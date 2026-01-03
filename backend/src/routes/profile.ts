// e-commerce/backend/src/routes/profile.ts
import express from "express";
import { authenticate } from "../middlewares/auth";
import { 
  getProfile, 
  updateProfile, 
  deleteProfile 
} from "../controllers/profile";

const router = express.Router();

// Semua route membutuhkan authentication
router.use(authenticate);

// GET profile user
router.get("/", getProfile);

// UPDATE profile user
router.put("/", updateProfile);

// DELETE profile data
router.delete("/", deleteProfile);

export default router;