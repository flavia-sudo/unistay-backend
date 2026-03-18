import { Express, Response, Request, NextFunction } from 'express';
import { createHostelController, deleteHostelController, getHostelByIdController, getHostelsController, getHostelByUserIdController, updateHostelController } from './hostel.controller';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: 'uploads/hostels/',
    filename: (req, file, cb) => {cb(null, Date.now() + '-' + file.originalname)}
});

const upload = multer({storage});

const hostel = (app: Express) => {
    app.route('/hostel').post(
        upload.single('image'),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await createHostelController(req, res)
            } catch (error) {
                next(error)
            }
        }
    )

    app.route('/hostel_all').get(
        async (req: Request, res: Response, next: NextFunction) =>{
            try {
                await getHostelsController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/hostel/:hostelId').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getHostelByIdController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/hostel/:hostelId').put(
        upload.single('image'),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await updateHostelController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/hostel/:hostelId').delete(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await deleteHostelController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )

    app.route('/hostel/user/:userId').get(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await getHostelByUserIdController(req, res)
            } catch (error) {
                next (error)
            }
        }
    )
}

export default hostel