export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { VendorCard } from "@/components/vendor/vendor-card";
import { searchVendors, getCategories } from "@/services/vendor.service";
import { getTaxonomyTypes } from "@/services/taxonomy.service";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Wedding Vendors",
  description: "Browse and search wedding vendors by category, location, cultural tradition, and more.",
};

const CATEGORY_EMOJI: Record<string, string> = {
  photographers: "📸",
  caterers: "🍽️",
  decorators: "🎨",
  venues: "🏛️",
  "makeup-artists": "💄",
  "djs-music": "🎵",
  "priests-officiants": "🙏",
  florists: "🌹",
  videographers: "🎬",
  "wedding-planners": "📋",
  "mehendi-artists": "🌿",
  "jewelers": "💎",
  "invitation-designers": "📬",
  "bridal-wear": "👗",
  "groom-wear": "🤵",
};

const SORT_OPTIONS = [
  { value: "relevance", label: "Best Match" },
  { value: "rating", label: "⭐ Top Rated" },
  { value: "price_asc", label: "💰 Price ↑" },
  { value: "price_desc", label: "💎 Price ↓" },
  { value: "newest", label: "🆕 Newest" },
];

interface PageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    country?: string;
    city?: string;
    religion?: string;
    tradition?: string;
    sort?: string;
    cursor?: string;
  }>;
}

export default async function VendorsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters = {
    query: params.query,
    category: params.category,
    country: params.country,
    city: params.city,
    religion: params.religion?.split(",").filter(Boolean),
    tradition: params.tradition?.split(",").filter(Boolean),
    sort: (params.sort as "relevance" | "price_asc" | "price_desc" | "rating" | "newest") ?? "relevance",
    cursor: params.cursor,
  };

  const [results, categories, taxonomyTypes] = await Promise.all([
    searchVendors(filters),
    getCategories(),
    getTaxonomyTypes(),
  ]);

  const religionType = taxonomyTypes.find((t) => t.name === "religion");
  const traditionType = taxonomyTypes.find((t) => t.name === "cultural_tradition");

  const activeFilters: { label: string; key: string; value: string }[] = [];
  if (filters.category) {
    const cat = categories.find((c) => c.slug === filters.category);
    if (cat) activeFilters.push({ label: cat.name, key: "category", value: filters.category });
  }
  if (filters.country) activeFilters.push({ label: filters.country, key: "country", value: filters.country });
  if (filters.city) activeFilters.push({ label: filters.city, key: "city", value: filters.city });
  filters.religion?.forEach((r) => {
    const term = religionType?.terms.flatMap((t) => [t, ...t.children]).find((t) => t.slug === r);
    if (term) activeFilters.push({ label: term.name, key: "religion", value: r });
  });
  filters.tradition?.forEach((t) => {
    const term = traditionType?.terms.flatMap((tr) => [tr, ...tr.children]).find((tr) => tr.slug === t);
    if (term) activeFilters.push({ label: term.name, key: "tradition", value: t });
  });

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { ...params, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    if (Object.keys(overrides).some((k) => k !== "cursor")) p.delete("cursor");
    return `/vendors?${p.toString()}`;
  }

  const currentCategoryName = filters.category
    ? categories.find((c) => c.slug === filters.category)?.name
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main id="main-content" className="flex-1">
        {/* Search header */}
        <div className="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 border-b py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {currentCategoryName
                ? `${CATEGORY_EMOJI[filters.category ?? ""] ?? "✨"} ${currentCategoryName}`
                : "Find Your Perfect Vendors 💍"}
            </h1>
            <form method="GET" action="/vendors" className="flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <input
                  name="query"
                  defaultValue={filters.query}
                  placeholder="Search vendors, cities, traditions..."
                  className="w-full h-10 rounded-full border-2 border-rose-200 bg-white pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              {filters.category && <input type="hidden" name="category" value={filters.category} />}
              {filters.sort && filters.sort !== "relevance" && <input type="hidden" name="sort" value={filters.sort} />}
              {filters.religion && <input type="hidden" name="religion" value={filters.religion.join(",")} />}
              {filters.tradition && <input type="hidden" name="tradition" value={filters.tradition.join(",")} />}
              <button
                type="submit"
                className="h-10 px-5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Category scrollable row */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            <Link
              href="/vendors"
              className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 whitespace-nowrap transition-all hover:shadow-sm ${
                !filters.category
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white border-rose-200 text-foreground hover:border-primary"
              }`}
            >
              🎊 All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={buildUrl({ category: filters.category === cat.slug ? undefined : cat.slug })}
                className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 whitespace-nowrap transition-all hover:shadow-sm ${
                  filters.category === cat.slug
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white border-rose-200 text-foreground hover:border-primary"
                }`}
              >
                {CATEGORY_EMOJI[cat.slug] ?? "✨"} {cat.name}
              </Link>
            ))}
          </div>

          {/* Sort + results count row */}
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <p className="text-sm text-muted-foreground">
              {results.items.length === 0
                ? "No vendors found"
                : `${results.items.length} vendor${results.items.length !== 1 ? "s" : ""}${results.hasMore ? "+" : ""}`}
              {activeFilters.length > 0 && (
                <Link href="/vendors" className="ml-2 text-rose-500 hover:text-rose-600 font-medium">
                  Clear all ×
                </Link>
              )}
            </p>

            <div className="flex items-center gap-1.5 flex-wrap">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              {SORT_OPTIONS.map((opt) => (
                <Link key={opt.value} href={buildUrl({ sort: opt.value })}>
                  <Badge
                    variant={filters.sort === opt.value ? "default" : "outline"}
                    className={`cursor-pointer text-xs ${
                      filters.sort !== opt.value ? "border-rose-200 hover:border-primary" : ""
                    }`}
                  >
                    {opt.label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {activeFilters.map((f) => (
                <Link key={`${f.key}-${f.value}`} href={buildUrl({ [f.key]: undefined })}>
                  <Badge className="cursor-pointer gap-1 bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 border">
                    {f.label} ×
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Collapsible filter panels */}
          <div className="mb-6 space-y-2">
            {religionType && (
              <details open={!!(filters.religion && filters.religion.length > 0)} className="group rounded-xl border border-rose-200 bg-white overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer font-medium text-sm select-none hover:bg-rose-50/50 transition-colors list-none">
                  <span className="flex items-center gap-2">
                    🕊️ <span>Religion</span>
                    {filters.religion?.length ? (
                      <Badge className="text-xs bg-primary/10 text-primary border-0 ml-1">{filters.religion.length} selected</Badge>
                    ) : null}
                  </span>
                  <span className="text-muted-foreground text-xs">▼</span>
                </summary>
                <div className="px-4 pb-4 pt-2 flex flex-wrap gap-2 border-t border-rose-100">
                  {religionType.terms.map((term) => {
                    const isActive = filters.religion?.includes(term.slug);
                    const newReligion = isActive
                      ? filters.religion?.filter((r) => r !== term.slug).join(",") || undefined
                      : [...(filters.religion ?? []), term.slug].join(",");
                    return (
                      <Link key={term.slug} href={buildUrl({ religion: newReligion })}>
                        <Badge
                          variant={isActive ? "default" : "outline"}
                          className={`cursor-pointer ${!isActive ? "border-rose-200 hover:border-primary hover:bg-rose-50" : ""}`}
                        >
                          {term.name}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </details>
            )}

            {traditionType && (
              <details open={!!(filters.tradition && filters.tradition.length > 0)} className="rounded-xl border border-rose-200 bg-white overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer font-medium text-sm select-none hover:bg-rose-50/50 transition-colors list-none">
                  <span className="flex items-center gap-2">
                    🌍 <span>Cultural Tradition</span>
                    {filters.tradition?.length ? (
                      <Badge className="text-xs bg-primary/10 text-primary border-0 ml-1">{filters.tradition.length} selected</Badge>
                    ) : null}
                  </span>
                  <span className="text-muted-foreground text-xs">▼</span>
                </summary>
                <div className="px-4 pb-4 pt-2 flex flex-wrap gap-2 border-t border-rose-100">
                  {traditionType.terms.map((term) => {
                    const isActive = filters.tradition?.includes(term.slug);
                    const newTradition = isActive
                      ? filters.tradition?.filter((t) => t !== term.slug).join(",") || undefined
                      : [...(filters.tradition ?? []), term.slug].join(",");
                    return (
                      <Link key={term.slug} href={buildUrl({ tradition: newTradition })}>
                        <Badge
                          variant={isActive ? "default" : "outline"}
                          className={`cursor-pointer ${!isActive ? "border-rose-200 hover:border-primary hover:bg-rose-50" : ""}`}
                        >
                          {term.name}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </details>
            )}
          </div>

          {/* Results */}
          {results.items.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-semibold mb-2">No vendors found</p>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search in a different city</p>
              <Link href="/vendors">
                <Button className="rounded-full">Clear Filters & Browse All</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.items.map((listing) => (
                  <VendorCard
                    key={listing.id}
                    listing={listing}
                  />
                ))}
              </div>

              {results.hasMore && results.nextCursor && (
                <div className="mt-10 text-center">
                  <Link href={buildUrl({ cursor: results.nextCursor })}>
                    <Button variant="outline" className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8">
                      Load More Vendors ✨
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
