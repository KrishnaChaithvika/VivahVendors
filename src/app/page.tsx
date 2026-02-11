export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { VendorCard } from "@/components/vendor/vendor-card";
import { getFeaturedVendors, getCategories } from "@/services/vendor.service";
import { Camera, UtensilsCrossed, Palette, Building, Sparkles, Music, BookOpen, Flower, Video, ClipboardList, Search } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  photographers: <Camera className="h-6 w-6" />,
  caterers: <UtensilsCrossed className="h-6 w-6" />,
  decorators: <Palette className="h-6 w-6" />,
  venues: <Building className="h-6 w-6" />,
  "makeup-artists": <Sparkles className="h-6 w-6" />,
  "djs-music": <Music className="h-6 w-6" />,
  "priests-officiants": <BookOpen className="h-6 w-6" />,
  florists: <Flower className="h-6 w-6" />,
  videographers: <Video className="h-6 w-6" />,
  "wedding-planners": <ClipboardList className="h-6 w-6" />,
};

export default async function HomePage() {
  const [featuredVendors, categories] = await Promise.all([
    getFeaturedVendors(6),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Find Wedding Vendors for{" "}
              <span className="text-primary">Your Traditions</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover photographers, caterers, decorators, priests and more who
              specialize in your cultural traditions, religion, and ceremony style.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
              <Link href="/vendors" className="flex-1">
                <Button size="lg" className="w-full gap-2">
                  <Search className="h-4 w-4" />
                  Browse Vendors
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full">
                  List Your Business
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
              Browse by Category
            </h2>
            <p className="text-muted-foreground text-center mb-10">
              Find the perfect vendor for every part of your celebration
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.slice(0, 10).map((category) => (
                <Link
                  key={category.slug}
                  href={`/vendors?category=${category.slug}`}
                  className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-background border hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {CATEGORY_ICONS[category.slug] ?? <Sparkles className="h-6 w-6" />}
                  </div>
                  <span className="text-sm font-medium text-center">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Vendors */}
        {featuredVendors.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    Featured Vendors
                  </h2>
                  <p className="text-muted-foreground">
                    Top-rated vendors trusted by couples
                  </p>
                </div>
                <Link href="/vendors">
                  <Button variant="outline">View All</Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredVendors.map((listing) => (
                  <VendorCard
                    key={listing.id}
                    listing={listing as unknown as Parameters<typeof VendorCard>[0]["listing"]}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Are You a Wedding Vendor?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Join thousands of vendors who reach couples looking for services that
              match their cultural traditions. List your business for free.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
