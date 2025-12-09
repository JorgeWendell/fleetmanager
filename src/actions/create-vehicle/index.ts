"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { vehiclesTable } from "@/db/schema";
import { createVehicleSchema } from "./schema";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export const createVehicleAction = actionClient
  .schema(createVehicleSchema)
  .action(async ({ parsedInput }) => {
    const id = generateId();

    await db.insert(vehiclesTable).values({
      id,
      plate: parsedInput.plate.toUpperCase(),
      brand: parsedInput.brand,
      model: parsedInput.model,
      year: parsedInput.year,
      color: parsedInput.color || null,
      chassis: parsedInput.chassis || null,
      renavam: parsedInput.renavam || null,
      mileage: parsedInput.mileage,
      fuelType: parsedInput.fuelType,
      inMaintenance: parsedInput.inMaintenance,
      status: "disponivel",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, id };
  });

