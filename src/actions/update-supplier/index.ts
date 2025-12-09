"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { suppliersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateSupplierSchema } from "./schema";

export const updateSupplierAction = actionClient
  .schema(updateSupplierSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(suppliersTable)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(suppliersTable.id, parsedInput.id));

    return { success: true };
  });

