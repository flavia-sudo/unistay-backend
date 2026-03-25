import { Express, Response, Request, NextFunction } from 'express';
import { createMaintenanceController, deleteMaintenanceController, getMaintenanceByIdController, getMaintenanceController, getMaintenanceByRoomIdController, updateMaintenanceController, getMaintenanceByUserIdController } from './maintenance.controller';

const maintenance = (app: Express) => {
    app.route('/maintenance').post(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await createMaintenanceController(req, res)
            } catch (error) {
                next(error)
            }
        }
    )

    app.route('/maintenance_all').get(
        async (req: Request, res: Response, next: NextFunction) =>{
            try {
                await getMaintenanceController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/maintenance/:maintenanceId').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getMaintenanceByIdController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/maintenance/:maintenanceId').put(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await updateMaintenanceController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/maintenance/:maintenanceId').delete(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await deleteMaintenanceController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/maintenance/room/:roomId').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getMaintenanceByRoomIdController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/maintenance/user/:userId').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getMaintenanceByUserIdController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )
}

export default maintenance;