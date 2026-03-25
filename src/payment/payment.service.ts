import { eq } from "drizzle-orm";
import db from "../Drizzle/db";
import { PaymentTable } from "../Drizzle/schema";

/* ---------------- CREATE ---------------- */
export const createPaymentService = async (payment: any) => {
  const [inserted] = await db
    .insert(PaymentTable)
    .values(payment)
    .returning();

  return inserted ?? null;
};

/* ---------------- GET ALL (WITH RELATIONS) ---------------- */
export const getPaymentService = async () => {
  const payments = await db.query.PaymentTable.findMany({
    with: {
      booking: {
        with: {
          user: true,
          room: {
            with: {
              hostel: true,
            },
          },
        },
      },
    },
  });

  // Flatten response for frontend
  return payments.map((p) => ({
    ...p,
    firstName: p.booking?.user?.firstName ?? null,
    lastName: p.booking?.user?.lastName ?? null,
    hostelName: p.booking?.room?.hostel?.hostelName ?? null,
    roomNumber: p.booking?.room?.roomNumber ?? null,
  }));
};

/* ---------------- GET BY ID ---------------- */
export const getPaymentByIdService = async (paymentId: number) => {
  const payment = await db.query.PaymentTable.findFirst({
    where: eq(PaymentTable.paymentId, paymentId),
    with: {
      booking: {
        with: {
          user: true,
          room: {
            with: {
              hostel: true,
            },
          },
        },
      },
    },
  });

  if (!payment) return null;

  return {
    ...payment,
    firstName: payment.booking?.user?.firstName ?? null,
    lastName: payment.booking?.user?.lastName ?? null,
    hostelName: payment.booking?.room?.hostel?.hostelName ?? null,
    roomNumber: payment.booking?.room?.roomNumber ?? null,
  };
};

/* ---------------- UPDATE ---------------- */
export const updatePaymentService = async (
  paymentId: number,
  payment: any
) => {
  const [updated] = await db
    .update(PaymentTable)
    .set(payment)
    .where(eq(PaymentTable.paymentId, paymentId))
    .returning();

  return updated ?? null;
};

/* ---------------- DELETE ---------------- */
export const deletePaymentService = async (paymentId: number) => {
  const [deleted] = await db
    .delete(PaymentTable)
    .where(eq(PaymentTable.paymentId, paymentId))
    .returning();

  return deleted ?? null;
};

/* ---------------- GET BY BOOKING ID ---------------- */
export const getPaymentByBookingIdService = async (
  bookingId: number
) => {
  const payment = await db.query.PaymentTable.findFirst({
    where: eq(PaymentTable.bookingId, bookingId),
    with: {
      booking: {
        with: {
          user: true,
          room: {
            with: {
              hostel: true,
            },
          },
        },
      },
    },
  });

  if (!payment) return null;

  return {
    ...payment,
    firstName: payment.booking?.user?.firstName ?? null,
    lastName: payment.booking?.user?.lastName ?? null,
    hostelName: payment.booking?.room?.hostel?.hostelName ?? null,
    roomNumber: payment.booking?.room?.roomNumber ?? null,
  };
};