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

const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  photographers:       { bg: "bg-blue-50 hover:bg-blue-100 border-blue-100",   icon: "bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white" },
  caterers:            { bg: "bg-orange-50 hover:bg-orange-100 border-orange-100", icon: "bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white" },
  decorators:          { bg: "bg-purple-50 hover:bg-purple-100 border-purple-100", icon: "bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white" },
  venues:              { bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-100", icon: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white" },
  "makeup-artists":    { bg: "bg-pink-50 hover:bg-pink-100 border-pink-100",    icon: "bg-pink-100 text-pink-600 group-hover:bg-pink-500 group-hover:text-white" },
  "djs-music":         { bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-100", icon: "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white" },
  "priests-officiants":{ bg: "bg-amber-50 hover:bg-amber-100 border-amber-100", icon: "bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white" },
  florists:            { bg: "bg-rose-50 hover:bg-rose-100 border-rose-100",    icon: "bg-rose-100 text-rose-600 group-hover:bg-rose-500 group-hover:text-white" },
  videographers:       { bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-100",    icon: "bg-cyan-100 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white" },
  "wedding-planners":  { bg: "bg-violet-50 hover:bg-violet-100 border-violet-100", icon: "bg-violet-100 text-violet-600 group-hover:bg-violet-500 group-hover:text-white" },
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
        <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-20 md:py-32">
          {/* Decorative floating elements */}
          <span className="absolute top-8 left-[8%] text-5xl opacity-30 rotate-12 select-none pointer-events-none">🌸</span>
          <span className="absolute top-20 right-[10%] text-4xl opacity-30 -rotate-12 select-none pointer-events-none">🌺</span>
          <span className="absolute bottom-8 left-[15%] text-3xl opacity-25 rotate-6 select-none pointer-events-none">✨</span>
          <span className="absolute bottom-20 right-[15%] text-3xl opacity-25 -rotate-6 select-none pointer-events-none">💐</span>
          <span className="absolute top-1/2 left-[4%] text-2xl opacity-20 select-none pointer-events-none">🕯️</span>
          <span className="absolute top-1/3 right-[5%] text-2xl opacity-20 select-none pointer-events-none">🎊</span>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-rose-200 text-rose-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
              <span>✨</span>
              <span>India&apos;s #1 Cultural Wedding Marketplace</span>
              <span>✨</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Find Wedding Vendors for{" "}
              <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                Your Traditions
              </span>
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
                <Button size="lg" variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  List Your Business
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-rose-200/60">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10,000+</div>
                <div className="text-xs text-muted-foreground">Vendors</div>
              </div>
              <div className="w-px h-8 bg-rose-200" />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-xs text-muted-foreground">Traditions</div>
              </div>
              <div className="w-px h-8 bg-rose-200" />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">25+</div>
                <div className="text-xs text-muted-foreground">Countries</div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Browse by Category 🎊
              </h2>
              <p className="text-muted-foreground">
                Find the perfect vendor for every part of your celebration
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.slice(0, 10).map((category) => {
                const colors = CATEGORY_COLORS[category.slug] ?? {
                  bg: "bg-rose-50 hover:bg-rose-100 border-rose-100",
                  icon: "bg-rose-100 text-rose-600 group-hover:bg-rose-500 group-hover:text-white",
                };
                return (
                  <Link
                    key={category.slug}
                    href={`/vendors?category=${category.slug}`}
                    className={`group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${colors.bg}`}
                  >
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${colors.icon}`}>
                      {CATEGORY_ICONS[category.slug] ?? <Sparkles className="h-6 w-6" />}
                    </div>
                    <span className="text-sm font-semibold text-center leading-tight">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Vendors */}
        {featuredVendors.length > 0 && (
          <section className="py-16 bg-gradient-to-b from-rose-50/50 to-white">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    ⭐ Featured Vendors
                  </h2>
                  <p className="text-muted-foreground">
                    Top-rated vendors trusted by couples
                  </p>
                </div>
                <Link href="/vendors">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    View All
                  </Button>
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

        {/* Why Choose Us */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Why Couples Love Us 💕
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="text-5xl mb-4">🙏</div>
                <h3 className="text-lg font-semibold mb-2">Culturally Aware</h3>
                <p className="text-muted-foreground text-sm">
                  Browse vendors by religion, tradition, and ceremony style — from Hindu to Christian, South Indian to Caribbean.
                </p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-lg font-semibold mb-2">Verified Vendors</h3>
                <p className="text-muted-foreground text-sm">
                  Every featured vendor is verified and reviewed by real couples to ensure quality service.
                </p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-rose-50 border border-rose-100">
                <div className="text-5xl mb-4">💌</div>
                <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
                <p className="text-muted-foreground text-sm">
                  Send inquiries, get quotes, and book your dream vendors all in one place.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 relative overflow-hidden bg-gradient-to-r from-primary via-rose-500 to-amber-500 text-white">
          <span className="absolute top-4 left-8 text-4xl opacity-20 select-none pointer-events-none">🎊</span>
          <span className="absolute bottom-4 right-8 text-4xl opacity-20 select-none pointer-events-none">✨</span>
          <span className="absolute top-8 right-1/4 text-3xl opacity-15 select-none pointer-events-none">🌸</span>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Are You a Wedding Vendor? 💍
            </h2>
            <p className="text-white/85 max-w-xl mx-auto mb-8">
              Join thousands of vendors who reach couples looking for services that
              match their cultural traditions. List your business for free.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                Get Started Free ✨
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
