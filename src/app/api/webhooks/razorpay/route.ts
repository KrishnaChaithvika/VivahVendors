import { NextResponse } from "next/server";

/**
 * Razorpay webhook handler stub.
 * In production, this would:
 * 1. Verify the webhook signature using RAZORPAY_WEBHOOK_SECRET
 * 2. Parse the event (payment.captured, payment.failed, etc.)
 * 3. Update the corresponding Order's paymentStatus
 * 4. Send confirmation emails via Resend
 */
export async function POST(request: Request) {
  const body = await request.text();

  // TODO: Verify Razorpay signature
  // const sig = request.headers.get("x-razorpay-signature");
  // const isValid = validateWebhookSignature(body, sig, process.env.RAZORPAY_WEBHOOK_SECRET);

  console.log("Razorpay webhook received:", body.slice(0, 100));

  // TODO: Process event and update order status

  return NextResponse.json({ received: true });
}
