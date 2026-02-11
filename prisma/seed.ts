import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ==========================================
  // CATEGORIES
  // ==========================================

  const categories = [
    { name: "Photographers", slug: "photographers", iconName: "camera", sortOrder: 1 },
    { name: "Caterers", slug: "caterers", iconName: "utensils", sortOrder: 2 },
    { name: "Decorators", slug: "decorators", iconName: "palette", sortOrder: 3 },
    { name: "Venues", slug: "venues", iconName: "building", sortOrder: 4 },
    { name: "Makeup Artists", slug: "makeup-artists", iconName: "sparkles", sortOrder: 5 },
    { name: "DJs & Music", slug: "djs-music", iconName: "music", sortOrder: 6 },
    { name: "Mehendi Artists", slug: "mehendi-artists", iconName: "hand", sortOrder: 7 },
    { name: "Wedding Planners", slug: "wedding-planners", iconName: "clipboard-list", sortOrder: 8 },
    { name: "Florists", slug: "florists", iconName: "flower", sortOrder: 9 },
    { name: "Invitation Designers", slug: "invitation-designers", iconName: "mail", sortOrder: 10 },
    { name: "Priests & Officiants", slug: "priests-officiants", iconName: "book-open", sortOrder: 11 },
    { name: "Videographers", slug: "videographers", iconName: "video", sortOrder: 12 },
    { name: "Jewelers", slug: "jewelers", iconName: "gem", sortOrder: 13 },
    { name: "Bridal Wear", slug: "bridal-wear", iconName: "shirt", sortOrder: 14 },
    { name: "Groom Wear", slug: "groom-wear", iconName: "shirt", sortOrder: 15 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log(`  Seeded ${categories.length} categories`);

  // ==========================================
  // TAXONOMY TYPES
  // ==========================================

  const taxonomyTypes = [
    { name: "religion", displayName: "Religion", sortOrder: 1 },
    { name: "cultural_tradition", displayName: "Cultural Tradition", sortOrder: 2 },
    { name: "sub_tradition", displayName: "Community / Sub-group", sortOrder: 3 },
    { name: "ceremony_style", displayName: "Ceremony Style", sortOrder: 4 },
  ];

  const typeMap: Record<string, string> = {};
  for (const tt of taxonomyTypes) {
    const created = await prisma.taxonomyType.upsert({
      where: { name: tt.name },
      update: tt,
      create: tt,
    });
    typeMap[tt.name] = created.id;
  }
  console.log(`  Seeded ${taxonomyTypes.length} taxonomy types`);

  // ==========================================
  // TAXONOMY TERMS
  // ==========================================

  // Helper to create term with optional parent
  async function createTerm(
    typeId: string,
    name: string,
    slug: string,
    parentId?: string,
    sortOrder = 0,
    metadata?: Record<string, unknown>
  ) {
    return prisma.taxonomyTerm.upsert({
      where: { slug },
      update: { name, taxonomyTypeId: typeId, parentId, sortOrder, metadata: metadata ?? undefined },
      create: { name, slug, taxonomyTypeId: typeId, parentId, sortOrder, metadata: metadata ?? undefined },
    });
  }

  // --- Religion ---
  const religionId = typeMap.religion;
  const hindu = await createTerm(religionId, "Hindu", "hindu", undefined, 1);
  const muslim = await createTerm(religionId, "Muslim", "muslim", undefined, 2);
  await createTerm(religionId, "Sunni", "sunni", muslim.id, 1);
  await createTerm(religionId, "Shia", "shia", muslim.id, 2);
  const christian = await createTerm(religionId, "Christian", "christian", undefined, 3);
  await createTerm(religionId, "Catholic", "catholic", christian.id, 1);
  await createTerm(religionId, "Protestant", "protestant", christian.id, 2);
  await createTerm(religionId, "Orthodox", "orthodox-christian", christian.id, 3);
  await createTerm(religionId, "Sikh", "sikh", undefined, 4);
  const jewish = await createTerm(religionId, "Jewish", "jewish", undefined, 5);
  await createTerm(religionId, "Ashkenazi", "ashkenazi", jewish.id, 1);
  await createTerm(religionId, "Sephardi", "sephardi", jewish.id, 2);
  await createTerm(religionId, "Buddhist", "buddhist", undefined, 6);
  await createTerm(religionId, "Jain", "jain", undefined, 7);
  await createTerm(religionId, "Zoroastrian (Parsi)", "zoroastrian-parsi", undefined, 8);
  await createTerm(religionId, "Shinto", "shinto", undefined, 9);
  await createTerm(religionId, "Interfaith", "interfaith", undefined, 10);

  // --- Cultural Tradition ---
  const ctId = typeMap.cultural_tradition;
  const southIndian = await createTerm(ctId, "South Indian", "south-indian", undefined, 1);
  await createTerm(ctId, "Tamil", "tamil", southIndian.id, 1);
  await createTerm(ctId, "Telugu", "telugu", southIndian.id, 2);
  await createTerm(ctId, "Kannada", "kannada", southIndian.id, 3);
  await createTerm(ctId, "Malayali", "malayali", southIndian.id, 4);

  const northIndian = await createTerm(ctId, "North Indian", "north-indian", undefined, 2);
  await createTerm(ctId, "Punjabi", "punjabi", northIndian.id, 1);
  await createTerm(ctId, "Rajasthani", "rajasthani", northIndian.id, 2);
  await createTerm(ctId, "UP", "up", northIndian.id, 3);
  await createTerm(ctId, "Bihari", "bihari", northIndian.id, 4);
  await createTerm(ctId, "Haryanvi", "haryanvi", northIndian.id, 5);

  const westIndian = await createTerm(ctId, "West Indian", "west-indian", undefined, 3);
  await createTerm(ctId, "Gujarati", "gujarati", westIndian.id, 1);
  await createTerm(ctId, "Marathi", "marathi", westIndian.id, 2);
  await createTerm(ctId, "Goan", "goan", westIndian.id, 3);
  await createTerm(ctId, "Sindhi", "sindhi", westIndian.id, 4);

  const eastIndian = await createTerm(ctId, "East Indian", "east-indian", undefined, 4);
  await createTerm(ctId, "Bengali", "bengali", eastIndian.id, 1);
  await createTerm(ctId, "Odia", "odia", eastIndian.id, 2);
  await createTerm(ctId, "Assamese", "assamese", eastIndian.id, 3);

  const neIndian = await createTerm(ctId, "Northeast Indian", "northeast-indian", undefined, 5);
  await createTerm(ctId, "Manipuri", "manipuri", neIndian.id, 1);
  await createTerm(ctId, "Naga", "naga", neIndian.id, 2);

  // International traditions
  await createTerm(ctId, "East African", "east-african", undefined, 6);
  await createTerm(ctId, "West African", "west-african", undefined, 7);
  await createTerm(ctId, "Caribbean", "caribbean", undefined, 8);
  await createTerm(ctId, "East Asian", "east-asian", undefined, 9);
  await createTerm(ctId, "Southeast Asian", "southeast-asian", undefined, 10);
  await createTerm(ctId, "Middle Eastern", "middle-eastern", undefined, 11);
  await createTerm(ctId, "Mediterranean", "mediterranean", undefined, 12);
  await createTerm(ctId, "Latin American", "latin-american", undefined, 13);
  await createTerm(ctId, "Western / European", "western-european", undefined, 14);

  // --- Sub-tradition / Community ---
  const stId = typeMap.sub_tradition;
  // South Indian communities
  await createTerm(stId, "Iyer", "iyer", undefined, 1, { region: "Tamil Nadu" });
  await createTerm(stId, "Iyengar", "iyengar", undefined, 2, { region: "Tamil Nadu" });
  await createTerm(stId, "Nair", "nair", undefined, 3, { region: "Kerala" });
  await createTerm(stId, "Reddy", "reddy", undefined, 4, { region: "Andhra Pradesh" });
  await createTerm(stId, "Nayak", "nayak", undefined, 5, { region: "Karnataka" });

  // North Indian communities
  await createTerm(stId, "Marwari", "marwari", undefined, 6, { region: "Rajasthan" });
  await createTerm(stId, "Agarwal", "agarwal", undefined, 7, { region: "North India" });
  await createTerm(stId, "Khatri", "khatri", undefined, 8, { region: "Punjab" });
  await createTerm(stId, "Jat", "jat", undefined, 9, { region: "Haryana" });

  // --- Ceremony Style ---
  const csId = typeMap.ceremony_style;
  await createTerm(csId, "Traditional", "traditional", undefined, 1);
  await createTerm(csId, "Modern", "modern", undefined, 2);
  await createTerm(csId, "Fusion", "fusion", undefined, 3);
  await createTerm(csId, "Destination", "destination", undefined, 4);
  await createTerm(csId, "Intimate / Micro", "intimate-micro", undefined, 5);
  await createTerm(csId, "Elopement", "elopement", undefined, 6);

  console.log("  Seeded taxonomy terms");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
