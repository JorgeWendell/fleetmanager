"use server";

import { db } from "@/db/index";
import { driversTable } from "@/db/schema";

export async function getDriversAction() {
  const drivers = await db.select({
    id: driversTable.id,
    name: driversTable.name,
    cnh: driversTable.cnh,
  }).from(driversTable);

  return { drivers };
}

