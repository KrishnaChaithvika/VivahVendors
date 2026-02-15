import { PrismaClient } from "../../generated/prisma/client";
import type { NormalizedVendor } from "./normalizer";

/**
 * Multi-signal deduplication engine.
 * Compares scraped vendors against existing DB records to avoid duplicates.
 *
 * Scoring:
 * - Phone match: +40 points
 * - Email match: +40 points
 * - Name similarity (>80%) + same city: +30 points
 * - Website URL match: +35 points
 *
 * Threshold: 40+ points = likely duplicate
 */

interface DeduplicationResult {
  isDuplicate: boolean;
  existingProfileId?: string;
  confidence: number;
}

export class Deduplicator {
  async check(
    vendor: NormalizedVendor,
    prisma: PrismaClient
  ): Promise<DeduplicationResult> {
    let bestScore = 0;
    let bestMatchId: string | undefined;

    // Check by phone
    if (vendor.contactPhone) {
      const phoneClean = vendor.contactPhone.replace(/\D/g, "");
      if (phoneClean.length >= 7) {
        const match = await prisma.vendorProfile.findFirst({
          where: {
            contactPhone: { contains: phoneClean.slice(-7) },
          },
          select: { id: true },
        });
        if (match) {
          bestScore = Math.max(bestScore, 40);
          bestMatchId = match.id;
        }
      }
    }

    // Check by email
    if (vendor.contactEmail) {
      const match = await prisma.vendorProfile.findFirst({
        where: { contactEmail: vendor.contactEmail },
        select: { id: true },
      });
      if (match) {
        bestScore = Math.max(bestScore, 40);
        bestMatchId = match.id;
      }
    }

    // Check by website URL
    if (vendor.websiteUrl) {
      const match = await prisma.vendorProfile.findFirst({
        where: { websiteUrl: vendor.websiteUrl },
        select: { id: true },
      });
      if (match) {
        bestScore = Math.max(bestScore, 35);
        bestMatchId = match.id;
      }
    }

    // Check by name + city
    const nameMatches = await prisma.vendorProfile.findMany({
      where: {
        city: { equals: vendor.city, mode: "insensitive" },
        businessName: { contains: vendor.businessName.split(" ")[0], mode: "insensitive" },
      },
      select: { id: true, businessName: true },
    });

    for (const match of nameMatches) {
      const similarity = nameSimilarity(vendor.businessName, match.businessName);
      if (similarity > 0.8) {
        const score = Math.round(similarity * 30);
        if (score > bestScore) {
          bestScore = score;
          bestMatchId = match.id;
        }
      }
    }

    return {
      isDuplicate: bestScore >= 40,
      existingProfileId: bestScore >= 40 ? bestMatchId : undefined,
      confidence: bestScore,
    };
  }
}

/**
 * Simple Levenshtein-based name similarity (0-1).
 */
function nameSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();

  if (s1 === s2) return 1;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;

  const distance = levenshtein(s1, s2);
  return 1 - distance / maxLen;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}
