import { Request, Response } from "express";
import {
  createHostelService,
  getHostelsService,
  getHostelByIdService,
  getHostelByUserIdService,
  deleteHostelService,
  updateHostelService,
} from "./hostel.service";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// export const createHostelController = async (req: MulterRequest, res: Response) => {
//   try {
//     const hostel = req.body;

//     // ✅ multer-storage-cloudinary puts the Cloudinary URL in req.file.path
//     const imageUrl = req.file?.path || req.body.image_URL;

//     const newHostelData = {
//       ...hostel,
//       ...(imageUrl && { image_URL: imageUrl }),
//     };

//     const newHostel = await createHostelService(newHostelData);
//     if (newHostel) {
//       res.status(201).json({ message: "Hostel created successfully", data: newHostel });
//     } else {
//       res.status(400).json({ message: "Failed to create hostel" });
//     }
//   } catch (error: any) {
//     console.error(error);
//     return res.status(500).json({ error: error.message });
//   }
// };

export const getHostelsController = async (req: Request, res: Response) => {
  try {
    const hostels = await getHostelsService();
    res.status(200).json(hostels);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getHostelByIdController = async (req: Request, res: Response) => {
  try {
    const hostelId = parseInt(req.params.hostelId as string);
    if (isNaN(hostelId)) return res.status(400).json({ error: "Invalid hostel ID" });

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

// export const updateHostelController = async (req: MulterRequest, res: Response) => {
//   try {
//     const hostelId = parseInt(req.params.hostelId as string);
//     if (isNaN(hostelId)) return res.status(400).json({ error: "Invalid hostel ID" });

//     const hostel = req.body;

//     // ✅ Only overwrite image_URL if user uploaded a new file
//     const imageUrl = req.file?.path;

//     const updatedData = {
//       ...hostel,
//       ...(imageUrl && { image_URL: imageUrl }),
//     };

//     await updateHostelService(hostelId, updatedData);
//     res.status(200).json({ message: "Hostel updated successfully" });
//   } catch (error: any) {
//     console.error("UPDATE ERROR:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };

export const deleteHostelController = async (req: Request, res: Response) => {
  try {
    const hostelId = parseInt(req.params.hostelId as string);
    if (isNaN(hostelId)) return res.status(400).json({ error: "Invalid hostel ID" });

    const existingHostel = await getHostelByIdService(hostelId);
    if (!existingHostel) return res.status(404).json({ error: "Hostel not found" });

    await deleteHostelService(hostelId);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getHostelByUserIdController = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId as string);
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid user id" });

    const hostels = await getHostelByUserIdService(userId);
    res.status(200).json(hostels);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const createHostelController = async (req: MulterRequest, res: Response) => {
  try {
    console.log("req.file:", req.file); // ✅ debug: should show path as Cloudinary URL

    const imageUrl = req.file?.path; // multer-storage-cloudinary sets this to secure_url

    const newHostelData = {
      ...req.body,
      price: Number(req.body.price),
      rooms_available: Number(req.body.rooms_available),
      userId: Number(req.body.userId),
      ...(imageUrl && { image_URL: imageUrl }), // ✅ only set if file was uploaded
    };

    const newHostel = await createHostelService(newHostelData);
    if (newHostel) {
      res.status(201).json({ message: "Hostel created successfully", data: newHostel });
    } else {
      res.status(400).json({ message: "Failed to create hostel" });
    }
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateHostelController = async (req: MulterRequest, res: Response) => {
  try {
    const hostelId = parseInt(req.params.hostelId as string);
    if (isNaN(hostelId)) return res.status(400).json({ error: "Invalid hostel ID" });

    console.log("req.file:", req.file); // ✅ debug

    const imageUrl = req.file?.path;

    const updatedData = {
      ...req.body,
      price: Number(req.body.price),
      rooms_available: Number(req.body.rooms_available),
      userId: Number(req.body.userId),
      ...(imageUrl && { image_URL: imageUrl }), // ✅ only overwrite if new file uploaded
    };

    await updateHostelService(hostelId, updatedData);
    res.status(200).json({ message: "Hostel updated successfully" });
  } catch (error: any) {
    console.error("UPDATE ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};