import { Express, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

import {
  createHostelController,
  updateHostelController,
  getHostelsController,
  getHostelByIdController,
  getHostelByUserIdController,
  deleteHostelController,
  createHostelWithRoomsController, // ✅ ADD THIS
} from './hostel.controller';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (_req: any, _file: any) => ({
    folder: 'hostels',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  }),
});

const upload = multer({ storage });

const hostel = (app: Express) => {

  // =====================================================
  // ✅ NEW ROUTE (MUST BE BEFORE OTHER /hostel ROUTES)
  // =====================================================
  app.post(
    '/hostel/with-rooms',
    upload.single('file'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await createHostelWithRoomsController(req as any, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // =====================================================
  // EXISTING ROUTES
  // =====================================================

  app.post(
    '/hostel',
    upload.single('file'),
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
    '/hostel/user/:userId',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await getHostelByUserIdController(req, res);
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
    upload.single('file'),
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
};

export default hostel;