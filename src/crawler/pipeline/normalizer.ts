import type { RawVendorData } from "../sources/base-adapter";

/**
 * Normalized vendor data after cleaning and validation.
 */
export interface NormalizedVendor {
  sourceName: string;
  sourceUrl: string;
  externalId?: string;

  businessName: string;
  description?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;

  country: string;
  state?: string;
  city: string;
  addressLine?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;

  categories: string[];
  rating?: number;
  reviewCount?: number;
  culturalKeywords: string[];
  imageUrls: string[];
}

/**
 * Clean and validate raw vendor data.
 */
export function normalize(raw: RawVendorData): NormalizedVendor | null {
  // Skip if no business name
  if (!raw.businessName || raw.businessName.trim().length < 2) {
    return null;
  }

  // Clean phone number
  let phone = raw.contactPhone?.replace(/[^\d+\-() ]/g, "").trim();
  if (phone && phone.length < 7) phone = undefined;

  // Clean email
  let email = raw.contactEmail?.trim().toLowerCase();
  if (email && !email.includes("@")) email = undefined;

  // Clean URL
  let website = raw.websiteUrl?.trim();
  if (website && !website.startsWith("http")) {
    website = `https://${website}`;
  }

  // Clean country code
  let country = raw.country.trim().toUpperCase();
  if (country === "INDIA") country = "IN";
  if (country === "UNITED STATES" || country === "USA") country = "US";
  if (country === "UNITED KINGDOM" || country === "UK") country = "GB";

  return {
    sourceName: raw.sourceName,
    sourceUrl: raw.sourceUrl,
    externalId: raw.externalId,
    businessName: raw.businessName.trim(),
    description: raw.description?.trim(),
    websiteUrl: website,
    contactEmail: email,
    contactPhone: phone,
    country,
    state: raw.state?.trim(),
    city: raw.city.trim(),
    addressLine: raw.addressLine?.trim(),
    postalCode: raw.postalCode?.trim(),
    latitude: raw.latitude,
    longitude: raw.longitude,
    categories: raw.categories.map((c) => c.toLowerCase().trim()),
    rating: raw.rating,
    reviewCount: raw.reviewCount,
    culturalKeywords: raw.culturalKeywords.map((k) => k.toLowerCase().trim()),
    imageUrls: raw.imageUrls,
  };
}
