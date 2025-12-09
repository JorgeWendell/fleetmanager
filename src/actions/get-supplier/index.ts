"use server";

import { db } from "@/db/index";
import { suppliersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getSupplierAction(id: string) {
  const [supplier] = await db
    .select()
    .from(suppliersTable)
    .where(eq(suppliersTable.id, id))
    .limit(1);

  if (!supplier) {
    return { error: "Fornecedor não encontrado" };
  }

  return { supplier };
}

