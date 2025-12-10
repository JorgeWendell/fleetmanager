import { db } from "@/db/index";
import {
  vehiclesTable,
  driversTable,
  maintenancesTable,
  serviceOrdersTable,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Pencil, FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/components/ui/page-container";
import { Badge } from "@/components/ui/badge";

async function getVehicle(id: string) {
  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, id))
    .limit(1);

  return vehicle;
}

async function getVehicleCurrentDriver(vehicleId: string) {
  const vehicle = await getVehicle(vehicleId);
  if (!vehicle || !vehicle.currentDriverId) {
    return null;
  }

  const [driver] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.id, vehicle.currentDriverId))
    .limit(1);

  return driver || null;
}

async function getVehicleServiceOrders(vehicleId: string) {
  const serviceOrders = await db
    .select()
    .from(serviceOrdersTable)
    .where(eq(serviceOrdersTable.vehicleId, vehicleId))
    .orderBy(desc(serviceOrdersTable.createdAt));

  return serviceOrders;
}

async function getVehicleMaintenances(vehicleId: string) {
  const maintenances = await db
    .select()
    .from(maintenancesTable)
    .where(eq(maintenancesTable.vehicleId, vehicleId))
    .orderBy(desc(maintenancesTable.startDate));

  return maintenances;
}

async function getLastAndNextMaintenance(vehicleId: string) {
  const allMaintenances = await db
    .select()
    .from(maintenancesTable)
    .where(eq(maintenancesTable.vehicleId, vehicleId))
    .orderBy(desc(maintenancesTable.startDate));

  const now = new Date();
  const lastMaintenance =
    allMaintenances.find((m) => new Date(m.startDate) <= now) || null;
  const nextMaintenance =
    allMaintenances.find((m) => new Date(m.startDate) > now) || null;

  return {
    last: lastMaintenance,
    next: nextMaintenance,
  };
}

export default async function VeiculoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicle(id);

  if (!vehicle) {
    return (
      <PageContainer>
        <PageContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Veículo não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/veiculos">Voltar</Link>
            </Button>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  const [currentDriver, serviceOrders, maintenances, maintenanceDates] =
    await Promise.all([
      getVehicleCurrentDriver(id),
      getVehicleServiceOrders(id),
      getVehicleMaintenances(id),
      getLastAndNextMaintenance(id),
    ]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberta":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "em_andamento":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "concluida":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelada":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getVehicleStatusColor = (status: string, inMaintenance: boolean) => {
    if (inMaintenance) {
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    }
    switch (status) {
      case "disponivel":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "em_uso":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "manutencao":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "inativo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getVehicleStatusText = (status: string, inMaintenance: boolean) => {
    if (inMaintenance) {
      return "Manutenção";
    }
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/veiculos">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">Voltar</span>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="space-y-6">
        {/* Main Vehicle Information Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <p className="text-sm text-muted-foreground mb-4">
                  Placa: {vehicle.plate}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${getVehicleStatusColor(
                    vehicle.status,
                    vehicle.inMaintenance
                  )} border-0`}
                >
                  {getVehicleStatusText(vehicle.status, vehicle.inMaintenance)}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/veiculos/${vehicle.id}/editar`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ano</p>
                  <p className="font-medium">{vehicle.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cor</p>
                  <p className="font-medium">{vehicle.color || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Categoria</p>
                  <p className="font-medium">{vehicle.category || "Leve"}</p>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Quilometragem
                  </p>
                  <p className="font-medium">
                    {vehicle.mileage.toLocaleString("pt-BR")} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Tipo de Combustível
                  </p>
                  <p className="font-medium capitalize">{vehicle.fuelType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Motorista</p>
                  {currentDriver ? (
                    <Link
                      href={`/motoristas/${currentDriver.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium block"
                    >
                      {currentDriver.name}
                    </Link>
                  ) : (
                    <p className="text-muted-foreground">Nenhum motorista</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Última Manutenção
                  </p>
                  <p className="font-medium">
                    {maintenanceDates.last
                      ? formatDate(maintenanceDates.last.startDate)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Próxima Manutenção
                  </p>
                  <p className="font-medium">
                    {maintenanceDates.next
                      ? formatDate(maintenanceDates.next.startDate)
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>Ordens de Serviço</CardTitle>
            <Button size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Nova OS
            </Button>
          </CardHeader>
          <CardContent>
            {serviceOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma ordem de serviço encontrada
              </div>
            ) : (
              <div className="space-y-4">
                {serviceOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{order.number}</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        {order.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Criado em: {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <Badge
                      className={`${getStatusColor(order.status)} border-0`}
                    >
                      {formatStatus(order.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance History Card */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Manutenções</CardTitle>
          </CardHeader>
          <CardContent>
            {maintenances.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma manutenção encontrada
              </div>
            ) : (
              <div className="space-y-4">
                {maintenances.map((maintenance) => (
                  <div
                    key={maintenance.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="border-0 bg-gray-100">
                            {maintenance.type.charAt(0).toUpperCase() +
                              maintenance.type.slice(1)}
                          </Badge>
                        </div>
                        <p className="font-medium mb-2">
                          {maintenance.description}
                        </p>
                      </div>
                      {maintenance.cost && (
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {formatCurrency(Number(maintenance.cost))}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Data</p>
                        <p className="font-medium">
                          {formatDate(maintenance.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">KM</p>
                        <p className="font-medium">
                          {maintenance.mileage.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Oficina</p>
                        <p className="font-medium">
                          {maintenance.provider || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Mecânico</p>
                        <p className="font-medium">
                          {maintenance.mechanic || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}
