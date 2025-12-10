"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  purchasesTable,
  inventoryTable,
  serviceOrderItemsTable,
  serviceOrdersTable,
} from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { createPurchaseRequestSchema } from "./schema";

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

async function generatePurchaseNumber() {
  // Buscar a última solicitação de compra
  const lastPurchase = await db
    .select()
    .from(purchasesTable)
    .orderBy(desc(purchasesTable.createdAt))
    .limit(1);

  if (lastPurchase.length > 0 && lastPurchase[0].number) {
    // Extrair o número da última solicitação (ex: "PR-003" -> 3)
    const match = lastPurchase[0].number.match(/PR-(\d+)/);
    if (match) {
      const lastNumber = parseInt(match[1], 10);
      const newNumber = lastNumber + 1;
      return `PR-${newNumber.toString().padStart(3, "0")}`;
    }
  }

  // Se não houver solicitação anterior, começar do 001
  return "PR-001";
}

export const createPurchaseRequestAction = actionClient
  .schema(createPurchaseRequestSchema)
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

    const id = generateId();
    const number = await generatePurchaseNumber();

    // Calcular valor total: quantidade × valor unitário
    const unitCost = inventory.unitCost ? parseFloat(inventory.unitCost) : 0;
    const totalAmount = parsedInput.quantity * unitCost;

    await db.insert(purchasesTable).values({
      id,
      number,
      inventoryId: parsedInput.inventoryId,
      serviceOrderId: parsedInput.serviceOrderId || null,
      supplierId: parsedInput.supplierId || null,
      urgency: parsedInput.urgency,
      quantity: parsedInput.quantity.toString(),
      status: "pendente",
      totalAmount: totalAmount.toString(),
      purchaseDate: new Date(),
      notes: parsedInput.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Se houver serviceOrderId, criar o item na ordem de serviço vinculado à solicitação de compra
    if (parsedInput.serviceOrderId) {
      const itemId = generateId();

      await db.insert(serviceOrderItemsTable).values({
        id: itemId,
        serviceOrderId: parsedInput.serviceOrderId,
        inventoryId: parsedInput.inventoryId,
        description: inventory.name,
        requiredQuantity: parsedInput.quantity.toString(),
        purchaseRequestId: id, // Vincular a solicitação de compra ao item
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Recalcular o custo estimado da ordem de serviço
      await recalculateEstimatedCost(parsedInput.serviceOrderId);
    }

    return { success: true, id };
  });

