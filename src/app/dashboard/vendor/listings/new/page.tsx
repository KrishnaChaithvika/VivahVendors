import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ListingForm } from "@/components/vendor/listing-form";

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { currency: true },
  });

  if (!profile) redirect("/dashboard/vendor/profile");

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

  // Flatten terms with their children
  const flatTerms = taxonomyTerms.flatMap((term) => [
    { id: term.id, name: term.name, slug: term.slug, typeName: term.taxonomyType.name },
    ...term.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      typeName: child.taxonomyType.name,
    })),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>
      <ListingForm
        categories={categories}
        taxonomyTerms={flatTerms}
        defaultCurrency={profile.currency}
      />
    </div>
  );
}
