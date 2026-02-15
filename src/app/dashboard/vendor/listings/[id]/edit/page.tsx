import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ListingForm } from "@/components/vendor/listing-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const listing = await prisma.vendorListing.findUnique({
    where: { id },
    include: {
      vendorProfile: { select: { userId: true, currency: true } },
      categories: { select: { categoryId: true } },
      culturalTags: { select: { taxonomyTermId: true } },
    },
  });

  if (!listing || listing.vendorProfile.userId !== session.user.id) {
    notFound();
  }

  const [categories, taxonomyTerms] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.taxonomyTerm.findMany({
      where: { isActive: true, parentId: null },
      include: {
        taxonomyType: { select: { name: true } },
        children: {
          where: { isActive: true },
          include: { taxonomyType: { select: { name: true } } },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const flatTerms = taxonomyTerms.flatMap((term) => [
    { id: term.id, name: term.name, slug: term.slug, typeName: term.taxonomyType.name },
    ...term.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      typeName: child.taxonomyType.name,
    })),
  ]);

  const existingData = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    priceType: listing.priceType,
    priceMin: listing.priceMin ? Number(listing.priceMin) : null,
    priceMax: listing.priceMax ? Number(listing.priceMax) : null,
    currency: listing.currency,
    priceUnit: listing.priceUnit,
    externalPurchaseUrl: listing.externalPurchaseUrl,
    isPublished: listing.isPublished,
    categoryIds: listing.categories.map((c) => c.categoryId),
    culturalTagIds: listing.culturalTags.map((t) => t.taxonomyTermId),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>
      <ListingForm
        categories={categories}
        taxonomyTerms={flatTerms}
        existing={existingData}
        defaultCurrency={listing.vendorProfile.currency}
      />
    </div>
  );
}
