import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
  adapter,
});

const connectDB = async () => {
    try{
        await prisma.$connect();
        console.log("DB connected")
    } catch(error) {
        if (error instanceof Error) {
            console.error(`Database connection error: ${error.message}`);
        } else {
            console.error("Unknown database connection error:", error);
        }
        process.exit(1);
    }
};

const disconnectDB = async () => {
        await prisma.$disconnect();
}
export {connectDB, disconnectDB}