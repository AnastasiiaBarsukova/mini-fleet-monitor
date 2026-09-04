import "dotenv/config";
import bcrypt from "bcryptjs";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("test123", 12);

  await prisma.user.upsert({
    where: {
      email: "admin@test.com",
    },
    update: {},
    create: {
      email: "admin@test.com",
      passwordHash,
    },
  });

  const robotCount = await prisma.robot.count();

  if (robotCount === 0) {
    await prisma.robot.createMany({
      data: [
        {
          name: "Robot 01",
          status: "idle",
          lat: 52.52,
          lon: 13.405,
        },
        {
          name: "Robot 02",
          status: "moving",
          lat: 52.515,
          lon: 13.41,
        },
        {
          name: "Robot 03",
          status: "idle",
          lat: 52.525,
          lon: 13.395,
        },
      ],
    });
  }


  console.log("Seed completed");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });