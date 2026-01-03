// e-commerce/backend/src/routes/supplier.ts
import express from "express";
import { authenticate } from "../middlewares/auth";
import { requireRole } from "../middlewares/role";
import { 
  getSupplierStats, 
  getSupplierOrders, 
  getSupplierOrderById, 
  updateOrderStatusSupplier,
  getOrderStatistics,
  deleteOrderSupplier  // ← TAMBAH INI
} from "../controllers/supplier";

const router = express.Router();

router.use(authenticate, requireRole("supplier"));

router.get("/stats", getSupplierStats);
router.get("/orders", getSupplierOrders);
router.get("/orders/statistics", getOrderStatistics);
router.get("/orders/:orderId", getSupplierOrderById);
router.put("/orders/:orderId/status", updateOrderStatusSupplier);
router.delete("/orders/:orderId", deleteOrderSupplier);  // ← TAMBAH INI

export default router;