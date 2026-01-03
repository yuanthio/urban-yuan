// e-commerce/backend/src/routes/product.ts
import express from "express";
import { authenticate } from "../middlewares/auth";
import { requireRole } from "../middlewares/role";
import {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/product";

const router = express.Router();

router.use(authenticate, requireRole("supplier"));

router.post("/", createProduct);
router.get("/", getMyProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
