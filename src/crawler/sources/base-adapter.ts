/**
 * Base interface for all crawler source adapters.
 * Each adapter scrapes a specific source and yields raw vendor data.
 */

export interface RawVendorData {
  // Source identification
  sourceName: string;
  sourceUrl: string;
  externalId?: string;

  // Business info
  businessName: string;
  description?: string;
  websiteUrl?: string;

  // Contact
  contactEmail?: string;
  contactPhone?: string;

  // Location
  country: string;
  state?: string;
  city: string;
  addressLine?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;

  // Business details
  categories: string[]; // raw category strings to be mapped
  rating?: number;
  reviewCount?: number;
  priceRange?: string;

  // Cultural signals (raw keywords to be mapped by taxonomy mapper)
  culturalKeywords: string[];

  // Images
  imageUrls: string[];
}

export interface ScrapeConfig {
  region?: string;
  city?: string;
  category?: string;
  maxResults?: number;
}

export interface SourceAdapter {
  name: string;
  scrape(config: ScrapeConfig): AsyncGenerator<RawVendorData>;
}
