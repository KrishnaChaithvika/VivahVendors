/**
 * Extended vendor seed — Mumbai, Pune, Thane, Navi Mumbai & nearby.
 * Run with: npx tsx prisma/seed-vendors.ts
 */
// Load env before Prisma client initializes
import { config } from "dotenv";
config({ path: new URL("../.env", import.meta.url).pathname });

import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── helpers ──────────────────────────────────────────────────────────────────
const cat = (slug: string) => prisma.category.findUnique({ where: { slug } });
const term = (slug: string) => prisma.taxonomyTerm.findUnique({ where: { slug } });

async function upsertVendor(v: {
  email: string;
  name: string;
  profile: {
    businessName: string; slug: string; description: string; shortBio: string;
    country: string; state: string; city: string;
    startingPrice: number; currency: string;
    yearsInBusiness?: number; teamSize?: number;
    averageRating?: number; totalReviews?: number;
    isVerified?: boolean; websiteUrl?: string;
  };
  categories: string[];
  tags: string[];
  listing: {
    title: string; slug: string; description: string;
    priceType: "FIXED" | "STARTING_AT" | "RANGE" | "ON_REQUEST";
    priceMin?: number; priceMax?: number; priceUnit?: string;
    isFeatured?: boolean;
  };
  packages: { name: string; description: string; price: number; inclusions: string[] }[];
}) {
  const pwHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: v.email },
    update: {},
    create: { name: v.name, email: v.email, passwordHash: pwHash, role: "VENDOR" },
  });

  const profile = await prisma.vendorProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      ...v.profile,
      isActive: true,
      isClaimed: true,
      isVerified: v.profile.isVerified ?? false,
      startingPrice: v.profile.startingPrice,
      averageRating: v.profile.averageRating ?? 0,
      totalReviews: v.profile.totalReviews ?? 0,
    },
  });

  const listing = await prisma.vendorListing.upsert({
    where: { slug: v.listing.slug },
    update: {},
    create: {
      vendorProfileId: profile.id,
      ...v.listing,
      currency: v.profile.currency,
      isPublished: true,
      isFeatured: v.listing.isFeatured ?? false,
    },
  });

  // categories
  for (const slug of v.categories) {
    const c = await cat(slug);
    if (c) {
      await prisma.vendorListingCategory.upsert({
        where: { listingId_categoryId: { listingId: listing.id, categoryId: c.id } },
        update: {},
        create: { listingId: listing.id, categoryId: c.id },
      });
    }
  }

  // cultural tags
  for (const slug of v.tags) {
    const t = await term(slug);
    if (t) {
      await prisma.vendorListingCulturalTag.upsert({
        where: { listingId_taxonomyTermId: { listingId: listing.id, taxonomyTermId: t.id } },
        update: {},
        create: { listingId: listing.id, taxonomyTermId: t.id },
      });
    }
  }

  // packages — delete & recreate so re-running is idempotent
  const existing = await prisma.vendorPackage.count({ where: { listingId: listing.id } });
  if (existing === 0) {
    for (let i = 0; i < v.packages.length; i++) {
      const p = v.packages[i];
      await prisma.vendorPackage.create({
        data: {
          listingId: listing.id,
          name: p.name, description: p.description,
          price: p.price, currency: v.profile.currency,
          inclusions: p.inclusions, isActive: true, sortOrder: i,
        },
      });
    }
  }
}

// ─── vendor data ──────────────────────────────────────────────────────────────
async function main() {
  console.log("Seeding extended vendor data…");

  // ── PHOTOGRAPHERS ──────────────────────────────────────────────────────────

  await upsertVendor({
    email: "vivek.mehta.photo@example.com", name: "Vivek Mehta",
    profile: { businessName: "Vivek Mehta Photography", slug: "vivek-mehta-photography",
      description: "Award-winning wedding photographer based in Bandra, Mumbai. Specialises in Marathi and Gujarati traditional ceremonies. Known for natural light, candid moments, and storytelling.",
      shortBio: "Candid wedding photography — Mumbai", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 60000, currency: "INR", yearsInBusiness: 12, teamSize: 4,
      averageRating: 4.9, totalReviews: 187, isVerified: true },
    categories: ["photographers"],
    tags: ["hindu", "west-indian", "marathi", "gujarati", "traditional"],
    listing: { title: "Wedding Photography — Bandra Studio", slug: "vivek-mehta-wedding-photography",
      description: "Complete wedding day coverage. Candid, editorial, and traditional styles. Includes pre-wedding consultation and online gallery delivery.",
      priceType: "STARTING_AT", priceMin: 60000, priceMax: 250000, priceUnit: "per event", isFeatured: true },
    packages: [
      { name: "Silver", description: "6 hr coverage, 300 edited photos", price: 60000, inclusions: ["6 hours", "300 edited photos", "Online gallery", "1 photographer"] },
      { name: "Gold", description: "Full day, 600 photos, 2 shooters", price: 130000, inclusions: ["Full day", "600 photos", "2 photographers", "Pre-wedding shoot", "Highlight reel"] },
      { name: "Platinum", description: "2-day coverage + drone + album", price: 250000, inclusions: ["2-day coverage", "Drone footage", "1000+ photos", "Premium album", "Cinematic reel"] },
    ],
  });

  await upsertVendor({
    email: "lens.love.mumbai@example.com", name: "Pooja Nair",
    profile: { businessName: "Lens & Love", slug: "lens-and-love-mumbai",
      description: "Borivali-based wedding photography studio. Specialists in South Indian and interfaith ceremonies across Mumbai. Fine-art documentary style.",
      shortBio: "Fine-art wedding photography", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 45000, currency: "INR", yearsInBusiness: 7, teamSize: 3,
      averageRating: 4.8, totalReviews: 103, isVerified: true },
    categories: ["photographers"],
    tags: ["hindu", "south-indian", "malayali", "interfaith", "modern"],
    listing: { title: "Fine Art Wedding Photography", slug: "lens-love-wedding-photography",
      description: "Documentary-style photography for South Indian and fusion ceremonies in Mumbai and Pune.",
      priceType: "STARTING_AT", priceMin: 45000, priceMax: 180000, priceUnit: "per event", isFeatured: true },
    packages: [
      { name: "Essentials", description: "5 hrs, 250 photos", price: 45000, inclusions: ["5 hours", "250 photos", "Online gallery"] },
      { name: "Classic", description: "Full day, 500 photos, video teaser", price: 100000, inclusions: ["Full day", "500 photos", "Short video teaser", "2 photographers"] },
    ],
  });

  await upsertVendor({
    email: "rohan.frames@example.com", name: "Rohan Desai",
    profile: { businessName: "Rohan Desai Frames", slug: "rohan-desai-frames",
      description: "Pune-based photographer covering Mumbai, Pune and Nashik weddings. Speciality in Marathi and Gujarati vidhi photography with a cinematic approach.",
      shortBio: "Cinematic Marathi wedding photographer", country: "IN", state: "Maharashtra", city: "Pune",
      startingPrice: 40000, currency: "INR", yearsInBusiness: 9, teamSize: 3,
      averageRating: 4.7, totalReviews: 91, isVerified: true },
    categories: ["photographers"],
    tags: ["hindu", "west-indian", "marathi", "gujarati", "traditional"],
    listing: { title: "Marathi Wedding Photography & Film", slug: "rohan-desai-wedding-photography",
      description: "Full wedding coverage for Marathi and Gujarati weddings. Available across Pune, Mumbai, and Nashik.",
      priceType: "STARTING_AT", priceMin: 40000, priceMax: 150000, priceUnit: "per event", isFeatured: false },
    packages: [
      { name: "Basic", description: "4 hrs, 200 photos", price: 40000, inclusions: ["4 hours", "200 photos", "USB delivery"] },
      { name: "Full Day", description: "8 hrs, 500 photos + cinematic film", price: 100000, inclusions: ["8 hours", "500 photos", "5 min cinematic film", "2 photographers"] },
    ],
  });

  await upsertVendor({
    email: "arjun.shah.films@example.com", name: "Arjun Shah",
    profile: { businessName: "Arjun Shah Wedding Films", slug: "arjun-shah-wedding-films",
      description: "Andheri-based cinematic wedding filmmaker. Specialises in Gujarati and Jain wedding films. Known for emotional storytelling and 4K drone coverage.",
      shortBio: "Cinematic Gujarati wedding films", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 70000, currency: "INR", yearsInBusiness: 11, teamSize: 5,
      averageRating: 4.8, totalReviews: 142, isVerified: true },
    categories: ["videographers"],
    tags: ["hindu", "west-indian", "gujarati", "jain", "traditional"],
    listing: { title: "Cinematic Wedding Films", slug: "arjun-shah-cinematic-wedding-films",
      description: "Feature-length cinematic wedding film. 4K, drone, and multi-camera setup. Specialising in Gujarati, Jain, and Marathi ceremonies.",
      priceType: "STARTING_AT", priceMin: 70000, priceMax: 200000, priceUnit: "per event", isFeatured: true },
    packages: [
      { name: "Highlight Film", description: "5-min cinematic highlight + full ceremony", price: 70000, inclusions: ["5-min highlight", "Full ceremony recording", "1080p delivery"] },
      { name: "Feature Film", description: "15-min feature + same-day edit", price: 150000, inclusions: ["15-min feature film", "Same-day edit", "4K drone", "Multi-camera", "4K delivery"] },
    ],
  });

  await upsertVendor({
    email: "wedding.tale.thane@example.com", name: "Nisha Kapoor",
    profile: { businessName: "The Wedding Tale", slug: "the-wedding-tale-thane",
      description: "Thane-based photography and videography studio. Covering weddings across Mumbai Metropolitan Region. Specialists in North Indian and Punjabi ceremonies.",
      shortBio: "Mumbai MMR wedding photographer", country: "IN", state: "Maharashtra", city: "Thane",
      startingPrice: 35000, currency: "INR", yearsInBusiness: 6, teamSize: 4,
      averageRating: 4.6, totalReviews: 78, isVerified: true },
    categories: ["photographers", "videographers"],
    tags: ["hindu", "north-indian", "punjabi", "sikh", "modern"],
    listing: { title: "Wedding Photography & Video Package", slug: "the-wedding-tale-photo-video",
      description: "Combined photo and video package for North Indian and Punjabi weddings. Covering Thane, Navi Mumbai, and Mumbai.",
      priceType: "STARTING_AT", priceMin: 35000, priceMax: 120000, priceUnit: "per event" },
    packages: [
      { name: "Photo Only", description: "Full day photography", price: 35000, inclusions: ["Full day", "300 photos", "Online gallery"] },
      { name: "Photo + Video", description: "Full day photo and video combo", price: 80000, inclusions: ["Full day", "400 photos", "10-min film", "Drone", "2 photographers", "1 videographer"] },
    ],
  });

  // ── CATERERS ───────────────────────────────────────────────────────────────

  await upsertVendor({
    email: "patel.caterers.mumbai@example.com", name: "Suresh Patel",
    profile: { businessName: "Patel Family Caterers", slug: "patel-family-caterers-mumbai",
      description: "Third-generation Gujarati catering family based in Borivali. Specialists in vegetarian Gujarati thali, Jain menus, and Saurashtra-style wedding feasts. No onion, no garlic options available.",
      shortBio: "Authentic Gujarati wedding catering", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 600, currency: "INR", yearsInBusiness: 35, teamSize: 50,
      averageRating: 4.8, totalReviews: 334, isVerified: true },
    categories: ["caterers"],
    tags: ["hindu", "west-indian", "gujarati", "jain", "traditional"],
    listing: { title: "Gujarati Vegetarian Wedding Feast", slug: "patel-gujarati-wedding-feast",
      description: "Full Gujarati thali catering for weddings. Pure vegetarian, Jain options, and traditional Saurashtra-style menus.",
      priceType: "STARTING_AT", priceMin: 600, priceMax: 1800, priceUnit: "per plate", isFeatured: true },
    packages: [
      { name: "Standard Thali", description: "12-item Gujarati thali", price: 600, inclusions: ["Dal", "Sabji (2)", "Rotli", "Puri", "Rice", "Khichdi", "Kadhi", "Papad", "Pickle", "Chaas", "Mukhwas", "Dessert (2)"] },
      { name: "Premium Thali", description: "18-item Gujarati royal thali with sweets", price: 1000, inclusions: ["All standard items", "Undhiyu", "Srikhand", "Basundi", "Farsan (3)", "Live sweet counter"] },
      { name: "Jain Special", description: "Pure Jain menu, no root vegetables", price: 800, inclusions: ["Jain-certified kitchen", "No onion/garlic/root veg", "12-item Jain thali", "Desserts"] },
    ],
  });

  await upsertVendor({
    email: "maharaj.caterers.worli@example.com", name: "Ramdas Maharaj",
    profile: { businessName: "Maharaj Caterers Worli", slug: "maharaj-caterers-worli",
      description: "Premium South Indian vegetarian catering for Mumbai weddings. Specialises in Tamil Brahmin, Udupi, and Chettinad wedding menus. 25 years of experience serving traditional sadhyas and feasts.",
      shortBio: "Premium South Indian wedding catering", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 700, currency: "INR", yearsInBusiness: 25, teamSize: 40,
      averageRating: 4.7, totalReviews: 215, isVerified: true },
    categories: ["caterers"],
    tags: ["hindu", "south-indian", "tamil", "malayali", "traditional"],
    listing: { title: "South Indian Wedding Sadhya", slug: "maharaj-south-indian-wedding-sadhya",
      description: "Authentic South Indian wedding feast on banana leaf. Tamil Brahmin, Udupi, and Kerala-style sadhyas.",
      priceType: "STARTING_AT", priceMin: 700, priceMax: 2000, priceUnit: "per plate", isFeatured: true },
    packages: [
      { name: "Tamil Sadhya", description: "20-item South Indian feast on banana leaf", price: 700, inclusions: ["Banana leaf service", "Sambar", "Rasam", "Kootu", "Poriyal (3)", "Papad", "Pickle", "Dessert (2)", "Payasam"] },
      { name: "Kerala Sadhya", description: "28-item Kerala-style feast", price: 1200, inclusions: ["Banana leaf", "28 curries & sides", "Olan", "Avial", "Payasam (2)", "Full dessert spread"] },
    ],
  });

  await upsertVendor({
    email: "nikah.feast.mumbai@example.com", name: "Zubair Khan",
    profile: { businessName: "Zubair's Nikah Feast", slug: "zubairs-nikah-feast-mumbai",
      description: "Specialized Muslim wedding catering in Mumbai. Expert in Nikah ceremony feasts, Walima catering, and Eid-style menus. Halal-certified kitchen. Serving Mumbai's Muslim community for 18 years.",
      shortBio: "Halal-certified Mumbai Nikah caterers", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 900, currency: "INR", yearsInBusiness: 18, teamSize: 35,
      averageRating: 4.7, totalReviews: 178, isVerified: true },
    categories: ["caterers"],
    tags: ["muslim", "west-indian", "traditional"],
    listing: { title: "Nikah & Walima Catering", slug: "zubairs-nikah-walima-catering",
      description: "Halal-certified catering for Nikah and Walima ceremonies. Biryani, kebabs, curries, and desserts.",
      priceType: "STARTING_AT", priceMin: 900, priceMax: 2500, priceUnit: "per plate", isFeatured: true },
    packages: [
      { name: "Nikah Package", description: "15-item halal feast", price: 900, inclusions: ["Mutton biryani", "Chicken curry", "Kebabs (2)", "Raita", "Dessert", "Drinks", "Service staff"] },
      { name: "Royal Walima", description: "25-item grand feast with live stations", price: 2000, inclusions: ["2 biryani types", "5 curries", "Live kebab station", "Mughlai sweets", "Shahi tukda", "Full dessert counter"] },
    ],
  });

  await upsertVendor({
    email: "marathi.caterers.pune@example.com", name: "Santosh Deshmukh",
    profile: { businessName: "Deshmukh Caterers", slug: "deshmukh-caterers-pune",
      description: "Authentic Maharashtrian wedding catering from Pune. Traditional Marathi thali, puran poli, modak, and non-vegetarian options including chicken and mutton specialties.",
      shortBio: "Authentic Marathi wedding catering", country: "IN", state: "Maharashtra", city: "Pune",
      startingPrice: 550, currency: "INR", yearsInBusiness: 22, teamSize: 30,
      averageRating: 4.6, totalReviews: 189, isVerified: true },
    categories: ["caterers"],
    tags: ["hindu", "west-indian", "marathi", "traditional"],
    listing: { title: "Marathi Wedding Thali", slug: "deshmukh-marathi-wedding-thali",
      description: "Traditional Maharashtrian wedding catering. Vegetarian and non-vegetarian Marathi thalis, sakar puda, and modak.",
      priceType: "STARTING_AT", priceMin: 550, priceMax: 1500, priceUnit: "per plate" },
    packages: [
      { name: "Veg Thali", description: "Traditional Marathi veg thali", price: 550, inclusions: ["Amti", "Bhaji (2)", "Poli", "Bhaat", "Koshimbir", "Papad", "Pickle", "Puran poli", "Shrikhand"] },
      { name: "Non-Veg Thali", description: "Marathi non-veg special", price: 800, inclusions: ["Mutton curry", "Chicken sukka", "Amti", "Poli", "Bhaat", "Sabudana", "Modak", "Dessert"] },
    ],
  });

  await upsertVendor({
    email: "continental.catering.bandra@example.com", name: "Marco D'Souza",
    profile: { businessName: "D'Souza Continental Catering", slug: "dsouza-continental-catering",
      description: "Goan-Christian wedding catering specialists in Bandra, Mumbai. Expert in Goan-Catholic feast menus, sorpotel, vindaloo, and Western-style buffets for cross-cultural weddings.",
      shortBio: "Goan Christian wedding catering", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 1200, currency: "INR", yearsInBusiness: 15, teamSize: 25,
      averageRating: 4.7, totalReviews: 94, isVerified: true },
    categories: ["caterers"],
    tags: ["christian", "west-indian", "goan", "western-european", "fusion"],
    listing: { title: "Goan Christian Wedding Feast", slug: "dsouza-goan-christian-feast",
      description: "Authentic Goan-Catholic wedding catering. Traditional Goan dishes and Continental buffets for church and reception.",
      priceType: "STARTING_AT", priceMin: 1200, priceMax: 3000, priceUnit: "per plate" },
    packages: [
      { name: "Goan Feast", description: "Traditional Goan menu", price: 1200, inclusions: ["Sorpotel", "Vindaloo", "Xacuti", "Rice", "Pao", "Bebinca", "Local drinks"] },
      { name: "Continental Buffet", description: "Full Western-style buffet", price: 2200, inclusions: ["Starters (6)", "Main course (4)", "Pasta station", "Salad bar", "Goan desserts", "Coffee station"] },
    ],
  });

  await upsertVendor({
    email: "punjabi.dhaba.catering@example.com", name: "Harpreet Singh",
    profile: { businessName: "Singh's Punjabi Catering", slug: "singhs-punjabi-catering-mumbai",
      description: "Authentic Punjabi wedding catering in Mumbai. Specialists in Sikh Anand Karaj langar and grand Punjabi reception feasts. Famous for butter chicken, dal makhani, and live tandoor.",
      shortBio: "Authentic Punjabi wedding feasts Mumbai", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 800, currency: "INR", yearsInBusiness: 16, teamSize: 28,
      averageRating: 4.8, totalReviews: 156, isVerified: true },
    categories: ["caterers"],
    tags: ["hindu", "sikh", "north-indian", "punjabi", "traditional"],
    listing: { title: "Punjabi Wedding Feast", slug: "singhs-punjabi-wedding-feast",
      description: "Grand Punjabi wedding catering. Anand Karaj langar, cocktail snacks, and full wedding reception buffets.",
      priceType: "STARTING_AT", priceMin: 800, priceMax: 2500, priceUnit: "per plate" },
    packages: [
      { name: "Langar Style", description: "Simple community-style langar", price: 400, inclusions: ["Dal", "Sabzi", "Roti", "Rice", "Kheer", "Community service style"] },
      { name: "Reception Feast", description: "Grand Punjabi reception buffet", price: 1200, inclusions: ["Butter chicken", "Dal makhani", "Paneer (2)", "Live tandoor", "Starters (5)", "Dessert counter", "Lassi"] },
    ],
  });

  // ── DECORATORS & FLORISTS ──────────────────────────────────────────────────

  await upsertVendor({
    email: "dream.decor.mumbai@example.com", name: "Kavita Joshi",
    profile: { businessName: "Dream Decor Mumbai", slug: "dream-decor-mumbai",
      description: "Full-service wedding decoration in Mumbai. From classic Marathi and Hindu mandap setups to luxury contemporary designs. 300+ weddings decorated across Mumbai, Pune, and Thane.",
      shortBio: "Full-service luxury wedding decoration", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 80000, currency: "INR", yearsInBusiness: 14, teamSize: 20,
      averageRating: 4.8, totalReviews: 211, isVerified: true },
    categories: ["decorators"],
    tags: ["hindu", "west-indian", "marathi", "gujarati", "traditional", "modern"],
    listing: { title: "Complete Wedding Decoration", slug: "dream-decor-mumbai-complete",
      description: "End-to-end wedding decoration. Mandap, stage, entrance, table arrangements. Traditional and modern styles.",
      priceType: "STARTING_AT", priceMin: 80000, priceMax: 600000, priceUnit: "per event", isFeatured: true },
    packages: [
      { name: "Classic Mandap", description: "Traditional floral mandap setup", price: 80000, inclusions: ["Mandap decoration", "Entrance gate", "Stage backdrop", "Floral arrangements", "Lighting"] },
      { name: "Grand Decor", description: "Full venue transformation", price: 250000, inclusions: ["Luxury mandap", "Full entrance setup", "Stage + backdrop", "Aisle decoration", "Table centerpieces", "Fairy lights", "Photo booth"] },
      { name: "Destination Package", description: "Multi-location event decor", price: 500000, inclusions: ["Mehendi decor", "Sangeet decor", "Wedding mandap", "Reception stage", "Flower wall", "Drone entrance", "Luxury draping"] },
    ],
  });

  await upsertVendor({
    email: "floral.fantasy.thane@example.com", name: "Sunita Malhotra",
    profile: { businessName: "Floral Fantasy Events", slug: "floral-fantasy-events-thane",
      description: "Thane-based wedding florist and decorator. Expert in fresh flower decorations for Hindu, Jain, and North Indian ceremonies. Specialising in marigold, rose, and jasmine arrangements.",
      shortBio: "Fresh flower wedding decorations", country: "IN", state: "Maharashtra", city: "Thane",
      startingPrice: 50000, currency: "INR", yearsInBusiness: 8, teamSize: 12,
      averageRating: 4.7, totalReviews: 134, isVerified: true },
    categories: ["decorators", "florists"],
    tags: ["hindu", "north-indian", "west-indian", "gujarati", "traditional"],
    listing: { title: "Fresh Flower Wedding Decoration", slug: "floral-fantasy-fresh-flower-decor",
      description: "Beautiful fresh flower mandap, stage, and venue decorations. Marigold, rose, jasmine, and orchid setups.",
      priceType: "STARTING_AT", priceMin: 50000, priceMax: 300000, priceUnit: "per event" },
    packages: [
      { name: "Mandap Flowers", description: "Full mandap floral setup", price: 50000, inclusions: ["Mandap structure", "Fresh flowers", "Flower garlands", "Stage backdrop"] },
      { name: "Full Venue", description: "Complete venue floral decoration", price: 180000, inclusions: ["Mandap", "Stage", "Entrance", "Table flowers", "Car decoration", "All fresh flowers"] },
    ],
  });

  await upsertVendor({
    email: "blooms.by.preethi@example.com", name: "Preethi Iyer",
    profile: { businessName: "Blooms by Preethi", slug: "blooms-by-preethi-mumbai",
      description: "South Indian wedding florist in Mumbai. Expert in Kasi Yatra floral setups, jasmine vadam, and traditional flower jewellery. Covering Tamil and Telugu ceremonies.",
      shortBio: "South Indian floral specialist", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 40000, currency: "INR", yearsInBusiness: 6, teamSize: 8,
      averageRating: 4.8, totalReviews: 86, isVerified: true },
    categories: ["florists", "decorators"],
    tags: ["hindu", "south-indian", "tamil", "telugu", "traditional"],
    listing: { title: "South Indian Wedding Florals", slug: "blooms-by-preethi-south-indian-florals",
      description: "Traditional South Indian wedding flower decorations. Jasmine vadam, flower jewellery, and complete mandap florals.",
      priceType: "STARTING_AT", priceMin: 40000, priceMax: 200000, priceUnit: "per event" },
    packages: [
      { name: "Jasmine Package", description: "Traditional jasmine and marigold decor", price: 40000, inclusions: ["Jasmine vadam", "Marigold mandap", "Flower bouquet", "Bride flowers"] },
      { name: "Complete Floral", description: "Full Tamil/Telugu wedding floral", price: 150000, inclusions: ["Complete mandap", "Thamboolam decor", "Flower jewellery", "Stage florals", "Entrance garlands"] },
    ],
  });

  await upsertVendor({
    email: "elegant.events.pune@example.com", name: "Priyanka Kulkarni",
    profile: { businessName: "Elegant Events Pune", slug: "elegant-events-pune",
      description: "Pune's top wedding decorator for upscale weddings. Modern, minimalist, and luxury designs. Expert in fusion weddings, destination events, and high-end hotel decor.",
      shortBio: "Luxury wedding decorator Pune", country: "IN", state: "Maharashtra", city: "Pune",
      startingPrice: 150000, currency: "INR", yearsInBusiness: 10, teamSize: 18,
      averageRating: 4.9, totalReviews: 97, isVerified: true },
    categories: ["decorators"],
    tags: ["hindu", "christian", "west-indian", "fusion", "modern", "destination"],
    listing: { title: "Luxury Wedding Decor Pune", slug: "elegant-events-pune-luxury-decor",
      description: "Luxury wedding and event decoration in Pune. Modern, fusion, and destination wedding styles.",
      priceType: "STARTING_AT", priceMin: 150000, priceMax: 800000, priceUnit: "per event", isFeatured: true },
    packages: [
      { name: "Modern Elegance", description: "Clean modern wedding decor", price: 150000, inclusions: ["Minimalist mandap", "LED backdrop", "Floral centerpieces", "Lounge setup"] },
      { name: "Grand Luxury", description: "Opulent full-venue transformation", price: 500000, inclusions: ["Crystal mandap", "Full floral installation", "Luxury draping", "Lighting design", "Entrance arch", "Photobooth", "Reception stage"] },
    ],
  });

  // ── MAKEUP ARTISTS ─────────────────────────────────────────────────────────

  await upsertVendor({
    email: "simran.bridal.mumbai@example.com", name: "Simran Bedi",
    profile: { businessName: "Simran Bedi Bridal Studio", slug: "simran-bedi-bridal-studio",
      description: "Celebrity-level Punjabi and North Indian bridal makeup in Mumbai's Andheri. Airbrush specialist with MAC, Dior, and Bobbi Brown. Known for that perfect glow and long-lasting makeup.",
      shortBio: "Celebrity Punjabi bridal makeup artist", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 30000, currency: "INR", yearsInBusiness: 9, teamSize: 4,
      averageRating: 4.9, totalReviews: 203, isVerified: true },
    categories: ["makeup-artists"],
    tags: ["hindu", "sikh", "north-indian", "punjabi", "modern"],
    listing: { title: "Punjabi Bridal Makeup & Hair", slug: "simran-bedi-punjabi-bridal-makeup",
      description: "Complete bridal look for Punjabi and North Indian weddings. Airbrush makeup, hair styling, and draping.",
      priceType: "RANGE", priceMin: 30000, priceMax: 80000, priceUnit: "per event", isFeatured: true },
    packages: [
      { name: "Day Bridal", description: "Complete bridal makeup for one event", price: 30000, inclusions: ["Airbrush foundation", "Eye makeup", "Contouring", "Hair styling", "Touch-up kit"] },
      { name: "3-Day Bridal", description: "Full 3-ceremony bridal package", price: 70000, inclusions: ["Mehendi look", "Sangeet look", "Bridal look", "HD makeup", "Hairstyling x3", "Trial session"] },
    ],
  });

  await upsertVendor({
    email: "kavya.bridal.studio@example.com", name: "Kavya Menon",
    profile: { businessName: "Kavya Menon Bridal Studio", slug: "kavya-menon-bridal-studio",
      description: "Kerala and Tamil South Indian bridal makeup specialist in Mumbai. Expert in traditional Kanchipuram silk saree draping, gold jewellery enhancement, and natural Kerala bride looks.",
      shortBio: "South Indian bridal makeup & draping", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 25000, currency: "INR", yearsInBusiness: 7, teamSize: 3,
      averageRating: 4.8, totalReviews: 118, isVerified: true },
    categories: ["makeup-artists"],
    tags: ["hindu", "south-indian", "malayali", "tamil", "traditional"],
    listing: { title: "South Indian Bridal Makeup", slug: "kavya-menon-south-indian-bridal-makeup",
      description: "Traditional Kerala and Tamil bridal makeup. Natural look with traditional flower jewellery and silk saree draping.",
      priceType: "RANGE", priceMin: 25000, priceMax: 70000, priceUnit: "per event", isFeatured: true },
    packages: [
      { name: "Kerala Bride", description: "Traditional Kerala kasavu saree bridal look", price: 25000, inclusions: ["Natural floral makeup", "Gajra hairstyle", "Kasavu saree draping", "Flower jewellery"] },
      { name: "Tamil Bride", description: "Traditional Tamil Brahmin bridal look", price: 30000, inclusions: ["Traditional makeup", "Hair with flowers", "Silk saree draping", "Jewellery styling"] },
    ],
  });

  await upsertVendor({
    email: "glam.studio.bandra@example.com", name: "Rhea Kapadia",
    profile: { businessName: "Glam Studio Bandra", slug: "glam-studio-bandra",
      description: "Contemporary bridal studio in Bandra, Mumbai. Specialists in Bollywood-inspired looks, HD makeup, and fusion bridal styles for modern brides across all traditions.",
      shortBio: "Modern fusion bridal makeup Bandra", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 35000, currency: "INR", yearsInBusiness: 8, teamSize: 5,
      averageRating: 4.7, totalReviews: 167, isVerified: true },
    categories: ["makeup-artists"],
    tags: ["hindu", "christian", "west-indian", "fusion", "modern"],
    listing: { title: "Contemporary Bridal Makeup", slug: "glam-studio-bandra-bridal-makeup",
      description: "Modern and fusion bridal makeup for the contemporary bride. HD, airbrush, and editorial styles.",
      priceType: "RANGE", priceMin: 35000, priceMax: 100000, priceUnit: "per event" },
    packages: [
      { name: "Modern Bridal", description: "Contemporary HD makeup + styling", price: 35000, inclusions: ["HD foundation", "Contouring", "Modern hair", "Lashes", "Touch-up"] },
      { name: "Destination Bridal", description: "Full 4-day wedding package", price: 90000, inclusions: ["4 event looks", "Engagement", "Mehendi", "Sangeet", "Wedding", "All styling"] },
    ],
  });

  await upsertVendor({
    email: "marathi.bridal.pune@example.com", name: "Vaishali Patil",
    profile: { businessName: "Vaishali's Marathi Bridal", slug: "vaishali-marathi-bridal-pune",
      description: "Traditional Marathi bridal makeup and Nauvari saree draping specialist in Pune. Expert in nauvari, nauv-vaari styles, and traditional Konkani bridal looks.",
      shortBio: "Traditional Marathi bridal specialist", country: "IN", state: "Maharashtra", city: "Pune",
      startingPrice: 20000, currency: "INR", yearsInBusiness: 10, teamSize: 2,
      averageRating: 4.7, totalReviews: 143, isVerified: true },
    categories: ["makeup-artists"],
    tags: ["hindu", "west-indian", "marathi", "goan", "traditional"],
    listing: { title: "Marathi Bridal Makeup & Nauvari Draping", slug: "vaishali-marathi-bridal-nauvari",
      description: "Traditional Marathi bridal makeup, nauvari saree draping, and complete bridal look for Marathi ceremonies.",
      priceType: "RANGE", priceMin: 20000, priceMax: 50000, priceUnit: "per event" },
    packages: [
      { name: "Nauvari Bride", description: "Traditional Marathi look with nauvari saree", price: 20000, inclusions: ["Traditional makeup", "Nauvari draping", "Nath styling", "Gajra", "Hair setting"] },
    ],
  });

  // ── MEHENDI ARTISTS ────────────────────────────────────────────────────────

  await upsertVendor({
    email: "henna.queen.mumbai@example.com", name: "Zara Shaikh",
    profile: { businessName: "Zara Henna Art", slug: "zara-henna-art-mumbai",
      description: "Premium mehendi artist in Bandra, Mumbai. Expert in Arabic, Rajasthani, and bridal full-hand mehendi. Known for intricate patterns and long-lasting natural henna.",
      shortBio: "Premium bridal mehendi artist Mumbai", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 8000, currency: "INR", yearsInBusiness: 11, teamSize: 3,
      averageRating: 4.9, totalReviews: 287, isVerified: true },
    categories: ["mehendi-artists"],
    tags: ["hindu", "muslim", "west-indian", "north-indian", "traditional"],
    listing: { title: "Bridal Mehendi — Full Hand", slug: "zara-henna-bridal-mehendi",
      description: "Full bridal mehendi from hands to elbows and feet to knees. Arabic, Rajasthani, and fusion patterns. Natural henna guaranteed.",
      priceType: "STARTING_AT", priceMin: 8000, priceMax: 25000, priceUnit: "per event", isFeatured: true },
    packages: [
      { name: "Bridal Mehendi", description: "Full bridal mehendi, hands + feet", price: 12000, inclusions: ["Both hands to elbow", "Both feet to knee", "Natural dark henna", "2-3 hours"] },
      { name: "Full Bridal Package", description: "Bride + all bridesmaids", price: 25000, inclusions: ["Full bridal mehendi", "5 bridesmaids hands", "Pattern consultation", "Natural henna kit", "Aftercare guidance"] },
    ],
  });

  await upsertVendor({
    email: "mehendi.magic.thane@example.com", name: "Deepika Rane",
    profile: { businessName: "Mehendi Magic Thane", slug: "mehendi-magic-thane",
      description: "Experienced Marathi and North Indian mehendi specialist in Thane. Offers group mehendi packages for sangeet ceremonies.",
      shortBio: "Sangeet mehendi specialist", country: "IN", state: "Maharashtra", city: "Thane",
      startingPrice: 5000, currency: "INR", yearsInBusiness: 8, teamSize: 4,
      averageRating: 4.6, totalReviews: 142, isVerified: true },
    categories: ["mehendi-artists"],
    tags: ["hindu", "west-indian", "marathi", "north-indian", "traditional"],
    listing: { title: "Sangeet Mehendi for Bride & Guests", slug: "mehendi-magic-thane-sangeet",
      description: "Group mehendi packages for sangeet events. Bride gets full bridal mehendi, guests get quick designs.",
      priceType: "STARTING_AT", priceMin: 5000, priceMax: 20000, priceUnit: "per event" },
    packages: [
      { name: "Sangeet Group", description: "Bride + 10 guests", price: 8000, inclusions: ["Bride full hand", "10 guests hands", "Arabic patterns", "Quick 2-hour service"] },
    ],
  });

  await upsertVendor({
    email: "navimumbai.henna@example.com", name: "Sunita Gupta",
    profile: { businessName: "Sunita's Henna Studio", slug: "sunita-henna-studio-navimumbai",
      description: "Navi Mumbai based mehendi artist. Expert in Rajasthani, contemporary, and fusion patterns. Available for weddings, sangeet, and festivals across Navi Mumbai.",
      shortBio: "Navi Mumbai mehendi artist", country: "IN", state: "Maharashtra", city: "Navi Mumbai",
      startingPrice: 4000, currency: "INR", yearsInBusiness: 9, teamSize: 2,
      averageRating: 4.5, totalReviews: 98, isVerified: true },
    categories: ["mehendi-artists"],
    tags: ["hindu", "north-indian", "west-indian", "traditional"],
    listing: { title: "Bridal Mehendi Navi Mumbai", slug: "sunita-henna-navimumbai-bridal",
      description: "Bridal and group mehendi in Navi Mumbai. Rajasthani and fusion patterns.",
      priceType: "STARTING_AT", priceMin: 4000, priceMax: 15000, priceUnit: "per event" },
    packages: [
      { name: "Basic Bridal", description: "Hands and feet mehendi", price: 6000, inclusions: ["Both hands to wrist", "Both feet", "Natural henna", "1.5 hours"] },
    ],
  });

  // ── DJs & MUSIC ────────────────────────────────────────────────────────────

  await upsertVendor({
    email: "dj.vikram.events@example.com", name: "Vikram Singh",
    profile: { businessName: "DJ Vikram Events", slug: "dj-vikram-events-mumbai",
      description: "Mumbai's top wedding DJ and sound systems. Specialises in Bollywood, Punjabi, and international music for sangeet, reception, and cocktail parties. Professional lighting and LED dance floors.",
      shortBio: "Top Bollywood wedding DJ Mumbai", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 30000, currency: "INR", yearsInBusiness: 13, teamSize: 6,
      averageRating: 4.8, totalReviews: 198, isVerified: true },
    categories: ["djs-music"],
    tags: ["hindu", "sikh", "north-indian", "punjabi", "modern"],
    listing: { title: "Wedding DJ & Sound System", slug: "dj-vikram-wedding-dj",
      description: "Professional DJ, sound, and lighting for weddings and sangeet events in Mumbai. Bollywood, Punjabi, and international playlists.",
      priceType: "STARTING_AT", priceMin: 30000, priceMax: 150000, priceUnit: "per event", isFeatured: true },
    packages: [
      { name: "Sangeet DJ", description: "5-hour sangeet DJ set", price: 30000, inclusions: ["5 hours", "DJ + speakers", "Basic lighting", "Bollywood/Punjabi playlist"] },
      { name: "Reception Bash", description: "Full reception with LED dance floor", price: 100000, inclusions: ["8 hours", "Professional DJ", "LED dance floor", "Stage lighting", "Fog machine", "Smoke effects", "Custom playlist"] },
    ],
  });

  await upsertVendor({
    email: "shehnai.wala.pune@example.com", name: "Pandit Vijay Sharma",
    profile: { businessName: "Vijay Shehnai & Dhol", slug: "vijay-shehnai-dhol-pune",
      description: "Traditional shehnai and dhol-tasha performers for Pune and Mumbai Hindu weddings. Providing authentic Marathi wedding band music including dhol, shehnai, and nagarkhana.",
      shortBio: "Traditional wedding shehnai & dhol band", country: "IN", state: "Maharashtra", city: "Pune",
      startingPrice: 15000, currency: "INR", yearsInBusiness: 30, teamSize: 10,
      averageRating: 4.7, totalReviews: 156, isVerified: true },
    categories: ["djs-music"],
    tags: ["hindu", "west-indian", "marathi", "north-indian", "traditional"],
    listing: { title: "Shehnai & Dhol-Tasha Band", slug: "vijay-shehnai-dhol-tasha",
      description: "Traditional shehnai and dhol-tasha band for Hindu wedding ceremonies. Varmala, baraat, and procession music.",
      priceType: "STARTING_AT", priceMin: 15000, priceMax: 60000, priceUnit: "per event" },
    packages: [
      { name: "Baraat Band", description: "Baraat procession music, 2 hours", price: 15000, inclusions: ["Dhol (2)", "Shehnai", "Nagarkhana", "2-hour baraat"] },
      { name: "Full Ceremony Music", description: "All ceremony music from haldi to reception", price: 50000, inclusions: ["Haldi music", "Baraat procession", "Varmala music", "Ceremony shehnai", "Reception entertainment"] },
    ],
  });

  await upsertVendor({
    email: "mumbai.soundmachine@example.com", name: "Ravi Kumar",
    profile: { businessName: "Mumbai Sound Machine", slug: "mumbai-sound-machine",
      description: "Full-service DJ and entertainment company for South Mumbai and Western suburbs weddings. Specialising in South Indian, Gujarati, and modern fusion soundtracks.",
      shortBio: "South Mumbai wedding DJ & entertainment", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 25000, currency: "INR", yearsInBusiness: 8, teamSize: 5,
      averageRating: 4.6, totalReviews: 87, isVerified: true },
    categories: ["djs-music"],
    tags: ["hindu", "south-indian", "west-indian", "gujarati", "modern", "fusion"],
    listing: { title: "Wedding DJ — South & West Mumbai", slug: "mumbai-sound-machine-wedding-dj",
      description: "Professional DJ and sound systems for weddings across South Mumbai and Western suburbs. South Indian, Gujarati, and modern music.",
      priceType: "STARTING_AT", priceMin: 25000, priceMax: 80000, priceUnit: "per event" },
    packages: [
      { name: "Basic DJ", description: "4-hour reception DJ", price: 25000, inclusions: ["4 hours", "Sound system", "DJ", "Basic lighting"] },
    ],
  });

  // ── WEDDING PLANNERS ───────────────────────────────────────────────────────

  await upsertVendor({
    email: "perfect.occasions.mumbai@example.com", name: "Meghna Agarwal",
    profile: { businessName: "Perfect Occasions", slug: "perfect-occasions-mumbai",
      description: "Full-service wedding planning company in Mumbai. Specialising in luxury Indian weddings, destination events, and grand multi-day celebrations. Planning team with experience across 500+ weddings.",
      shortBio: "Luxury Mumbai wedding planners", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 200000, currency: "INR", yearsInBusiness: 12, teamSize: 15,
      averageRating: 4.9, totalReviews: 87, isVerified: true },
    categories: ["wedding-planners"],
    tags: ["hindu", "north-indian", "west-indian", "gujarati", "punjabi", "modern"],
    listing: { title: "Full-Service Wedding Planning", slug: "perfect-occasions-full-service-planning",
      description: "End-to-end wedding planning and coordination. Venue, vendors, décor, and day-of management.",
      priceType: "STARTING_AT", priceMin: 200000, priceMax: 1500000, priceUnit: "per wedding", isFeatured: true },
    packages: [
      { name: "Day-of Coordination", description: "Day-of coordinator only", price: 50000, inclusions: ["1 lead coordinator", "Day-of management", "Vendor coordination", "Timeline management"] },
      { name: "Full Planning", description: "Complete wedding planning from start to finish", price: 500000, inclusions: ["12-month planning", "Venue selection", "All vendor coordination", "Budget management", "Day-of team (3)", "Post-wedding wrap"] },
    ],
  });

  await upsertVendor({
    email: "shaadi.savvy.pune@example.com", name: "Aditi Joshi",
    profile: { businessName: "Shaadi Savvy", slug: "shaadi-savvy-pune",
      description: "Boutique wedding planning studio in Pune specialising in intimate weddings, eco-friendly ceremonies, and budget-conscious planning. Marathi and Gujarati wedding experts.",
      shortBio: "Boutique wedding planner Pune", country: "IN", state: "Maharashtra", city: "Pune",
      startingPrice: 75000, currency: "INR", yearsInBusiness: 7, teamSize: 6,
      averageRating: 4.8, totalReviews: 64, isVerified: true },
    categories: ["wedding-planners"],
    tags: ["hindu", "west-indian", "marathi", "gujarati", "intimate-micro", "fusion"],
    listing: { title: "Intimate Wedding Planning — Pune", slug: "shaadi-savvy-intimate-wedding",
      description: "Boutique wedding planning for intimate and budget-friendly ceremonies in Pune. Marathi and Gujarati traditions.",
      priceType: "STARTING_AT", priceMin: 75000, priceMax: 400000, priceUnit: "per wedding" },
    packages: [
      { name: "Micro Wedding", description: "Planning for under 50 guests", price: 75000, inclusions: ["Venue coordination", "6 vendor bookings", "Day-of coordination", "Timeline", "Guest management"] },
    ],
  });

  // ── VENUES ─────────────────────────────────────────────────────────────────

  await upsertVendor({
    email: "grand.garden.navimumbai@example.com", name: "Prakash Naik",
    profile: { businessName: "The Grand Garden Estate", slug: "grand-garden-estate-navimumbai",
      description: "Premium outdoor wedding venue in Navi Mumbai. 5-acre landscaped garden estate with a banquet hall, mandap lawn, and poolside area. Capacity up to 1500 guests.",
      shortBio: "Premium outdoor wedding venue Navi Mumbai", country: "IN", state: "Maharashtra", city: "Navi Mumbai",
      startingPrice: 300000, currency: "INR", yearsInBusiness: 9, teamSize: 30,
      averageRating: 4.7, totalReviews: 112, isVerified: true },
    categories: ["venues"],
    tags: ["hindu", "muslim", "christian", "west-indian", "modern", "destination"],
    listing: { title: "Garden Estate Wedding Venue", slug: "grand-garden-estate-venue",
      description: "5-acre outdoor wedding venue with banquet hall, mandap lawn, and poolside. Capacity 200–1500 guests. In-house catering available.",
      priceType: "STARTING_AT", priceMin: 300000, priceMax: 1500000, priceUnit: "per day", isFeatured: true },
    packages: [
      { name: "Intimate Lawn", description: "Lawn only, up to 200 guests", price: 300000, inclusions: ["Lawn space", "Chairs + tables", "Basic lighting", "Parking", "Security"] },
      { name: "Grand Estate", description: "Full estate with banquet hall", price: 1000000, inclusions: ["Full estate", "Banquet hall", "Lawn + pool area", "Luxury furniture", "In-house catering", "Valet parking"] },
    ],
  });

  await upsertVendor({
    email: "heritage.banquets.pune@example.com", name: "Anita Deshpande",
    profile: { businessName: "Heritage Banquets Pune", slug: "heritage-banquets-pune",
      description: "Heritage haveli-style banquet hall in Pune's Koregaon Park. Perfect for traditional Marathi, Brahmin, and heritage-style weddings with old-world charm.",
      shortBio: "Heritage banquet hall Pune", country: "IN", state: "Maharashtra", city: "Pune",
      startingPrice: 200000, currency: "INR", yearsInBusiness: 18, teamSize: 20,
      averageRating: 4.6, totalReviews: 88, isVerified: true },
    categories: ["venues"],
    tags: ["hindu", "west-indian", "marathi", "traditional"],
    listing: { title: "Heritage Wedding Hall Pune", slug: "heritage-banquets-pune-hall",
      description: "Traditional haveli-style banquet hall in Koregaon Park. Ideal for Marathi and Brahmin ceremonies. Capacity 50–600 guests.",
      priceType: "STARTING_AT", priceMin: 200000, priceMax: 800000, priceUnit: "per day" },
    packages: [
      { name: "Half Day", description: "5 hours, 300 guests max", price: 200000, inclusions: ["5 hours", "300-capacity hall", "Basic décor", "Parking", "Dressing rooms"] },
    ],
  });

  await upsertVendor({
    email: "sunshine.lawns.andheri@example.com", name: "Raj Malhotra",
    profile: { businessName: "Sunshine Lawns Andheri", slug: "sunshine-lawns-andheri-mumbai",
      description: "Affordable outdoor banquet lawns in Andheri, Mumbai. Multiple lawn spaces and a covered hall. Popular for North Indian baraat and reception parties. Capacity 100–800 guests.",
      shortBio: "Affordable outdoor venue Andheri", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 150000, currency: "INR", yearsInBusiness: 11, teamSize: 15,
      averageRating: 4.4, totalReviews: 145, isVerified: true },
    categories: ["venues"],
    tags: ["hindu", "muslim", "north-indian", "punjabi", "traditional", "modern"],
    listing: { title: "Outdoor Wedding Lawn — Andheri", slug: "sunshine-lawns-andheri-venue",
      description: "Spacious outdoor banquet lawns and covered hall for weddings in Andheri. Baraat entry with horse. Capacity 100–800.",
      priceType: "STARTING_AT", priceMin: 150000, priceMax: 700000, priceUnit: "per day" },
    packages: [
      { name: "Small Lawn", description: "Up to 200 guests", price: 150000, inclusions: ["Lawn space", "Basic décor", "Parking", "2 dressing rooms"] },
      { name: "Full Estate", description: "Lawn + hall combo, 800 guests", price: 500000, inclusions: ["Full lawn", "Covered hall", "Stage setup", "Baraat entry area", "Parking for 100 cars"] },
    ],
  });

  // ── PRIESTS & OFFICIANTS ──────────────────────────────────────────────────

  await upsertVendor({
    email: "pandit.suresh.mumbai@example.com", name: "Pandit Suresh Bhatt",
    profile: { businessName: "Pandit Suresh Bhatt", slug: "pandit-suresh-bhatt-mumbai",
      description: "Experienced Vedic pandit for Gujarati and Marathi Hindu weddings in Mumbai. Conducting Saptapadi, Kanya Daan, and all traditional Hindu rituals. Available across Mumbai, Thane, and Navi Mumbai.",
      shortBio: "Vedic pandit for Gujarati & Marathi weddings", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 11000, currency: "INR", yearsInBusiness: 22, teamSize: 1,
      averageRating: 4.8, totalReviews: 290, isVerified: true },
    categories: ["priests-officiants"],
    tags: ["hindu", "west-indian", "gujarati", "marathi", "traditional"],
    listing: { title: "Hindu Wedding Ceremony — Gujarati & Marathi", slug: "pandit-suresh-bhatt-hindu-ceremony",
      description: "Complete Hindu wedding ceremony with all Vedic rituals. Specialising in Gujarati and Marathi traditions across Mumbai.",
      priceType: "FIXED", priceMin: 11000, priceUnit: "per ceremony", isFeatured: true },
    packages: [
      { name: "Standard Ceremony", description: "3-4 hour ceremony", price: 11000, inclusions: ["Muhurtam selection", "All vidhi rituals", "Saptapadi", "Kanya Daan", "Pooja materials list"] },
      { name: "Full Ceremony", description: "Extended 6-8 hour ceremony with all sub-rituals", price: 21000, inclusions: ["All rituals", "Homam", "Ganesh Puja", "Sapta Padi", "Navgraha puja", "Materials included"] },
    ],
  });

  await upsertVendor({
    email: "father.joseph.weddings@example.com", name: "Father Joseph Fernandes",
    profile: { businessName: "Fr. Joseph — Christian Weddings", slug: "father-joseph-christian-weddings-mumbai",
      description: "Catholic and Protestant wedding officiant based in Mumbai. Conducts weddings in English, Hindi, and Konkani. Available for church ceremonies, outdoor weddings, and interfaith services.",
      shortBio: "Catholic wedding officiant Mumbai", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 10000, currency: "INR", yearsInBusiness: 20, teamSize: 1,
      averageRating: 4.9, totalReviews: 78, isVerified: true },
    categories: ["priests-officiants"],
    tags: ["christian", "west-indian", "goan", "interfaith", "traditional"],
    listing: { title: "Catholic & Christian Wedding Ceremony", slug: "father-joseph-christian-ceremony",
      description: "Traditional Catholic and Christian wedding ceremonies in Mumbai. Church and outdoor settings. Interfaith services also available.",
      priceType: "FIXED", priceMin: 10000, priceUnit: "per ceremony" },
    packages: [
      { name: "Church Ceremony", description: "Traditional Catholic wedding mass", price: 10000, inclusions: ["Pre-marital counseling", "Wedding mass", "Vows", "Certificate preparation"] },
    ],
  });

  await upsertVendor({
    email: "nikah.qazi.mumbai@example.com", name: "Maulvi Ibrahim",
    profile: { businessName: "Maulvi Ibrahim — Nikah Services", slug: "maulvi-ibrahim-nikah-mumbai",
      description: "Experienced Islamic marriage officiant (Qazi) in Mumbai. Conducts Nikah ceremonies with full religious observance. Available for traditional and modern Nikah settings across Mumbai and Navi Mumbai.",
      shortBio: "Islamic Nikah officiant Mumbai", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 8000, currency: "INR", yearsInBusiness: 25, teamSize: 1,
      averageRating: 4.9, totalReviews: 167, isVerified: true },
    categories: ["priests-officiants"],
    tags: ["muslim", "traditional"],
    listing: { title: "Nikah Ceremony — Mumbai", slug: "maulvi-ibrahim-nikah-ceremony",
      description: "Traditional Islamic Nikah ceremony. Includes Mehr discussion, Ijab-Qabul, and Nikah-Nama documentation.",
      priceType: "FIXED", priceMin: 8000, priceUnit: "per ceremony" },
    packages: [
      { name: "Standard Nikah", description: "Full Nikah ceremony", price: 8000, inclusions: ["Pre-ceremony consultation", "Nikah recitation", "Mehr documentation", "Nikah-Nama", "2 witnesses"] },
    ],
  });

  // ── JEWELERS ───────────────────────────────────────────────────────────────

  await upsertVendor({
    email: "pooja.jewellers.mumbai@example.com", name: "Ramesh Mehta",
    profile: { businessName: "Pooja Jewellers", slug: "pooja-jewellers-mumbai-zaveri",
      description: "Traditional gold and diamond jewellery house in Zaveri Bazaar, Mumbai. Specialists in bridal jewellery sets for South Indian, Gujarati, and Marathi brides. Gold, kundan, polki, and diamond collections.",
      shortBio: "Bridal jewellery — Zaveri Bazaar Mumbai", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 50000, currency: "INR", yearsInBusiness: 45, teamSize: 20,
      averageRating: 4.7, totalReviews: 312, isVerified: true },
    categories: ["jewelers"],
    tags: ["hindu", "south-indian", "west-indian", "gujarati", "marathi", "traditional"],
    listing: { title: "Bridal Jewellery Sets", slug: "pooja-jewellers-bridal-sets",
      description: "Complete bridal jewellery sets in gold, kundan, and diamond. South Indian, Gujarati, and Marathi bridal collections.",
      priceType: "STARTING_AT", priceMin: 50000, priceMax: 5000000, priceUnit: "per set" },
    packages: [
      { name: "Gold Bridal Set", description: "Traditional gold bridal jewellery", price: 200000, inclusions: ["Necklace", "Earrings", "Bangles", "Maang tikka", "Nose ring", "22K gold"] },
    ],
  });

  await upsertVendor({
    email: "diamonds.bandra@example.com", name: "Kiran Shah",
    profile: { businessName: "Kiran's Diamond House", slug: "kirans-diamond-house-bandra",
      description: "Contemporary diamond jewellery boutique in Bandra. Specialising in modern bridal sets, custom engagement rings, and bridal solitaires for the modern bride.",
      shortBio: "Modern diamond bridal jewellery Bandra", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 100000, currency: "INR", yearsInBusiness: 15, teamSize: 8,
      averageRating: 4.8, totalReviews: 145, isVerified: true },
    categories: ["jewelers"],
    tags: ["hindu", "christian", "west-indian", "modern", "fusion"],
    listing: { title: "Diamond Bridal Jewellery", slug: "kirans-diamond-bridal-jewellery",
      description: "Modern diamond bridal sets, engagement rings, and custom jewellery for contemporary brides.",
      priceType: "STARTING_AT", priceMin: 100000, priceMax: 10000000, priceUnit: "per piece" },
    packages: [
      { name: "Solitaire Ring", description: "Custom diamond solitaire", price: 100000, inclusions: ["GIA certified diamond", "Custom setting", "Free resizing", "Lifetime polish"] },
    ],
  });

  // ── BRIDAL WEAR ────────────────────────────────────────────────────────────

  await upsertVendor({
    email: "ritu.bridal.studio@example.com", name: "Ritu Verma",
    profile: { businessName: "Ritu's Bridal Studio", slug: "ritus-bridal-studio-mumbai",
      description: "Premium bridal wear boutique in Andheri, Mumbai. Specialising in North Indian bridal lehengas, Punjabi suits, and fusion gowns. Designer bridal wear for rent and sale.",
      shortBio: "Designer bridal lehenga boutique Mumbai", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 20000, currency: "INR", yearsInBusiness: 11, teamSize: 8,
      averageRating: 4.7, totalReviews: 178, isVerified: true },
    categories: ["bridal-wear"],
    tags: ["hindu", "sikh", "north-indian", "punjabi", "modern"],
    listing: { title: "Designer Bridal Lehengas & Gowns", slug: "ritus-bridal-designer-lehengas",
      description: "Designer bridal lehengas, Punjabi suits, and fusion gowns. For rent and sale. Trial sessions available.",
      priceType: "STARTING_AT", priceMin: 20000, priceMax: 300000, priceUnit: "per outfit" },
    packages: [
      { name: "Rental Bridal", description: "Premium bridal lehenga on rent", price: 20000, inclusions: ["Lehenga rental", "Blouse", "Dupatta", "Styling session", "Dry cleaning included"] },
      { name: "Purchase Bridal", description: "Designer lehenga purchase", price: 80000, inclusions: ["Full lehenga set", "Custom stitching", "2 alterations", "Packaging"] },
    ],
  });

  await upsertVendor({
    email: "kanjeevaram.silk.mumbai@example.com", name: "Lakshmi Iyer",
    profile: { businessName: "Lakshmi's Silk House", slug: "lakshmis-silk-house-mumbai",
      description: "Authentic Kanjivaram and Patola silk sarees for South Indian brides in Mumbai. Direct from Kanchipuram weavers. Bridal sarees, half-sarees, and traditional jewellery coordination.",
      shortBio: "Kanjivaram silk bridal sarees Mumbai", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 30000, currency: "INR", yearsInBusiness: 20, teamSize: 5,
      averageRating: 4.9, totalReviews: 134, isVerified: true },
    categories: ["bridal-wear"],
    tags: ["hindu", "south-indian", "tamil", "telugu", "malayali", "traditional"],
    listing: { title: "Kanjivaram Bridal Sarees", slug: "lakshmis-kanjivaram-bridal-sarees",
      description: "Authentic Kanjivaram silk sarees direct from weavers. Perfect for South Indian bridal ceremonies.",
      priceType: "STARTING_AT", priceMin: 30000, priceMax: 500000, priceUnit: "per saree" },
    packages: [
      { name: "Classic Kanjivaram", description: "Traditional bridal Kanjivaram", price: 50000, inclusions: ["Pure silk Kanjivaram", "Certificate of authenticity", "Free draping guidance"] },
    ],
  });

  // ── GROOM WEAR ─────────────────────────────────────────────────────────────

  await upsertVendor({
    email: "groom.studio.mumbai@example.com", name: "Aakash Mehta",
    profile: { businessName: "The Groom Studio", slug: "the-groom-studio-mumbai",
      description: "Mumbai's premier groom wear boutique in Juhu. Specialists in sherwani, bandhgala, and indo-western wedding outfits for grooms across all Indian traditions.",
      shortBio: "Sherwani & groom wear specialist Mumbai", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 15000, currency: "INR", yearsInBusiness: 9, teamSize: 6,
      averageRating: 4.7, totalReviews: 123, isVerified: true },
    categories: ["groom-wear"],
    tags: ["hindu", "muslim", "north-indian", "west-indian", "traditional", "modern"],
    listing: { title: "Sherwani & Wedding Outfits for Grooms", slug: "groom-studio-sherwani-mumbai",
      description: "Designer sherwani, bandhgala, and indo-western outfits for grooms. Purchase and rental available.",
      priceType: "STARTING_AT", priceMin: 15000, priceMax: 150000, priceUnit: "per outfit" },
    packages: [
      { name: "Rental Sherwani", description: "Premium sherwani rental with accessories", price: 15000, inclusions: ["Sherwani", "Dupatta", "Mojri shoes", "Turban/safa", "Styling session"] },
      { name: "Custom Sherwani", description: "Made-to-measure custom sherwani", price: 60000, inclusions: ["Custom stitching", "Fabric choice", "2 fittings", "All accessories"] },
    ],
  });

  // ── INVITATION DESIGNERS ──────────────────────────────────────────────────

  await upsertVendor({
    email: "srishti.invites@example.com", name: "Srishti Gupta",
    profile: { businessName: "Srishti Wedding Invites", slug: "srishti-wedding-invites-mumbai",
      description: "Premium Indian wedding invitation designer in Mumbai. Specialising in foil-stamped, laser-cut, and digital wedding invites. Traditional, fusion, and contemporary designs.",
      shortBio: "Luxury wedding invitation designer Mumbai", country: "IN", state: "Maharashtra", city: "Mumbai",
      startingPrice: 50, currency: "INR", yearsInBusiness: 8, teamSize: 4,
      averageRating: 4.8, totalReviews: 203, isVerified: true },
    categories: ["invitation-designers"],
    tags: ["hindu", "muslim", "west-indian", "north-indian", "traditional", "modern"],
    listing: { title: "Wedding Invitations — Foil & Laser Cut", slug: "srishti-wedding-invitations",
      description: "Luxury hand-crafted wedding invitations. Foil stamping, laser cut, and custom box sets. Traditional and modern designs for all Indian ceremonies.",
      priceType: "STARTING_AT", priceMin: 50, priceMax: 500, priceUnit: "per card (min 100)", isFeatured: true },
    packages: [
      { name: "Digital Invite", description: "Custom digital invitation + e-card", price: 5000, inclusions: ["Custom design", "Digital invite", "WhatsApp optimised", "2 revision rounds"] },
      { name: "Premium Box Set", description: "Luxury boxed invitation set", price: 300, inclusions: ["Foil stamping", "Laser cut insert", "Envelope liner", "Wax seal", "RSVP card", "Min order 100"] },
    ],
  });

  await upsertVendor({
    email: "digital.shaadi.cards@example.com", name: "Tanvi Shah",
    profile: { businessName: "Digital Shaadi Cards", slug: "digital-shaadi-cards-pune",
      description: "Pune-based digital wedding invitation studio. Specialising in animated video invites, custom e-cards, and digital save-the-dates for tech-savvy couples.",
      shortBio: "Animated digital wedding invites", country: "IN", state: "Maharashtra", city: "Pune",
      startingPrice: 2500, currency: "INR", yearsInBusiness: 5, teamSize: 3,
      averageRating: 4.7, totalReviews: 156, isVerified: true },
    categories: ["invitation-designers"],
    tags: ["hindu", "muslim", "christian", "west-indian", "modern", "fusion"],
    listing: { title: "Animated Digital Wedding Invitations", slug: "digital-shaadi-cards-animated",
      description: "Animated video invitations and custom digital e-cards for modern Indian weddings.",
      priceType: "STARTING_AT", priceMin: 2500, priceMax: 15000, priceUnit: "per design" },
    packages: [
      { name: "E-Card Basic", description: "Static digital invite", price: 2500, inclusions: ["1 page design", "PDF + JPG format", "1 revision", "WhatsApp format"] },
      { name: "Animated Video", description: "Animated 30-sec video invite", price: 8000, inclusions: ["30-sec animation", "MP4 format", "Custom music", "2 revisions", "WhatsApp optimised"] },
    ],
  });

  // ── VIDEOGRAPHERS (additional) ─────────────────────────────────────────────

  await upsertVendor({
    email: "shaadi.films.navi@example.com", name: "Abhishek Joshi",
    profile: { businessName: "Shaadi Films Navi Mumbai", slug: "shaadi-films-navi-mumbai",
      description: "Navi Mumbai-based wedding filmmaker specialising in Marathi, Gujarati, and South Indian ceremonies. Cinematic 4K films and same-day edits.",
      shortBio: "Wedding filmmaker Navi Mumbai", country: "IN", state: "Maharashtra", city: "Navi Mumbai",
      startingPrice: 35000, currency: "INR", yearsInBusiness: 7, teamSize: 3,
      averageRating: 4.6, totalReviews: 76, isVerified: true },
    categories: ["videographers"],
    tags: ["hindu", "west-indian", "marathi", "gujarati", "south-indian", "traditional"],
    listing: { title: "Wedding Films — Navi Mumbai", slug: "shaadi-films-navi-mumbai-wedding-film",
      description: "Cinematic wedding films for Marathi and Gujarati ceremonies in Navi Mumbai and Mumbai.",
      priceType: "STARTING_AT", priceMin: 35000, priceMax: 120000, priceUnit: "per event" },
    packages: [
      { name: "Highlight Reel", description: "3-min cinematic highlight", price: 35000, inclusions: ["3-min highlight", "Full ceremony recording", "Digital delivery"] },
    ],
  });

  // ── INTERNATIONAL ──────────────────────────────────────────────────────────

  await upsertVendor({
    email: "amir.events.dubai@example.com", name: "Amir Hassan",
    profile: { businessName: "Amir Hassan Events", slug: "amir-hassan-events-dubai",
      description: "Premium Muslim and South Asian wedding planner based in Dubai, UAE. Specialising in Nikah ceremonies, destination Indian weddings in the UAE, and luxury reception events.",
      shortBio: "Dubai luxury Muslim wedding planner", country: "AE", state: "Dubai", city: "Dubai",
      startingPrice: 5000, currency: "USD", yearsInBusiness: 14, teamSize: 12,
      averageRating: 4.8, totalReviews: 67, isVerified: true },
    categories: ["wedding-planners"],
    tags: ["muslim", "interfaith", "modern", "destination"],
    listing: { title: "Luxury Muslim Wedding Planning — Dubai", slug: "amir-hassan-dubai-wedding-planning",
      description: "Full-service luxury wedding planning for Muslim and South Asian weddings in Dubai. Destination wedding specialists.",
      priceType: "STARTING_AT", priceMin: 5000, priceMax: 50000, priceUnit: "per wedding" },
    packages: [
      { name: "Nikah Package", description: "Intimate Nikah ceremony planning", price: 5000, inclusions: ["Qazi coordination", "Venue booking", "Décor", "Catering coordination", "Day-of team"] },
    ],
  });

  console.log("✅ Extended vendor seed complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
