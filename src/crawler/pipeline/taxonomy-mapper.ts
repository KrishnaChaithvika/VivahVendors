import { PrismaClient } from "../../generated/prisma/client";

/**
 * Maps cultural keywords and business name signals to taxonomy term IDs.
 * Uses keyword matching against a pre-loaded taxonomy dictionary.
 */

interface TaxonomyMatch {
  termId: string;
  termSlug: string;
  typeName: string;
}

// Keyword → taxonomy slug mapping
const CULTURAL_KEYWORD_MAP: Record<string, string> = {
  // Religion
  hindu: "hindu",
  temple: "hindu",
  mandir: "hindu",
  muslim: "muslim",
  islamic: "muslim",
  nikah: "muslim",
  christian: "christian",
  church: "christian",
  catholic: "catholic",
  protestant: "protestant",
  sikh: "sikh",
  gurdwara: "sikh",
  anand: "sikh",
  jewish: "jewish",
  synagogue: "jewish",
  buddhist: "buddhist",
  jain: "jain",

  // Traditions
  "south indian": "south-indian",
  tamil: "tamil",
  telugu: "telugu",
  kannada: "kannada",
  malayali: "malayali",
  kerala: "malayali",
  "north indian": "north-indian",
  punjabi: "punjabi",
  rajasthani: "rajasthani",
  gujarati: "gujarati",
  marathi: "marathi",
  bengali: "bengali",
  assamese: "assamese",
  odia: "odia",

  // Ceremony styles
  traditional: "traditional",
  modern: "modern",
  contemporary: "modern",
  fusion: "fusion",
  destination: "destination-wedding",
  intimate: "intimate",
  luxury: "luxury",
  royal: "luxury",
};

export class TaxonomyMapper {
  private termsBySlug: Map<string, { id: string; slug: string; typeName: string }> = new Map();

  async initialize(prisma: PrismaClient) {
    const terms = await prisma.taxonomyTerm.findMany({
      where: { isActive: true },
      include: { taxonomyType: { select: { name: true } } },
    });

    for (const term of terms) {
      this.termsBySlug.set(term.slug, {
        id: term.id,
        slug: term.slug,
        typeName: term.taxonomyType.name,
      });
    }

    console.log(`[TaxonomyMapper] Loaded ${this.termsBySlug.size} taxonomy terms`);
  }

  mapKeywords(keywords: string[], businessName: string): TaxonomyMatch[] {
    const matches = new Map<string, TaxonomyMatch>();
    const allText = [...keywords, businessName.toLowerCase()].join(" ");

    for (const [keyword, slug] of Object.entries(CULTURAL_KEYWORD_MAP)) {
      if (allText.includes(keyword)) {
        const term = this.termsBySlug.get(slug);
        if (term && !matches.has(term.id)) {
          matches.set(term.id, {
            termId: term.id,
            termSlug: term.slug,
            typeName: term.typeName,
          });
        }
      }
    }

    return Array.from(matches.values());
  }
}
