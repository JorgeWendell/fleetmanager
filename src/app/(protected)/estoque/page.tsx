import { db } from "@/db/index";
import { inventoryTable, suppliersTable } from "@/db/schema";
import { eq, sql, and, isNotNull, lte, or, isNull } from "drizzle-orm";
import { EstoqueClient } from "./estoque-client";

async function getInventory() {
  const items = await db
    .select({
      inventory: inventoryTable,
      supplier: suppliersTable,
    })
    .from(inventoryTable)
    .leftJoin(suppliersTable, eq(inventoryTable.supplierId, suppliersTable.id));

  return items.map((item) => ({
    ...item.inventory,
    supplier: item.supplier,
  }));
}

async function getInventoryStats() {
  const [totalItems, totalValue, lowStockCount, outOfStockCount] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(DISTINCT ${inventoryTable.id})` })
        .from(inventoryTable),
      db
        .select({
          total: sql<number>`COALESCE(SUM(CAST(${inventoryTable.quantity} AS DECIMAL) * CAST(${inventoryTable.unitCost} AS DECIMAL)), 0)`,
        })
        .from(inventoryTable),
      db
        .select({ count: sql<number>`count(*)` })
        .from(inventoryTable)
        .where(
          and(
            isNotNull(inventoryTable.minQuantity),
            lte(
              sql`CAST(${inventoryTable.quantity} AS DECIMAL)`,
              sql`CAST(${inventoryTable.minQuantity} AS DECIMAL)`
            ),
            sql`CAST(${inventoryTable.quantity} AS DECIMAL) > 0`
          )
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(inventoryTable)
        .where(
          or(
            sql`CAST(${inventoryTable.quantity} AS DECIMAL) = 0`,
            isNull(inventoryTable.quantity)
          )
        ),
    ]);

  return {
    totalItems: Number(totalItems[0]?.count || 0),
    totalValue: Number(totalValue[0]?.total || 0),
    lowStockCount: Number(lowStockCount[0]?.count || 0),
    outOfStockCount: Number(outOfStockCount[0]?.count || 0),
  };
}

export default async function EstoquePage() {
  const inventory = await getInventory();
  const stats = await getInventoryStats();

  return <EstoqueClient inventory={inventory} stats={stats} />;
}
