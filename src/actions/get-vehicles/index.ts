"use server";

import { db } from "@/db/index";
import { vehiclesTable } from "@/db/schema";

export async function getVehiclesAction() {
  const vehicles = await db.select({
    id: vehiclesTable.id,
    plate: vehiclesTable.plate,
    brand: vehiclesTable.brand,
    model: vehiclesTable.model,
  }).from(vehiclesTable);

  return { vehicles };
}
