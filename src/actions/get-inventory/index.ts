"use server";

import { db } from "@/db/index";
import { inventoryTable, suppliersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getInventoryAction(id: string) {
  const [item] = await db
    .select({
      inventory: inventoryTable,
      supplier: suppliersTable,
    })
    .from(inventoryTable)
    .leftJoin(suppliersTable, eq(inventoryTable.supplierId, suppliersTable.id))
    .where(eq(inventoryTable.id, id))
    .limit(1);

  if (!item) {
    return { error: "Item não encontrado" };
  }

  return {
    inventory: {
      ...item.inventory,
      supplier: item.supplier,
    },
  };
}

