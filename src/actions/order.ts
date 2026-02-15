"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { orderSchema } from "@/lib/validators/package";

export type ActionResult = {
  success: boolean;
  error?: string;
  orderId?: string;
};

export async function createOrder(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Please log in to place an order" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { packageId, listingId, eventDate, customerNote } = parsed.data;

  // Verify package exists and is active
  const pkg = await prisma.vendorPackage.findUnique({
    where: { id: packageId },
    include: {
      listing: {
        include: {
          vendorProfile: { select: { orderMode: true } },
        },
      },
    },
  });

  if (!pkg || !pkg.isActive || pkg.listingId !== listingId) {
    return { success: false, error: "Package not found or inactive" };
  }

  const order = await prisma.order.create({
    data: {
      customerId: session.user.id,
      packageId,
      listingId,
      totalAmount: pkg.price,
      currency: pkg.currency,
      eventDate: eventDate ? new Date(eventDate) : null,
      customerNote: customerNote || null,
      orderType: "PLATFORM",
      paymentStatus: "PENDING",
    },
  });

  return { success: true, orderId: order.id };
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: string,
  paymentIntentId?: string,
  paymentProvider?: string
): Promise<ActionResult> {
  // This would typically be called from a webhook handler
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { success: false, error: "Order not found" };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: paymentStatus as "PENDING" | "PAID" | "REFUNDED" | "FAILED",
      paymentIntentId: paymentIntentId ?? order.paymentIntentId,
      paymentProvider: paymentProvider
        ? (paymentProvider as "STRIPE" | "RAZORPAY")
        : order.paymentProvider,
    },
  });

  return { success: true };
}
