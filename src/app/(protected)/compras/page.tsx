import { db } from "@/db/index";
import { purchasesTable, suppliersTable, inventoryTable } from "@/db/schema";
import { eq, and, sql, isNotNull, lte, or, desc, ne } from "drizzle-orm";
import { ComprasClient } from "./compras-client";

async function getPurchases() {
  return await db
    .select({
      purchase: purchasesTable,
      supplier: suppliersTable,
      inventory: inventoryTable,
    })
    .from(purchasesTable)
    .leftJoin(suppliersTable, eq(purchasesTable.supplierId, suppliersTable.id))
    .leftJoin(inventoryTable, eq(purchasesTable.inventoryId, inventoryTable.id))
    .where(ne(purchasesTable.status, "recebida"))
    .orderBy(desc(purchasesTable.createdAt));
}

async function getPurchaseStats() {
  // Excluir compras recebidas das estatísticas
  const [total] = await db
    .select({ count: sql<number>`count(*)` })
    .from(purchasesTable)
    .where(ne(purchasesTable.status, "recebida"));

  const [pending] = await db
    .select({ count: sql<number>`count(*)` })
    .from(purchasesTable)
    .where(eq(purchasesTable.status, "pendente"));

  // Urgentes: compras pendentes com valor alto ou sem data de entrega definida
  // Por enquanto, vamos considerar como urgentes as pendentes sem data de entrega
  const [urgent] = await db
    .select({ count: sql<number>`count(*)` })
    .from(purchasesTable)
    .where(
      and(
        eq(purchasesTable.status, "pendente"),
        sql`${purchasesTable.deliveryDate} IS NULL`
      )
    );

  // Calcular valor total de todas as compras (exceto recebidas)
  // Se totalAmount for 0, calcular baseado em quantity × unitCost do inventory
  const allPurchases = await db
    .select({
      purchase: purchasesTable,
      inventory: inventoryTable,
    })
    .from(purchasesTable)
    .leftJoin(inventoryTable, eq(purchasesTable.inventoryId, inventoryTable.id))
    .where(ne(purchasesTable.status, "recebida"));

  let totalValue = 0;
  for (const item of allPurchases) {
    const totalAmount = parseFloat(item.purchase.totalAmount || "0");
    if (totalAmount > 0) {
      totalValue += totalAmount;
    } else if (item.inventory) {
      // Calcular: quantidade × valor unitário
      const quantity = parseFloat(item.purchase.quantity || "0");
      const unitCost = parseFloat(item.inventory.unitCost || "0");
      totalValue += quantity * unitCost;
    }
  }

  // Buscar itens com estoque baixo
  const [lowStock] = await db
    .select({ count: sql<number>`count(*)` })
    .from(inventoryTable)
    .where(
      or(
        eq(sql`CAST(${inventoryTable.quantity} AS DECIMAL)`, sql`0`),
        and(
          isNotNull(inventoryTable.minQuantity),
          lte(
            sql`CAST(${inventoryTable.quantity} AS DECIMAL)`,
            sql`CAST(${inventoryTable.minQuantity} AS DECIMAL)`
          )
        )
      )
    );

  return {
    total: Number(total.count) || 0,
    pending: Number(pending.count) || 0,
    urgent: Number(urgent.count) || 0,
    totalValue: totalValue,
    lowStock: Number(lowStock.count) || 0,
  };
}

export default async function ComprasPage() {
  const purchases = await getPurchases();
  const stats = await getPurchaseStats();

  return <ComprasClient purchases={purchases} stats={stats} />;
}
