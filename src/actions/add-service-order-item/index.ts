"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  serviceOrderItemsTable,
  inventoryTable,
  serviceOrdersTable,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { addServiceOrderItemSchema } from "./schema";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function recalculateEstimatedCost(serviceOrderId: string) {
  // Buscar todos os itens da ordem de serviço com seus custos unitários
  const items = await db
    .select({
      requiredQuantity: serviceOrderItemsTable.requiredQuantity,
      unitCost: inventoryTable.unitCost,
    })
    .from(serviceOrderItemsTable)
    .leftJoin(
      inventoryTable,
      eq(serviceOrderItemsTable.inventoryId, inventoryTable.id)
    )
    .where(eq(serviceOrderItemsTable.serviceOrderId, serviceOrderId));

  // Calcular o total: soma de (quantidade × custo unitário) de cada item
  const totalCost = items.reduce((sum, item) => {
    const quantity = parseFloat(item.requiredQuantity || "0");
    const unitCost = parseFloat(item.unitCost || "0");
    return sum + quantity * unitCost;
  }, 0);

  // Atualizar o custo estimado da ordem de serviço
  await db
    .update(serviceOrdersTable)
    .set({
      estimatedCost: totalCost.toString(),
      updatedAt: new Date(),
    })
    .where(eq(serviceOrdersTable.id, serviceOrderId));

  return totalCost;
}

export const addServiceOrderItemAction = actionClient
  .schema(addServiceOrderItemSchema)
  .action(async ({ parsedInput }) => {
    // Buscar o nome da peça do estoque para usar como description
    const [inventory] = await db
      .select()
      .from(inventoryTable)
      .where(eq(inventoryTable.id, parsedInput.inventoryId))
      .limit(1);

    if (!inventory) {
      return { serverError: "Peça não encontrada no estoque" };
    }

    const currentQuantity = parseFloat(inventory.quantity || "0");
    const id = generateId();

    // Inserir o item na ordem de serviço
    await db.insert(serviceOrderItemsTable).values({
      id,
      serviceOrderId: parsedInput.serviceOrderId,
      inventoryId: parsedInput.inventoryId,
      description: inventory.name,
      requiredQuantity: parsedInput.requiredQuantity.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Atualizar a quantidade no estoque (diminuir) apenas se houver estoque disponível
    if (currentQuantity > 0) {
      const newQuantity = Math.max(
        0,
        currentQuantity - parsedInput.requiredQuantity
      );

      await db
        .update(inventoryTable)
        .set({
          quantity: newQuantity.toString(),
          updatedAt: new Date(),
        })
        .where(eq(inventoryTable.id, parsedInput.inventoryId));
    }

    // Recalcular o custo estimado da ordem de serviço
    await recalculateEstimatedCost(parsedInput.serviceOrderId);

    return { success: true, id };
  });

