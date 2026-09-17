const bcrypt = require("bcryptjs");
const prisma = require("../src/prisma");

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const salesPassword = await bcrypt.hash("Sales@123", 10);

  await prisma.user.upsert({
    where: { email: "admin@erp.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@erp.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "sales@erp.com" },
    update: {},
    create: {
      name: "Sales User",
      email: "sales@erp.com",
      passwordHash: salesPassword,
      role: "SALES",
    },
  });

  console.log("Admin and Sales users created successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });