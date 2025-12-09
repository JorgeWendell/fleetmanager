"use server";

import { db } from "@/db/index";
import { suppliersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getSuppliersAction() {
  const suppliers = await db
    .select({
      id: suppliersTable.id,
      name: suppliersTable.name,
    })
    .from(suppliersTable)
    .where(eq(suppliersTable.isActive, true));

  return { suppliers };
}

