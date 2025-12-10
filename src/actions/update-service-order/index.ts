"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { serviceOrdersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateServiceOrderSchema } from "./schema";

export const updateServiceOrderAction = actionClient
  .schema(updateServiceOrderSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(serviceOrdersTable)
      .set({
        vehicleId: parsedInput.vehicleId,
        type: parsedInput.type,
        priority: parsedInput.priority,
        currentMileage: parsedInput.currentMileage?.toString() || null,
        mechanic: parsedInput.mechanic || null,
        description: parsedInput.description,
        scheduledDate: parsedInput.scheduledDate
          ? new Date(parsedInput.scheduledDate)
          : null,
        estimatedCost: parsedInput.estimatedCost?.toString() || null,
        updatedAt: new Date(),
      })
      .where(eq(serviceOrdersTable.id, parsedInput.id));

    return { success: true };
  });

