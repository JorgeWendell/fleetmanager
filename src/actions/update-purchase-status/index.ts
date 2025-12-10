"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  purchasesTable,
  inventoryTable,
  serviceOrderItemsTable,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { updatePurchaseStatusSchema } from "./schema";

export const updatePurchaseStatusAction = actionClient
  .schema(updatePurchaseStatusSchema)
  .action(async ({ parsedInput }) => {
    // Buscar a compra atual para verificar o status anterior
    const [currentPurchase] = await db
      .select()
      .from(purchasesTable)
      .where(eq(purchasesTable.id, parsedInput.purchaseId))
      .limit(1);

    if (!currentPurchase) {
      return { serverError: "Solicitação de compra não encontrada" };
    }

    // Se o status está mudando para "recebida" e não estava "recebida" antes
    if (
      parsedInput.status === "recebida" &&
      currentPurchase.status !== "recebida" &&
      currentPurchase.inventoryId
    ) {
      // Buscar o item do estoque
      const [inventory] = await db
        .select()
        .from(inventoryTable)
        .where(eq(inventoryTable.id, currentPurchase.inventoryId))
        .limit(1);

      if (inventory) {
        // Buscar o item da ordem de serviço vinculado a esta solicitação (se houver)
        let serviceOrderItem = null;
        if (currentPurchase.serviceOrderId) {
          const [item] = await db
            .select()
            .from(serviceOrderItemsTable)
            .where(
              and(
                eq(
                  serviceOrderItemsTable.serviceOrderId,
                  currentPurchase.serviceOrderId
                ),
                eq(
                  serviceOrderItemsTable.purchaseRequestId,
                  currentPurchase.id
                )
              )
            )
            .limit(1);
          serviceOrderItem = item || null;
        }

        // Calcular a quantidade final do estoque
        const currentQuantity = parseFloat(inventory.quantity || "0");
        const purchasedQuantity = parseFloat(currentPurchase.quantity || "0");
        
        // Se houver ordem de serviço vinculada, usar apenas a quantidade necessária
        // Caso contrário, adicionar toda a quantidade comprada
        let finalQuantity: number;
        if (serviceOrderItem) {
          const requiredQuantity = parseFloat(
            serviceOrderItem.requiredQuantity || "0"
          );
          // Adiciona a quantidade comprada e já diminui a quantidade necessária
          finalQuantity = Math.max(0, currentQuantity + purchasedQuantity - requiredQuantity);
        } else {
          // Sem ordem de serviço, adiciona toda a quantidade comprada
          finalQuantity = currentQuantity + purchasedQuantity;
        }

        // Atualizar o estoque em uma única operação
        await db
          .update(inventoryTable)
          .set({
            quantity: finalQuantity.toString(),
            lastPurchase: parsedInput.approvalDate || new Date(),
            updatedAt: new Date(),
          })
          .where(eq(inventoryTable.id, currentPurchase.inventoryId));

        // Se houver ordem de serviço, remover o vínculo com a solicitação de compra
        if (serviceOrderItem) {
          await db
            .update(serviceOrderItemsTable)
            .set({
              purchaseRequestId: null,
              updatedAt: new Date(),
            })
            .where(eq(serviceOrderItemsTable.id, serviceOrderItem.id));
        }
      }
    }

    // Atualizar o status da compra
    await db
      .update(purchasesTable)
      .set({
        status: parsedInput.status,
        approvedBy: parsedInput.approvedBy || null,
        approvalDate: parsedInput.approvalDate || null,
        updatedAt: new Date(),
      })
      .where(eq(purchasesTable.id, parsedInput.purchaseId));

    return { success: true };
  });

