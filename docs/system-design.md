# VivahVendors — System Design Document

## 1. Architecture Overview

```
┌─────────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│   Client        │────▶│   Next.js App (Vercel)    │────▶│  PostgreSQL     │
│   (Browser)     │◀────│   - Server Components     │◀────│  (Neon)         │
│                 │     │   - Server Actions         │     │                 │
│                 │     │   - API Routes             │     │                 │
└─────────────────┘     └──────────┬───────────────┘     └────────┬────────┘
                                   │                              │
                          ┌────────▼────────┐            ┌────────▼────────┐
                          │   Cloudinary     │            │   Crawler       │
                          │   (Image CDN)    │            │   (TypeScript)  │
                          └─────────────────┘            │   - BullMQ      │
                                                          │   - Redis       │
                          ┌─────────────────┐            └────────┬────────┘
                          │   Stripe /       │                     │
                          │   Razorpay       │            ┌────────▼────────┐
                          │   (Payments)     │            │  External       │
                          └─────────────────┘            │  Sources        │
                                                          │  - Google Places│
                          ┌─────────────────┐            │  - WeddingWire  │
                          │   Resend         │            │  - WedMeGood    │
                          │   (Email)        │            └─────────────────┘
                          └─────────────────┘
```

## 2. Component Architecture

### Frontend (React)
- **Server Components** (default): Used for data-heavy pages (vendor listings, search results, detail pages). Data is fetched directly via Prisma in the component — no API layer needed.
- **Client Components** (`"use client"`): Used for interactive elements — search filters, forms, calendars, image uploads, star ratings.

### Data Flow (Server → Client)
```
Page Request → Server Component → Service Layer → Prisma → PostgreSQL
                                                          ↓
                                                     Response
                                                          ↓
                                              Server Component renders HTML
                                                          ↓
                                              Streamed to Client
```

### Mutation Flow (Client → Server)
```
User Action → Form / Button → Server Action (src/actions/)
                                      ↓
                              Zod Validation (src/lib/validators/)
                                      ↓
                              Auth Check (session)
                                      ↓
                              Service Layer (src/services/)
                                      ↓
                              Prisma → PostgreSQL
                                      ↓
                              revalidatePath() / redirect()
```

### Services Layer
Thin abstraction over Prisma queries. Benefits:
- Testable (can mock Prisma)
- Reusable across Server Components and Server Actions
- Keeps page components focused on rendering

## 3. Data Flow Diagrams

### Customer Browsing Flow
```
1. Customer visits /vendors?category=photographers&religion=hindu&city=chennai
2. Server Component reads URL search params
3. vendor.service.ts builds Prisma query with filters
4. PostgreSQL returns matching vendors
5. Server Component renders VendorGrid with results
6. Customer clicks vendor → /vendors/[slug]
7. Server Component fetches vendor detail + reviews
8. SSR with full SEO metadata + JSON-LD
```

### Booking Flow
```
1. Customer fills BookingRequestForm on vendor detail page
2. Server Action: requestBooking()
   - Validates input (Zod)
   - Checks auth session (must be CUSTOMER)
   - Creates Booking with status=INQUIRY
   - Sends email to vendor via Resend
3. Vendor sees booking in dashboard
4. Vendor sends quote → status=QUOTE_SENT
5. Customer accepts → status=ACCEPTED
6. Vendor confirms → status=CONFIRMED
7. Event happens → vendor marks COMPLETED
8. Customer can now write a review
```

### Order Flow (In-Platform)
```
1. Customer selects a VendorPackage on vendor detail page
2. Customer clicks "Book Now" → /checkout page
3. Server Action: createOrder()
   - Creates Order with status=PENDING
   - Creates Stripe/Razorpay PaymentIntent
   - Returns clientSecret
4. Client-side Stripe/Razorpay payment form
5. Customer completes payment
6. Webhook: /api/webhooks/stripe or /api/webhooks/razorpay
   - Verifies signature
   - Updates Order.paymentStatus = PAID
   - Sends confirmation email to both parties
```

### Crawler Pipeline
```
1. CLI or GitHub Actions triggers: npx tsx src/crawler/index.ts --source=google-places
2. CrawlRun record created (status=running)
3. Source Adapter fetches raw data (Google Places API, HTML scraping)
4. Normalizer: cleans text, standardizes fields, Zod validation
5. Taxonomy Mapper: keyword analysis → auto-assign cultural tags
6. Deduplicator: multi-signal scoring against existing DB records
   - Phone match, name+city similarity, email match
   - Score > threshold → merge with existing
   - Score < threshold → create new
7. DB Writer: upsert with claimed/unclaimed logic
   - New vendors: isClaimed=false, create VendorSourceLink
   - Existing + unclaimed: update non-overridden fields
   - Existing + claimed: only update fields without VendorFieldOverride
8. CrawlRun updated with stats (vendorsFound, created, updated, errors)
```

### Vendor Claim Flow
```
1. Vendor registers on VivahVendors
2. Searches for their business in unclaimed profiles
3. Clicks "Claim This Business"
4. System checks: does vendor's email/phone match the scraped data?
   - Yes → auto-approve claim
   - No → manual review (admin dashboard)
5. On approval:
   - VendorProfile.isClaimed = true
   - VendorProfile.userId linked to claimant
   - Future manual edits tracked in VendorFieldOverride
6. Next crawler run: skips overridden fields for this vendor
```

## 4. API & Server Action Design

### Server Actions (Primary Mutation Layer)
All data mutations use Next.js Server Actions — no REST API endpoints for app features.

| Action | File | Description |
|--------|------|-------------|
| `registerUser` | `src/actions/auth.ts` | Create user with hashed password |
| `createVendorProfile` | `src/actions/vendor.ts` | Set up vendor business profile |
| `createListing` | `src/actions/vendor.ts` | Create vendor listing |
| `updateListing` | `src/actions/vendor.ts` | Edit listing details |
| `deleteListing` | `src/actions/vendor.ts` | Remove listing |
| `togglePublish` | `src/actions/vendor.ts` | Publish/unpublish listing |
| `requestBooking` | `src/actions/booking.ts` | Customer sends booking inquiry |
| `updateBookingStatus` | `src/actions/booking.ts` | Vendor updates booking status |
| `createOrder` | `src/actions/order.ts` | Customer places package order |
| `submitReview` | `src/actions/review.ts` | Customer writes review |

### API Route Handlers (External Integration Only)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET, POST | Auth.js handler |
| `/api/webhooks/stripe` | POST | Stripe payment webhook |
| `/api/webhooks/razorpay` | POST | Razorpay payment webhook |

## 5. Auth Architecture

### Strategy: JWT (Stateless)
- Sessions stored in JWT token (not database) for edge compatibility
- Token contains: `{ sub: userId, role, vendorProfileId }`
- Token refreshed on each request via Auth.js middleware

### Providers
1. **Credentials** — email + bcrypt-hashed password
2. **Google OAuth** — via Auth.js Google provider
3. **Phone OTP** — planned for future (extensible via custom provider)

### Route Protection
```typescript
// middleware.ts
// Runs on /dashboard/* routes
// Checks: valid session → role-based routing
// CUSTOMER trying to access /dashboard/vendor → redirect
// VENDOR trying to access /dashboard/customer → redirect
// Unauthenticated → redirect to /login?callbackUrl=...
```

## 6. Database Design

### Key Design Decisions

**Cultural Taxonomy (Type + Term + Hierarchy)**
- TaxonomyType defines dimensions (religion, cultural_tradition, etc.)
- TaxonomyTerm stores individual terms with self-referential parentId
- Many-to-many between listings and terms via VendorListingCulturalTag
- Fully database-driven — no hardcoded enums for cultural data
- Adding new religions/traditions = data insert, not code change

**Vendor Profiles vs Listings**
- VendorProfile = the business entity (one per vendor)
- VendorListing = a specific service offering (many per vendor)
- This allows a vendor to offer multiple services (e.g., photography + videography)

**Claimed vs Unclaimed Profiles**
- Crawler creates unclaimed profiles (isClaimed=false)
- VendorFieldOverride tracks which fields a claimed vendor has manually edited
- Crawler respects overrides to prevent data regression

### Indexing Strategy
- Unique indexes: email, phone, slug fields
- Composite indexes: (country, city), (isPublished, isFeatured), (listingId, date)
- Full-text search: PostgreSQL tsvector on vendor name + description (via Prisma preview feature)

## 7. Crawler Architecture

### Components
- **Source Adapters**: Pluggable per-source scrapers implementing `SourceAdapter` interface
- **Normalizer**: Cleans and validates raw data using shared Zod schemas
- **Taxonomy Mapper**: Keyword-based cultural tag auto-detection
- **Deduplicator**: Multi-signal scoring engine (phone, name+city, email, address proximity)
- **DB Writer**: Upsert with field override awareness

### Scheduling
- Initial seed: manual CLI run
- Monthly refresh: GitHub Actions cron (`0 0 1 * *`)
- Each run creates a CrawlRun record for monitoring

### Data Quality
- Zod validation on all scraped data
- Dedup prevents duplicates across sources
- CrawlRun logs track errors for debugging

## 8. Deployment Architecture

### Production
- **App**: Vercel (auto-deploy from main branch, preview deployments per PR)
- **Database**: Neon (serverless PostgreSQL, auto-scaling, branching for preview environments)
- **Images**: Cloudinary (CDN, auto-optimization)
- **Email**: Resend
- **Payments**: Stripe (global) + Razorpay (India)

### CI/CD (GitHub Actions)
```
Push/PR → lint → type-check → unit tests → integration tests → build → deploy
```
- Integration tests spin up Docker PostgreSQL
- E2E tests run against Vercel preview deployment
- Main branch auto-deploys to production

### Environment Variables
- Development: `.env` file (git-ignored)
- Production: Vercel environment variables dashboard
- Preview: Vercel preview environment variables
