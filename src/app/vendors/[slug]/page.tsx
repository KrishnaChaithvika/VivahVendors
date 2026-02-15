export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVendorBySlug } from "@/services/vendor.service";
import { Star, MapPin, Clock, Users, Globe, Check } from "lucide-react";
import { BookingRequestForm } from "@/components/booking/booking-request-form";
import { ClaimButton } from "@/components/vendor/claim-button";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getVendorBySlug(slug);
  if (!listing) return { title: "Vendor Not Found" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vivahvendors.com";
  const profile = listing.vendorProfile;

  return {
    title: profile.businessName,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: `${profile.businessName} | VivahVendors`,
      description: listing.description.slice(0, 160),
      url: `${baseUrl}/vendors/${listing.slug}`,
      siteName: "VivahVendors",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: profile.businessName,
      description: listing.description.slice(0, 160),
    },
  };
}

export default async function VendorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [listing, session] = await Promise.all([
    getVendorBySlug(slug),
    auth(),
  ]);

  if (!listing) notFound();

  const profile = listing.vendorProfile;
  const religionTags = listing.culturalTags.filter(
    (t) => t.taxonomyTerm.taxonomyType.name === "religion"
  );
  const traditionTags = listing.culturalTags.filter(
    (t) => t.taxonomyTerm.taxonomyType.name === "cultural_tradition"
  );
  const styleTags = listing.culturalTags.filter(
    (t) => t.taxonomyTerm.taxonomyType.name === "ceremony_style"
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: profile.businessName,
    description: listing.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.city,
      addressRegion: profile.state,
      addressCountry: profile.country,
    },
    ...(profile.contactPhone && { telephone: profile.contactPhone }),
    ...(profile.contactEmail && { email: profile.contactEmail }),
    ...(profile.websiteUrl && { url: profile.websiteUrl }),
    ...(profile.averageRating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: profile.averageRating,
        reviewCount: profile.totalReviews,
      },
    }),
  };

  function formatPrice(amount: number | null, currency: string) {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1">
        {/* Hero banner */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Photo placeholder */}
              <div className="w-full md:w-80 h-60 bg-muted rounded-xl flex items-center justify-center shrink-0">
                <span className="text-6xl">📸</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {listing.categories.map((c) => (
                    <Link key={c.category.slug} href={`/vendors?category=${c.category.slug}`}>
                      <Badge variant="secondary">{c.category.name}</Badge>
                    </Link>
                  ))}
                  {profile.isVerified && (
                    <Badge className="bg-green-600 gap-1">
                      <Check className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {profile.businessName}
                </h1>

                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.city}, {profile.state ?? profile.country}</span>
                  </div>
                  {profile.yearsInBusiness && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{profile.yearsInBusiness}+ years</span>
                    </div>
                  )}
                  {profile.teamSize && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Team of {profile.teamSize}</span>
                    </div>
                  )}
                </div>

                {profile.averageRating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.round(profile.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{profile.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({profile.totalReviews} reviews)</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {religionTags.map((t) => (
                    <Badge key={t.taxonomyTerm.slug} variant="default">{t.taxonomyTerm.name}</Badge>
                  ))}
                  {traditionTags.map((t) => (
                    <Badge key={t.taxonomyTerm.slug} variant="secondary">{t.taxonomyTerm.name}</Badge>
                  ))}
                  {styleTags.map((t) => (
                    <Badge key={t.taxonomyTerm.slug} variant="outline">{t.taxonomyTerm.name}</Badge>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <Button size="lg">Request Quote</Button>
                  {profile.websiteUrl && (
                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="lg" className="gap-2">
                        <Globe className="h-4 w-4" /> Visit Website
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <section>
                <h2 className="text-xl font-bold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </section>

              {/* Packages */}
              {listing.packages.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold mb-4">Packages</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listing.packages.map((pkg) => (
                      <Card key={pkg.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          <p className="text-2xl font-bold text-primary">
                            {formatPrice(Number(pkg.price), pkg.currency)}
                          </p>
                        </CardHeader>
                        <CardContent>
                          {pkg.description && (
                            <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                          )}
                          {Array.isArray(pkg.inclusions) && (
                            <ul className="space-y-1">
                              {(pkg.inclusions as string[]).map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                          <Button className="w-full mt-4" variant="outline">
                            Select Package
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Reviews */}
              {listing.reviews.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold mb-4">Reviews</h2>
                  <div className="space-y-4">
                    {listing.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                                />
                              ))}
                            </div>
                            <span className="font-medium text-sm">{review.customer.name}</span>
                          </div>
                          {review.title && <p className="font-semibold mb-1">{review.title}</p>}
                          <p className="text-sm text-muted-foreground">{review.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  {listing.priceType === "ON_REQUEST" ? (
                    <p className="text-lg font-semibold">Price on request</p>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-primary">
                        {listing.priceType === "STARTING_AT" && "From "}
                        {formatPrice(Number(listing.priceMin), listing.currency)}
                        {listing.priceMax && listing.priceType === "RANGE" && (
                          <> - {formatPrice(Number(listing.priceMax), listing.currency)}</>
                        )}
                      </p>
                      {listing.priceUnit && (
                        <p className="text-sm text-muted-foreground">{listing.priceUnit}</p>
                      )}
                    </>
                  )}
                  <div className="mt-4">
                    <BookingRequestForm listingId={listing.id} listingTitle={listing.title} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {profile.contactEmail && <p>{profile.contactEmail}</p>}
                  {profile.contactPhone && <p>{profile.contactPhone}</p>}
                  {profile.websiteUrl && (
                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block">
                      {profile.websiteUrl}
                    </a>
                  )}
                </CardContent>
              </Card>

              {!profile.isClaimed && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-3">
                      Is this your business? Claim it to manage your profile.
                    </p>
                    <ClaimButton
                      vendorProfileId={profile.id}
                      isLoggedIn={!!session?.user}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
