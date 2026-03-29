import { Request, Response, RequestHandler } from "express";
import { initiateStkPush, handleMpesaCallback } from "./mpesa.service";

// Normalize Kenyan numbers (07, 01, 011, 2547, etc.)
const normalizePhone = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, ""); 

  if (cleaned.startsWith("254")) return cleaned;

  if (cleaned.startsWith("0")) {
    return "254" + cleaned.substring(1);
  }

  // fallback (assume missing 0)
  if (cleaned.length === 9) {
    return "254" + cleaned;
  }

  return cleaned;
};

// Valid after normalization (Kenya mobile: 2547..., 2541...)
const isValidPhone = (phone: string): boolean => {
  return /^254[71]\d{8}$/.test(phone);
};

export const stkPushController: RequestHandler = async (req, res) => {
  try {
    const { phoneNumber, amount, paymentId } = req.body;

    if (!phoneNumber || !amount || !paymentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const normalizedPhone = normalizePhone(phoneNumber);

    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Kenyan phone number",
      });
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const data = await initiateStkPush({
      phoneNumber: normalizedPhone,
      amount: Number(amount),
      paymentId: Number(paymentId),
    });

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("❌ STK ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.errorMessage ||
        error.message ||
        "STK push failed",
    });
  }
};

export const mpesaCallbackController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("📩 M-Pesa Callback Received");

    const paymentId = Number(req.query.payment_id);

    if (isNaN(paymentId)) {
      return res.status(400).json({ message: "Invalid payment_id" });
    }

    const stkCallback = req.body?.Body?.stkCallback;

    if (!stkCallback) {
      return res.status(400).json({ message: "Invalid callback payload" });
    }

    await handleMpesaCallback(paymentId, stkCallback);

    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Processed successfully",
    });
  } catch (error: any) {
    console.error("❌ Callback Error:", error.message);

    return res.status(200).json({
      ResultCode: 1,
      ResultDesc: "Callback processing failed",
    });
  }
};