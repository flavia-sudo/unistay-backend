import { Request, Response } from "express";
import { createBookingService, getBookingService, getBookingByIdService, getBookingByUserIdService, getBookingByRoomIdService, deleteBookingService,updateBookingService } from "./booking.service";

export const createBookingController = async(req: Request, res: Response) => {
    try {
        const booking = req.body;
        if (booking.createdAt) {
            booking.createdAt = new Date(booking.createdAt);
        }
        if (booking.updatedAt) {
            booking.updatedAt = new Date(booking.updatedAt);
        }
        const newBooking = await createBookingService(booking);
        if (newBooking) {
            res.status(201).json({
                message: "Booking created successfully",
                data: newBooking
            });
        } else {
            res.status(400).json({
                message: "Failed to create booking"
            });
        }
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({error: error.message})
    }
}

export const getBookingController = async (req: Request, res: Response) => {
    try {
        const bookings = await getBookingService();
        res.status(200).json({
            message: "Bookings fetched successfully",
            data: bookings});
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const getBookingByIdController = async (req: Request, res: Response) => {
    try {
        const bookingId = parseInt(req.params.bookingId as string);
        if (isNaN(bookingId)) {
            return res.status(400).json({error: "Invalid booking ID"});
        }
        const booking = await getBookingByIdService(bookingId);
        if (booking) {
                res.status(200).json(booking);
            }else {
                res.status(404).json({error: "Booking not found"});
            }
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const updateBookingController = async (req: Request, res: Response) => {
    try {
        const bookingId = parseInt(req.params.bookingId as string);
        if (isNaN(bookingId)) {
            return res.status(400).json({error: "Invalid booking ID"});
        }
        const booking = req.body;
        const payload = {
            ...booking,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        console.log(payload)
        const updatedBooking = await updateBookingService(bookingId, payload);
        if (updatedBooking) {
            res.status(200).json({
                message: "Booking updated successfully",
                data: updatedBooking
            });
        } else {
            res.status(404).json({error: "Booking not found"});
        }
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const deleteBookingController = async (req: Request, res: Response) => {
    try {
        const bookingId = parseInt(req.params.bookingId as string);
        if (isNaN(bookingId)) {
            return res.status(400).json({error: "Invalid booking ID"});
        }
        const existingBooking = await getBookingByIdService(bookingId);
        if (!existingBooking) {
            return res.status(404).json({error: "Booking not found"});
        }
        await deleteBookingService(bookingId);
        return res.status(204).json({error: "Booking deleted successfully"})
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const getBookingByUserIdController = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId as string);
        if (isNaN(userId)) {
            return res.status(400).json({error: "Invalid user id"});
        }
        const bookings = await getBookingByUserIdService(userId);
        res.status(200).json(bookings);
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({error: error.message})
    }
}

export const getBookingByRoomIdController = async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.params.roomId as string);
        if (isNaN(roomId)) {
            return res.status(400).json({error: "Invalid room id"});
        }
        const bookings = await getBookingByRoomIdService(roomId);
        res.status(200).json(bookings);
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({error: error.message})
    }
}