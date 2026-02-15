import type { SourceAdapter, RawVendorData, ScrapeConfig } from "./base-adapter";

/**
 * WedMeGood scraper adapter (stub).
 *
 * In production, this would:
 * 1. Respect robots.txt
 * 2. Fetch category listing pages
 * 3. Parse vendor cards with Cheerio
 * 4. Navigate to detail pages for full info
 * 5. Rate-limit to 1 req/second
 *
 * Currently returns no results — implement when ready to scrape.
 */
export class WedMeGoodAdapter implements SourceAdapter {
  name = "wedmegood";

  async *scrape(_config: ScrapeConfig): AsyncGenerator<RawVendorData> {
    console.log(`[WedMeGood] Adapter is a stub — skipping`);
    // TODO: Implement WedMeGood scraping
    // Respect robots.txt, rate limit 1 req/sec per domain
    return;
  }
}
