// e-commerce/backend/src/app.ts
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";

import authRoute from "./routes/auth";
import productRoute from "./routes/product";
import supplierRoute from "./routes/supplier";
import publicProductRoute from "./routes/publicProduct";
import cartRoute from "./routes/cart";
import orderRoute from "./routes/order";
import profileRoute from "./routes/profile";
import paymentRoute from "./routes/payment";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoute);
app.use("/products", productRoute);
app.use("/supplier", supplierRoute);
app.use("/public", publicProductRoute);
app.use("/cart", cartRoute);
app.use("/orders", orderRoute);
app.use("/profile", profileRoute);
app.use("/payment", paymentRoute);

// Direct test route for products
app.get("/public/products", async (req, res) => {
  try {
    const { prisma } = await import("./prisma/client");
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await prisma.product.count();
    
    // Get products with pagination and images
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
    });
    
    // Format products dengan size
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images[0]?.url || null,
      description: product.description,
      stock: product.stock,
      size: product.size ? JSON.parse(product.size) : [],
      images: product.images.map(img => img.url),
    }));
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({
      products: formattedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error("Direct route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Direct route for product detail
app.get("/public/products/detail/:id", async (req, res) => {
  try {
    const { prisma } = await import("./prisma/client");
    const { id } = req.params;
    
    // Simple UUID validation
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Format response dengan semua gambar dan size
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      size: product.size ? JSON.parse(product.size) : [],
      images: product.images.map(img => img.url),
      imageUrl: product.images[0]?.url || null,
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error("Direct detail route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});