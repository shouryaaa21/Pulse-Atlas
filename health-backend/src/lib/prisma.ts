import { PrismaClient } from "@prisma/client";

// Reuse one Prisma client across the app instead of creating a new one
// per request.
export const prisma = new PrismaClient();
