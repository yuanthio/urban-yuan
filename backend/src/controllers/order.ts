// e-commerce/backend/src/controllers/order.ts
import { Request, Response } from "express";
import { prisma } from "../prisma/client";

interface OrderItemRequest {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string; // TAMBAH FIELD SIZE
  imageUrl?: string;
}

interface CreateOrderRequest {
  items: OrderItemRequest[];
  totalPrice: number;
}

export async function createOrder(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { items, totalPrice }: CreateOrderRequest = req.body;

    console.log("=== CREATE ORDER ===");
    console.log("User ID:", userId);
    console.log("Items:", JSON.stringify(items, null, 2));
    console.log("Total Price:", totalPrice);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    // Check if user exists
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized - User profile not found" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items in order" });
    }

    // Validate all items
    for (const item of items) {
      if (!item.productId || !item.productName || !item.price || !item.quantity) {
        return res.status(400).json({ 
          error: "Invalid item data. All fields are required.",
          item 
        });
      }
    }

    // Get supplier ID from first product
    const firstProduct = await prisma.product.findUnique({
      where: { id: items[0].productId },
      include: { supplier: true },
    });

    if (!firstProduct) {
      return res.status(404).json({ error: `Product ${items[0].productId} not found` });
    }

    const supplierId = firstProduct.supplierId;
    console.log("Supplier ID:", supplierId);

    // Check stock and supplier consistency
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      if (product.supplierId !== supplierId) {
        return res.status(400).json({
          error: "All items must be from the same supplier in one order",
        });
      }
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          supplierId,
          totalPrice,
          status: "PENDING",
        },
      });

      console.log(`Created order: ${newOrder.id}`);

      // Create order items and update product stock
      for (const item of items) {
        console.log(`Creating order item for product ${item.productId}, quantity: ${item.quantity}`);
        
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            supplierId: supplierId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            imageUrl: item.imageUrl,
          },
        });

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        console.log(`Updated stock for product ${item.productId}`);
      }

      return newOrder;
    });

    console.log(`Order ${order.id} created successfully`);
    console.log("=========================");

    res.status(201).json({
      id: order.id,
      message: "Order created successfully",
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        size: item.size
      }))
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Duplicate order detected" });
    } else if (error.code === 'P2003') {
      return res.status(400).json({ error: "Foreign key constraint failed" });
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function getUserOrders(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format orders untuk menyertakan size
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        size: item.size // Sertakan size di response
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Format order untuk menyertakan size
    const formattedOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        size: item.size // Sertakan size di response
      }))
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    const validStatuses = [
      "PENDING",
      "PAID",
      "SHIPPED",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}