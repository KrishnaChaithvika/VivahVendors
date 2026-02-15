# VivahVendors

## Project Overview
Global wedding vendor marketplace with culturally-aware categorization by religion, tradition, region, community, and ceremony style. Two-sided platform: couples/event planners browse and book wedding vendors (photographers, caterers, decorators, priests, etc.), vendors manage their listings, bookings, packages, and orders. Includes a web crawler that seeds vendor data from external sources, with vendors able to claim and manage auto-created profiles.

## Tech Stack
- Next.js 16 (App Router, TypeScript), Tailwind CSS v4, shadcn/ui
- PostgreSQL + Prisma ORM (v6, output to `src/generated/prisma`)
- Auth.js v5 (Credentials + Google OAuth, JWT strategy)
- Zod v4 for validation (shared client + server schemas)
- Stripe + Razorpay for payments, Cloudinary for images
- Lucide React for icons, slugify for URL slug generation
- Vitest + Playwright for testing

## Development Commands
- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — production build (verifies all 26 routes compile)
- `npm run lint` — run ESLint
- `docker compose up -d` — start PostgreSQL + Redis
- `npx prisma migrate dev` — run database migrations
- `npx prisma db seed` — seed categories + taxonomy data
- `npx prisma studio` — visual DB browser

### Crawler CLI
```bash
npx tsx src/crawler/index.ts --seed                        # Full seed run (all sources)
npx tsx src/crawler/index.ts --source=google-places        # Single source
npx tsx src/crawler/index.ts --source=google-places --region=IN --city=Mumbai
npx tsx src/crawler/index.ts --source=wed-me-good --category=photographers --max=50
```
Flags: `--seed`, `--source`, `--region`, `--city`, `--category`, `--max`

## Project Structure

### App Routes (src/app/)
```
src/app/
├── layout.tsx                          # Root layout with SessionProvider
├── page.tsx                            # Homepage (hero, categories, featured vendors)
├── globals.css                         # Tailwind v4 styles
├── sitemap.ts                          # Dynamic sitemap (force-dynamic)
├── robots.ts                           # Blocks /dashboard/, /api/
├── not-found.tsx                       # Global 404
├── error.tsx                           # Global error boundary
├── about/page.tsx                      # Static about page
├── login/page.tsx                      # Login (credentials + Google OAuth)
├── register/page.tsx                   # Register (customer/vendor role selection)
├── api/
│   ├── auth/[...nextauth]/route.ts     # Auth.js handler
│   ├── vendor/profile/route.ts         # GET vendor profile for current user
│   └── webhooks/
│       ├── stripe/route.ts             # Stripe payment webhook (stub)
│       └── razorpay/route.ts           # Razorpay payment webhook (stub)
├── vendors/
│   ├── page.tsx                        # Search/browse with filters, sort, pagination
│   ├── loading.tsx                     # Skeleton loader
│   ├── error.tsx                       # Error boundary
│   └── [slug]/
│       ├── page.tsx                    # Vendor detail (JSON-LD, OG, packages, reviews, booking, claim)
│       ├── loading.tsx                 # Skeleton loader
│       └── not-found.tsx              # Vendor-specific 404
└── dashboard/
    ├── page.tsx                        # Role-based redirect
    ├── layout.tsx                      # Dashboard nav (role-aware, includes Orders links)
    ├── loading.tsx                     # Skeleton loader
    ├── error.tsx                       # Error boundary
    ├── customer/
    │   ├── page.tsx                    # Customer overview
    │   ├── bookings/page.tsx           # Bookings list with status actions
    │   ├── orders/page.tsx             # Orders list
    │   └── reviews/page.tsx            # Submitted reviews
    └── vendor/
        ├── page.tsx                    # Vendor overview (4 card grid)
        ├── profile/page.tsx            # Business profile setup/edit
        ├── bookings/page.tsx           # Incoming bookings with send quote
        ├── orders/page.tsx             # Incoming orders
        ├── reviews/page.tsx            # Reviews with rating summary
        └── listings/
            ├── page.tsx               # Listings table with publish/edit/delete
            ├── new/page.tsx           # Create listing form
            └── [id]/edit/page.tsx     # Edit listing form
```

### Components (src/components/)
```
src/components/
├── ui/                                # shadcn/ui (button, card, input, label, badge, textarea, select)
├── layout/
│   ├── header.tsx                     # Client: session-aware nav (useSession)
│   └── footer.tsx                     # Server: footer with links
├── vendor/
│   ├── vendor-card.tsx                # Card: price, rating, cultural tags
│   ├── listing-actions.tsx            # Client: toggle publish, delete
│   ├── listing-form.tsx               # Client: full form with category/tag multi-select
│   └── claim-button.tsx               # Client: claim flow with verification method
├── booking/
│   ├── booking-request-form.tsx       # Client: booking request with event details
│   ├── booking-status-actions.tsx     # Client: status transition buttons per role
│   └── send-quote-form.tsx            # Client: inline quote form for vendors
├── review/
│   └── review-form.tsx                # Client: interactive star rating + review
└── auth/
    └── logout-button.tsx              # Client: sign out button
```

### Server Actions (src/actions/)
- `auth.ts` — register (bcrypt + auto sign-in), login
- `vendor.ts` — profile upsert, listing CRUD (create/update/delete/togglePublish)
- `booking.ts` — create request, send quote, update status (with transition validation)
- `review.ts` — submit review + automatic rating aggregation
- `package.ts` — package CRUD for vendor listings
- `order.ts` — create order, update payment status
- `claim.ts` — submit claim request, admin approve (transfers ownership)

### Validators (src/lib/validators/)
- `auth.ts` — loginSchema, registerSchema
- `vendor.ts` — vendorProfileSchema, vendorListingSchema
- `booking.ts` — bookingRequestSchema, quoteSchema
- `review.ts` — reviewSchema
- `package.ts` — vendorPackageSchema, orderSchema

### Services (src/services/)
- `vendor.service.ts` — searchVendors (with text/category/religion/tradition/style/location/price/rating filters, sort, cursor pagination), getFeaturedVendors, getVendorBySlug, getCategories
- `taxonomy.service.ts` — getTaxonomyTypes, getTermsByType

### Crawler (src/crawler/)
```
src/crawler/
├── index.ts                           # CLI entry point
├── sources/
│   ├── base-adapter.ts                # SourceAdapter interface, RawVendorData type
│   ├── google-places.ts               # Google Places API adapter (Text Search)
│   ├── wed-me-good.ts                 # Stub adapter
│   └── generic-web.ts                 # Stub adapter
└── pipeline/
    ├── normalizer.ts                  # Clean phone/email/URL, normalize country codes
    ├── taxonomy-mapper.ts             # 60+ keyword → taxonomy slug mappings
    ├── deduplicator.ts                # Multi-signal scoring (phone:40, email:40, website:35, name+city:30)
    └── db-writer.ts                   # Upsert unclaimed profiles, respects field overrides
```

### Other Key Files
- `src/lib/db.ts` — Prisma client singleton
- `src/lib/auth.ts` — Auth.js config (Credentials + Google providers, JWT with role)
- `src/lib/auth.config.ts` — Edge-compatible auth config for middleware
- `src/lib/utils.ts` — cn() helper
- `prisma/schema.prisma` — Full data model (app + crawler + taxonomy tables)
- `prisma/seed.ts` — Categories + cultural taxonomy hierarchy seed data
- `middleware.ts` — Route protection for /dashboard/* with role-based access

## Conventions
- Use Server Components by default; add "use client" only when needed
- All mutations go through Server Actions (`src/actions/`), not API routes
- Data queries go through services layer (`src/services/`)
- Validate with Zod v4 schemas from `src/lib/validators/` (shared client + server)
- Use `z.enum([...], { message: "..." })` not `required_error` (Zod v4)
- Access Zod errors via `.issues` not `.errors`
- Use shadcn/ui components from `src/components/ui/`
- Add `export const dynamic = "force-dynamic"` on all pages that query the database (prevents build-time pre-rendering errors)
- Use `slugify` for generating URL slugs
- Feature branches: `feature/<name>`, bug fixes: `fix/<name>`
- Never commit .env files or secrets
- Prisma client is generated to `src/generated/prisma` (import from there)

## Database
- Local: Docker PostgreSQL + Redis (see docker-compose.yml)
- Production: Neon (serverless PostgreSQL)
- Always run `npx prisma migrate dev` after schema changes
- Prisma client output: `src/generated/prisma`

## Key Data Models
- **User** — CUSTOMER / VENDOR / ADMIN roles
- **VendorProfile** — businessName, location, isClaimed, isVerified, orderMode (PLATFORM/REDIRECT/BOTH)
- **VendorListing** — title, slug, pricing, isPublished, cultural tags
- **VendorPackage** — fixed-price service packages per listing
- **Booking** — status flow: INQUIRY → QUOTE_SENT → ACCEPTED → CONFIRMED → COMPLETED (or CANCELLED/DECLINED)
- **Order** — package purchases with Stripe/Razorpay payment tracking
- **Review** — linked to completed bookings, auto-aggregates rating on VendorProfile
- **TaxonomyType/Term** — cultural categorization (religion, cultural_tradition, ceremony_style, region, sub_tradition)
- **VendorClaimRequest** — claim flow for unclaimed (crawler-created) profiles
- **VendorFieldOverride** — tracks vendor manual edits; crawler respects these
- **CrawlRun** — logs each crawler execution

## SEO
- Dynamic `sitemap.ts` with vendor listings + category pages
- `robots.ts` blocks /dashboard/ and /api/
- JSON-LD (LocalBusiness schema) on vendor detail pages
- Open Graph + Twitter Card meta tags on vendor pages
- Semantic HTML with proper heading hierarchy
