"use server";

import { db } from "@/db/index";
import { serviceOrdersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getServiceOrderAction(id: string) {
  const [serviceOrder] = await db
    .select()
    .from(serviceOrdersTable)
    .where(eq(serviceOrdersTable.id, id))
    .limit(1);

  if (!serviceOrder) {
    return { error: "Ordem de serviço não encontrada" };
  }

  return { serviceOrder };
}

