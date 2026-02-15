import { NextResponse } from "next/server";

/**
 * Stripe webhook handler stub.
 * In production, this would:
 * 1. Verify the webhook signature using STRIPE_WEBHOOK_SECRET
 * 2. Parse the event (checkout.session.completed, payment_intent.succeeded, etc.)
 * 3. Update the corresponding Order's paymentStatus
 * 4. Send confirmation emails via Resend
 */
export async function POST(request: Request) {
  const body = await request.text();

  // TODO: Verify Stripe signature
  // const sig = request.headers.get("stripe-signature");
  // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  console.log("Stripe webhook received:", body.slice(0, 100));

  // TODO: Process event and update order status

  return NextResponse.json({ received: true });
}
