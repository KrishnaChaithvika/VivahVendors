import { prisma } from "@/lib/db";

export async function getTaxonomyTypes() {
  return prisma.taxonomyType.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      terms: {
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: "asc" },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });
}

export async function getTermsByType(typeName: string) {
  return prisma.taxonomyTerm.findMany({
    where: {
      isActive: true,
      taxonomyType: { name: typeName },
      parentId: null,
    },
    orderBy: { sortOrder: "asc" },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
