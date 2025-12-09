"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { driversTable } from "@/db/schema";
import { createDriverSchema } from "./schema";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export const createDriverAction = actionClient
  .schema(createDriverSchema)
  .action(async ({ parsedInput }) => {
    const id = generateId();

    await db.insert(driversTable).values({
      id,
      name: parsedInput.name,
      cpf: parsedInput.cpf,
      cnh: parsedInput.cnh,
      cnhCategory: parsedInput.cnhCategory,
      cnhExpiry: parsedInput.cnhExpiry,
      phone: parsedInput.phone || null,
      email: parsedInput.email || null,
      address: parsedInput.address || null,
      status: parsedInput.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, id };
  });

