export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { VendorCard } from "@/components/vendor/vendor-card";
import { searchVendors, getCategories } from "@/services/vendor.service";
import { getTaxonomyTypes } from "@/services/taxonomy.service";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Wedding Vendors",
  description: "Browse and search wedding vendors by category, location, cultural tradition, and more.",
};

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

  // Build active filter display
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
    // Remove cursor when filters change
    if (Object.keys(overrides).some((k) => k !== "cursor")) p.delete("cursor");
    return `/vendors?${p.toString()}`;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">
            {filters.category
              ? categories.find((c) => c.slug === filters.category)?.name ?? "Vendors"
              : "All Wedding Vendors"}
          </h1>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              <Link href="/vendors">
                <Badge variant={!filters.category ? "default" : "outline"} className="cursor-pointer">
                  All
                </Badge>
              </Link>
              {categories.map((cat) => (
                <Link key={cat.slug} href={buildUrl({ category: filters.category === cat.slug ? undefined : cat.slug })}>
                  <Badge variant={filters.category === cat.slug ? "default" : "outline"} className="cursor-pointer">
                    {cat.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Religion pills */}
            {religionType && (
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Religion</p>
                <div className="flex flex-wrap gap-2">
                  {religionType.terms.map((term) => {
                    const isActive = filters.religion?.includes(term.slug);
                    const newReligion = isActive
                      ? filters.religion?.filter((r) => r !== term.slug).join(",") || undefined
                      : [...(filters.religion ?? []), term.slug].join(",");
                    return (
                      <Link key={term.slug} href={buildUrl({ religion: newReligion })}>
                        <Badge variant={isActive ? "default" : "outline"} className="cursor-pointer">
                          {term.name}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tradition pills */}
            {traditionType && (
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Cultural Tradition</p>
                <div className="flex flex-wrap gap-2">
                  {traditionType.terms.map((term) => {
                    const isActive = filters.tradition?.includes(term.slug);
                    const newTradition = isActive
                      ? filters.tradition?.filter((t) => t !== term.slug).join(",") || undefined
                      : [...(filters.tradition ?? []), term.slug].join(",");
                    return (
                      <Link key={term.slug} href={buildUrl({ tradition: newTradition })}>
                        <Badge variant={isActive ? "default" : "outline"} className="cursor-pointer">
                          {term.name}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort:</span>
              {[
                { value: "relevance", label: "Relevance" },
                { value: "rating", label: "Top Rated" },
                { value: "price_asc", label: "Price: Low" },
                { value: "price_desc", label: "Price: High" },
                { value: "newest", label: "Newest" },
              ].map((opt) => (
                <Link key={opt.value} href={buildUrl({ sort: opt.value })}>
                  <Badge variant={filters.sort === opt.value ? "default" : "outline"} className="cursor-pointer text-xs">
                    {opt.label}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Active filters */}
            {activeFilters.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active:</span>
                {activeFilters.map((f) => (
                  <Link key={`${f.key}-${f.value}`} href={buildUrl({ [f.key]: undefined })}>
                    <Badge variant="secondary" className="cursor-pointer gap-1">
                      {f.label} &times;
                    </Badge>
                  </Link>
                ))}
                <Link href="/vendors">
                  <Badge variant="destructive" className="cursor-pointer text-xs">Clear all</Badge>
                </Link>
              </div>
            )}
          </div>

          {/* Results */}
          {results.items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-semibold mb-2">No vendors found</p>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
              <Link href="/vendors">
                <Button>Clear Filters</Button>
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Showing {results.items.length} vendor{results.items.length !== 1 ? "s" : ""}
                {results.hasMore ? "+" : ""}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.items.map((listing) => (
                  <VendorCard
                    key={listing.id}
                    listing={listing as unknown as Parameters<typeof VendorCard>[0]["listing"]}
                  />
                ))}
              </div>

              {results.hasMore && results.nextCursor && (
                <div className="mt-8 text-center">
                  <Link href={buildUrl({ cursor: results.nextCursor })}>
                    <Button variant="outline">Load More</Button>
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
