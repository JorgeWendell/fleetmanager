"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { driversTable, vehiclesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateDriverSchema } from "./schema";

export const updateDriverAction = actionClient
  .schema(updateDriverSchema)
  .action(async ({ parsedInput }) => {
    // Buscar o motorista atual para ver qual veículo estava atribuído antes
    const [currentDriver] = await db
      .select()
      .from(driversTable)
      .where(eq(driversTable.id, parsedInput.id))
      .limit(1);

    // Atualizar o motorista
    await db
      .update(driversTable)
      .set({
        name: parsedInput.name,
        cpf: parsedInput.cpf,
        cnh: parsedInput.cnh,
        cnhCategory: parsedInput.cnhCategory,
        cnhExpiry: parsedInput.cnhExpiry,
        phone: parsedInput.phone || null,
        email: parsedInput.email || null,
        address: parsedInput.address || null,
        status: parsedInput.status,
        currentVehicleId: parsedInput.currentVehicleId || null,
        updatedAt: new Date(),
      })
      .where(eq(driversTable.id, parsedInput.id));

    // Se havia um veículo anterior, remover a referência e atualizar status
    if (currentDriver?.currentVehicleId && currentDriver.currentVehicleId !== parsedInput.currentVehicleId) {
      await db
        .update(vehiclesTable)
        .set({
          currentDriverId: null,
          status: "disponivel",
          updatedAt: new Date(),
        })
        .where(eq(vehiclesTable.id, currentDriver.currentVehicleId));
    }

    // Se há um novo veículo, atualizar o veículo também e mudar status para "em_uso"
    if (parsedInput.currentVehicleId) {
      await db
        .update(vehiclesTable)
        .set({
          currentDriverId: parsedInput.id,
          status: "em_uso",
          updatedAt: new Date(),
        })
        .where(eq(vehiclesTable.id, parsedInput.currentVehicleId));
    }

    return { success: true };
  });

