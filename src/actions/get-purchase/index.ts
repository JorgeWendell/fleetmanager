"use server";

import { db } from "@/db/index";
import { purchasesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getPurchaseAction(id: string) {
  const [purchase] = await db
    .select()
    .from(purchasesTable)
    .where(eq(purchasesTable.id, id))
    .limit(1);

  if (!purchase) {
    return { error: "Solicitação de compra não encontrada" };
  }

  return { purchase };
}

