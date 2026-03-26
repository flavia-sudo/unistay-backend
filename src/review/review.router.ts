import { Express, Response, Request, NextFunction } from 'express';
import { createReviewController, deleteReviewController, getReviewByIdController, getReviewByHostelIdController, getReviewByUserIdController, getReviewsController, updateReviewController } from './review.controller';

const review = (app: Express) => {
    app.route('/review').post(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await createReviewController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/review_all').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getReviewsController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/review/:reviewId').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getReviewByIdController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/review/:reviewId').put(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await updateReviewController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/review/:reviewId').delete(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await deleteReviewController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/review/hostel/:hostelId').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getReviewByHostelIdController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/review/user/:userId').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getReviewByUserIdController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )
}
export default review;