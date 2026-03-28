import axios from "axios";
import db from "../Drizzle/db";
import { PaymentTable, BookingTable } from '../Drizzle/schema';
import { eq } from "drizzle-orm";
import { getAccessToken, generatePassword } from "../utils/mpesa.helpers";
import { normalizePhoneNumber } from "../utils/normalizePhoneNumbers";

export const initiateStkPush = async ({
  phoneNumber,
  amount,
  paymentId,
}: {
  phoneNumber: string
  amount: number
  paymentId: number
}) => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber)
  const token = await getAccessToken()
  const { password, timestamp } = generatePassword()

  // FIX 1: Always use sandbox URL when MPESA_ENV=sandbox.
  // Previously, any value other than "sandbox" would hit the production URL,
  // causing 404s when using sandbox credentials.
  const mpesaBaseUrl = process.env.MPESA_ENV === "sandbox"
    ? "https://sandbox.safaricom.co.ke"
    : "https://api.safaricom.co.ke"

  console.log("🚀 Initiating STK Push:", {
    paymentId,
    amount,
    normalizedPhone,
    env: process.env.MPESA_ENV,
    callbackUrl: `${process.env.MPESA_CALLBACK_URL}?payment_id=${paymentId}`,
  })

  const response = await axios.post(
    `${mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: normalizedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: `${process.env.MPESA_CALLBACK_URL}?payment_id=${paymentId}`,
      AccountReference: "HostelBooking",
      TransactionDesc: "Hostel Room Payment",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  console.log("📱 STK Push response from Safaricom:", response.data)

  if (response.data.ResponseCode !== "0") {
    throw new Error(`M-Pesa Error: ${response.data.ResponseDescription}`)
  }

  // FIX 2: Store CheckoutRequestID in transactionId — NOT in paymentId.
  // Previously this overwrote paymentId (a serial int PK) with a string,
  // which would corrupt the record and break the callback lookup since
  // the callback URL already carries ?payment_id=<numeric_id>.
  if (response.data.CheckoutRequestID) {
    console.log("💾 Storing CheckoutRequestID in transactionId:", response.data.CheckoutRequestID)

    await db
      .update(PaymentTable)
      .set({
        transactionId: response.data.CheckoutRequestID,  // ✅ correct column
        paymentStatus: "Processing",
        updatedAt: new Date(),
      })
      .where(eq(PaymentTable.paymentId, paymentId))       // ✅ paymentId unchanged

    console.log("✅ Payment record updated to Processing status")
  }

  return response.data
}

export const handleMpesaCallback = async (paymentId: number, callbackBody: any) => {
  console.log("📩 M-Pesa Callback Handler Started")
  console.log("Payment ID:", paymentId)
  console.log("Callback body:", JSON.stringify(callbackBody, null, 2))

  const stkCallback = callbackBody.Body?.stkCallback

  if (!stkCallback) {
    console.error("❌ Invalid callback structure - no stkCallback found")
    console.log("Available Body keys:", Object.keys(callbackBody.Body || {}))
    return
  }

  console.log("Result Code:", stkCallback.ResultCode)
  console.log("Result Description:", stkCallback.ResultDesc)

  if (stkCallback.ResultCode === 0) {
    // ── Payment successful ────────────────────────────────────────────────────
    console.log("🎉 Payment successful!")

    const items: any[] = stkCallback.CallbackMetadata?.Item || []

    const mpesaReceipt   = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value
    const amount         = items.find((i) => i.Name === "Amount")?.Value
    const transactionDate = items.find((i) => i.Name === "TransactionDate")?.Value
    const phone          = items.find((i) => i.Name === "PhoneNumber")?.Value

    console.log("Receipt:", mpesaReceipt, "| Amount:", amount, "| Date:", transactionDate, "| Phone:", phone)

    if (!mpesaReceipt) {
      console.error("❌ No MpesaReceiptNumber in callback metadata")
      console.log("Items received:", items.map((i) => ({ Name: i.Name, Value: i.Value })))
      return
    }

    // Update payment to Completed and store the real M-Pesa receipt number
    const paymentUpdate = await db
      .update(PaymentTable)
      .set({
        paymentStatus: "Completed",
        transactionId: mpesaReceipt,
        updatedAt: new Date(),
      })
      .where(eq(PaymentTable.paymentId, paymentId))
      .returning()

    console.log("✅ Payment marked Completed:", paymentUpdate)

    // Also confirm the booking now that payment is complete
    if (paymentUpdate.length > 0) {
      const bookingId = paymentUpdate[0].bookingId
      await db
        .update(BookingTable)
        .set({ bookingStatus: true, updatedAt: new Date() })
        .where(eq(BookingTable.bookingId, bookingId))

      console.log(`✅ Booking #${bookingId} confirmed`)
    }

  } else {
    // ── Payment failed / cancelled ────────────────────────────────────────────
    console.log(`❌ Payment failed — Code: ${stkCallback.ResultCode} | ${stkCallback.ResultDesc}`)

    await db
      .update(PaymentTable)
      .set({
        paymentStatus: "Failed",
        updatedAt: new Date(),
      })
      .where(eq(PaymentTable.paymentId, paymentId))
      .returning()

    console.log(`Payment #${paymentId} marked as Failed`)
  }

  console.log("✅ Callback processing complete for payment:", paymentId)
}