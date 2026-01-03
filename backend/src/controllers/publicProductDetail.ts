// e-commerce/backend/src/controllers/publicProductDetail.ts
import { Request, Response } from "express";
import { prisma } from "../prisma/client";

// Simple UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getPublicProductDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Validate UUID format
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

    // Format response dengan semua gambar
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      size: product.size ? JSON.parse(product.size) : [],
      images: product.images.map(img => img.url), // Semua gambar
      imageUrl: product.images[0]?.url || null, // Gambar pertama untuk kompatibilitas
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error("Error fetching product detail:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
