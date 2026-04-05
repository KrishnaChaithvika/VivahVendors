process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://vivah:vivah_dev_password@localhost:5432/vivahvendors?schema=public&connect_timeout=3";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const byCategory = await prisma.vendorListingCategory.groupBy({
    by: ['categoryId'],
    _count: true,
  });
  const cats = await prisma.category.findMany({ where: { id: { in: byCategory.map(b => b.categoryId) } } });
  const catMap = Object.fromEntries(cats.map(c => [c.id, c.name]));

  console.log('=== By Category ===');
  byCategory.sort((a,b) => b._count - a._count).forEach(b =>
    console.log(`  ${catMap[b.categoryId]}: ${b._count}`)
  );

  const byCity = await prisma.vendorProfile.groupBy({ by: ['city', 'country'], _count: true, orderBy: { _count: { city: 'desc' } } });
  console.log('\n=== By City ===');
  byCity.forEach(b => console.log(`  ${b.city}, ${b.country}: ${b._count}`));

  const total = await prisma.vendorListing.count({ where: { isPublished: true } });
  const india = await prisma.vendorListing.count({ where: { isPublished: true, vendorProfile: { country: 'IN' } } });
  const mumbai = await prisma.vendorListing.count({ where: { isPublished: true, vendorProfile: { city: { contains: 'mumbai', mode: 'insensitive' } } } });
  const pune = await prisma.vendorListing.count({ where: { isPublished: true, vendorProfile: { city: { contains: 'pune', mode: 'insensitive' } } } });

  console.log(`\n=== Totals ===`);
  console.log(`  Published listings: ${total}`);
  console.log(`  India: ${india} | Mumbai: ${mumbai} | Pune: ${pune}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
