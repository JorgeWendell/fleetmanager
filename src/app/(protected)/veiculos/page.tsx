import { db } from "@/db/index";
import {
  vehiclesTable,
  driversTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

import { VeiculosClient } from "./veiculos-client";

async function getVehicles() {
  const vehicles = await db.select().from(vehiclesTable);

  const vehiclesWithDetails = await Promise.all(
    vehicles.map(async (vehicle) => {
      let currentDriver = null;
      if (vehicle.currentDriverId) {
        const [driver] = await db
          .select()
          .from(driversTable)
          .where(eq(driversTable.id, vehicle.currentDriverId))
          .limit(1);
        currentDriver = driver || null;
      }

      return {
        ...vehicle,
        currentDriver: currentDriver,
      };
    })
  );

  return vehiclesWithDetails;
}

export default async function VeiculosPage() {
  const vehicles = await getVehicles();

  return <VeiculosClient vehicles={vehicles} />;
}

