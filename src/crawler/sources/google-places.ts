import type { SourceAdapter, RawVendorData, ScrapeConfig } from "./base-adapter";

/**
 * Google Places API adapter.
 * Uses the Places API (Text Search) to find wedding vendors.
 *
 * Requires GOOGLE_PLACES_API_KEY environment variable.
 */

const WEDDING_CATEGORIES = [
  "wedding photographer",
  "wedding caterer",
  "wedding decorator",
  "wedding venue",
  "wedding planner",
  "wedding florist",
  "wedding makeup artist",
  "wedding DJ",
  "wedding videographer",
  "wedding priest",
];

export class GooglePlacesAdapter implements SourceAdapter {
  name = "google-places";

  private apiKey: string;
  private baseUrl = "https://places.googleapis.com/v1/places:searchText";

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY ?? "";
    if (!this.apiKey) {
      console.warn("GOOGLE_PLACES_API_KEY not set — Google Places adapter will be inactive");
    }
  }

  async *scrape(config: ScrapeConfig): AsyncGenerator<RawVendorData> {
    if (!this.apiKey) return;

    const categories = config.category
      ? [config.category]
      : WEDDING_CATEGORIES;
    const city = config.city ?? "Mumbai";
    const region = config.region ?? "India";

    for (const category of categories) {
      const query = `${category} in ${city}, ${region}`;
      console.log(`[GooglePlaces] Searching: "${query}"`);

      try {
        const response = await fetch(this.baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": this.apiKey,
            "X-Goog-FieldMask":
              "places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.types,places.photos",
          },
          body: JSON.stringify({
            textQuery: query,
            maxResultCount: config.maxResults ?? 20,
          }),
        });

        if (!response.ok) {
          console.error(`[GooglePlaces] API error: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const places = data.places ?? [];

        for (const place of places) {
          yield this.mapToRawVendor(place, category, city, region);

          // Rate limit: 200ms delay between yields
          await new Promise((r) => setTimeout(r, 200));
        }
      } catch (error) {
        console.error(`[GooglePlaces] Error searching "${query}":`, error);
      }

      // Rate limit: 1 second between category searches
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  private mapToRawVendor(
    place: Record<string, unknown>,
    category: string,
    city: string,
    region: string
  ): RawVendorData {
    const displayName = place.displayName as { text?: string } | undefined;
    const location = place.location as { latitude?: number; longitude?: number } | undefined;

    return {
      sourceName: this.name,
      sourceUrl: `https://maps.google.com/?q=${encodeURIComponent(
        displayName?.text ?? ""
      )}`,
      businessName: displayName?.text ?? "Unknown",
      description: undefined,
      websiteUrl: (place.websiteUri as string) ?? undefined,
      contactPhone: (place.nationalPhoneNumber as string) ?? undefined,
      country: region === "India" ? "IN" : region,
      state: undefined,
      city,
      addressLine: (place.formattedAddress as string) ?? undefined,
      latitude: location?.latitude,
      longitude: location?.longitude,
      categories: [category],
      rating: (place.rating as number) ?? undefined,
      reviewCount: (place.userRatingCount as number) ?? undefined,
      culturalKeywords: [],
      imageUrls: [],
    };
  }
}
