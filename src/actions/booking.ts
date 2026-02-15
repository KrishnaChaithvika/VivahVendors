"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { bookingRequestSchema, quoteSchema } from "@/lib/validators/booking";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createBookingRequest(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Please log in to request a booking" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = bookingRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  // Verify listing exists and is published
  const listing = await prisma.vendorListing.findUnique({
    where: { id: data.listingId },
    select: { id: true, isPublished: true, currency: true },
  });
  if (!listing || !listing.isPublished) {
    return { success: false, error: "Listing not found" };
  }

  await prisma.booking.create({
    data: {
      customerId: session.user.id,
      listingId: data.listingId,
      eventDate: new Date(data.eventDate),
      eventType: data.eventType || null,
      guestCount: data.guestCount,
      eventCity: data.eventCity || null,
      eventVenue: data.eventVenue || null,
      customerNote: data.customerNote || null,
      currency: listing.currency,
      status: "INQUIRY",
    },
  });

  return { success: true };
}

export async function sendQuote(
  bookingId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: { include: { vendorProfile: { select: { userId: true } } } },
    },
  });

  if (!booking || booking.listing.vendorProfile.userId !== session.user.id) {
    return { success: false, error: "Booking not found" };
  }
  if (booking.status !== "INQUIRY") {
    return { success: false, error: "Quote can only be sent for inquiries" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      quotedPrice: parsed.data.quotedPrice,
      currency: parsed.data.currency,
      vendorNote: parsed.data.vendorNote || null,
      status: "QUOTE_SENT",
    },
  });

  return { success: true };
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: { include: { vendorProfile: { select: { userId: true } } } },
    },
  });

  if (!booking) return { success: false, error: "Booking not found" };

  const isVendor = booking.listing.vendorProfile.userId === session.user.id;
  const isCustomer = booking.customerId === session.user.id;

  // Validate status transitions
  const validTransitions: Record<string, { status: string; by: "vendor" | "customer" }[]> = {
    INQUIRY: [
      { status: "QUOTE_SENT", by: "vendor" },
      { status: "DECLINED", by: "vendor" },
      { status: "CANCELLED", by: "customer" },
    ],
    QUOTE_SENT: [
      { status: "ACCEPTED", by: "customer" },
      { status: "CANCELLED", by: "customer" },
      { status: "DECLINED", by: "vendor" },
    ],
    ACCEPTED: [
      { status: "CONFIRMED", by: "vendor" },
      { status: "CANCELLED", by: "customer" },
    ],
    CONFIRMED: [
      { status: "COMPLETED", by: "vendor" },
      { status: "CANCELLED", by: "customer" },
    ],
  };

  const allowed = validTransitions[booking.status];
  if (!allowed) {
    return { success: false, error: "No further status changes allowed" };
  }

  const transition = allowed.find((t) => t.status === newStatus);
  if (!transition) {
    return { success: false, error: `Cannot change status from ${booking.status} to ${newStatus}` };
  }

  if (
    (transition.by === "vendor" && !isVendor) ||
    (transition.by === "customer" && !isCustomer)
  ) {
    return { success: false, error: "You are not authorized to perform this action" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: newStatus as typeof booking.status },
  });

  return { success: true };
}
