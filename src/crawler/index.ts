/**
 * VivahVendors Web Crawler CLI
 *
 * Usage:
 *   npx tsx src/crawler/index.ts --seed --source=google-places --region=IN --city=Mumbai
 *   npx tsx src/crawler/index.ts --source=all --city=Delhi
 *   npx tsx src/crawler/index.ts --source=google-places --category="wedding photographer"
 *
 * Flags:
 *   --seed           Initial seed run (logs extra info)
 *   --source=<name>  Source adapter to use (google-places, wedmegood, generic-web, all)
 *   --region=<code>  Region/country to search (default: IN)
 *   --city=<name>    City to search (default: Mumbai)
 *   --category=<cat> Specific category to search
 *   --max=<n>        Max results per category (default: 20)
 */

import { PrismaClient } from "../generated/prisma/client";
import { GooglePlacesAdapter } from "./sources/google-places";
import { WedMeGoodAdapter } from "./sources/wed-me-good";
import { GenericWebAdapter } from "./sources/generic-web";
import type { SourceAdapter, ScrapeConfig } from "./sources/base-adapter";
import { normalize } from "./pipeline/normalizer";
import { TaxonomyMapper } from "./pipeline/taxonomy-mapper";
import { Deduplicator } from "./pipeline/deduplicator";
import { DbWriter } from "./pipeline/db-writer";

const prisma = new PrismaClient();

// Parse CLI args
function parseArgs(): {
  seed: boolean;
  source: string;
  region: string;
  city: string;
  category?: string;
  max: number;
} {
  const args = process.argv.slice(2);
  const flags: Record<string, string> = {};

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      flags[key] = value ?? "true";
    }
  }

  return {
    seed: flags.seed === "true",
    source: flags.source ?? "google-places",
    region: flags.region ?? "IN",
    city: flags.city ?? "Mumbai",
    category: flags.category,
    max: parseInt(flags.max ?? "20", 10),
  };
}

function getAdapters(sourceName: string): SourceAdapter[] {
  const all: SourceAdapter[] = [
    new GooglePlacesAdapter(),
    new WedMeGoodAdapter(),
    new GenericWebAdapter(),
  ];

  if (sourceName === "all") return all;
  const adapter = all.find((a) => a.name === sourceName);
  if (!adapter) {
    console.error(`Unknown source: ${sourceName}`);
    console.error(`Available: ${all.map((a) => a.name).join(", ")}, all`);
    process.exit(1);
  }
  return [adapter];
}

async function main() {
  const args = parseArgs();
  console.log("=== VivahVendors Crawler ===");
  console.log(`Mode: ${args.seed ? "SEED" : "REFRESH"}`);
  console.log(`Source: ${args.source}`);
  console.log(`Region: ${args.region}, City: ${args.city}`);
  console.log("");

  // Initialize pipeline components
  const taxonomyMapper = new TaxonomyMapper();
  await taxonomyMapper.initialize(prisma);

  const deduplicator = new Deduplicator();

  const dbWriter = new DbWriter();
  await dbWriter.initialize(prisma);

  const adapters = getAdapters(args.source);
  const config: ScrapeConfig = {
    region: args.region,
    city: args.city,
    category: args.category,
    maxResults: args.max,
  };

  // Create crawl run log
  const crawlRun = await prisma.crawlRun.create({
    data: {
      source: `${args.source} | ${args.region}/${args.city}`,
      status: "running",
      startedAt: new Date(),
    },
  });

  let totalFound = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const adapter of adapters) {
    console.log(`\n--- Running ${adapter.name} adapter ---`);

    for await (const rawVendor of adapter.scrape(config)) {
      totalFound++;

      // 1. Normalize
      const normalized = normalize(rawVendor);
      if (!normalized) {
        console.log(`  [SKIP] Invalid data: "${rawVendor.businessName}"`);
        totalSkipped++;
        continue;
      }

      // 2. Deduplicate
      const dedupResult = await deduplicator.check(normalized, prisma);
      if (dedupResult.isDuplicate) {
        console.log(
          `  [DEDUP] "${normalized.businessName}" matches existing (confidence: ${dedupResult.confidence})`
        );
      }

      // 3. Write to DB
      try {
        const outcome = await dbWriter.writeVendor(
          normalized,
          dedupResult.existingProfileId,
          taxonomyMapper,
          prisma
        );

        if (outcome === "created") {
          totalCreated++;
          console.log(`  [NEW] "${normalized.businessName}" — ${normalized.city}`);
        } else if (outcome === "updated") {
          totalUpdated++;
          console.log(`  [UPD] "${normalized.businessName}"`);
        } else {
          totalSkipped++;
          console.log(`  [SKIP] "${normalized.businessName}" — claimed or no changes`);
        }
      } catch (error) {
        totalErrors++;
        console.error(`  [ERR] "${normalized.businessName}":`, error);
      }
    }
  }

  // Update crawl run log
  await prisma.crawlRun.update({
    where: { id: crawlRun.id },
    data: {
      status: totalErrors > 0 ? "completed_with_errors" : "completed",
      completedAt: new Date(),
      vendorsFound: totalFound,
      vendorsCreated: totalCreated,
      vendorsUpdated: totalUpdated,
      errors: totalErrors,
    },
  });

  console.log("\n=== Crawl Complete ===");
  console.log(`Found: ${totalFound}`);
  console.log(`Created: ${totalCreated}`);
  console.log(`Updated: ${totalUpdated}`);
  console.log(`Skipped: ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Crawler failed:", error);
  prisma.$disconnect();
  process.exit(1);
});
