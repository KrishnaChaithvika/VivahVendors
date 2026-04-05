import { PrismaClient } from "@prisma/client";

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

  // ==========================================
  // MUMBAI VENDORS — Showcase diverse wedding market
  // ==========================================

  const mumbaiVendors = [
    // --- PHOTOGRAPHERS ---
    {
      user: { name: "Vikram Patil", email: "vikram.patil@example.com" },
      profile: {
        businessName: "Vikram Patil Photography",
        slug: "vikram-patil-photography-mumbai",
        description: "Award-winning Maharashtrian wedding photographer based in Andheri, Mumbai. Specializing in capturing the vibrant traditions of Marathi, Gujarati, and Hindu weddings with a cinematic style.",
        shortBio: "Capturing Maharashtrian wedding traditions since 2010",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 75000, currency: "INR",
        yearsInBusiness: 14, teamSize: 8,
        averageRating: 4.8, totalReviews: 187,
        isVerified: true,
        websiteUrl: "https://vikrampatilphoto.example.com",
      },
      categories: ["photographers"],
      culturalTags: ["hindu", "west-indian", "marathi", "traditional"],
      listings: [{
        title: "Complete Maharashtrian Wedding Photography",
        slug: "vikram-complete-maharashtrian-wedding-photography",
        description: "Full coverage of traditional Maharashtrian weddings including Sakhar Puda, Haldi, Mehndi, and the main ceremony. Pre-wedding shoots available.",
        priceType: "STARTING_AT" as const,
        priceMin: 75000, priceMax: 300000,
        priceUnit: "per event",
        isPublished: true, isFeatured: true,
      }],
      packages: [
        { name: "Essential", description: "Single day coverage, 300 edited photos", price: 75000, inclusions: ["8 hours coverage", "300 edited photos", "Online gallery", "1 photographer"] },
        { name: "Premium", description: "Full wedding coverage with pre-wedding shoot", price: 150000, inclusions: ["Full day coverage", "600 edited photos", "2 photographers", "Pre-wedding shoot", "Premium album"] },
        { name: "Luxury", description: "Multi-day + cinematic video + drone", price: 300000, inclusions: ["Multi-day coverage", "Unlimited photos", "Cinematic highlight video", "Drone coverage", "3 photographers", "Premium album"] },
      ],
    },
    {
      user: { name: "Faizan Sheikh", email: "faizan.sheikh@example.com" },
      profile: {
        businessName: "Faizan Sheikh Photography",
        slug: "faizan-sheikh-photography-mumbai",
        description: "Specialist in Muslim wedding photography covering Nikah, Mehndi, and Walima ceremonies. Based in Bandra, Mumbai with 10+ years capturing the elegance of Islamic wedding traditions.",
        shortBio: "Elegant Nikah and Walima photography",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 60000, currency: "INR",
        yearsInBusiness: 10, teamSize: 5,
        averageRating: 4.7, totalReviews: 132,
        isVerified: true,
      },
      categories: ["photographers"],
      culturalTags: ["muslim", "west-indian", "traditional", "modern"],
      listings: [{
        title: "Muslim Wedding Photography",
        slug: "faizan-muslim-wedding-photography-mumbai",
        description: "Complete photography coverage for Nikah, Mehndi, and Walima events. Respectful of Islamic traditions with a modern editorial approach.",
        priceType: "STARTING_AT" as const,
        priceMin: 60000, priceMax: 250000,
        priceUnit: "per event",
        isPublished: true, isFeatured: false,
      }],
      packages: [
        { name: "Nikah Coverage", description: "Ceremony day coverage", price: 60000, inclusions: ["6 hours coverage", "250 edited photos", "1 photographer", "Online gallery"] },
        { name: "Complete Wedding", description: "Mehndi + Nikah + Walima coverage", price: 150000, inclusions: ["Multi-event coverage", "500+ edited photos", "2 photographers", "All 3 events", "Premium album"] },
      ],
    },
    {
      user: { name: "Neha Kapoor", email: "neha.kapoor@example.com" },
      profile: {
        businessName: "Neha Kapoor Studios",
        slug: "neha-kapoor-studios-mumbai",
        description: "Modern fusion wedding photographer in South Mumbai. Specializing in intimate weddings, interfaith ceremonies, and destination celebrations with a candid documentary style.",
        shortBio: "Candid fusion & destination weddings",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 100000, currency: "INR",
        yearsInBusiness: 7, teamSize: 4,
        averageRating: 4.9, totalReviews: 94,
        isVerified: true,
        websiteUrl: "https://nehakapoorphoto.example.com",
      },
      categories: ["photographers", "videographers"],
      culturalTags: ["interfaith", "modern", "fusion", "destination"],
      listings: [{
        title: "Fusion Wedding Photo & Film",
        slug: "neha-fusion-wedding-photo-film-mumbai",
        description: "Cinematic photography and film for modern, interfaith, and fusion weddings. Travel across India and internationally.",
        priceType: "STARTING_AT" as const,
        priceMin: 100000, priceMax: 500000,
        priceUnit: "per event",
        isPublished: true, isFeatured: true,
      }],
      packages: [
        { name: "Photo Only", description: "Full day candid photography", price: 100000, inclusions: ["Full day coverage", "400 edited photos", "2 photographers", "Online gallery"] },
        { name: "Photo + Film", description: "Photography plus cinematic highlight film", price: 250000, inclusions: ["Full day photo + video", "600+ photos", "5 min cinematic film", "3 photographers", "Premium album"] },
      ],
    },

    // --- CATERERS ---
    {
      user: { name: "Jayesh Mehta", email: "jayesh.mehta@example.com" },
      profile: {
        businessName: "Shubh Shakahari Caterers",
        slug: "shubh-shakahari-caterers-mumbai",
        description: "Pure vegetarian Gujarati and Jain wedding caterers in Ghatkopar, Mumbai. Specialists in elaborate Gujarati thali, Jain-friendly dishes with no onion/garlic options. Serving Mumbai weddings for over 25 years.",
        shortBio: "Pure veg Gujarati & Jain wedding caterers",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 600, currency: "INR",
        yearsInBusiness: 25, teamSize: 40,
        averageRating: 4.6, totalReviews: 278,
        isVerified: true,
      },
      categories: ["caterers"],
      culturalTags: ["hindu", "jain", "west-indian", "gujarati", "traditional"],
      listings: [{
        title: "Gujarati & Jain Wedding Catering",
        slug: "shubh-gujarati-jain-wedding-catering-mumbai",
        description: "Elaborate pure vegetarian thalis for wedding functions. Jain options (no onion/garlic), live chaat counters, and traditional Gujarati sweets.",
        priceType: "STARTING_AT" as const,
        priceMin: 600, priceMax: 1800,
        priceUnit: "per plate",
        isPublished: true, isFeatured: true,
      }],
      packages: [
        { name: "Silver Thali", description: "12-item traditional Gujarati thali", price: 600, inclusions: ["12-item thali", "2 sweets", "Chaas", "Papad", "Service staff"] },
        { name: "Gold Thali", description: "18-item thali with live counters", price: 1000, inclusions: ["18-item thali", "4 sweets", "Live chaat counter", "Pani puri stall", "Premium drinks", "Decorated food stalls"] },
        { name: "Platinum", description: "25-item royal spread with Rajwadi setup", price: 1800, inclusions: ["25-item thali", "6 sweets", "3 live counters", "Ice cream bar", "Welcome drinks", "Rajwadi setup", "Premium service staff"] },
      ],
    },
    {
      user: { name: "Irfan Qureshi", email: "irfan.qureshi@example.com" },
      profile: {
        businessName: "Qureshi's Royal Kitchen",
        slug: "qureshis-royal-kitchen-mumbai",
        description: "Legendary Mughlai and Lucknowi wedding caterers from Mohammed Ali Road, Mumbai. Famous for biryani, seekh kebabs, and Shahi desserts. Trusted by families for generations.",
        shortBio: "Legendary Mughlai wedding feasts since 1985",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 700, currency: "INR",
        yearsInBusiness: 38, teamSize: 50,
        averageRating: 4.8, totalReviews: 345,
        isVerified: true,
      },
      categories: ["caterers"],
      culturalTags: ["muslim", "north-indian", "traditional"],
      listings: [{
        title: "Royal Mughlai Wedding Feast",
        slug: "qureshis-royal-mughlai-feast-mumbai",
        description: "Authentic Mughlai and Lucknowi cuisine for Nikah, Walima, and reception. Famous for our signature biryani and live kebab counters.",
        priceType: "STARTING_AT" as const,
        priceMin: 700, priceMax: 2200,
        priceUnit: "per plate",
        isPublished: true, isFeatured: false,
      }],
      packages: [
        { name: "Classic Dawat", description: "12-item non-veg menu", price: 700, inclusions: ["Qureshi biryani", "3 curries", "4 kebab varieties", "2 desserts", "Sharbat", "Service staff"] },
        { name: "Shahi Dawat", description: "20-item royal spread with live counters", price: 1500, inclusions: ["2 biryanis", "5 curries", "8 kebab varieties", "Live tandoor counter", "4 Shahi desserts", "Premium drinks", "Decorated counters"] },
      ],
    },
    {
      user: { name: "Srinivas Iyer", email: "srinivas.iyer@example.com" },
      profile: {
        businessName: "Dakshin Delight Caterers",
        slug: "dakshin-delight-caterers-mumbai",
        description: "South Indian and multi-cuisine wedding caterers in Powai, Mumbai. Offering traditional banana leaf meals, North Indian, and continental options. Perfect for diverse guest lists.",
        shortBio: "South Indian & multi-cuisine wedding caterers",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 550, currency: "INR",
        yearsInBusiness: 15, teamSize: 35,
        averageRating: 4.5, totalReviews: 189,
        isVerified: false,
      },
      categories: ["caterers"],
      culturalTags: ["hindu", "south-indian", "west-indian", "modern"],
      listings: [{
        title: "Multi-Cuisine Wedding Catering",
        slug: "dakshin-multi-cuisine-wedding-mumbai",
        description: "Authentic South Indian banana leaf meals along with North Indian and continental options. Ideal for weddings with diverse guest backgrounds.",
        priceType: "RANGE" as const,
        priceMin: 550, priceMax: 1600,
        priceUnit: "per plate",
        isPublished: true, isFeatured: false,
      }],
      packages: [
        { name: "South Indian Special", description: "Traditional banana leaf meal", price: 550, inclusions: ["Banana leaf meal", "Sambar", "Rasam", "4 curries", "Payasam", "Filter coffee"] },
        { name: "Multi-Cuisine Combo", description: "South + North Indian + Continental", price: 1100, inclusions: ["South Indian counter", "North Indian counter", "Continental starters", "Live dosa station", "4 desserts"] },
      ],
    },

    // --- DECORATORS ---
    {
      user: { name: "Meera Joshi", email: "meera.joshi@example.com" },
      profile: {
        businessName: "Meera's Mandap Creations",
        slug: "meeras-mandap-creations-mumbai",
        description: "Traditional Hindu wedding mandap and ceremony decoration specialist in Dadar, Mumbai. Expert in Maharashtrian and Gujarati mandap styles with fresh flower work.",
        shortBio: "Traditional mandap decoration specialist",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 80000, currency: "INR",
        yearsInBusiness: 18, teamSize: 20,
        averageRating: 4.7, totalReviews: 156,
        isVerified: true,
      },
      categories: ["decorators", "florists"],
      culturalTags: ["hindu", "west-indian", "marathi", "gujarati", "traditional"],
      listings: [{
        title: "Traditional Mandap & Ceremony Decor",
        slug: "meeras-traditional-mandap-decor-mumbai",
        description: "Handcrafted mandap setups with fresh flowers for Maharashtrian and Gujarati weddings. Includes entrance, aisle, and stage decoration.",
        priceType: "STARTING_AT" as const,
        priceMin: 80000, priceMax: 400000,
        priceUnit: "per event",
        isPublished: true, isFeatured: true,
      }],
      packages: [
        { name: "Classic Mandap", description: "Traditional mandap + entrance decor", price: 80000, inclusions: ["Wooden mandap", "Fresh flower decoration", "Entrance arch", "Aisle decoration"] },
        { name: "Grand Mandap", description: "Luxury mandap + full venue decor", price: 250000, inclusions: ["Premium carved mandap", "Exotic flower work", "Full entrance setup", "Stage decoration", "Table centerpieces", "LED lighting", "Car decoration"] },
      ],
    },
    {
      user: { name: "Rohit Singhania", email: "rohit.singhania@example.com" },
      profile: {
        businessName: "Luxe Events Mumbai",
        slug: "luxe-events-mumbai",
        description: "Luxury contemporary wedding designer in Juhu, Mumbai. Creating stunning modern, minimalist, and fusion wedding setups. Featured in top wedding magazines.",
        shortBio: "Luxury contemporary wedding design",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 200000, currency: "INR",
        yearsInBusiness: 9, teamSize: 12,
        averageRating: 4.9, totalReviews: 78,
        isVerified: true,
        websiteUrl: "https://luxeventsmumbai.example.com",
      },
      categories: ["decorators"],
      culturalTags: ["interfaith", "modern", "fusion", "destination"],
      listings: [{
        title: "Luxury Wedding Design & Decor",
        slug: "luxe-luxury-wedding-design-mumbai",
        description: "Bespoke wedding design for modern couples. Minimalist elegance, floral installations, and immersive themed setups.",
        priceType: "STARTING_AT" as const,
        priceMin: 200000, priceMax: 1500000,
        priceUnit: "per event",
        isPublished: true, isFeatured: false,
      }],
      packages: [
        { name: "Chic", description: "Modern minimalist setup", price: 200000, inclusions: ["Contemporary mandap/altar", "Minimal floral installation", "Entrance setup", "Basic lighting"] },
        { name: "Opulent", description: "Full luxury transformation", price: 800000, inclusions: ["Bespoke design concept", "Floral ceiling installation", "LED walls", "Luxury lounge", "Photo zones", "Complete venue transformation"] },
      ],
    },

    // --- VENUES ---
    {
      user: { name: "The Taj Mahal Palace Events", email: "taj.events@example.com" },
      profile: {
        businessName: "Heritage Banquet Hall",
        slug: "heritage-banquet-hall-mumbai",
        description: "Elegant heritage banquet hall in South Mumbai. Grand ballroom with vintage chandeliers, perfect for traditional Hindu, Parsi, and Christian weddings. Capacity up to 800 guests.",
        shortBio: "Grand heritage venue in South Mumbai",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 300000, currency: "INR",
        yearsInBusiness: 30, teamSize: 25,
        averageRating: 4.6, totalReviews: 210,
        isVerified: true,
      },
      categories: ["venues"],
      culturalTags: ["hindu", "christian", "west-indian", "traditional"],
      listings: [{
        title: "Grand Heritage Banquet Hall",
        slug: "heritage-grand-banquet-hall-mumbai",
        description: "Stunning South Mumbai venue with vintage architecture, grand ballroom, outdoor lawns, and in-house catering. Perfect for opulent traditional weddings.",
        priceType: "STARTING_AT" as const,
        priceMin: 300000, priceMax: 1500000,
        priceUnit: "per event",
        isPublished: true, isFeatured: true,
      }],
      packages: [
        { name: "Ballroom", description: "Grand ballroom for 400 guests", price: 300000, inclusions: ["Ballroom rental", "Basic decor", "Valet parking", "400 guests capacity", "Bridal suite"] },
        { name: "Grand Celebration", description: "Full venue with lawn + ballroom", price: 800000, inclusions: ["Ballroom + lawn", "800 guests capacity", "In-house catering", "Premium decor", "Bridal suite", "DJ setup", "Valet parking"] },
      ],
    },
    {
      user: { name: "Seaside Celebrations", email: "seaside.celebrations@example.com" },
      profile: {
        businessName: "Seaside Celebrations Juhu",
        slug: "seaside-celebrations-juhu-mumbai",
        description: "Beachfront wedding venue in Juhu, Mumbai. Open-air celebrations with stunning Arabian Sea views. Perfect for sunset ceremonies and intimate beach weddings.",
        shortBio: "Beachfront wedding venue with sea views",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 200000, currency: "INR",
        yearsInBusiness: 12, teamSize: 15,
        averageRating: 4.5, totalReviews: 98,
        isVerified: false,
      },
      categories: ["venues"],
      culturalTags: ["interfaith", "modern", "destination", "intimate-micro"],
      listings: [{
        title: "Beachfront Wedding Venue",
        slug: "seaside-beachfront-wedding-venue-mumbai",
        description: "Beautiful beachside venue with panoramic sea views. Ideal for intimate ceremonies, sangeet nights, and destination-style weddings in Mumbai.",
        priceType: "STARTING_AT" as const,
        priceMin: 200000, priceMax: 1000000,
        priceUnit: "per event",
        isPublished: true, isFeatured: false,
      }],
      packages: [
        { name: "Intimate Beach", description: "Up to 100 guests, sunset ceremony", price: 200000, inclusions: ["Beach setup", "100 guests", "Basic decor", "Sound system", "2 hours"] },
        { name: "Grand Beach Wedding", description: "Up to 300 guests, full evening", price: 600000, inclusions: ["Full beach + indoor venue", "300 guests", "Premium decor", "Stage + dance floor", "Full evening", "Parking"] },
      ],
    },

    // --- MAKEUP ARTISTS ---
    {
      user: { name: "Pooja Sawant", email: "pooja.sawant@example.com" },
      profile: {
        businessName: "Pooja Sawant Bridal Studio",
        slug: "pooja-sawant-bridal-studio-mumbai",
        description: "Specialist in Maharashtrian bridal looks including traditional Nauvari draping, mundavalya, and bridal jewelry styling. Based in Thane, serving all of Mumbai.",
        shortBio: "Maharashtrian bridal makeup & Nauvari draping",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 15000, currency: "INR",
        yearsInBusiness: 11, teamSize: 4,
        averageRating: 4.8, totalReviews: 165,
        isVerified: true,
      },
      categories: ["makeup-artists"],
      culturalTags: ["hindu", "west-indian", "marathi", "traditional"],
      listings: [{
        title: "Maharashtrian Bridal Makeup & Styling",
        slug: "pooja-maharashtrian-bridal-makeup-mumbai",
        description: "Complete Maharashtrian bridal transformation including traditional makeup, Nauvari saree draping, mundavalya, and bridal jewelry styling.",
        priceType: "STARTING_AT" as const,
        priceMin: 15000, priceMax: 50000,
        priceUnit: "per event",
        isPublished: true, isFeatured: false,
      }],
      packages: [
        { name: "Classic Bridal", description: "Traditional makeup + hairstyling", price: 15000, inclusions: ["HD bridal makeup", "Hairstyling", "Nauvari draping", "1 event"] },
        { name: "Premium Bridal", description: "Airbrush + trial + 2 events", price: 35000, inclusions: ["Airbrush makeup", "Hairstyling", "Nauvari draping", "Mundavalya setting", "Trial session", "2 events"] },
      ],
    },
    {
      user: { name: "Zara Hussain", email: "zara.hussain@example.com" },
      profile: {
        businessName: "Zara Glam Studio",
        slug: "zara-glam-studio-mumbai",
        description: "Celebrity makeup artist in Bandra specializing in glamorous bridal looks for all traditions. Expert in Muslim, Sikh, and South Indian bridal styles.",
        shortBio: "Celebrity makeup artist for all traditions",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 30000, currency: "INR",
        yearsInBusiness: 13, teamSize: 6,
        averageRating: 4.9, totalReviews: 220,
        isVerified: true,
        websiteUrl: "https://zaraglamstudio.example.com",
      },
      categories: ["makeup-artists"],
      culturalTags: ["muslim", "sikh", "south-indian", "modern"],
      listings: [{
        title: "Celebrity Bridal Makeup",
        slug: "zara-celebrity-bridal-makeup-mumbai",
        description: "Red carpet bridal looks for all cultural backgrounds. Specializing in Muslim, Sikh, and South Indian bridal styles with a glamorous modern touch.",
        priceType: "STARTING_AT" as const,
        priceMin: 30000, priceMax: 100000,
        priceUnit: "per event",
        isPublished: true, isFeatured: true,
      }],
      packages: [
        { name: "Signature Look", description: "HD/airbrush makeup for 1 event", price: 30000, inclusions: ["HD/airbrush makeup", "Hairstyling", "Dupatta/veil setting", "1 event", "Touch-up kit"] },
        { name: "Star Package", description: "Full wedding coverage + trial", price: 75000, inclusions: ["Airbrush makeup", "Hairstyling", "All events (up to 3)", "Trial session", "Family member makeup (2)", "Touch-up kit"] },
      ],
    },

    // --- PRIESTS & OFFICIANTS ---
    {
      user: { name: "Pandit Suresh Joshi", email: "pandit.suresh@example.com" },
      profile: {
        businessName: "Pandit Suresh Joshi",
        slug: "pandit-suresh-joshi-mumbai",
        description: "Experienced Marathi Hindu priest in Dadar, Mumbai. Conducting traditional Maharashtrian, Gujarati, and Vedic wedding ceremonies for over 30 years.",
        shortBio: "Vedic priest for Maharashtrian weddings",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 11000, currency: "INR",
        yearsInBusiness: 30, teamSize: 1,
        averageRating: 4.8, totalReviews: 290,
        isVerified: true,
      },
      categories: ["priests-officiants"],
      culturalTags: ["hindu", "west-indian", "marathi", "gujarati", "traditional"],
      listings: [{
        title: "Maharashtrian Hindu Wedding Ceremony",
        slug: "pandit-suresh-maharashtrian-wedding-mumbai",
        description: "Traditional Maharashtrian and Vedic wedding ceremonies. Includes muhurat selection, all rituals from Ganesh Pujan to Saptapadi.",
        priceType: "FIXED" as const,
        priceMin: 11000,
        priceUnit: "per ceremony",
        isPublished: true, isFeatured: false,
      }],
      packages: [
        { name: "Standard Ceremony", description: "Core wedding rituals, 3 hours", price: 11000, inclusions: ["Muhurat consultation", "All main rituals", "Pooja materials list", "3 hours"] },
        { name: "Complete Traditional", description: "Full ceremony with all sub-rituals", price: 21000, inclusions: ["Muhurat consultation", "All rituals + sub-rituals", "Ganesh Pujan", "Havan", "Pooja materials included", "5-6 hours"] },
      ],
    },
    {
      user: { name: "Reverend David D'Souza", email: "rev.david@example.com" },
      profile: {
        businessName: "Reverend David D'Souza",
        slug: "reverend-david-dsouza-mumbai",
        description: "Interfaith and Christian wedding officiant in South Mumbai. Conducts Catholic, Protestant, and interfaith ceremonies. Fluent in English, Hindi, Konkani, and Marathi.",
        shortBio: "Christian & interfaith wedding officiant",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 8000, currency: "INR",
        yearsInBusiness: 20, teamSize: 1,
        averageRating: 4.7, totalReviews: 87,
        isVerified: true,
      },
      categories: ["priests-officiants"],
      culturalTags: ["christian", "interfaith", "west-indian", "modern"],
      listings: [{
        title: "Christian & Interfaith Wedding Ceremony",
        slug: "rev-david-christian-interfaith-wedding-mumbai",
        description: "Beautiful Christian and interfaith wedding ceremonies. Personalized vows, multilingual services. Church or venue ceremonies.",
        priceType: "FIXED" as const,
        priceMin: 8000,
        priceUnit: "per ceremony",
        isPublished: true, isFeatured: false,
      }],
      packages: [
        { name: "Church Ceremony", description: "Traditional church wedding", price: 8000, inclusions: ["Pre-marital counseling", "Church ceremony", "Personalized homily", "1.5 hours"] },
        { name: "Venue Ceremony", description: "Ceremony at wedding venue", price: 15000, inclusions: ["Pre-marital counseling", "Venue ceremony", "Personalized vows", "Sound system", "2 hours", "Travel included"] },
      ],
    },

    // --- MEHENDI ARTIST ---
    {
      user: { name: "Rashida Patel", email: "rashida.patel@example.com" },
      profile: {
        businessName: "Rashida's Mehndi Art",
        slug: "rashidas-mehndi-art-mumbai",
        description: "Master mehndi artist in Andheri, Mumbai. Specializing in intricate Rajasthani, Arabic, and Indo-Arabic bridal designs. Team available for large wedding parties.",
        shortBio: "Intricate bridal mehndi designs",
        country: "IN", state: "Maharashtra", city: "Mumbai",
        startingPrice: 5000, currency: "INR",
        yearsInBusiness: 16, teamSize: 8,
        averageRating: 4.8, totalReviews: 312,
        isVerified: true,
      },
      categories: ["mehendi-artists"],
      culturalTags: ["hindu", "muslim", "west-indian", "traditional"],
      listings: [{
        title: "Bridal Mehndi Design",
        slug: "rashidas-bridal-mehndi-design-mumbai",
        description: "Exquisite bridal mehndi designs including Rajasthani, Arabic, and custom fusion patterns. Team of 8 artists for quick guest mehndi.",
        priceType: "STARTING_AT" as const,
        priceMin: 5000, priceMax: 25000,
        priceUnit: "per bride",
        isPublished: true, isFeatured: false,
      }],
      packages: [
        { name: "Bridal Hands", description: "Full hands + feet bridal mehndi", price: 5000, inclusions: ["Full hands front & back", "Feet design", "1 bride", "Premium mehndi cone"] },
        { name: "Bridal + Guests", description: "Bridal mehndi + up to 30 guests", price: 20000, inclusions: ["Bridal hands & feet", "30 guest hands", "4 artists", "Premium cones", "4-5 hours"] },
      ],
    },
  ];

  for (const vendor of mumbaiVendors) {
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

    const profile = await prisma.vendorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        ...vendor.profile,
        startingPrice: vendor.profile.startingPrice,
      },
    });

    for (const listingData of vendor.listings) {
      const listing = await prisma.vendorListing.upsert({
        where: { slug: listingData.slug },
        update: {},
        create: {
          vendorProfileId: profile.id,
          ...listingData,
          currency: "INR",
        },
      });

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

  console.log(`  Seeded ${mumbaiVendors.length} Mumbai vendors`);

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
