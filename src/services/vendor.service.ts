import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface VendorSearchFilters {
  query?: string;
  category?: string;
  country?: string;
  city?: string;
  religion?: string[];
  tradition?: string[];
  ceremonyStyle?: string[];
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  sort?: "relevance" | "price_asc" | "price_desc" | "rating" | "newest";
  cursor?: string;
  limit?: number;
}

const vendorInclude = {
  vendorProfile: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  categories: { include: { category: true } },
  culturalTags: { include: { taxonomyTerm: { include: { taxonomyType: true } } } },
  packages: { where: { isActive: true }, orderBy: { sortOrder: "asc" as const } },
  _count: { select: { reviews: true, bookings: true } },
} satisfies Prisma.VendorListingInclude;

// Maps common country names/aliases to ISO-3166-1 alpha-2 codes stored in the DB.
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  india: "IN", "india ": "IN", bharat: "IN",
  "united states": "US", usa: "US", "u.s.a": "US", america: "US",
  "united kingdom": "GB", uk: "GB", britain: "GB", england: "GB",
  canada: "CA", australia: "AU", singapore: "SG", malaysia: "MY",
  uae: "AE", dubai: "AE", "united arab emirates": "AE",
  nepal: "NP", pakistan: "PK", "sri lanka": "LK",
  bangladesh: "BD", germany: "DE", france: "FR",
};

export async function searchVendors(filters: VendorSearchFilters) {
  const limit = filters.limit ?? 12;
  const where: Prisma.VendorListingWhereInput = {
    isPublished: true,
    vendorProfile: { isActive: true },
  };

  if (filters.query) {
    const q = filters.query.trim();
    const countryCode = COUNTRY_NAME_TO_CODE[q.toLowerCase()];
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { vendorProfile: { businessName: { contains: q, mode: "insensitive" } } },
      // Search location fields so "mumbai", "chennai", "india" all work
      { vendorProfile: { city: { contains: q, mode: "insensitive" } } },
      { vendorProfile: { state: { contains: q, mode: "insensitive" } } },
      // Resolve country name → ISO code, e.g. "india" → "IN"
      ...(countryCode ? [{ vendorProfile: { country: countryCode } }] : []),
    ];
  }

  if (filters.category) {
    where.categories = { some: { category: { slug: filters.category } } };
  }

  if (filters.country) {
    // Accept either ISO code ("IN") or full name ("India")
    const resolvedCode =
      COUNTRY_NAME_TO_CODE[filters.country.toLowerCase()] ?? filters.country.toUpperCase();
    where.vendorProfile = {
      ...(where.vendorProfile as Prisma.VendorProfileWhereInput),
      country: resolvedCode,
    };
  }

  if (filters.city) {
    where.vendorProfile = {
      ...(where.vendorProfile as Prisma.VendorProfileWhereInput),
      city: { contains: filters.city, mode: "insensitive" },
    };
  }

  if (filters.religion?.length) {
    where.culturalTags = {
      some: {
        taxonomyTerm: {
          slug: { in: filters.religion },
          taxonomyType: { name: "religion" },
        },
      },
    };
  }

  if (filters.tradition?.length) {
    where.AND = [
      ...(Array.isArray((where as Record<string, unknown>).AND) ? (where as Record<string, unknown>).AND as Prisma.VendorListingWhereInput[] : []),
      {
        culturalTags: {
          some: {
            taxonomyTerm: {
              slug: { in: filters.tradition },
              taxonomyType: { name: "cultural_tradition" },
            },
          },
        },
      },
    ];
  }

  if (filters.minRating) {
    where.vendorProfile = {
      ...(where.vendorProfile as Prisma.VendorProfileWhereInput),
      averageRating: { gte: filters.minRating },
    };
  }

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    if (filters.priceMin !== undefined) {
      where.priceMin = { gte: filters.priceMin };
    }
    if (filters.priceMax !== undefined) {
      where.priceMax = { lte: filters.priceMax };
    }
  }

  let orderBy: Prisma.VendorListingOrderByWithRelationInput = { createdAt: "desc" };
  switch (filters.sort) {
    case "price_asc":
      orderBy = { priceMin: "asc" };
      break;
    case "price_desc":
      orderBy = { priceMin: "desc" };
      break;
    case "rating":
      orderBy = { vendorProfile: { averageRating: "desc" } };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
  }

  const listings = await prisma.vendorListing.findMany({
    where,
    include: vendorInclude,
    orderBy,
    take: limit + 1,
    ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
  });

  const hasMore = listings.length > limit;
  const items = hasMore ? listings.slice(0, limit) : listings;
  const nextCursor = hasMore ? items[items.length - 1].id : undefined;

  return { items, nextCursor, hasMore };
}

export async function getFeaturedVendors(limit = 6) {
  return prisma.vendorListing.findMany({
    where: { isPublished: true, isFeatured: true, vendorProfile: { isActive: true } },
    include: vendorInclude,
    orderBy: { vendorProfile: { averageRating: "desc" } },
    take: limit,
  });
}

export async function getVendorBySlug(slug: string) {
  return prisma.vendorListing.findUnique({
    where: { slug },
    include: {
      ...vendorInclude,
      reviews: {
        where: { isApproved: true },
        include: { customer: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    include: { children: { where: { isActive: true } } },
  });
}
