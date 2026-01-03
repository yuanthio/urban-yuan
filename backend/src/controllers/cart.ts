// e-commerce/backend/src/controllers/cart.ts
import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export async function getCart(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    console.log("Cart request - User ID:", userId);
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    // Check if user exists in Profile table
    const profile = await prisma.profile.findUnique({
      where: { id: userId }
    });

    if (!profile) {
      console.log("Profile not found for user:", userId);
      return res.status(401).json({ error: "Unauthorized - User profile not found" });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return res.json({ items: [] });
    }

    // Format response
    const formattedCart = {
      ...cart,
      items: cart.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        size: item.size,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          imageUrl: item.product.images[0]?.url || null,
          stock: item.product.stock,
          size: item.product.size ? JSON.parse(item.product.size) : [],
        },
      })),
    };

    res.json(formattedCart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function addToCart(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { productId, quantity = 1, size } = req.body; // TAMBAH PARAMETER SIZE

    console.log("Add to cart request - User ID:", userId);
    console.log("Add to cart request - Product ID:", productId);
    console.log("Add to cart request - Quantity:", quantity);
    console.log("Add to cart request - Size:", size);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    // Check if user exists in Profile table
    const profile = await prisma.profile.findUnique({
      where: { id: userId }
    });

    if (!profile) {
      console.log("Profile not found for user:", userId);
      return res.status(401).json({ error: "Unauthorized - User profile not found" });
    }

    if (!productId || quantity <= 0) {
      return res.status(400).json({ error: "Invalid product ID or quantity" });
    }

    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // Validasi size jika produk memiliki size options
    if (product.size) {
      try {
        const availableSizes = JSON.parse(product.size);
        if (availableSizes.length > 0 && !size) {
          return res.status(400).json({ error: "Size is required for this product" });
        }
        if (size && availableSizes.length > 0 && !availableSizes.includes(size)) {
          return res.status(400).json({ error: "Invalid size selected" });
        }
      } catch (error) {
        console.error("Error parsing product sizes:", error);
      }
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already exists in cart dengan size yang sama
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_size: { // Gunakan constraint baru yang termasuk size
          cartId: cart.id,
          productId,
          size: size || null,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({ error: "Insufficient stock" });
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          size, // Simpan size
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    // Format response
    const formattedCart = {
      ...updatedCart,
      items: updatedCart?.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        size: item.size,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          imageUrl: item.product.images[0]?.url || null,
          stock: item.product.stock,
          size: item.product.size ? JSON.parse(item.product.size) : [],
        },
      })) || [],
    };

    res.json(formattedCart);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateCartItem(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { itemId } = req.params;
    const { quantity, size } = req.body; // TAMBAH PARAMETER SIZE

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    if (quantity > cartItem.product.stock) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // Update size jika diberikan
    const updateData: any = { quantity };
    if (size !== undefined) {
      updateData.size = size;
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: updateData,
    });

    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function removeFromCart(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { itemId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}