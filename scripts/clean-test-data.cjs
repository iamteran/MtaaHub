const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const del = await prisma.listing.deleteMany({ where: { title: { startsWith: "E2E " } } });
  console.log("deleted test listings:", del.count);
  await prisma.$disconnect();
})();
