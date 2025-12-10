"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { inventoryTable } from "@/db/schema";
import { updateInventorySchema } from "./schema";
import { eq } from "drizzle-orm";

export const updateInventoryAction = actionClient
  .schema(updateInventorySchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(inventoryTable)
      .set({
        codFabricante: parsedInput.codFabricante || null,
        name: parsedInput.name,
        code: parsedInput.code || null,
        description: parsedInput.observations || null, // 'code' from form maps to 'description' in DB
        observations: parsedInput.observations || null,
        category: parsedInput.category,
        unit: parsedInput.unit,
        quantity: parsedInput.quantity.toString(),
        minQuantity: parsedInput.minQuantity ? parsedInput.minQuantity.toString() : null,
        maxQuantity: parsedInput.maxQuantity ? parsedInput.maxQuantity.toString() : null,
        unitCost: parsedInput.unitCost ? parsedInput.unitCost.toString() : null,
        location: parsedInput.location || null,
        supplierId: parsedInput.supplierId || null,
        lastPurchase: parsedInput.lastPurchase ? new Date(parsedInput.lastPurchase) : null,
        updatedAt: new Date(),
      })
      .where(eq(inventoryTable.id, parsedInput.id));

    return { success: true };
  });

