import db from "../Drizzle/db";
import { PaymentTable, TIPayment, TSPayment, BookingTable, UserTable, RoomTable, HostelTable } from "../Drizzle/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

// export const createPaymentService = async (payment: TIPayment) => {
//   const [inserted] = await db.insert(PaymentTable).values(payment).returning();
//   return inserted ?? null;
// };


// Helper: sync booking status and decrement rooms when payment completes
const syncBookingOnPayment = async (
  bookingId: number,
  status: string,
  previousStatus?: string
) => {
  if (status === "Completed") {
    await db.update(BookingTable)
      .set({ bookingStatus: true })
      .where(eq(BookingTable.bookingId, bookingId));

    if (previousStatus !== "Completed") {
      const booking = await db.query.BookingTable.findFirst({
        where: eq(BookingTable.bookingId, bookingId),
      });
      if (booking) {
        await db.update(HostelTable)
          .set({ rooms_available: sql`GREATEST(${HostelTable.rooms_available} - 1, 0)` })
          .where(eq(HostelTable.hostelId, booking.hostelId));
        await db.update(RoomTable)
          .set({ status: true }) // true = occupied
          .where(eq(RoomTable.roomId, booking.roomId));
      }
    }
  } else if (status === "Cancelled" || status === "Failed") {
    await db.update(BookingTable)
      .set({ bookingStatus: false })
      .where(eq(BookingTable.bookingId, bookingId));

    // ✅ Also free the room back when payment fails/cancels
    const booking = await db.query.BookingTable.findFirst({
      where: eq(BookingTable.bookingId, bookingId),
    });
    if (booking) {
      await db.update(RoomTable)
        .set({ status: false }) // false = available again
        .where(eq(RoomTable.roomId, booking.roomId));
      await db.update(HostelTable)
        .set({ rooms_available: sql`${HostelTable.rooms_available} + 1` })
        .where(eq(HostelTable.hostelId, booking.hostelId));
    }
  }
};



export const createPaymentService = async (payment: TIPayment) => {
  const [inserted] = await db.insert(PaymentTable).values(payment).returning();
  if (inserted) await syncBookingOnPayment(inserted.bookingId, inserted.paymentStatus ?? "");
  return inserted ?? null;
};

export const getPaymentService = async () => {
  const payments = await db.query.PaymentTable.findMany();

  const paymentsWithRelations = await Promise.all(
    payments.map(async (p) => {
      const booking = await db.query.BookingTable.findFirst({
        where: eq(BookingTable.bookingId, p.bookingId),
      });

      const user = booking
        ? await db.query.UserTable.findFirst({
            columns: { firstName: true, lastName: true },
            where: eq(UserTable.userId, booking.userId),
          })
        : null;

      const room = booking
        ? await db.query.RoomTable.findFirst({
            columns: { roomNumber: true, hostelId: true },
            where: eq(RoomTable.roomId, booking.roomId),
          })
        : null;

      const hostel = room
        ? await db.query.HostelTable.findFirst({
            columns: { hostelName: true },
            where: eq(HostelTable.hostelId, room.hostelId),
          })
        : null;

      return {
        ...p,
        firstName: user?.firstName ?? null,
        lastName: user?.lastName ?? null,
        roomNumber: room?.roomNumber ?? null,
        hostelName: hostel?.hostelName ?? null,
      };
    })
  );

  return paymentsWithRelations;
};

export const getPaymentByIdService = async (paymentId: number) => {
  const payment = await db.query.PaymentTable.findFirst({
    where: eq(PaymentTable.paymentId, paymentId),
  });

  if (!payment) return null;

  const booking = await db.query.BookingTable.findFirst({
    where: eq(BookingTable.bookingId, payment.bookingId),
  });

  const user = booking
    ? await db.query.UserTable.findFirst({
        columns: { firstName: true, lastName: true },
        where: eq(UserTable.userId, booking.userId),
      })
    : null;

  const room = booking
    ? await db.query.RoomTable.findFirst({
        columns: { roomNumber: true, hostelId: true },
        where: eq(RoomTable.roomId, booking.roomId),
      })
    : null;

  const hostel = room
    ? await db.query.HostelTable.findFirst({
        columns: { hostelName: true },
        where: eq(HostelTable.hostelId, room.hostelId),
      })
    : null;

  return {
    ...payment,
    firstName: user?.firstName ?? null,
    lastName: user?.lastName ?? null,
    roomNumber: room?.roomNumber ?? null,
    hostelName: hostel?.hostelName ?? null,
  };
};

export const getPaymentByBookingIdService = async (bookingId: number) => {
  const payment = await db.query.PaymentTable.findFirst({
    where: eq(PaymentTable.bookingId, bookingId),
  });

  if (!payment) return null;

  const booking = await db.query.BookingTable.findFirst({
    where: eq(BookingTable.bookingId, bookingId),
  });

  const user = booking
    ? await db.query.UserTable.findFirst({
        columns: { firstName: true, lastName: true },
        where: eq(UserTable.userId, booking.userId),
      })
    : null;

  const room = booking
    ? await db.query.RoomTable.findFirst({
        columns: { roomNumber: true, hostelId: true },
        where: eq(RoomTable.roomId, booking.roomId),
      })
    : null;

  const hostel = room
    ? await db.query.HostelTable.findFirst({
        columns: { hostelName: true },
        where: eq(HostelTable.hostelId, room.hostelId),
      })
    : null;

  return {
    ...payment,
    firstName: user?.firstName ?? null,
    lastName: user?.lastName ?? null,
    roomNumber: room?.roomNumber ?? null,
    hostelName: hostel?.hostelName ?? null,
  };
};

// export const updatePaymentService = async (paymentId: number, payment: TIPayment) => {
//   const [updated] = await db.update(PaymentTable).set(payment).where(eq(PaymentTable.paymentId, paymentId)).returning();
//   return updated ?? null;
// };
export const updatePaymentService = async (paymentId: number, payment: TIPayment) => {
  // Get previous status before update
  const existing = await db.query.PaymentTable.findFirst({
    where: eq(PaymentTable.paymentId, paymentId),
  });

  const [updated] = await db.update(PaymentTable).set(payment)
    .where(eq(PaymentTable.paymentId, paymentId)).returning();

  if (updated) {
    await syncBookingOnPayment(
      updated.bookingId,
      updated.paymentStatus ?? "",
      existing?.paymentStatus ?? ""
    );
  }
  return updated ?? null;
};
export const deletePaymentService = async (paymentId: number) => {
  const [deleted] = await db.delete(PaymentTable).where(eq(PaymentTable.paymentId, paymentId)).returning();
  return deleted ?? null;
};

export const getPaymentByUserIdService = async (userId: number) => {
  const payments = await db.query.PaymentTable.findMany({
    where: eq(PaymentTable.userId, userId),
  });

  const paymentsWithRelations = await Promise.all(
    payments.map(async (p) => {
      const booking = await db.query.BookingTable.findFirst({
        where: eq(BookingTable.bookingId, p.bookingId),
      });

      const room = booking
        ? await db.query.RoomTable.findFirst({
            columns: { roomNumber: true, hostelId: true },
            where: eq(RoomTable.roomId, booking.roomId),
          })
        : null;

      const hostel = room
        ? await db.query.HostelTable.findFirst({
            columns: { hostelName: true },
            where: eq(HostelTable.hostelId, room.hostelId),
          })
        : null;

      return {
        ...p,
        roomNumber: room?.roomNumber ?? null,
        hostelName: hostel?.hostelName ?? null,
      };
    })
  );

  return { data: paymentsWithRelations };
};

export const getByTransactionId = async (transactionId: string): Promise<TSPayment | undefined> => {
  try {
    const result = await db
      .select()
      .from(PaymentTable)
      .where(eq(PaymentTable.transactionId, transactionId))
    return result[0]
  } catch (error: any) {
    throw new Error(`Failed to fetch payment by transaction ID: ${error.message}`)
  }
}