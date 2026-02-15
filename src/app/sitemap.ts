export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vivahvendors.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/vendors`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/register`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    // Vendor listing pages
    const listings = await prisma.vendorListing.findMany({
      where: { isPublished: true, vendorProfile: { isActive: true } },
      select: { slug: true, updatedAt: true },
    });

    const vendorPages: MetadataRoute.Sitemap = listings.map((listing) => ({
      url: `${baseUrl}/vendors/${listing.slug}`,
      lastModified: listing.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Category pages
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/vendors?category=${cat.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...vendorPages, ...categoryPages];
  } catch {
    // If DB is unavailable, return only static pages
    return staticPages;
  }
}
