// e-commerce/backend/src/controllers/supplier.ts
import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export async function getSupplierStats(req: Request, res: Response) {
  const user = (req as any).user;

  // 1️⃣ total product
  const totalProducts = await prisma.product.count({
    where: { supplierId: user.id },
  });

  // 2️⃣ aggregate stock & value
  const aggregates = await prisma.product.aggregate({
    where: { supplierId: user.id },
    _sum: {
      stock: true,
      price: true,
    },
  });

  // 3️⃣ inventory value = sum(price * stock)
  const products = await prisma.product.findMany({
    where: { supplierId: user.id },
    select: { price: true, stock: true },
  });

  const inventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );

  // 4️⃣ latest products - AMBIL GAMBAR PERTAMA DARI PRODUCTIMAGE
  const latestProductsData = await prisma.product.findMany({
    where: { supplierId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      images: {
        orderBy: { order: 'asc' },
        take: 1,
      },
    },
  });

  // Format latest products dengan gambar pertama
  const latestProducts = latestProductsData.map(product => ({
    id: product.id,
    name: product.name,
    stock: product.stock,
    price: product.price,
    imageUrl: product.images[0]?.url || null,
    createdAt: product.createdAt,
  }));

  // 5️⃣ order statistics
  const orderStats = await prisma.order.aggregate({
    where: { supplierId: user.id },
    _count: true,
    _sum: {
      totalPrice: true,
    },
  });

  const pendingOrders = await prisma.order.count({
    where: { 
      supplierId: user.id,
      status: "PENDING"
    },
  });

  res.json({
    totalProducts,
    totalStock: aggregates._sum.stock ?? 0,
    inventoryValue,
    latestProducts,
    orderStats: {
      totalOrders: orderStats._count,
      totalRevenue: orderStats._sum.totalPrice ?? 0,
      pendingOrders: pendingOrders,
    },
  });
}

// GET supplier orders
export async function getSupplierOrders(req: Request, res: Response) {
  try {
    const supplierId = (req as any).user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    if (!supplierId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const whereClause: any = { supplierId };
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              avatarUrl: true,
            },
          },
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
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    // Format orders untuk response dengan size
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        size: item.size, // Sertakan size
        product: {
          ...item.product,
          imageUrl: item.product.images[0]?.url || null,
        }
      }))
    }));

    res.json({
      orders: formattedOrders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching supplier orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET single supplier order
export async function getSupplierOrderById(req: Request, res: Response) {
  try {
    const supplierId = (req as any).user?.id;
    const { orderId } = req.params;

    if (!supplierId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        supplierId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
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

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Format order untuk response dengan size
    const formattedOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        size: item.size, // Sertakan size
        product: {
          ...item.product,
          imageUrl: item.product.images[0]?.url || null,
        }
      }))
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error("Error fetching supplier order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// UPDATE order status (supplier can update status)
export async function updateOrderStatusSupplier(req: Request, res: Response) {
  try {
    const supplierId = (req as any).user?.id;
    const { orderId } = req.params;
    const { status, cancellationReason } = req.body;

    if (!supplierId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const validStatuses = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Check if order belongs to this supplier
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        supplierId,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // If cancelling, check if we need to restore stock
    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      await prisma.$transaction(async (tx) => {
        // Get order items
        const orderItems = await tx.orderItem.findMany({
          where: { orderId },
          include: { product: true },
        });

        // Restore stock for each item
        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: { 
            status,
            ...(cancellationReason && { cancellationReason }),
          },
        });
      });
    } else {
      // Regular status update
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status,
          ...(cancellationReason && { cancellationReason }),
        },
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
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

    // Format updated order untuk response
    const formattedOrder = updatedOrder ? {
      ...updatedOrder,
      items: updatedOrder.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          imageUrl: item.product.images[0]?.url || null,
        }
      }))
    } : null;

    res.json(formattedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET order statistics for dashboard
export async function getOrderStatistics(req: Request, res: Response) {
  try {
    const supplierId = (req as any).user?.id;

    if (!supplierId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const [
      totalOrders,
      pendingOrders,
      totalRevenue,
      monthlyOrders,
      weeklyOrders,
      statusCounts,
    ] = await Promise.all([
      prisma.order.count({ where: { supplierId } }),
      prisma.order.count({ where: { supplierId, status: "PENDING" } }),
      prisma.order.aggregate({
        where: { supplierId, status: { in: ["PAID", "SHIPPED", "COMPLETED"] } },
        _sum: { totalPrice: true },
      }),
      prisma.order.count({
        where: {
          supplierId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.order.count({
        where: {
          supplierId,
          createdAt: { gte: startOfWeek },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: { supplierId },
        _count: true,
      }),
    ]);

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      where: { supplierId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        items: {
          take: 1,
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
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Format recent orders untuk response
    const formattedRecentOrders = recentOrders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          imageUrl: item.product.images[0]?.url || null,
        }
      }))
    }));

    // Monthly revenue trend
    const monthlyRevenue = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        supplierId,
        createdAt: { gte: startOfMonth },
        status: { in: ["PAID", "SHIPPED", "COMPLETED"] },
      },
      _sum: { totalPrice: true },
    });

    res.json({
      overview: {
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        monthlyOrders,
        weeklyOrders,
      },
      statusDistribution: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      recentOrders: formattedRecentOrders,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE order (supplier)
export async function deleteOrderSupplier(req: Request, res: Response) {
  try {
    const supplierId = (req as any).user?.id;
    const { orderId } = req.params;

    if (!supplierId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if order belongs to this supplier
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        supplierId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Restore product stock for each item
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Delete order items first (cascade)
      await tx.orderItem.deleteMany({
        where: { orderId },
      });

      // Delete the order
      await tx.order.delete({
        where: { id: orderId },
      });
    });

    res.json({ 
      message: "Order deleted successfully",
      restoredStock: order.items.length > 0 
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}