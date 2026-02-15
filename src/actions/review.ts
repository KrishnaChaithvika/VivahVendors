"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators/review";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function submitReview(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Please log in to leave a review" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { listingId, bookingId, rating, title, content } = parsed.data;

  // Check listing exists
  const listing = await prisma.vendorListing.findUnique({
    where: { id: listingId },
    select: { id: true, vendorProfileId: true },
  });
  if (!listing) return { success: false, error: "Listing not found" };

  // Check for duplicate review
  if (bookingId) {
    const existing = await prisma.review.findUnique({
      where: { bookingId },
    });
    if (existing) return { success: false, error: "You have already reviewed this booking" };
  }

  // Create review
  await prisma.review.create({
    data: {
      customerId: session.user.id,
      listingId,
      bookingId: bookingId || null,
      rating,
      title: title || null,
      content,
    },
  });

  // Update vendor profile rating aggregates
  const stats = await prisma.review.aggregate({
    where: { listing: { vendorProfileId: listing.vendorProfileId } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.vendorProfile.update({
    where: { id: listing.vendorProfileId },
    data: {
      averageRating: stats._avg.rating ?? 0,
      totalReviews: stats._count.rating,
    },
  });

  return { success: true };
}
