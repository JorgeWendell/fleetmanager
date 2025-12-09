"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { suppliersTable } from "@/db/schema";
import { createSupplierSchema } from "./schema";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export const createSupplierAction = actionClient
  .schema(createSupplierSchema)
  .action(async ({ parsedInput }) => {
    const id = generateId();

    await db.insert(suppliersTable).values({
      id,
      name: parsedInput.name,
      cnpj: parsedInput.cnpj || null,
      phone: parsedInput.phone || null,
      email: parsedInput.email || null,
      address: parsedInput.address || null,
      contactPerson: parsedInput.contactPerson || null,
      category: parsedInput.category || null,
      website: parsedInput.website || null,
      paymentTerms: parsedInput.paymentTerms || null,
      deliveryDays: parsedInput.deliveryDays || null,
      observations: parsedInput.observations || null,
      isActive: parsedInput.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, id };
  });

