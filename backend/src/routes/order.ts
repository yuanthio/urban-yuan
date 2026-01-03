// e-commerce/backend/src/routes/order.ts
import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/:orderId", getOrderById);
router.put("/:orderId/status", updateOrderStatus);

export default router;