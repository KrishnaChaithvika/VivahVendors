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

  // ==========================================
  // SAMPLE VENDOR DATA (for development/testing)
  // ==========================================

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash("password123", 10);

  // Helper to get category and taxonomy term IDs
  const getCategory = (slug: string) => prisma.category.findUnique({ where: { slug } });
  const getTerm = (slug: string) => prisma.taxonomyTerm.findUnique({ where: { slug } });

  const sampleVendors = [
    {
      user: { name: "Rajesh Kumar", email: "rajesh@example.com" },
      profile: {
        businessName: "Rajesh Photography Studio",
        slug: "rajesh-photography-studio",
        description: "Award-winning wedding photographer specializing in South Indian and Hindu ceremonies. Over 15 years of experience capturing the beauty of traditional weddings across Tamil Nadu and Kerala.",
        shortBio: "Capturing timeless moments in traditional ceremonies",
        country: "IN", state: "Tamil Nadu", city: "Chennai",
        startingPrice: 50000, currency: "INR",
        yearsInBusiness: 15, teamSize: 5,
        averageRating: 4.8, totalReviews: 124,
        isVerified: true,
        websiteUrl: "https://rajeshphotography.example.com",
      },
      categories: ["photographers"],
      culturalTags: ["hindu", "south-indian", "tamil", "traditional"],
      listings: [{
        title: "Complete Wedding Photography",
        slug: "rajesh-complete-wedding-photography",
        description: "Full coverage of your wedding from mehendi to reception. Includes pre-wedding shoot, ceremony coverage, and a premium photo album.",
        priceType: "STARTING_AT" as const,
        priceMin: 50000, priceMax: 200000,
        priceUnit: "per event",
        isPublished: true, isFeatured: true,
      }],
      packages: [
        { name: "Silver Package", description: "6 hours coverage, 200 edited photos, online gallery", price: 50000, inclusions: ["6 hours coverage", "200 edited photos", "Online gallery", "1 photographer"] },
        { name: "Gold Package", description: "Full day coverage, 500 edited photos, premium album", price: 120000, inclusions: ["Full day coverage", "500 edited photos", "Premium album", "2 photographers", "Pre-wedding shoot"] },
        { name: "Platinum Package", description: "Multi-day coverage, unlimited photos, cinematic video", price: 200000, inclusions: ["Multi-day coverage", "Unlimited photos", "Cinematic video", "3 photographers", "Drone shots", "Pre-wedding shoot", "Premium album"] },
      ],
    },
    {
      user: { name: "Priya Sharma", email: "priya@example.com" },
      profile: {
        businessName: "Priya's Bridal Makeup",
        slug: "priyas-bridal-makeup",
        description: "Celebrity makeup artist specializing in bridal looks for North Indian and Punjabi weddings. Expert in HD, airbrush, and traditional bridal makeup.",
        shortBio: "Celebrity bridal makeup artist",
        country: "IN", state: "Delhi", city: "New Delhi",
        startingPrice: 25000, currency: "INR",
        yearsInBusiness: 8, teamSize: 3,
        averageRating: 4.9, totalReviews: 89,
        isVerified: true,
      },
      categories: ["makeup-artists"],
      culturalTags: ["hindu", "sikh", "north-indian", "punjabi", "modern"],
      listings: [{
        title: "Bridal Makeup & Styling",
        slug: "priyas-bridal-makeup-styling",
        description: "Complete bridal look including makeup, hairstyling, and draping. Available for all North Indian wedding ceremonies.",
        priceType: "RANGE" as const,
        priceMin: 25000, priceMax: 75000,
        priceUnit: "per event",
        isPublished: true, isFeatured: true,
      }],
      packages: [
        { name: "Essential Bridal", description: "HD makeup, hairstyling for one event", price: 25000, inclusions: ["HD makeup", "Hairstyling", "1 event", "Touch-up kit"] },
        { name: "Premium Bridal", description: "Airbrush makeup, hairstyling, draping for 2 events", price: 50000, inclusions: ["Airbrush makeup", "Hairstyling", "Saree/lehenga draping", "2 events", "Touch-up kit", "Trial session"] },
      ],
    },
    {
      user: { name: "Mohammed Ali Catering", email: "ali.catering@example.com" },
      profile: {
        businessName: "Ali's Royal Catering",
        slug: "alis-royal-catering",
        description: "Premium Mughlai and Hyderabadi wedding catering. Specialists in Nikah ceremonies and Walima feasts. Serving authentic biryani, kebabs, and traditional desserts.",
        shortBio: "Authentic Mughlai wedding feasts",
        country: "IN", state: "Telangana", city: "Hyderabad",
        startingPrice: 800, currency: "INR",
        yearsInBusiness: 20, teamSize: 30,
        averageRating: 4.7, totalReviews: 203,
        isVerified: true,
      },
      categories: ["caterers"],
      culturalTags: ["muslim", "south-indian", "telugu", "traditional"],
      listings: [{
        title: "Mughlai Wedding Feast",
        slug: "alis-mughlai-wedding-feast",
        description: "Complete catering for Nikah and Walima ceremonies. Menu includes Hyderabadi biryani, kebabs, curries, and traditional desserts.",
        priceType: "STARTING_AT" as const,
        priceMin: 800, priceMax: 2500,
        priceUnit: "per plate",
        isPublished: true, isFeatured: true,
      }],
      packages: [
        { name: "Standard Menu", description: "15-item menu including biryani, 3 curries, starters", price: 800, inclusions: ["Hyderabadi biryani", "3 curries", "4 starters", "2 desserts", "Drinks", "Service staff"] },
        { name: "Royal Menu", description: "25-item menu with live counters and premium dishes", price: 1500, inclusions: ["2 types of biryani", "5 curries", "8 starters", "Live kebab counter", "4 desserts", "Premium drinks", "Decorated food stalls"] },
      ],
    },
    {
      user: { name: "Ananya Decorators", email: "ananya@example.com" },
      profile: {
        businessName: "Ananya Floral & Decor",
        slug: "ananya-floral-decor",
        description: "Luxury wedding decoration specialists. From traditional mandap setups to modern minimalist designs. Expert in South Indian wedding florals and stage decoration.",
        shortBio: "Luxury wedding florals & mandap decor",
        country: "IN", state: "Karnataka", city: "Bangalore",
        startingPrice: 100000, currency: "INR",
        yearsInBusiness: 12, teamSize: 15,
        averageRating: 4.6, totalReviews: 67,
        isVerified: true,
      },
      categories: ["decorators", "florists"],
      culturalTags: ["hindu", "south-indian", "kannada", "traditional", "modern"],
      listings: [{
        title: "Complete Wedding Decoration",
        slug: "ananya-complete-wedding-decoration",
        description: "End-to-end wedding decoration including mandap, stage, entrance, and table arrangements. Specializing in fresh flower decorations.",
        priceType: "STARTING_AT" as const,
        priceMin: 100000, priceMax: 500000,
        priceUnit: "per event",
        isPublished: true, isFeatured: false,
      }],
      packages: [
        { name: "Classic Decor", description: "Mandap setup, entrance decor, basic stage", price: 100000, inclusions: ["Mandap decoration", "Entrance arch", "Basic stage setup", "50 chair covers"] },
        { name: "Premium Decor", description: "Full venue transformation with premium flowers", price: 300000, inclusions: ["Premium mandap", "Full entrance setup", "Luxury stage", "Table centerpieces", "Car decoration", "Photo booth backdrop", "LED lighting"] },
      ],
    },
    {
      user: { name: "Pandit Ramesh Shastri", email: "pandit.ramesh@example.com" },
      profile: {
        businessName: "Pandit Ramesh Shastri",
        slug: "pandit-ramesh-shastri",
        description: "Experienced Vedic priest conducting Hindu wedding ceremonies. Specialized in Tamil Brahmin (Iyer) and Telugu wedding rituals. Fluent in Sanskrit, Tamil, and Telugu.",
        shortBio: "Vedic priest for South Indian weddings",
        country: "IN", state: "Tamil Nadu", city: "Chennai",
        startingPrice: 15000, currency: "INR",
        yearsInBusiness: 25, teamSize: 1,
        averageRating: 4.9, totalReviews: 312,
        isVerified: true,
      },
      categories: ["priests-officiants"],
      culturalTags: ["hindu", "south-indian", "tamil", "telugu", "traditional"],
      listings: [{
        title: "Hindu Wedding Ceremony",
        slug: "pandit-ramesh-hindu-wedding",
        description: "Complete Vedic wedding ceremony including muhurtam selection, all rituals from Ganapathi pooja to Saptapadi. Available for Tamil and Telugu traditions.",
        priceType: "FIXED" as const,
        priceMin: 15000,
        priceUnit: "per ceremony",
        isPublished: true, isFeatured: true,
      }],
      packages: [
        { name: "Standard Ceremony", description: "Core wedding rituals, 3-4 hours", price: 15000, inclusions: ["Muhurtam consultation", "All wedding rituals", "Pooja materials list", "3-4 hours"] },
        { name: "Extended Ceremony", description: "Full traditional ceremony with all sub-rituals", price: 25000, inclusions: ["Muhurtam consultation", "All wedding rituals", "All sub-ceremonies", "Homam", "Pooja materials included", "6-8 hours"] },
      ],
    },
    {
      user: { name: "Sarah Johnson", email: "sarah@example.com" },
      profile: {
        businessName: "Sarah Johnson Photography",
        slug: "sarah-johnson-photography",
        description: "Destination wedding photographer based in New York. Specialized in interfaith and fusion ceremonies. Editorial style with a documentary approach.",
        shortBio: "NYC-based destination wedding photographer",
        country: "US", state: "New York", city: "New York City",
        startingPrice: 5000, currency: "USD",
        yearsInBusiness: 10, teamSize: 4,
        averageRating: 4.7, totalReviews: 56,
        isVerified: true,
        websiteUrl: "https://sarahjohnsonphoto.example.com",
      },
      categories: ["photographers"],
      culturalTags: ["interfaith", "fusion", "modern", "destination"],
      listings: [{
        title: "Destination Wedding Photography",
        slug: "sarah-destination-wedding-photography",
        description: "Full destination wedding coverage. Travel worldwide. Editorial and documentary style capturing every cultural detail of your fusion ceremony.",
        priceType: "STARTING_AT" as const,
        priceMin: 5000, priceMax: 15000,
        currency: "USD",
        priceUnit: "per event",
        isPublished: true, isFeatured: true,
      }],
      packages: [
        { name: "Essentials", description: "8 hours coverage, 400 photos", price: 5000, inclusions: ["8 hours coverage", "400 edited photos", "Online gallery", "1 photographer"] },
        { name: "Premium", description: "Full weekend, 2 photographers, engagement session", price: 10000, inclusions: ["Full weekend coverage", "800+ edited photos", "2 photographers", "Engagement session", "Premium album", "Online gallery"] },
      ],
    },
  ];

  for (const vendor of sampleVendors) {
    // Create user
    const user = await prisma.user.upsert({
      where: { email: vendor.user.email },
      update: {},
      create: {
        name: vendor.user.name,
        email: vendor.user.email,
        passwordHash,
        role: "VENDOR",
      },
    });

    // Create vendor profile
    const profile = await prisma.vendorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        ...vendor.profile,
        startingPrice: vendor.profile.startingPrice,
      },
    });

    // Create listing
    for (const listingData of vendor.listings) {
      const listing = await prisma.vendorListing.upsert({
        where: { slug: listingData.slug },
        update: {},
        create: {
          vendorProfileId: profile.id,
          ...listingData,
          currency: (listingData as { currency?: string }).currency ?? "INR",
        },
      });

      // Assign categories
      for (const catSlug of vendor.categories) {
        const cat = await getCategory(catSlug);
        if (cat) {
          await prisma.vendorListingCategory.upsert({
            where: { listingId_categoryId: { listingId: listing.id, categoryId: cat.id } },
            update: {},
            create: { listingId: listing.id, categoryId: cat.id },
          });
        }
      }

      // Assign cultural tags
      for (const termSlug of vendor.culturalTags) {
        const term = await getTerm(termSlug);
        if (term) {
          await prisma.vendorListingCulturalTag.upsert({
            where: { listingId_taxonomyTermId: { listingId: listing.id, taxonomyTermId: term.id } },
            update: {},
            create: { listingId: listing.id, taxonomyTermId: term.id },
          });
        }
      }

      // Create packages
      for (let i = 0; i < vendor.packages.length; i++) {
        const pkg = vendor.packages[i];
        await prisma.vendorPackage.create({
          data: {
            listingId: listing.id,
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            currency: vendor.profile.currency,
            inclusions: pkg.inclusions,
            sortOrder: i,
          },
        });
      }
    }
  }

  // Create a sample customer
  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Test Customer",
      email: "customer@example.com",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  console.log(`  Seeded ${sampleVendors.length} sample vendors + 1 customer`);
  console.log("  Login credentials: any vendor email / password123");
  console.log("  Customer login: customer@example.com / password123");
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
