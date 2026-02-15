import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default async function CustomerReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const reviews = await prisma.review.findMany({
    where: { customerId: session.user.id },
    include: {
      listing: {
        include: {
          vendorProfile: { select: { businessName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Reviews</h1>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You haven&apos;t written any reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      href={`/vendors/${review.listing.slug}`}
                      className="font-semibold hover:text-primary"
                    >
                      {review.listing.vendorProfile.businessName}
                    </Link>
                    <p className="text-sm text-muted-foreground mb-2">
                      {review.listing.title}
                    </p>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    {review.title && (
                      <p className="font-medium text-sm mb-1">{review.title}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{review.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {review.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
