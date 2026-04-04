import { Request, Response } from "express";
import {
  createHostelService,
  getHostelsService,
  getHostelByIdService,
  getHostelByUserIdService,
  deleteHostelService,
  updateHostelService,
} from "./hostel.service";

import { createRoomService } from "../room/room.service"; // ✅ FIXED IMPORT

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

/* ======================================================
   GET ALL HOSTELS
====================================================== */
export const getHostelsController = async (req: Request, res: Response) => {
  try {
    const hostels = await getHostelsService();
    res.status(200).json(hostels);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   GET HOSTEL BY ID
====================================================== */
export const getHostelByIdController = async (req: Request, res: Response) => {
  try {
    const hostelId = parseInt(req.params.hostelId as string);
    if (isNaN(hostelId)) {
      return res.status(400).json({ error: "Invalid hostel ID" });
    }

    const hostel = await getHostelByIdService(hostelId);

    if (hostel) {
      res.status(200).json(hostel);
    } else {
      res.status(404).json({ error: "Hostel not found" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   GET HOSTELS BY USER ID
====================================================== */
export const getHostelByUserIdController = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const hostels = await getHostelByUserIdService(userId);
    res.status(200).json(hostels);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   CREATE HOSTEL (NO ROOMS)
====================================================== */
export const createHostelController = async (req: MulterRequest, res: Response) => {
  try {
    const imageUrl = req.file?.path;

    const newHostelData = {
      ...req.body,
      price: Number(req.body.price),
      rooms_available: Number(req.body.rooms_available),
      userId: Number(req.body.userId),
      ...(imageUrl && { image_URL: imageUrl }),
    };

    const newHostel = await createHostelService(newHostelData);

    if (newHostel) {
      res.status(201).json({
        message: "Hostel created successfully",
        data: newHostel,
      });
    } else {
      res.status(400).json({ message: "Failed to create hostel" });
    }
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   CREATE HOSTEL WITH ROOMS (NEW FEATURE)
====================================================== */
export const createHostelWithRoomsController = async (
  req: MulterRequest,
  res: Response
) => {
  try {
    const imageUrl = req.file?.path;
    const { rooms, ...hostelBody } = req.body;

    const hostelData = {
      ...hostelBody,
      price: Number(hostelBody.price),
      rooms_available: Number(hostelBody.rooms_available),
      userId: Number(hostelBody.userId),
      ...(imageUrl && { image_URL: imageUrl }),
    };

    const newHostel = await createHostelService(hostelData);

    if (!newHostel) {
      return res.status(400).json({ message: "Failed to create hostel" });
    }

    let createdRooms: any[] = [];

    if (rooms) {
      let roomsArray;

      try {
        roomsArray = typeof rooms === "string" ? JSON.parse(rooms) : rooms;
      } catch (err) {
        return res.status(400).json({ error: "Invalid rooms format (must be JSON)" });
      }

      if (Array.isArray(roomsArray)) {
        createdRooms = await Promise.all(
          roomsArray.map((room: any) =>
            createRoomService({
              ...room,
              hostelId: newHostel.hostelId,
            })
          )
        );
      }
    }

    return res.status(201).json({
      message: "Hostel with rooms created successfully",
      data: {
        ...newHostel,
        rooms: createdRooms,
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   UPDATE HOSTEL
====================================================== */
export const updateHostelController = async (req: MulterRequest, res: Response) => {
  try {
    const hostelId = parseInt(req.params.hostelId as string);
    if (isNaN(hostelId)) {
      return res.status(400).json({ error: "Invalid hostel ID" });
    }

    const imageUrl = req.file?.path;

    const updatedData = {
      ...req.body,
      price: Number(req.body.price),
      rooms_available: Number(req.body.rooms_available),
      userId: Number(req.body.userId),
      ...(imageUrl && { image_URL: imageUrl }),
    };

    await updateHostelService(hostelId, updatedData);

    res.status(200).json({ message: "Hostel updated successfully" });
  } catch (error: any) {
    console.error("UPDATE ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   DELETE HOSTEL
====================================================== */
export const deleteHostelController = async (req: Request, res: Response) => {
  try {
    const hostelId = parseInt(req.params.hostelId as string);
    if (isNaN(hostelId)) {
      return res.status(400).json({ error: "Invalid hostel ID" });
    }

    const existingHostel = await getHostelByIdService(hostelId);
    if (!existingHostel) {
      return res.status(404).json({ error: "Hostel not found" });
    }

    await deleteHostelService(hostelId);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};