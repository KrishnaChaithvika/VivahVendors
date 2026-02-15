"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { vendorPackageSchema } from "@/lib/validators/package";

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

export async function createPackage(
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

  const raw = Object.fromEntries(formData.entries());
  const parsed = vendorPackageSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const inclusions = data.inclusions
    ? data.inclusions.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  await prisma.vendorPackage.create({
    data: {
      listingId,
      name: data.name,
      description: data.description || null,
      price: data.price,
      currency: data.currency,
      inclusions,
      duration: data.duration || null,
      maxGuestCount: data.maxGuestCount,
      isActive: data.isActive,
    },
  });

  return { success: true };
}

export async function updatePackage(
  packageId: string,
  formData: FormData
): Promise<ActionResult> {
  const user = await getVendorUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const pkg = await prisma.vendorPackage.findUnique({
    where: { id: packageId },
    include: {
      listing: { include: { vendorProfile: { select: { userId: true } } } },
    },
  });
  if (!pkg || pkg.listing.vendorProfile.userId !== user.id) {
    return { success: false, error: "Package not found" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = vendorPackageSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const inclusions = data.inclusions
    ? data.inclusions.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  await prisma.vendorPackage.update({
    where: { id: packageId },
    data: {
      name: data.name,
      description: data.description || null,
      price: data.price,
      currency: data.currency,
      inclusions,
      duration: data.duration || null,
      maxGuestCount: data.maxGuestCount,
      isActive: data.isActive,
    },
  });

  return { success: true };
}

export async function deletePackage(packageId: string): Promise<ActionResult> {
  const user = await getVendorUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const pkg = await prisma.vendorPackage.findUnique({
    where: { id: packageId },
    include: {
      listing: { include: { vendorProfile: { select: { userId: true } } } },
    },
  });
  if (!pkg || pkg.listing.vendorProfile.userId !== user.id) {
    return { success: false, error: "Package not found" };
  }

  await prisma.vendorPackage.delete({ where: { id: packageId } });
  return { success: true };
}
