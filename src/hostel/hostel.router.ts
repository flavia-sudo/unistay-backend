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
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../cloudinary/cloudinary';

const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
        folder: 'hostels',
        allowed_foramts: ['jpg', 'png', 'jpeg'],
    }),
});

const upload = multer({ storage });

const hostel = (app: Express) => {

  app.post(
    '/hostel',
    upload.any(),
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
    upload.any(), // optional image
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