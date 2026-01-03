// e-commerce/backend/src/controllers/product.ts
import { Request, Response } from "express";
import { prisma } from "../prisma/client";

// CREATE
export async function createProduct(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { name, description, price, stock, size, images } = req.body;

    // Validasi size harus array
    let sizeArray = [];
    if (size) {
      try {
        sizeArray = Array.isArray(size) ? size : JSON.parse(size);
        if (!Array.isArray(sizeArray)) {
          return res.status(400).json({ error: "Size must be an array" });
        }
      } catch (error) {
        return res.status(400).json({ error: "Invalid size format" });
      }
    }

    const product = await prisma.$transaction(async (tx) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          supplierId: user.id,
          name,
          description,
          price,
          stock,
          size: JSON.stringify(sizeArray), // Simpan sebagai JSON string
        },
      });

      // Create product images if provided
      if (images && Array.isArray(images) && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await tx.productImage.create({
            data: {
              productId: newProduct.id,
              url: images[i],
              order: i,
            },
          });
        }
      }

      // Get product with images
      const productWithImages = await tx.product.findUnique({
        where: { id: newProduct.id },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return productWithImages;
    });

    res.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// READ (supplier only)
export async function getMyProducts(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    const products = await prisma.product.findMany({
      where: { supplierId: user.id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Parse size dari JSON string
    const formattedProducts = products.map(product => ({
      ...product,
      size: product.size ? JSON.parse(product.size) : [],
      images: product.images.map(img => img.url),
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// UPDATE
export async function updateProduct(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { name, description, price, stock, size, images } = req.body;

    // Validasi size harus array
    let sizeArray = [];
    if (size !== undefined) {
      try {
        sizeArray = Array.isArray(size) ? size : JSON.parse(size);
        if (!Array.isArray(sizeArray)) {
          return res.status(400).json({ error: "Size must be an array" });
        }
      } catch (error) {
        return res.status(400).json({ error: "Invalid size format" });
      }
    }

    const product = await prisma.$transaction(async (tx) => {
      // Update product data
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (stock !== undefined) updateData.stock = stock;
      if (size !== undefined) updateData.size = JSON.stringify(sizeArray);

      await tx.product.updateMany({
        where: {
          id,
          supplierId: user.id,
        },
        data: updateData,
      });

      // Update images if provided
      if (images && Array.isArray(images)) {
        // Delete existing images
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        // Add new images
        for (let i = 0; i < images.length; i++) {
          await tx.productImage.create({
            data: {
              productId: id,
              url: images[i],
              order: i,
            },
          });
        }
      }

      // Get updated product with images
      const updatedProduct = await tx.product.findUnique({
        where: { id },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return updatedProduct;
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      ...product,
      size: product.size ? JSON.parse(product.size) : [],
      images: product.images.map(img => img.url),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE
export async function deleteProduct(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    await prisma.product.deleteMany({
      where: {
        id,
        supplierId: user.id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
