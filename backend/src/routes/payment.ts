// e-commerce/backend/src/routes/payment.ts
import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
  createPaymentToken,
  handlePaymentNotification,
  checkTransactionStatus,
  cancelTransaction,
  getPaymentMethods,
  manualUpdateOrderStatus,
  getPendingOrders,
} from "../controllers/payment";

const router = Router();

// Public route for Midtrans notification (no authentication needed)
// NOTE: Midtrans mengirim POST request dengan content-type application/x-www-form-urlencoded
router.post("/notification", handlePaymentNotification);

// Debug route untuk test notification (GET untuk testing)
router.get("/notification-test", (req, res) => {
  console.log('Notification test endpoint hit');
  res.json({ message: 'Notification endpoint is working' });
});

// Protected routes (require authentication)
router.use(authenticate);

router.get("/methods", getPaymentMethods);
router.post("/:orderId/token", createPaymentToken);
router.get("/:orderId/status", checkTransactionStatus);
router.post("/:orderId/cancel", cancelTransaction);
router.post("/:orderId/manual-update", manualUpdateOrderStatus);
router.get("/pending-orders", getPendingOrders);

export default router;