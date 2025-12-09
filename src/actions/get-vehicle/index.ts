"use server";

import { db } from "@/db/index";
import { vehiclesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getVehicleAction(id: string) {
  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, id))
    .limit(1);

  if (!vehicle) {
    return { error: "Veículo não encontrado" };
  }

  return { vehicle };
}

