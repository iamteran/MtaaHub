const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const del = await prisma.listing.deleteMany({ where: { OR: [{ title: { startsWith: "E2E " } }, { title: { startsWith: "Debug " } }, { title: { startsWith: "Trace " } }] } });
  const locs = await prisma.location.deleteMany({ where: { town: "Kileleshwa", estate: "" } });
  console.log("deleted listings:", del.count, "stray locations:", locs.count);
  await prisma.$disconnect();
})();
