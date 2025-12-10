"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { serviceOrdersTable, maintenancesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateServiceOrderStatusSchema } from "./schema";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Mapear tipo de ordem de serviço para tipo de manutenção
function mapServiceOrderTypeToMaintenanceType(
  serviceOrderType: string
): "preventiva" | "corretiva" | "revisao" {
  switch (serviceOrderType) {
    case "preventiva":
      return "preventiva";
    case "corretiva":
      return "corretiva";
    case "preditiva":
      // Preditiva não existe em manutenções, mapear para preventiva
      return "preventiva";
    default:
      return "corretiva";
  }
}

export const updateServiceOrderStatusAction = actionClient
  .schema(updateServiceOrderStatusSchema)
  .action(async ({ parsedInput }) => {
    // Buscar a ordem de serviço atual
    const [serviceOrder] = await db
      .select()
      .from(serviceOrdersTable)
      .where(eq(serviceOrdersTable.id, parsedInput.serviceOrderId))
      .limit(1);

    if (!serviceOrder) {
      return { serverError: "Ordem de serviço não encontrada" };
    }

    // Atualizar a ordem de serviço
    await db
      .update(serviceOrdersTable)
      .set({
        status: parsedInput.status,
        validatedBy: parsedInput.validatedBy || null,
        validationDate: parsedInput.validationDate || null,
        endDate: parsedInput.status === "concluida" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(serviceOrdersTable.id, parsedInput.serviceOrderId));

    // Se o status for "concluida" ou "cancelada", criar uma manutenção
    if (parsedInput.status === "concluida" || parsedInput.status === "cancelada") {
      // Verificar se já existe uma manutenção com os mesmos dados
      // (para evitar duplicatas se o status for alterado novamente)
      const existingMaintenances = await db
        .select()
        .from(maintenancesTable)
        .where(eq(maintenancesTable.vehicleId, serviceOrder.vehicleId));

      // Verificar se já existe uma manutenção com a mesma descrição e data de início
      // Comparar datas com tolerância de 1 segundo para evitar problemas de precisão
      const serviceOrderStartTime = new Date(serviceOrder.startDate).getTime();
      const alreadyExists = existingMaintenances.some((m) => {
        const maintenanceStartTime = new Date(m.startDate).getTime();
        const timeDiff = Math.abs(serviceOrderStartTime - maintenanceStartTime);
        return (
          m.description === serviceOrder.description && timeDiff < 1000
        );
      });

      // Criar a manutenção apenas se não existir uma duplicata
      if (!alreadyExists) {
        const maintenanceId = generateId();
        const endDate =
          parsedInput.status === "concluida"
            ? parsedInput.validationDate || new Date()
            : null;

        await db.insert(maintenancesTable).values({
          id: maintenanceId,
          vehicleId: serviceOrder.vehicleId,
          type: mapServiceOrderTypeToMaintenanceType(serviceOrder.type),
          description: serviceOrder.description,
          cost: serviceOrder.estimatedCost || null,
          mileage: serviceOrder.currentMileage
            ? parseInt(serviceOrder.currentMileage)
            : 0,
          startDate: serviceOrder.startDate,
          endDate: endDate,
          mechanic: serviceOrder.mechanic || null,
          provider: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return { success: true };
  });

