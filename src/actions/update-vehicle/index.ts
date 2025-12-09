"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { vehiclesTable, driversTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateVehicleSchema } from "./schema";

export const updateVehicleAction = actionClient
  .schema(updateVehicleSchema)
  .action(async ({ parsedInput }) => {
    // Buscar o veículo atual para ver qual motorista estava atribuído antes
    const [currentVehicle] = await db
      .select()
      .from(vehiclesTable)
      .where(eq(vehiclesTable.id, parsedInput.id))
      .limit(1);

    // Determinar o status baseado na atribuição do motorista
    let finalStatus = parsedInput.status;
    if (parsedInput.currentDriverId) {
      // Se há um motorista atribuído, status deve ser "em_uso"
      finalStatus = "em_uso";
    } else if (!parsedInput.inMaintenance) {
      // Se não há motorista e não está em manutenção, pode voltar para "disponivel"
      // Mas só se o status atual não for "manutencao" ou "inativo"
      if (parsedInput.status !== "manutencao" && parsedInput.status !== "inativo") {
        finalStatus = "disponivel";
      }
    }

    // Atualizar o veículo
    await db
      .update(vehiclesTable)
      .set({
        plate: parsedInput.plate.toUpperCase(),
        brand: parsedInput.brand,
        model: parsedInput.model,
        year: parsedInput.year,
        color: parsedInput.color || null,
        chassis: parsedInput.chassis || null,
        renavam: parsedInput.renavam || null,
        mileage: parsedInput.mileage,
        fuelType: parsedInput.fuelType,
        status: finalStatus,
        inMaintenance: parsedInput.inMaintenance,
        currentDriverId: parsedInput.currentDriverId || null,
        lastMaintenance: parsedInput.lastMaintenance || null,
        nextMaintenance: parsedInput.nextMaintenance || null,
        updatedAt: new Date(),
      })
      .where(eq(vehiclesTable.id, parsedInput.id));

    // Se havia um motorista anterior, remover a referência
    if (currentVehicle?.currentDriverId && currentVehicle.currentDriverId !== parsedInput.currentDriverId) {
      await db
        .update(driversTable)
        .set({
          currentVehicleId: null,
          updatedAt: new Date(),
        })
        .where(eq(driversTable.id, currentVehicle.currentDriverId));
    }

    // Se há um novo motorista, atualizar o motorista também
    if (parsedInput.currentDriverId) {
      await db
        .update(driversTable)
        .set({
          currentVehicleId: parsedInput.id,
          updatedAt: new Date(),
        })
        .where(eq(driversTable.id, parsedInput.currentDriverId));
    }

    return { success: true };
  });

