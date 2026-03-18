import { Express, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  createHostelController,
  updateHostelController,
  getHostelsController,
  getHostelByIdController,
  getHostelByUserIdController,
  deleteHostelController,
} from './hostel.controller';

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/hostels');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

const hostel = (app: Express) => {

  app.post(
    '/hostel',
    upload.single('image'), // form-data key must be 'image'
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await createHostelController(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/hostel_all',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await getHostelsController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/hostel/:hostelId',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await getHostelByIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.put(
    '/hostel/:hostelId',
    upload.single('image'), // optional image
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await updateHostelController(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.delete(
    '/hostel/:hostelId',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await deleteHostelController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/hostel/user/:userId',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await getHostelByUserIdController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );
};

export default hostel;