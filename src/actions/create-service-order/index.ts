"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { serviceOrdersTable } from "@/db/schema";
import { createServiceOrderSchema } from "./schema";
import { eq, desc } from "drizzle-orm";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

async function generateServiceOrderNumber() {
  // Buscar o último número de OS para gerar o próximo sequencial
  const lastOrder = await db
    .select({ number: serviceOrdersTable.number })
    .from(serviceOrdersTable)
    .orderBy(desc(serviceOrdersTable.createdAt))
    .limit(1);

  if (lastOrder.length > 0 && lastOrder[0].number) {
    const lastNumber = lastOrder[0].number;
    const match = lastNumber.match(/OS-(\d+)/);
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `OS-${nextNumber.toString().padStart(3, "0")}`;
    }
  }

  // Se não houver OS anterior, começar do 001
  return "OS-001";
}

export const createServiceOrderAction = actionClient
  .schema(createServiceOrderSchema)
  .action(async ({ parsedInput }) => {
    const id = generateId();
    const number = await generateServiceOrderNumber();

    await db.insert(serviceOrdersTable).values({
      id,
      number,
      vehicleId: parsedInput.vehicleId,
      description: parsedInput.description,
      priority: parsedInput.priority,
      type: parsedInput.type,
      currentMileage: parsedInput.currentMileage || null,
      mechanic: parsedInput.mechanic || null,
      scheduledDate: parsedInput.scheduledDate ? new Date(parsedInput.scheduledDate) : null,
      estimatedCost: parsedInput.estimatedCost || null,
      startDate: parsedInput.scheduledDate ? new Date(parsedInput.scheduledDate) : new Date(),
      status: "aberta",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, id };
  });

