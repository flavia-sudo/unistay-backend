import { Express, Response, Request, NextFunction } from "express";
import { createUserController, deleteUserController, getUsersController, getLandlordController, getUserByIdController, updateUserController } from "./user.controller";
import { isAdmin, isAuthenticated } from "../middleware/auth.middleware";

const user = (app: Express) => {

    app.route('/user').post(
        async (req:Request, res:Response, next:NextFunction) => {
            try {
                await createUserController(req,res)
            } catch (error) {
                next(error)
            }
        }
    )

    app.route('/user_all').get(
        // isAuthenticated,
        // isAdmin,
        async (req:Request, res:Response, next:NextFunction) => {
            try {
                await getUsersController(req,res)
            } catch (error) {
                next(error)
            }
        }
    )

    app.route('/user/:userId').get(
        isAuthenticated,
        isAdmin,
        async (req:Request, res:Response, next:NextFunction) => {
            try {
                await getUserByIdController(req,res)
            } catch (error) {
                next(error)
            }
        }
    )

    app.route('/user/:userId').put(
        async (req:Request, res:Response, next:NextFunction) => {
            try {
                await updateUserController(req,res)
            } catch (error) {
                next(error)
            }
        }
    )

    app.route('/user/:userId').delete(
        async (req:Request, res:Response, next:NextFunction) => {
            try {
                await deleteUserController(req,res)
            } catch (error) {
                next(error)
            }
        }
    )

    app.route('/users/landlords_all').get(
        // isAuthenticated,
        // isAdmin,
        async (req:Request, res:Response, next:NextFunction) => {
            try {
                await getLandlordController(req,res)
            } catch (error) {
                next(error)
            }
        }
    )
}

export default user