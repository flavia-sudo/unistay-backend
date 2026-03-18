import { Request, Response } from "express";
import { createHostelService, getHostelsService, getHostelByIdService, getHostelByUserIdService,deleteHostelService,updateHostelService } from "./hostel.service";

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

export const createHostelController = async(req: MulterRequest, res: Response) => {
    try {
        const hostel = req.body;

        const imagePath = req.file?.path;
        const newHostelData = {
            ...hostel,
            image: imagePath
        };
        const newHostel = await createHostelService(hostel);
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
        const hostelId = parseInt(req.params.hostelId as string);
        if (isNaN(hostelId)) {
            return res.status(400).json({error: "Invalid hostel ID"});
        }
        const hostel = req.body;
        const imagePath = req.file?.path;
        const updatedData = {
            ...hostel,
            ...(imagePath && {image: imagePath})
        }
        await updateHostelService(hostelId, hostel);
        res.status(200).json({
                message: "Hostel updated successfully",
            });
        } catch (error: any) {
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