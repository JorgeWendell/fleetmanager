import { db } from "@/db/index";
import {
  driversTable,
  serviceOrdersTable,
  vehiclesTable,
} from "@/db/schema";
import { eq, and, or, desc } from "drizzle-orm";

import { MotoristasClient } from "./motoristas-client";

async function getDrivers() {
  const drivers = await db.select().from(driversTable);

  const driversWithDetails = await Promise.all(
    drivers.map(async (driver) => {
      let currentVehicle = null;
      if (driver.currentVehicleId) {
        const [vehicle] = await db
          .select()
          .from(vehiclesTable)
          .where(eq(vehiclesTable.id, driver.currentVehicleId))
          .limit(1);
        currentVehicle = vehicle || null;
      }

      return {
        ...driver,
        currentVehicle: currentVehicle,
      };
    })
  );

  return driversWithDetails;
}

export default async function MotoristasPage() {
  const drivers = await getDrivers();

  return <MotoristasClient drivers={drivers} />;
}

