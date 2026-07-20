import express from "express";
import { getPlans, purchasePlan, verifyPayment } from "../controllers/creditController.js";
import { protect } from "../middlewares/auth.js";

const creditRouter = express.Router()

creditRouter.get('/plan', getPlans)
creditRouter.post('/purchase', protect, purchasePlan)
creditRouter.post('/verify', protect, verifyPayment)   // New route for Razorpay payment verification

export default creditRouter