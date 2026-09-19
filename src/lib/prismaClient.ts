import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const databaseUrl = process?.env?.["DATABASE_URL"];
if (!databaseUrl) {
  throw new Error("YOU MUST PROVIDE A DATABASE URL");
}

const connectionString = `${databaseUrl}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
