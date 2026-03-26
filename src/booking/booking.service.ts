import db from "../Drizzle/db";
import { BookingTable, TIBooking, UserTable, RoomTable, HostelTable } from "../Drizzle/schema";
import { eq } from "drizzle-orm";

/* ---------------- CREATE ---------------- */
export const createBookingService = async (booking: TIBooking) => {
  const [inserted] = await db.insert(BookingTable).values(booking).returning();
  return inserted ?? null;
};

/* ---------------- GET ALL BOOKINGS ---------------- */
export const getBookingService = async () => {
  const bookings = await db.query.BookingTable.findMany({
    columns: {
      bookingId: true,
      userId: true,
      roomId: true,
      checkInDate: true,
      totalAmount: true,
      bookingStatus: true,
      createdAt: true,
    },
  });

  const bookingsWithRelations = await Promise.all(
    bookings.map(async (b) => {
      const user = await db.query.UserTable.findFirst({
        columns: { firstName: true, lastName: true },
        where: eq(UserTable.userId, b.userId),
      });

      const room = await db.query.RoomTable.findFirst({
        columns: { roomNumber: true, hostelId: true },
        where: eq(RoomTable.roomId, b.roomId),
      });

      const hostel = room
        ? await db.query.HostelTable.findFirst({
            columns: { hostelName: true },
            where: eq(HostelTable.hostelId, room.hostelId),
          })
        : null;

      return {
        ...b,
        firstName: user?.firstName,
        lastName: user?.lastName,
        roomNumber: room?.roomNumber,
        hostelName: hostel?.hostelName,
      };
    })
  );

  return bookingsWithRelations;
};

/* ---------------- GET BY BOOKING ID ---------------- */
export const getBookingByIdService = async (Id: number) => {
  const booking = await db.query.BookingTable.findFirst({
    where: eq(BookingTable.bookingId, Id),
  });

  if (!booking) return null;

  const user = await db.query.UserTable.findFirst({
    columns: { firstName: true, lastName: true },
    where: eq(UserTable.userId, booking.userId),
  });

  const room = await db.query.RoomTable.findFirst({
    columns: { roomNumber: true, hostelId: true },
    where: eq(RoomTable.roomId, booking.roomId),
  });

  const hostel = room
    ? await db.query.HostelTable.findFirst({
        columns: { hostelName: true },
        where: eq(HostelTable.hostelId, room.hostelId),
      })
    : null;

  return {
    ...booking,
    firstName: user?.firstName,
    lastName: user?.lastName,
    roomNumber: room?.roomNumber,
    hostelName: hostel?.hostelName,
  };
};

/* ---------------- GET BY USER ID ---------------- */
export const getBookingByUserIdService = async (userId: number) => {
  const bookings = await db.query.BookingTable.findMany({
    where: eq(BookingTable.userId, userId),
  });

  const bookingsWithRelations = await Promise.all(
    bookings.map(async (b) => {
      const room = await db.query.RoomTable.findFirst({
        columns: { roomNumber: true, hostelId: true },
        where: eq(RoomTable.roomId, b.roomId),
      });

      const hostel = room
        ? await db.query.HostelTable.findFirst({
            columns: { hostelName: true },
            where: eq(HostelTable.hostelId, room.hostelId),
          })
        : null;

        const user = await db.query.UserTable.findFirst({
          columns: { firstName: true, lastName: true },
          where: eq(UserTable.userId, b.userId),
        });

        return {
          ...b,
          firstName: user?.firstName,
          lastName: user?.lastName,
          roomNumber: room?.roomNumber,
          hostelName: hostel?.hostelName,
        };
    })
  );

  return { data: bookingsWithRelations };
};

/* ---------------- GET BY ROOM ID ---------------- */
export const getBookingByRoomIdService = async (roomId: number) => {
  const bookings = await db.query.BookingTable.findMany({
    where: eq(BookingTable.roomId, roomId),
  });

  const bookingsWithRelations = await Promise.all(
    bookings.map(async (b) => {
      const user = await db.query.UserTable.findFirst({
        columns: { firstName: true, lastName: true },
        where: eq(UserTable.userId, b.userId),
      });

      return {
        ...b,
        firstName: user?.firstName,
        lastName: user?.lastName,
      };
    })
  );

  return bookingsWithRelations;
};

/* ---------------- UPDATE ---------------- */
export const updateBookingService = async (Id: number, booking: TIBooking) => {
  const updated = await db.update(BookingTable).set(booking).where(eq(BookingTable.bookingId, Id)).returning();
  return updated;
};

/* ---------------- DELETE ---------------- */
export const deleteBookingService = async (Id: number) => {
  const deleted = await db.delete(BookingTable).where(eq(BookingTable.bookingId, Id)).returning();
  return deleted;
};