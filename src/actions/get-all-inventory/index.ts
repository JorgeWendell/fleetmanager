"use server";

import { db } from "@/db/index";
import { inventoryTable } from "@/db/schema";

export async function getAllInventoryAction() {
  const items = await db
    .select({
      id: inventoryTable.id,
      name: inventoryTable.name,
      code: inventoryTable.code,
      quantity: inventoryTable.quantity,
    })
    .from(inventoryTable)
    .orderBy(inventoryTable.name);

  return { items };
}

