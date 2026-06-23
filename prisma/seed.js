/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding...");

  // Delete all existing preorders
  await prisma.preorder.deleteMany({});
  console.log("Cleared existing preorders.");

  // Insert mock preorders
  const preorders = [
    {
      name: "Multi variant 3",
      products: 1,
      preorderWhen: "out-of-stock",
      startsAt: new Date("2025-12-15T20:24:00"),
      endsAt: null,
      status: false,
    },
    {
      name: "Multi variant 2",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: new Date("2025-12-15T20:24:00"),
      endsAt: new Date("2025-12-15T20:27:00"),
      status: true,
    },
    {
      name: "Multi variants 1",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: new Date("2025-12-15T20:24:00"),
      endsAt: null,
      status: true,
    },
    {
      name: "Partial payment",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: new Date("2025-08-17T16:56:00"),
      endsAt: null,
      status: true,
    },
    {
      name: "Shipping not sure",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: new Date("2025-08-17T16:56:00"),
      endsAt: null,
      status: true,
    },
    {
      name: "Full payment",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: new Date("2025-08-17T16:56:00"),
      endsAt: null,
      status: true,
    },
    {
      name: "Coming soon",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: new Date("2025-12-11T04:42:00"),
      endsAt: null,
      status: true,
    },
    {
      name: "With ends",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: new Date("2025-08-14T15:59:00"),
      endsAt: null,
      status: true,
    },
  ];

  for (const preorder of preorders) {
    const created = await prisma.preorder.create({
      data: preorder,
    });
    console.log(`Created preorder: ${created.name}`);
  }

  console.log("Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
