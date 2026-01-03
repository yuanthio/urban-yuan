// e-commerce/backend/src/routes/publicProduct.ts
import { Router } from "express";
import { getPublicProducts } from "../controllers/publicProduct";
import { getPublicProductDetail } from "../controllers/publicProductDetail";

const router = Router();

router.get("/", getPublicProducts);
router.get("/detail/:id", getPublicProductDetail);

export default router;
