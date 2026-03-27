import { Express, Response, Request, NextFunction } from "express";
import { createRoomController, deleteRoomController, getRoomByIdController, getRoomByHostelIdController, getRoomsController, updateRoomController } from "./room.controller";

const room = (app: Express) => {
    app.route('/room').post(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await createRoomController(req, res)
            } catch (error) {
                next(error)
            }
        }
    )

    app.route('/room_all').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getRoomsController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/room/hostel/:hostelId').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getRoomByHostelIdController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/room/:roomId').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getRoomByIdController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/room/:roomId').put(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await updateRoomController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/room/:roomId').delete(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await deleteRoomController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )
}
export default room