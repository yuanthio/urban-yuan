// e-commerce/backend/src/routes/cart.ts
import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cart";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:itemId", updateCartItem);
router.delete("/:itemId", removeFromCart);

export default router;
