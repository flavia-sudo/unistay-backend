import { Request, Response } from "express";
import { createReviewService, getReviewByIdService, getReviewsService, getReviewByHostelIdService, deleteReviewService, updateReviewService, getReviewByUserIdService } from "./review.service";

export const createReviewController = async(req: Request, res: Response) => {
    try {
        const { hostel_id, user_id, rating, comment } = req.body;
        
        const newReview = await createReviewService({
            hostelId: hostel_id,
            userId: user_id,
            rating,
            comment
        });
        
        if (newReview) {
            res.status(201).json({
                message: "Review created successfully",
                data: newReview
            });
        } else {
            res.status(400).json({
                message: "Failed to create review"
            });
        }
    } catch (error: any){
        console.log(error);
        return res.status(500).json({error: error.message})
    }
}

export const getReviewsController = async (req: Request, res: Response) => {
    try {
        const reviews = await getReviewsService();
        res.status(200).json(reviews);
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const getReviewByIdController = async (req: Request, res: Response) => {
    try {
        const reviewId = parseInt(req.params.reviewId as string);
        if (isNaN(reviewId)) {
            return res.status(400).json({error: "Invalid review ID"});
        }
        const review = await getReviewByIdService(reviewId);
        if (review) {
            res.status(200).json(review);
        } else {
            res.status(404).json({error: "Review not found"});
        }
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const updateReviewController = async (req: Request, res: Response) => {
    try {
        const reviewId = parseInt(req.params.reviewId as string);
        if (isNaN(reviewId)) {
            return res.status(400).json({error: "Invalid review ID"});
        }
        const review = req.body;
        const payload = {
            ...review,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        console.log(payload)
        const updatedReview = await updateReviewService(reviewId, payload);
        if (updatedReview) {
            res.status(200).json({
                message: "Review updated successfully",
                data: updatedReview
            });
        } else {
            res.status(404).json({error: "Review not found"});
        }
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const deleteReviewController = async (req: Request, res: Response) => {
    try {
        const reviewId = parseInt(req.params.reviewId as string);
        if (isNaN(reviewId)) {
            return res.status(400).json({error: "Invalid review ID"});
        }
        const existingReview = await getReviewByIdService(reviewId);
        if (!existingReview) {
            return res.status(404).json({error: "Review not found"});
        }
        await deleteReviewService(reviewId);
        return res.status(204).json({error: "Review deleted successfully"})
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

export const getReviewByHostelIdController = async (req: Request, res: Response) => {
    try {
        const hostelId = parseInt(req.params.hostelId as string);
        if (isNaN(hostelId)) {
            return res.status(400).json({error: "Invalid hostel ID"});
        }
        const review = await getReviewByHostelIdService(hostelId);
        res.status(200).json(review);
    } catch (error: any) {
        return res.status(500).json({error: error.mesaage})
    }
}

export const getReviewByUserIdController = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId as string);
        if (isNaN(userId)) {
            return res.status(400).json({error: "Invalid user ID"});
        }
        const review = await getReviewByUserIdService(userId);
        res.status(200).json(review);
    } catch (error: any) {
        return res.status(500).json({error: error.mesaage})
    }
}