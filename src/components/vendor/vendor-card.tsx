import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Camera, UtensilsCrossed, Palette, Building, Sparkles, Music, BookOpen, Flower, Video, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VendorListingWithRelations } from "@/lib/types";

const CATEGORY_PLACEHOLDERS: Record<string, { gradient: string; Icon: typeof Camera }> = {
  photographers: { gradient: "from-rose-200 to-amber-100", Icon: Camera },
  caterers: { gradient: "from-orange-200 to-amber-100", Icon: UtensilsCrossed },
  decorators: { gradient: "from-pink-200 to-purple-100", Icon: Palette },
  venues: { gradient: "from-blue-200 to-indigo-100", Icon: Building },
  "makeup-artists": { gradient: "from-fuchsia-200 to-pink-100", Icon: Sparkles },
  "djs-music": { gradient: "from-violet-200 to-blue-100", Icon: Music },
  "priests-officiants": { gradient: "from-amber-200 to-yellow-100", Icon: BookOpen },
  florists: { gradient: "from-green-200 to-emerald-100", Icon: Flower },
  videographers: { gradient: "from-cyan-200 to-blue-100", Icon: Video },
  "wedding-planners": { gradient: "from-indigo-200 to-violet-100", Icon: ClipboardList },
};

const RELIGION_BADGE_COLORS: Record<string, string> = {
  hindu: "bg-orange-100 text-orange-800 border-orange-200",
  muslim: "bg-emerald-100 text-emerald-800 border-emerald-200",
  christian: "bg-blue-100 text-blue-800 border-blue-200",
  sikh: "bg-amber-100 text-amber-800 border-amber-200",
  jewish: "bg-indigo-100 text-indigo-800 border-indigo-200",
  buddhist: "bg-yellow-100 text-yellow-800 border-yellow-200",
  jain: "bg-lime-100 text-lime-800 border-lime-200",
  interfaith: "bg-purple-100 text-purple-800 border-purple-200",
};

interface VendorCardProps {
  listing: VendorListingWithRelations;
}

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
};

const CATEGORY_GRADIENT: Record<string, string> = {
  photographers: "from-blue-100 via-sky-50 to-blue-50",
  caterers: "from-orange-100 via-amber-50 to-orange-50",
  decorators: "from-purple-100 via-violet-50 to-purple-50",
  venues: "from-emerald-100 via-green-50 to-emerald-50",
  "makeup-artists": "from-pink-100 via-rose-50 to-pink-50",
  "djs-music": "from-indigo-100 via-blue-50 to-indigo-50",
  "priests-officiants": "from-amber-100 via-yellow-50 to-amber-50",
  florists: "from-rose-100 via-pink-50 to-rose-50",
  videographers: "from-cyan-100 via-sky-50 to-cyan-50",
  "wedding-planners": "from-violet-100 via-purple-50 to-violet-50",
};

export function VendorCard({ listing }: VendorCardProps) {
  const { vendorProfile: profile } = listing;
  const primaryCategory = listing.categories[0]?.category.slug;
  const emoji = CATEGORY_EMOJI[primaryCategory ?? ""] ?? "📸";
  const gradient = CATEGORY_GRADIENT[primaryCategory ?? ""] ?? "from-rose-100 via-orange-50 to-amber-50";

  const religionTags = listing.culturalTags.filter(
    (t) => t.taxonomyTerm.taxonomyType.name === "religion"
  );
  const traditionTags = listing.culturalTags.filter(
    (t) => t.taxonomyTerm.taxonomyType.name === "cultural_tradition"
  );

  const categorySlug = listing.categories[0]?.category.slug ?? "";
  const placeholder = CATEGORY_PLACEHOLDERS[categorySlug] ?? { gradient: "from-primary/20 to-accent/10", Icon: Sparkles };
  const primaryImage = listing.images[0];

  function formatPrice() {
    const formatter = new Intl.NumberFormat(profile.country === "IN" ? "en-IN" : "en-US", {
      style: "currency",
      currency: listing.currency,
      maximumFractionDigits: 0,
    });

    if (listing.priceType === "ON_REQUEST") return "Price on request";
    if (listing.priceMin === null) return "Price on request";

    const min = formatter.format(Number(listing.priceMin));
    if (listing.priceType === "FIXED") return min;
    if (listing.priceType === "STARTING_AT") return `From ${min}`;
    if (listing.priceMax) {
      return `${min} – ${formatter.format(Number(listing.priceMax))}`;
    }
    return `From ${min}`;
  }

  return (
    <Link
      href={`/vendors/${listing.slug}`}
      className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 h-full border-2 hover:border-primary/20">
        <div className="aspect-[4/3] relative overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? `${profile.businessName} photo`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-6xl opacity-50" aria-hidden="true">{emoji}</span>
            </div>
          )}
          {profile.isVerified && (
            <Badge className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-600 shadow-sm">
              ✓ Verified
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-base line-clamp-1">
              {profile.businessName}
            </h3>
            {profile.averageRating > 0 && (
              <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-1.5 py-0.5 rounded-full">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="text-sm font-semibold text-amber-700">{profile.averageRating.toFixed(1)}</span>
                <span className="text-xs text-amber-600/70">({profile.totalReviews})</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
            <span>{profile.city}, {profile.country}</span>
          </div>

          {listing.categories.length > 0 && (
            <p className="text-xs text-muted-foreground mb-2">
              {listing.categories.map((c) => c.category.name).join(" · ")}
            </p>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {religionTags.slice(0, 2).map((t) => (
              <Badge
                key={t.taxonomyTerm.slug}
                className={`text-xs border ${RELIGION_BADGE_COLORS[t.taxonomyTerm.slug] ?? "bg-primary/10 text-primary border-0 hover:bg-primary/20"}`}
              >
                {t.taxonomyTerm.name}
              </Badge>
            ))}
            {traditionTags.slice(0, 2).map((t) => (
              <Badge key={t.taxonomyTerm.slug} variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50/50">
                {t.taxonomyTerm.name}
              </Badge>
            ))}
          </div>

          <p className="text-sm font-bold text-primary">
            {formatPrice()}
            {listing.priceUnit && (
              <span className="text-xs font-normal text-muted-foreground"> {listing.priceUnit}</span>
            )}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
