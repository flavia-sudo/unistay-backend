import { Request, Response } from "express";
import { createHostelService, getHostelsService, getHostelByIdService, getHostelByUserIdService,deleteHostelService,updateHostelService } from "./hostel.service";

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

export const createHostelController = async(req: MulterRequest, res: Response) => {
    try {
        const hostel = req.body;

        const imageUrl = req.file?.path || req.body.image_URL;
        const newHostelData = {
            ...hostel,
            ...(imageUrl && {image_URL: imageUrl})
        };
        const newHostel = await createHostelService(newHostelData);
        if (newHostel) {
            res.status(201).json({
                message: "Hostel created successfully",
                data: newHostel
            });
        } else {
            res.status(400).json({
                message: "Failed to create hostel"
            });
        }
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({error: error.message})
    }
}

export const getHostelsController = async (req: Request, res: Response) => {
    try {
        const hostels = await getHostelsService();
        res.status(200).json(hostels);
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const getHostelByIdController = async (req: Request, res: Response) => {
    try {
        const hostelId = parseInt(req.params.hostelId as string);
        if (isNaN(hostelId)) {
            return res.status(400).json({error: "Invalid hostel ID"});
        }
        const hostel = await getHostelByIdService(hostelId);
        if (hostel) {
                res.status(200).json(hostel);
            }else {
                res.status(404).json({error: "Hostel not found"});
            }
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const updateHostelController = async (req: Request, res: Response) => {
    try {
        console.log("PARAMS:", req.params);
        console.log("BODY:", req.body);
        console.log("FILE:", (req as any).file);
        const hostelId = parseInt(req.params.hostelId as string);
        if (isNaN(hostelId)) {
            return res.status(400).json({error: "Invalid hostel ID"});
        }
        const hostel = req.body;
        const imageUrl = req.file?.path;
        console.log(imageUrl);
        const updatedData = {
            ...hostel,
            ...(imageUrl && {image_URL: imageUrl})
        }
        console.log("UPDATED DATA:", updatedData);
        await updateHostelService(hostelId, updatedData);
        res.status(200).json({
                message: "Hostel updated successfully",
            });
        } catch (error: any) {
        console.log("UPDATE ERROR:", error);
        return res.status(500).json({error: error.message})
    }
}

export const deleteHostelController = async (req: Request, res: Response) => {
    try {
        const hostelId = parseInt(req.params.hostelId as string);
        if (isNaN(hostelId)) {
            return res.status(400).json({error: "Invalid hostel ID"});
        }
        const existingHostel = await getHostelByIdService(hostelId);
        if (!existingHostel) {
            return res.status(404).json({error: "Hostel not found"});
        }
        await deleteHostelService(hostelId);
        return res.status(204).json({error: "Hostel deleted successfully"})
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const getHostelByUserIdController = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId as string);
        if (isNaN(userId)) {
            return res.status(400).json({error: "Invalid user id"});
        }
        const hostels = await getHostelByUserIdService(userId);
        res.status(200).json(hostels);
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({error: error.message})
    }
}