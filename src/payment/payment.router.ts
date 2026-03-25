import { Express, Response, Request, NextFunction } from 'express';
import { createPaymentController, deletePaymentController, getPaymentByIdController, getPaymentController, getPaymentByBookingIdController, updatePaymentController,
    getPaymentByUserIdController
 } from './payment.controller';
import { isAdmin, isAuthenticated } from '../middleware/auth.middleware';

const payment = (app: Express) => {
    // create payment
    app.route('/payment').post(
        async (req:Request, res:Response, next:NextFunction) => {
            try {
                await createPaymentController(req,res)
            } catch (error) {
                next(error)
            }
        }
    )

    app.route('/payment_all').get(
        // isAuthenticated,
        // isAdmin,
        async (req:Request, res:Response, next:NextFunction) => {
            try {
                await getPaymentController(req,res)
            } catch (error) {
                next(error)
            }
        }
    )

    app.route('/payment/:paymentId').get(
        async (req:Request, res:Response, next:NextFunction) => {
            try {
                await getPaymentByIdController(req,res)
            } catch (error) {
                next(error)
            }
        }
    )

    app.route('/payment/:paymentId').put(
        async (req:Request, res:Response, next:NextFunction) => {
            try {
                await updatePaymentController(req,res)
            } catch (error) {
                next(error)
            }
        }
    )

    app.route('/payment/:paymentId').delete(
        async (req:Request, res:Response, next:NextFunction) => {
            try {
                await deletePaymentController(req,res)
            } catch (error) {
                next(error)
            }
        }
    )

    app.route('/payment/booking/:bookingId').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getPaymentByBookingIdController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/payment/user/:userId').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getPaymentByUserIdController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )
}

export default payment;