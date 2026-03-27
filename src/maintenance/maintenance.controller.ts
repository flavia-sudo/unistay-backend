import { Request, Response } from "express";
import { createMaintenanceService, getMaintenanceService, getMaintenanceByIdService, getMaintenanceByRoomIdService, deleteMaintenanceService, updateMaintenanceService, getMaintenanceByUserIdService } from "./maintenance.service";

export const createMaintenanceController = async(req: Request, res: Response) => {
    try {
        const maintenance = req.body;
if (maintenance.date_reported) {
    maintenance.date_reported = new Date(maintenance.date_reported);
}
if (maintenance.date_resolved) {
    maintenance.date_resolved = new Date(maintenance.date_resolved);
}
const newMaintenance = await createMaintenanceService(maintenance);
        if (newMaintenance) {
            res.status(201).json({
                message: "Maintenance created successfully",
                data: newMaintenance
            });
        } else {
            res.status(400).json({
                message: "Failed to create maintenance"
            });
        }
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({error: error.message})
    }
}

export const getMaintenanceController = async (req: Request, res: Response) => {
    try {
        const maintenanceAll = await getMaintenanceService();
        res.status(200).json({
            message: "Maintenance fetched successfully",
            data: maintenanceAll
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({error: error.message})
    }
}

export const getMaintenanceByIdController = async (req: Request, res: Response) => {
    try {
        const maintenanceId = parseInt(req.params.maintenanceId as string);
        if (isNaN(maintenanceId)) {
            return res.status(400).json({error: "Invalid maintenance ID"});
        }
        const maintenance = await getMaintenanceByIdService(maintenanceId);
        if (maintenance) {
                res.status(200).json({
                    data: maintenance
                });
            }else {
                res.status(404).json({error: "Maintenance not found"});
            }
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const updateMaintenanceController = async (req: Request, res: Response) => {
    try {
        const maintenanceId = parseInt(req.params.maintenanceId as string);
        if (isNaN(maintenanceId)) {
            return res.status(400).json({error: "Invalid maintenance ID"});
        }
        const maintenance = req.body;
        const payload = {
            ...maintenance,
        }
        console.log(payload)
        const updatedMaintenance = await updateMaintenanceService(maintenanceId, payload);
        if (updatedMaintenance) {
            res.status(200).json({
                message: "Maintenance updated successfully",
                data: updatedMaintenance
            });
        } else {
            res.status(404).json({error: "Maintenance not found"});
        }
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const deleteMaintenanceController = async (req: Request, res: Response) => {
    try {
        const maintenanceId = parseInt(req.params.maintenanceId as string);
        if (isNaN(maintenanceId)) {
            return res.status(400).json({error: "Invalid maintenance ID"});
        }
        const existingMaintenance = await getMaintenanceByIdService(maintenanceId);
        if (!existingMaintenance) {
            return res.status(404).json({error: "Maintenance not found"});
        }
        await deleteMaintenanceService(maintenanceId);
        return res.status(204).json({error: "Maintenance deleted successfully"})
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const getMaintenanceByRoomIdController = async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.params.roomId as string);
        if (isNaN(roomId)) {
            return res.status(400).json({error: "Invalid room ID"});
        }
        const maintenance = await getMaintenanceByRoomIdService(roomId);
        res.status(200).json(maintenance);
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({error: error.message})
    }
}

export const getMaintenanceByUserIdController = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId as string);
        if (isNaN(userId)) {
            return res.status(400).json({error: "Invalid user ID"});
        }
        const maintenance = await getMaintenanceByUserIdService(userId);
        res.status(200).json(maintenance);
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({error: error.message})
    }
}