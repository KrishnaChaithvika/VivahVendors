"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { vendorProfileSchema, vendorListingSchema } from "@/lib/validators/vendor";
import slugify from "slugify";

export type ActionResult = {
  success: boolean;
  error?: string;
};

async function getVendorUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const role = (session.user as { role?: string }).role;
  if (role !== "VENDOR") return null;
  return session.user;
}

export async function upsertVendorProfile(formData: FormData): Promise<ActionResult> {
  const user = await getVendorUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = vendorProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const slug = slugify(data.businessName, { lower: true, strict: true });

  const existing = await prisma.vendorProfile.findUnique({
    where: { userId: user.id },
  });

  if (existing) {
    await prisma.vendorProfile.update({
      where: { id: existing.id },
      data: {
        ...data,
        slug: existing.slug, // don't change slug on update
        contactEmail: data.contactEmail || null,
        websiteUrl: data.websiteUrl || null,
      },
    });
  } else {
    // Ensure unique slug
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.vendorProfile.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    await prisma.vendorProfile.create({
      data: {
        userId: user.id,
        businessName: data.businessName,
        slug: finalSlug,
        description: data.description,
        shortBio: data.shortBio,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone,
        websiteUrl: data.websiteUrl || null,
        country: data.country,
        state: data.state,
        city: data.city,
        addressLine: data.addressLine,
        postalCode: data.postalCode,
        yearsInBusiness: data.yearsInBusiness,
        teamSize: data.teamSize,
        currency: data.currency,
        orderMode: data.orderMode,
      },
    });
  }

  return { success: true };
}

export async function createListing(formData: FormData): Promise<ActionResult & { listingId?: string }> {
  const user = await getVendorUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) return { success: false, error: "Please set up your business profile first" };

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    priceType: formData.get("priceType"),
    priceMin: formData.get("priceMin") || undefined,
    priceMax: formData.get("priceMax") || undefined,
    currency: formData.get("currency") || profile.currency,
    priceUnit: formData.get("priceUnit") || undefined,
    externalPurchaseUrl: formData.get("externalPurchaseUrl") || undefined,
    categoryIds: formData.getAll("categoryIds"),
    culturalTagIds: formData.getAll("culturalTagIds"),
    isPublished: formData.get("isPublished") === "true",
  };

  const parsed = vendorListingSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  // Generate unique slug
  let slug = slugify(data.title, { lower: true, strict: true });
  let counter = 1;
  while (await prisma.vendorListing.findUnique({ where: { slug } })) {
    slug = `${slugify(data.title, { lower: true, strict: true })}-${counter}`;
    counter++;
  }

  const listing = await prisma.vendorListing.create({
    data: {
      vendorProfileId: profile.id,
      title: data.title,
      slug,
      description: data.description,
      priceType: data.priceType,
      priceMin: data.priceMin,
      priceMax: data.priceMax,
      currency: data.currency,
      priceUnit: data.priceUnit || null,
      externalPurchaseUrl: data.externalPurchaseUrl || null,
      isPublished: data.isPublished,
      categories: {
        create: data.categoryIds.map((categoryId) => ({ categoryId })),
      },
      culturalTags: {
        create: data.culturalTagIds.map((taxonomyTermId) => ({ taxonomyTermId })),
      },
    },
  });

  return { success: true, listingId: listing.id };
}

export async function updateListing(
  listingId: string,
  formData: FormData
): Promise<ActionResult> {
  const user = await getVendorUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const listing = await prisma.vendorListing.findUnique({
    where: { id: listingId },
    include: { vendorProfile: { select: { userId: true } } },
  });
  if (!listing || listing.vendorProfile.userId !== user.id) {
    return { success: false, error: "Listing not found" };
  }

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    priceType: formData.get("priceType"),
    priceMin: formData.get("priceMin") || undefined,
    priceMax: formData.get("priceMax") || undefined,
    currency: formData.get("currency"),
    priceUnit: formData.get("priceUnit") || undefined,
    externalPurchaseUrl: formData.get("externalPurchaseUrl") || undefined,
    categoryIds: formData.getAll("categoryIds"),
    culturalTagIds: formData.getAll("culturalTagIds"),
    isPublished: formData.get("isPublished") === "true",
  };

  const parsed = vendorListingSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  await prisma.$transaction([
    // Delete existing relations
    prisma.vendorListingCategory.deleteMany({ where: { listingId } }),
    prisma.vendorListingCulturalTag.deleteMany({ where: { listingId } }),
    // Update listing
    prisma.vendorListing.update({
      where: { id: listingId },
      data: {
        title: data.title,
        description: data.description,
        priceType: data.priceType,
        priceMin: data.priceMin,
        priceMax: data.priceMax,
        currency: data.currency,
        priceUnit: data.priceUnit || null,
        externalPurchaseUrl: data.externalPurchaseUrl || null,
        isPublished: data.isPublished,
        categories: {
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
        },
        culturalTags: {
          create: data.culturalTagIds.map((taxonomyTermId) => ({ taxonomyTermId })),
        },
      },
    }),
  ]);

  return { success: true };
}

export async function deleteListing(listingId: string): Promise<ActionResult> {
  const user = await getVendorUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const listing = await prisma.vendorListing.findUnique({
    where: { id: listingId },
    include: { vendorProfile: { select: { userId: true } } },
  });
  if (!listing || listing.vendorProfile.userId !== user.id) {
    return { success: false, error: "Listing not found" };
  }

  await prisma.vendorListing.delete({ where: { id: listingId } });
  return { success: true };
}

export async function toggleListingPublished(listingId: string): Promise<ActionResult> {
  const user = await getVendorUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const listing = await prisma.vendorListing.findUnique({
    where: { id: listingId },
    include: { vendorProfile: { select: { userId: true } } },
  });
  if (!listing || listing.vendorProfile.userId !== user.id) {
    return { success: false, error: "Listing not found" };
  }

  await prisma.vendorListing.update({
    where: { id: listingId },
    data: { isPublished: !listing.isPublished },
  });

  return { success: true };
}
