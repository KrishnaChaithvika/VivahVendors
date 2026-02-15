import { PrismaClient } from "../../generated/prisma/client";
import type { NormalizedVendor } from "./normalizer";
import type { TaxonomyMapper } from "./taxonomy-mapper";
import slugify from "slugify";

/**
 * Writes normalized vendor data to the database.
 * Handles:
 * - Creating new unclaimed vendor profiles
 * - Updating existing unclaimed profiles (respecting field overrides)
 * - Creating vendor listings
 * - Linking source records
 */

interface WriteResult {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

// Map raw category strings to DB category slugs
const CATEGORY_SLUG_MAP: Record<string, string> = {
  "wedding photographer": "photographers",
  photographer: "photographers",
  photography: "photographers",
  "wedding caterer": "caterers",
  caterer: "caterers",
  catering: "caterers",
  "wedding decorator": "decorators",
  decorator: "decorators",
  decoration: "decorators",
  "wedding venue": "venues",
  venue: "venues",
  "wedding planner": "wedding-planners",
  planner: "wedding-planners",
  "wedding florist": "florists",
  florist: "florists",
  "wedding makeup artist": "makeup-artists",
  "makeup artist": "makeup-artists",
  "wedding dj": "djs-music",
  dj: "djs-music",
  music: "djs-music",
  "wedding videographer": "videographers",
  videographer: "videographers",
  "wedding priest": "priests-officiants",
  priest: "priests-officiants",
  pandit: "priests-officiants",
  officiant: "priests-officiants",
};

export class DbWriter {
  private categoryIdMap: Map<string, string> = new Map();

  async initialize(prisma: PrismaClient) {
    const categories = await prisma.category.findMany({
      select: { id: true, slug: true },
    });
    for (const cat of categories) {
      this.categoryIdMap.set(cat.slug, cat.id);
    }
    console.log(`[DbWriter] Loaded ${this.categoryIdMap.size} categories`);
  }

  async writeVendor(
    vendor: NormalizedVendor,
    existingProfileId: string | undefined,
    taxonomyMapper: TaxonomyMapper,
    prisma: PrismaClient
  ): Promise<"created" | "updated" | "skipped"> {
    // Map categories to IDs
    const categoryIds: string[] = [];
    for (const rawCat of vendor.categories) {
      const slug = CATEGORY_SLUG_MAP[rawCat];
      if (slug && this.categoryIdMap.has(slug)) {
        categoryIds.push(this.categoryIdMap.get(slug)!);
      }
    }

    // Map cultural tags
    const culturalMatches = taxonomyMapper.mapKeywords(
      vendor.culturalKeywords,
      vendor.businessName
    );

    if (existingProfileId) {
      // Update existing unclaimed profile
      return this.updateExisting(
        existingProfileId,
        vendor,
        prisma
      );
    }

    // Create new profile + listing
    return this.createNew(vendor, categoryIds, culturalMatches, prisma);
  }

  private async createNew(
    vendor: NormalizedVendor,
    categoryIds: string[],
    culturalMatches: { termId: string }[],
    prisma: PrismaClient
  ): Promise<"created"> {
    // Generate unique profile slug
    let profileSlug = slugify(vendor.businessName, { lower: true, strict: true });
    let counter = 1;
    while (await prisma.vendorProfile.findUnique({ where: { slug: profileSlug } })) {
      profileSlug = `${slugify(vendor.businessName, { lower: true, strict: true })}-${counter}`;
      counter++;
    }

    // Generate unique listing slug
    let listingSlug = `${profileSlug}-services`;
    counter = 1;
    while (await prisma.vendorListing.findUnique({ where: { slug: listingSlug } })) {
      listingSlug = `${profileSlug}-services-${counter}`;
      counter++;
    }

    await prisma.$transaction(async (tx) => {
      // Create a placeholder user for the unclaimed profile
      const user = await tx.user.create({
        data: {
          email: `unclaimed-${profileSlug}@vivahvendors.placeholder`,
          name: vendor.businessName,
          role: "VENDOR",
        },
      });

      // Create vendor profile
      const profile = await tx.vendorProfile.create({
        data: {
          userId: user.id,
          businessName: vendor.businessName,
          slug: profileSlug,
          description: vendor.description,
          contactEmail: vendor.contactEmail,
          contactPhone: vendor.contactPhone,
          websiteUrl: vendor.websiteUrl,
          country: vendor.country,
          state: vendor.state,
          city: vendor.city,
          addressLine: vendor.addressLine,
          postalCode: vendor.postalCode,
          latitude: vendor.latitude,
          longitude: vendor.longitude,
          averageRating: vendor.rating ?? 0,
          totalReviews: vendor.reviewCount ?? 0,
          isClaimed: false,
          isActive: true,
        },
      });

      // Create listing
      await tx.vendorListing.create({
        data: {
          vendorProfileId: profile.id,
          title: `${vendor.businessName} — Wedding Services`,
          slug: listingSlug,
          description: vendor.description ?? `${vendor.businessName} offers wedding services in ${vendor.city}.`,
          priceType: "ON_REQUEST",
          isPublished: true,
          categories: {
            create: categoryIds.map((categoryId) => ({ categoryId })),
          },
          culturalTags: {
            create: culturalMatches.map((m) => ({ taxonomyTermId: m.termId })),
          },
        },
      });

      // Create source link
      await tx.vendorSourceLink.create({
        data: {
          vendorProfileId: profile.id,
          sourceType: vendor.sourceName,
          sourceUrl: vendor.sourceUrl,
          externalId: vendor.externalId,
          lastScrapedAt: new Date(),
        },
      });
    });

    return "created";
  }

  private async updateExisting(
    profileId: string,
    vendor: NormalizedVendor,
    prisma: PrismaClient
  ): Promise<"updated" | "skipped"> {
    // Check if profile is claimed
    const profile = await prisma.vendorProfile.findUnique({
      where: { id: profileId },
      select: { isClaimed: true },
    });

    if (profile?.isClaimed) {
      // Don't update claimed profiles — vendor has taken ownership
      return "skipped";
    }

    // Get field overrides
    const overrides = await prisma.vendorFieldOverride.findMany({
      where: { vendorProfileId: profileId },
      select: { fieldName: true },
    });
    const overriddenFields = new Set(overrides.map((o) => o.fieldName));

    // Build update data, respecting overrides
    const updateData: Record<string, unknown> = {};
    if (!overriddenFields.has("description") && vendor.description) {
      updateData.description = vendor.description;
    }
    if (!overriddenFields.has("contactPhone") && vendor.contactPhone) {
      updateData.contactPhone = vendor.contactPhone;
    }
    if (!overriddenFields.has("contactEmail") && vendor.contactEmail) {
      updateData.contactEmail = vendor.contactEmail;
    }
    if (!overriddenFields.has("websiteUrl") && vendor.websiteUrl) {
      updateData.websiteUrl = vendor.websiteUrl;
    }
    if (vendor.rating !== undefined) {
      updateData.averageRating = vendor.rating;
    }
    if (vendor.reviewCount !== undefined) {
      updateData.totalReviews = vendor.reviewCount;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.vendorProfile.update({
        where: { id: profileId },
        data: updateData,
      });

      // Update source link timestamp
      await prisma.vendorSourceLink.updateMany({
        where: {
          vendorProfileId: profileId,
          sourceType: vendor.sourceName,
        },
        data: { lastScrapedAt: new Date() },
      });

      return "updated";
    }

    return "skipped";
  }

  async writeBatch(
    vendors: NormalizedVendor[],
    existingMap: Map<NormalizedVendor, string | undefined>,
    taxonomyMapper: TaxonomyMapper,
    prisma: PrismaClient
  ): Promise<WriteResult> {
    const result: WriteResult = { created: 0, updated: 0, skipped: 0, errors: 0 };

    for (const vendor of vendors) {
      try {
        const outcome = await this.writeVendor(
          vendor,
          existingMap.get(vendor),
          taxonomyMapper,
          prisma
        );
        result[outcome]++;
      } catch (error) {
        console.error(`[DbWriter] Error writing "${vendor.businessName}":`, error);
        result.errors++;
      }
    }

    return result;
  }
}
