"use server";

import { db } from "@/db/index";
import { driversTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getDriverAction(id: string) {
  const [driver] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.id, id))
    .limit(1);

  if (!driver) {
    return { error: "Motorista não encontrado" };
  }

  return { driver };
}

