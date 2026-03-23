import db from "../Drizzle/db";
import { BookingTable, TIBooking } from "../Drizzle/schema";
import { eq } from "drizzle-orm";

export const createBookingService = async (booking: TIBooking) => {
    const [ inserted ] = await db.insert(BookingTable).values(booking).returning();
    if (inserted) {
        return inserted;
    }
    return null;
}

export const getBookingService = async () => {
    const bookings = await db.query.BookingTable.findMany({
        columns: {
            bookingId: true,
            checkInDate: true,
            createdAt: true,
            totalAmount: true,
            bookingStatus: true,
            roomId: true,
            userId: true,
        },
        with: {
            user: {
                columns: {
                    firstName: true,
                    lastName: true,
                },
            },
            room: {
                columns: {
                    roomNumber: true,
                    hostelId: true,
                },
            },
            hostel: {
                columns: {
                    hostelName: true,
                },
            },
            
        }
    });
    return bookings.map((b) =>({
        ...b,
        firstName: b.user?.firstName,
        lastName: b.user?.lastName,
        roomNumber: b.room?.roomNumber,
        hostelName: b.hostel?.hostelName
    }));
}

export const getBookingByIdService = async (Id: number) => {
    const booking = await db.query.BookingTable.findFirst({
        where: eq(BookingTable.bookingId, Id)
    });
    return booking;
}

export const updateBookingService = async (Id: number, booking: TIBooking) => {
    const updated = await db.update(BookingTable).set(booking).where(eq(BookingTable.bookingId, Id)).returning();
    return updated;
}

export const deleteBookingService = async (Id: number) => {
    const deleted = await db.delete(BookingTable).where(eq(BookingTable.bookingId, Id)).returning();
    return deleted;
}

export const getBookingByUserIdService = async (userId: number) => {
    const bookings = await db.query.BookingTable.findFirst({
        where: eq(BookingTable.userId, userId)
    });
    return bookings;
}

export const getBookingByRoomIdService = async (roomId: number) => {
    const bookings = await db.query.BookingTable.findFirst({
        where: eq(BookingTable.roomId, roomId)
    });
    return bookings;
}