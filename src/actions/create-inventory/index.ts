"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { inventoryTable } from "@/db/schema";
import { createInventorySchema } from "./schema";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export const createInventoryAction = actionClient
  .schema(createInventorySchema)
  .action(async ({ parsedInput }) => {
    const id = generateId();

    await db.insert(inventoryTable).values({
      id,
      codFabricante: parsedInput.codFabricante,
      name: parsedInput.name,
      code: parsedInput.code || null,
      description: parsedInput.observations || null,
      observations: parsedInput.observations || null,
      category: parsedInput.category,
      unit: parsedInput.unit,
      quantity: parsedInput.quantity,
      minQuantity: parsedInput.minQuantity || null,
      maxQuantity: parsedInput.maxQuantity || null,
      unitCost: parsedInput.unitCost || null,
      location: parsedInput.location || null,
      supplierId: parsedInput.supplierId || null,
      lastPurchase: parsedInput.lastPurchase ? new Date(parsedInput.lastPurchase) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, id };
  });

