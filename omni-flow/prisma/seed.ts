import * as dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is missing from your .env file!",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.board.deleteMany({});

  const board = await prisma.board.create({
    data: {
      title: "Product Development Workspace",
      columns: {
        create: [
          {
            title: "Backlog",
            tasks: {
              create: [
                {
                  title: "Implement Auth Middleware",
                  position: "U",
                  content: "Secure system endpoints.",
                },
                {
                  title: "Fix Memory Leak in Sidebar",
                  position: "V",
                  content: "Debug re-render loop.",
                },
              ],
            },
          },
          {
            title: "In Progress",
            tasks: {
              create: [
                {
                  title: "Configure TanStack Cache Engine",
                  position: "U",
                  content: "Integrate with Dexie storage.",
                },
              ],
            },
          },
          {
            title: "Done",
            tasks: {
              create: [
                {
                  title: "Initialize Docker Container",
                  position: "U",
                  content: "Spin up isolated Postgres image.",
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`Database seeded successfully! Active Board ID: ${board.id}`);
}

main()
  .catch((e) => {
    console.error("Error executing seed script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
