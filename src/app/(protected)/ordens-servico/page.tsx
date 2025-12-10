import { db } from "@/db/index";
import { serviceOrdersTable, vehiclesTable, driversTable } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { OrdensServicoClient } from "./ordens-servico-client";

async function getServiceOrders() {
  return await db
    .select({
      serviceOrder: serviceOrdersTable,
      vehicle: vehiclesTable,
      driver: driversTable,
    })
    .from(serviceOrdersTable)
    .leftJoin(vehiclesTable, eq(serviceOrdersTable.vehicleId, vehiclesTable.id))
    .leftJoin(driversTable, eq(serviceOrdersTable.driverId, driversTable.id))
    .where(
      and(
        ne(serviceOrdersTable.status, "concluida"),
        ne(serviceOrdersTable.status, "cancelada")
      )
    );
}

export default async function OrdensServicoPage() {
  const serviceOrders = await getServiceOrders();

  return <OrdensServicoClient serviceOrders={serviceOrders} />;
}

