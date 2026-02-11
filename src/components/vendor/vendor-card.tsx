import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VendorCardProps {
  listing: {
    slug: string;
    title: string;
    priceMin: number | null;
    priceMax: number | null;
    currency: string;
    priceType: string;
    priceUnit: string | null;
    vendorProfile: {
      businessName: string;
      city: string;
      country: string;
      averageRating: number;
      totalReviews: number;
      isVerified: boolean;
      isClaimed: boolean;
    };
    categories: { category: { name: string; slug: string } }[];
    culturalTags: { taxonomyTerm: { name: string; slug: string; taxonomyType: { name: string } } }[];
    images: { url: string; altText: string | null }[];
  };
}

export function VendorCard({ listing }: VendorCardProps) {
  const { vendorProfile: profile } = listing;
  const primaryImage = listing.images[0];
  const religionTags = listing.culturalTags.filter(
    (t) => t.taxonomyTerm.taxonomyType.name === "religion"
  );
  const traditionTags = listing.culturalTags.filter(
    (t) => t.taxonomyTerm.taxonomyType.name === "cultural_tradition"
  );

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
      return `${min} - ${formatter.format(Number(listing.priceMax))}`;
    }
    return `From ${min}`;
  }

  return (
    <Link href={`/vendors/${listing.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="aspect-[4/3] bg-muted relative">
          {primaryImage ? (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <span className="text-4xl">📸</span>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <span className="text-4xl">📸</span>
            </div>
          )}
          {profile.isVerified && (
            <Badge className="absolute top-2 right-2 bg-green-600">Verified</Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-base line-clamp-1">
              {profile.businessName}
            </h3>
            {profile.averageRating > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{profile.averageRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({profile.totalReviews})</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>{profile.city}, {profile.country}</span>
          </div>

          {listing.categories.length > 0 && (
            <p className="text-xs text-muted-foreground mb-2">
              {listing.categories.map((c) => c.category.name).join(" · ")}
            </p>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {religionTags.slice(0, 2).map((t) => (
              <Badge key={t.taxonomyTerm.slug} variant="secondary" className="text-xs">
                {t.taxonomyTerm.name}
              </Badge>
            ))}
            {traditionTags.slice(0, 2).map((t) => (
              <Badge key={t.taxonomyTerm.slug} variant="outline" className="text-xs">
                {t.taxonomyTerm.name}
              </Badge>
            ))}
          </div>

          <p className="text-sm font-semibold text-primary">
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
