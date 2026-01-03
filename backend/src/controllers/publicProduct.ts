// e-commerce/backend/src/controllers/publicProduct.ts
import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export async function getPublicProducts(req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1, // Ambil hanya gambar pertama untuk thumbnail
        },
      },
    });

    // Format response
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images[0]?.url || null, // Gambar pertama sebagai thumbnail
      description: product.description,
      stock: product.stock,
      size: product.size ? JSON.parse(product.size) : [],
      images: product.images.map(img => img.url), // Semua gambar
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching public products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
