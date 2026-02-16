# VivahVendors

A global wedding vendor marketplace with culturally-aware categorization by religion, tradition, region, and ceremony style. Connects couples and event planners with wedding vendors — photographers, caterers, decorators, priests, and more.

## Features

- Browse and search vendors with cultural, category, location, and price filters
- Vendor detail pages with packages, reviews, pricing, and booking requests
- Customer and vendor dashboards (bookings, orders, reviews, listings)
- Vendor claiming flow for crawler-created profiles
- Web crawler pipeline to seed vendor data from external sources
- SEO optimized with dynamic sitemap, JSON-LD, and Open Graph tags

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js v5 (email/password + Google OAuth)
- **UI**: Tailwind CSS v4 + shadcn/ui
- **Payments**: Stripe + Razorpay (stubs)
- **Images**: Cloudinary
- **Icons**: Lucide React

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL and Redis)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/KrishnaChaithvika/VivahVendors.git
cd VivahVendors
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Pre-configured for local Docker PostgreSQL |
| `AUTH_SECRET` | Yes | Generate with `npx auth secret` |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID (optional for dev) |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret (optional for dev) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name (for image uploads) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (for payments) |
| `RAZORPAY_KEY_ID` | No | Razorpay key ID (for India payments) |
| `RESEND_API_KEY` | No | Resend API key (for email notifications) |

> The `DATABASE_URL` is pre-filled to work with the Docker PostgreSQL setup below. Only `AUTH_SECRET` is required to get the app running.

### 4. Start the database

```bash
docker compose up -d
```

This starts:
- **PostgreSQL 16** on port `5432` (user: `vivah`, password: `vivah_dev_password`, database: `vivahvendors`)
- **Redis 7** on port `6379` (used by the crawler job queue)

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Seed the database

```bash
npx prisma db seed
```

This populates categories (Photographers, Caterers, Decorators, etc.) and the cultural taxonomy hierarchy (religions, traditions, ceremony styles).

### 7. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed categories and taxonomy data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

## Web Crawler

The crawler seeds vendor data from external sources into the database as unclaimed profiles.

```bash
# Full seed run (all sources)
npx tsx src/crawler/index.ts --seed

# Single source with filters
npx tsx src/crawler/index.ts --source=google-places --region=IN --city=Mumbai

# Limit results
npx tsx src/crawler/index.ts --source=wed-me-good --category=photographers --max=50
```

> The Google Places adapter requires a `GOOGLE_PLACES_API_KEY` environment variable. Other source adapters (WedMeGood, Generic Web) are stubs ready for implementation.

## Project Structure

```
src/
├── app/              # Next.js App Router (pages, layouts, API routes)
├── actions/          # Server Actions (auth, vendor, booking, review, order, claim)
├── components/       # React components (ui, layout, vendor, booking, review, auth)
├── crawler/          # Web crawler pipeline (sources, normalizer, deduplicator)
├── lib/              # Shared utilities (db, auth, validators)
├── services/         # Data access layer (Prisma queries)
└── generated/prisma/ # Generated Prisma client
prisma/
├── schema.prisma     # Database schema
├── seed.ts           # Seed data
└── migrations/       # Migration history
```

## Deployment

The app is designed to deploy on:
- **Vercel** for the Next.js application
- **Neon** for serverless PostgreSQL

```bash
npm run build
```

## License

Private
