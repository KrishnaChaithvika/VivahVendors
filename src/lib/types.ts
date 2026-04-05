import type { Prisma } from "@prisma/client";

/**
 * The shape returned by searchVendors/getFeaturedVendors.
 * Matches the `vendorInclude` in vendor.service.ts.
 */
export type VendorListingWithRelations = Prisma.VendorListingGetPayload<{
  include: {
    vendorProfile: true;
    images: true;
    categories: { include: { category: true } };
    culturalTags: {
      include: { taxonomyTerm: { include: { taxonomyType: true } } };
    };
    packages: true;
    _count: { select: { reviews: true; bookings: true } };
  };
}>;
