import axios from "axios";
import db from "../Drizzle/db";
import { PaymentTable } from "../Drizzle/schema";
import { eq } from "drizzle-orm";
import { getAccessToken, generatePassword } from "../utils/mpesa.helpers";

export const initiateStkPush = async ({
  phoneNumber,
  amount,
  paymentId,
}: {
  phoneNumber: string;
  amount: number;
  paymentId: number;
}) => {
  const token = await getAccessToken();
  const { password, timestamp } = generatePassword();

  const baseUrl =
    process.env.MPESA_ENV === "sandbox"
      ? "https://sandbox.safaricom.co.ke"
      : "https://api.safaricom.co.ke";

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(amount),
    PartyA: phoneNumber,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phoneNumber,
    CallBackURL: `${process.env.MPESA_CALLBACK_URL}?payment_id=${paymentId}`,
    AccountReference: "HostelBooking",
    TransactionDesc: "Payment",
  };

  const response = await axios.post(
    `${baseUrl}/mpesa/stkpush/v1/processrequest`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.data.ResponseCode !== "0") {
    throw new Error(response.data.ResponseDescription);
  }

  await db
    .update(PaymentTable)
    .set({
      transactionId: response.data.CheckoutRequestID,
      paymentStatus: "Processing",
      updatedAt: new Date(),
    })
    .where(eq(PaymentTable.paymentId, paymentId));

  return response.data;
};

export const handleMpesaCallback = async (
  paymentId: number,
  stkCallback: any
) => {
  const { ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

  // FAILED PAYMENT
  if (ResultCode !== 0) {
    await db
      .update(PaymentTable)
      .set({
        paymentStatus: "Failed",
        updatedAt: new Date(),
      })
      .where(eq(PaymentTable.paymentId, paymentId));

    console.log(`❌ Payment ${paymentId} failed: ${ResultDesc}`);
    return;
  }

  const items = CallbackMetadata?.Item || [];

  const receipt =
    items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value ||
    "UNKNOWN";

  await db
    .update(PaymentTable)
    .set({
      transactionId: receipt,
      paymentStatus: "Completed",
      updatedAt: new Date(),
    })
    .where(eq(PaymentTable.paymentId, paymentId));

  console.log(`✅ Payment ${paymentId} completed: ${receipt}`);
};