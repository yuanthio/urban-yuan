// e-commerce/backend/src/routes/auth.ts 
import express from "express";
import { authenticate } from "../middlewares/auth";
import { requireRole } from "../middlewares/role";
import { getMe } from "../controllers/auth";

const router = express.Router();

// USER
router.get(
  "/me",
  authenticate,
  requireRole("user"),
  getMe
);

// SUPPLIER
router.get(
  "/supplier/me",
  authenticate,
  requireRole("supplier"),
  getMe
);

export default router;

