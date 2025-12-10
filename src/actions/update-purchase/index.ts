"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { purchasesTable, inventoryTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updatePurchaseSchema } from "./schema";

export const updatePurchaseAction = actionClient
  .schema(updatePurchaseSchema)
  .action(async ({ parsedInput }) => {
    // Buscar o item do estoque para obter informações
    const [inventory] = await db
      .select()
      .from(inventoryTable)
      .where(eq(inventoryTable.id, parsedInput.inventoryId))
      .limit(1);

    if (!inventory) {
      return { serverError: "Item do estoque não encontrado" };
    }

    // Calcular valor total: quantidade × valor unitário
    const unitCost = inventory.unitCost ? parseFloat(inventory.unitCost) : 0;
    const totalAmount = parsedInput.quantity * unitCost;

    await db
      .update(purchasesTable)
      .set({
        inventoryId: parsedInput.inventoryId,
        serviceOrderId: parsedInput.serviceOrderId || null,
        supplierId: parsedInput.supplierId || null,
        urgency: parsedInput.urgency,
        quantity: parsedInput.quantity.toString(),
        totalAmount: totalAmount.toString(),
        notes: parsedInput.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(purchasesTable.id, parsedInput.id));

    return { success: true };
  });

