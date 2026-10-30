const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const rows = await prisma.listing.findMany({ where: { title: { contains: "Debug" } }, select: { id: true, title: true, createdAt: true } });
  console.log("debug listings:", rows.length, JSON.stringify(rows));
  const loc = await prisma.location.findMany({ where: { town: "Kileleshwa" }, select: { id: true, county: true, town: true, estate: true } });
  console.log("locations:", JSON.stringify(loc));
  const total = await prisma.listing.count();
  console.log("total listings:", total);
  await prisma.$disconnect();
})();
