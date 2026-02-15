import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, EyeOff, Pencil } from "lucide-react";
import { TogglePublishButton, DeleteListingButton } from "@/components/vendor/listing-actions";

export default async function VendorListingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Set Up Your Profile First</h1>
        <p className="text-muted-foreground mb-6">
          You need to create your business profile before adding listings.
        </p>
        <Link href="/dashboard/vendor/profile">
          <Button>Create Profile</Button>
        </Link>
      </div>
    );
  }

  const listings = await prisma.vendorListing.findMany({
    where: { vendorProfileId: profile.id },
    include: {
      categories: { include: { category: true } },
      _count: { select: { bookings: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Link href="/dashboard/vendor/listings/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Listing
          </Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t created any listings yet.
          </p>
          <Link href="/dashboard/vendor/listings/new">
            <Button>Create Your First Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{listing.title}</h3>
                    <Badge variant={listing.isPublished ? "default" : "secondary"}>
                      {listing.isPublished ? (
                        <><Eye className="h-3 w-3 mr-1" /> Published</>
                      ) : (
                        <><EyeOff className="h-3 w-3 mr-1" /> Draft</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {listing.categories.map((c) => c.category.name).join(", ")}
                    {" · "}
                    {listing._count.bookings} bookings · {listing._count.reviews} reviews
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <TogglePublishButton
                    listingId={listing.id}
                    isPublished={listing.isPublished}
                  />
                  <Link href={`/dashboard/vendor/listings/${listing.id}/edit`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                  </Link>
                  <DeleteListingButton listingId={listing.id} title={listing.title} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
