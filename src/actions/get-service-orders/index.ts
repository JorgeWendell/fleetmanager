"use server";

import { db } from "@/db/index";
import { serviceOrdersTable } from "@/db/schema";

export async function getServiceOrdersAction() {
  const serviceOrders = await db
    .select({
      id: serviceOrdersTable.id,
      number: serviceOrdersTable.number,
    })
    .from(serviceOrdersTable)
    .orderBy(serviceOrdersTable.number);

  return { serviceOrders };
}

