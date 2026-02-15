import type { SourceAdapter, RawVendorData, ScrapeConfig } from "./base-adapter";

/**
 * Generic web search adapter (stub).
 *
 * In production, this would:
 * 1. Use a search API (e.g., Serper, SerpAPI) to find vendor websites
 * 2. Fetch each website and extract structured data (schema.org, meta tags)
 * 3. Parse contact info, business details, location
 * 4. Rate-limit appropriately
 *
 * Currently returns no results — implement when ready.
 */
export class GenericWebAdapter implements SourceAdapter {
  name = "generic-web";

  async *scrape(_config: ScrapeConfig): AsyncGenerator<RawVendorData> {
    console.log(`[GenericWeb] Adapter is a stub — skipping`);
    // TODO: Implement generic web search scraping
    return;
  }
}
