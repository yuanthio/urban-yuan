// e-commerce/backend/src/controllers/payment.ts
import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { snap, core } from "../config/midtrans";
import { 
  MidtransTransactionParams, 
  MidtransResponse,
  MidtransTransactionStatus,
  PaymentNotification 
} from "../types/midtrans";

// Generate payment token
export async function createPaymentToken(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get order details
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Prepare transaction details - tanpa expiry untuk menghindari error format
    const transactionParams: MidtransTransactionParams = {
      transaction_details: {
        order_id: order.id,
        gross_amount: order.totalPrice,
      },
      item_details: order.items.map(item => ({
        id: item.productId,
        price: item.price,
        quantity: item.quantity,
        name: item.productName,
        category: "Fashion",
        merchant_name: "ShopHub",
      })),
      customer_details: {
        first_name: order.user.fullName?.split(' ')[0] || "Customer",
        last_name: order.user.fullName?.split(' ').slice(1).join(' ') || "",
        email: order.user.email,
      },
      callbacks: {
        finish: `${process.env.BACKEND_URL}/payment/callback`,
        error: `${process.env.BACKEND_URL}/payment/callback`,
        pending: `${process.env.BACKEND_URL}/payment/callback`,
      },
      // HAPUS expiry untuk sementara
      // expiry: {
      //   start_time: new Date().toISOString(),
      //   unit: "minutes",
      //   duration: 1440, // 24 hours
      // },
      custom_field1: userId,
      custom_field2: order.supplierId,
      custom_field3: order.status,
    };

    console.log('Creating payment token for order:', order.id);
    console.log('Transaction params:', JSON.stringify(transactionParams, null, 2));

    // Create transaction token
    const transactionToken = await snap.createTransactionToken(transactionParams);
    
    const response: MidtransResponse = {
      token: transactionToken,
      redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${transactionToken}`,
    };

    console.log('Payment token created successfully:', transactionToken);
    res.json(response);
  } catch (error: any) {
    console.error("Error creating payment token:", error);
    
    // Log detail error Midtrans
    if (error.ApiResponse) {
      console.error('Midtrans API Response:', error.ApiResponse);
    }
    
    res.status(500).json({ 
      error: "Failed to create payment",
      details: error.message || 'Unknown error'
    });
  }
}

// Handle payment notification from Midtrans
export async function handlePaymentNotification(req: Request, res: Response) {
  try {
    const notification: PaymentNotification = req.body;

    console.log('=== MIDTRANS NOTIFICATION RECEIVED ===');
    console.log('Full notification:', JSON.stringify(notification, null, 2));
    console.log('Order ID:', notification.order_id);
    console.log('Transaction status:', notification.transaction_status);
    console.log('Fraud status:', notification.fraud_status);
    console.log('Payment type:', notification.payment_type);
    console.log('Gross amount:', notification.gross_amount);
    console.log('Transaction time:', notification.transaction_time);
    console.log('=====================================');

    // Verify required fields
    if (!notification.order_id || !notification.transaction_status) {
      console.error('Missing required fields in notification');
      return res.status(400).json({ error: "Missing required fields" });
    }

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Get order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      console.error(`Order ${orderId} not found in database`);
      return res.status(404).json({ error: "Order not found" });
    }

    console.log(`Order found: ${order.id}, Current status: ${order.status}`);

    let newStatus = order.status;
    let shouldRestoreStock = false;

    // Handle different transaction statuses
    switch (transactionStatus) {
      case 'capture':
        if (fraudStatus === 'challenge') {
          // Card was challenged by FDS
          newStatus = 'PENDING';
          console.log(`Order ${orderId} status: PENDING (fraud challenge)`);
        } else if (fraudStatus === 'accept') {
          // Card was accepted
          newStatus = 'PAID';
          console.log(`Order ${orderId} status: PAID (capture accepted)`);
        } else {
          console.log(`Unhandled fraud status: ${fraudStatus} for capture`);
        }
        break;

      case 'settlement':
        // Payment is successful
        newStatus = 'PAID';
        console.log(`Order ${orderId} status: PAID (settlement)`);
        break;

      case 'pending':
        // Customer hasn't paid yet
        newStatus = 'PENDING';
        console.log(`Order ${orderId} status: PENDING`);
        break;

      case 'deny':
        // Payment was denied
        newStatus = 'CANCELLED';
        shouldRestoreStock = true;
        console.log(`Order ${orderId} status: CANCELLED (denied)`);
        break;

      case 'expire':
        // Payment expired
        newStatus = 'CANCELLED';
        shouldRestoreStock = true;
        console.log(`Order ${orderId} status: CANCELLED (expired)`);
        break;

      case 'cancel':
        // Payment was cancelled
        newStatus = 'CANCELLED';
        shouldRestoreStock = true;
        console.log(`Order ${orderId} status: CANCELLED (cancelled)`);
        break;

      default:
        console.log(`Unhandled transaction status: ${transactionStatus}`);
        newStatus = 'PENDING';
    }

    // Update order status in transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { 
          status: newStatus,
          // Simpan informasi tambahan dari Midtrans jika perlu
        },
      });

      console.log(`Order ${orderId} updated to status: ${newStatus}`);

      // Restore stock if order was cancelled
      if (shouldRestoreStock && newStatus === 'CANCELLED') {
        console.log(`Restoring stock for order ${orderId}...`);
        
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
          console.log(`Restored ${item.quantity} units for product ${item.productId}`);
        }
      }

      // Log the transaction update
      console.log(`Transaction completed for order ${orderId}:`, {
        oldStatus: order.status,
        newStatus: newStatus,
        transactionStatus: transactionStatus,
        fraudStatus: fraudStatus,
        stockRestored: shouldRestoreStock,
      });
    });

    // Send success response to Midtrans
    console.log('Sending success response to Midtrans');
    res.status(200).json({ 
      status: 'OK',
      message: 'Notification processed successfully',
      order_id: orderId,
      new_status: newStatus 
    });

  } catch (error) {
    console.error("Error handling payment notification:", error);
    
    // Log error details
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Check transaction status manually
export async function checkTransactionStatus(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    console.log(`Checking transaction status for order: ${orderId}`);

    try {
      // Check transaction status from Midtrans
      const transactionStatus = await core.transaction.status(orderId);
      
      console.log('Midtrans transaction status:', transactionStatus);

      const status: MidtransTransactionStatus = {
        transaction_id: transactionStatus.transaction_id,
        order_id: transactionStatus.order_id,
        gross_amount: transactionStatus.gross_amount,
        payment_type: transactionStatus.payment_type,
        transaction_time: transactionStatus.transaction_time,
        transaction_status: transactionStatus.transaction_status,
        fraud_status: transactionStatus.fraud_status,
        status_code: transactionStatus.status_code,
        status_message: transactionStatus.status_message,
        signature_key: transactionStatus.signature_key,
        settlement_time: transactionStatus.settlement_time,
        currency: transactionStatus.currency,
      };

      // Update local database status based on Midtrans status
      let newStatus = order.status;
      
      if (transactionStatus.transaction_status === 'settlement' || 
          transactionStatus.transaction_status === 'capture') {
        if (transactionStatus.fraud_status !== 'challenge') {
          newStatus = 'PAID';
        }
      } else if (transactionStatus.transaction_status === 'pending') {
        newStatus = 'PENDING';
      } else if (['deny', 'expire', 'cancel'].includes(transactionStatus.transaction_status)) {
        newStatus = 'CANCELLED';
      }

      // Update if status changed
      if (newStatus !== order.status) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: newStatus },
        });
        console.log(`Updated order ${orderId} status from ${order.status} to ${newStatus}`);
      }

      res.json({
        ...status,
        local_status: order.status,
        updated_status: newStatus,
        status_changed: newStatus !== order.status,
      });

    } catch (midtransError: any) {
      console.error('Midtrans API Error:', midtransError);
      
      // Fallback: return current order status
      res.json({
        order_id: orderId,
        transaction_status: 'unknown',
        local_status: order.status,
        message: 'Could not fetch from Midtrans, using local status',
        error: midtransError.message,
      });
    }

  } catch (error) {
    console.error("Error checking transaction status:", error);
    res.status(500).json({ error: "Failed to check transaction status" });
  }
}

// Manual status update endpoint (for testing/debugging)
export async function manualUpdateOrderStatus(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const validStatuses = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    console.log(`Manual status update for order ${orderId}: ${order.status} -> ${status}`);

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Restore stock if cancelling
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
      console.log(`Stock restored for cancelled order ${orderId}`);
    }

    res.json({
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });

  } catch (error) {
    console.error("Error manually updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
}

// Cancel transaction
export async function cancelTransaction(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
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

    console.log(`Cancelling transaction for order: ${orderId}`);

    try {
      // Try to cancel transaction in Midtrans
      const cancelResult = await core.transaction.cancel(orderId);
      console.log('Midtrans cancel result:', cancelResult);
    } catch (midtransError) {
      console.warn('Could not cancel in Midtrans (may not exist yet):', midtransError);
    }

    // Update order status to CANCELLED
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    console.log(`Order ${orderId} cancelled and stock restored`);

    res.json({
      message: "Transaction cancelled successfully",
      stock_restored: order.items.length > 0,
      order_id: orderId,
    });
  } catch (error) {
    console.error("Error cancelling transaction:", error);
    res.status(500).json({ error: "Failed to cancel transaction" });
  }
}

// Get available payment methods
export async function getPaymentMethods(req: Request, res: Response) {
  try {
    const paymentMethods = [
      {
        id: 'credit_card',
        name: 'Credit Card',
        description: 'Pay with Visa, MasterCard, or JCB',
        icon: 'credit-card',
        enabled: true,
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Transfer via BCA, BNI, BRI, or Mandiri',
        icon: 'bank',
        enabled: true,
        banks: ['bca', 'bni', 'bri', 'mandiri'],
      },
      {
        id: 'gopay',
        name: 'GoPay',
        description: 'Pay with GoPay wallet',
        icon: 'wallet',
        enabled: true,
      },
      {
        id: 'shopeepay',
        name: 'ShopeePay',
        description: 'Pay with ShopeePay',
        icon: 'shopping-bag',
        enabled: true,
      },
      {
        id: 'qris',
        name: 'QRIS',
        description: 'Scan QR code to pay',
        icon: 'qr-code',
        enabled: true,
      },
      {
        id: 'cstore',
        name: 'Convenience Store',
        description: 'Pay at Alfamart or Indomaret',
        icon: 'store',
        enabled: true,
        stores: ['alfamart', 'indomaret'],
      },
    ];

    res.json(paymentMethods);
  } catch (error) {
    console.error("Error getting payment methods:", error);
    res.status(500).json({ error: "Failed to get payment methods" });
  }
}

// Debug endpoint to see all pending orders
export async function getPendingOrders(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const pendingOrders = await prisma.order.findMany({
      where: {
        userId,
        status: 'PENDING',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      count: pendingOrders.length,
      orders: pendingOrders,
    });
  } catch (error) {
    console.error("Error getting pending orders:", error);
    res.status(500).json({ error: "Failed to get pending orders" });
  }
}