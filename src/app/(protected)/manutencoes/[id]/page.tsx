import { db } from "@/db/index";
import {
  maintenancesTable,
  vehiclesTable,
  serviceOrdersTable,
  serviceOrderItemsTable,
  inventoryTable,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PDFButtonWrapper } from "./components/pdf-button-wrapper";

async function getMaintenance(id: string) {
  const [maintenance] = await db
    .select({
      maintenance: maintenancesTable,
      vehicle: vehiclesTable,
    })
    .from(maintenancesTable)
    .leftJoin(vehiclesTable, eq(maintenancesTable.vehicleId, vehiclesTable.id))
    .where(eq(maintenancesTable.id, id))
    .limit(1);

  return maintenance;
}

async function getMaintenanceServiceOrderItems(
  maintenanceId: string,
  vehicleId: string,
  description: string,
  startDate: Date
) {
  // Buscar a ordem de serviço relacionada à manutenção
  // através da descrição, veículo e data de início
  const startDateStr = startDate.toISOString().split("T")[0]; // YYYY-MM-DD
  
  const serviceOrders = await db
    .select()
    .from(serviceOrdersTable)
    .where(
      and(
        eq(serviceOrdersTable.vehicleId, vehicleId),
        eq(serviceOrdersTable.description, description),
        sql`DATE(${serviceOrdersTable.startDate}) = DATE(${sql.raw(`'${startDateStr}'`)})`
      )
    )
    .limit(1);

  if (serviceOrders.length === 0) {
    return [];
  }

  const serviceOrder = serviceOrders[0];

  // Buscar os itens da ordem de serviço
  const items = await db
    .select({
      item: serviceOrderItemsTable,
      inventory: inventoryTable,
    })
    .from(serviceOrderItemsTable)
    .leftJoin(
      inventoryTable,
      eq(serviceOrderItemsTable.inventoryId, inventoryTable.id)
    )
    .where(eq(serviceOrderItemsTable.serviceOrderId, serviceOrder.id));

  return items;
}

export default async function ManutencaoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getMaintenance(id);

  if (!data || !data.maintenance) {
    return (
      <PageContainer>
        <PageContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Manutenção não encontrada</p>
            <Button asChild className="mt-4">
              <Link href="/manutencoes">Voltar</Link>
            </Button>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  const { maintenance, vehicle } = data;

  // Buscar as peças utilizadas na ordem de serviço relacionada
  const items = await getMaintenanceServiceOrderItems(
    maintenance.id,
    maintenance.vehicleId,
    maintenance.description,
    maintenance.startDate
  );

  // Serializar dados para evitar problemas de hidratação
  const serializedMaintenance = {
    ...maintenance,
    startDate: maintenance.startDate
      ? new Date(maintenance.startDate).toISOString()
      : null,
    endDate: maintenance.endDate
      ? new Date(maintenance.endDate).toISOString()
      : null,
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "";
    return parseFloat(value).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatType = (type: string) => {
    const typeMap: Record<string, string> = {
      preventiva: "Preventiva",
      corretiva: "Corretiva",
      revisao: "Revisão",
    };
    return typeMap[type] || type;
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/manutencoes">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Detalhes da Manutenção</h1>
              <p className="text-muted-foreground">
                Visualização dos dados da manutenção
              </p>
            </div>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Veículo</Label>
                <Input
                  id="vehicle"
                  value={vehicle?.plate || "-"}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={maintenance.type} disabled>
                  <SelectTrigger id="type" className="bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventiva">Preventiva</SelectItem>
                    <SelectItem value="corretiva">Corretiva</SelectItem>
                    <SelectItem value="revisao">Revisão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formatDate(maintenance.startDate)}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Fim</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formatDate(maintenance.endDate)}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Quilometragem</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={maintenance.mileage}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Custo</Label>
                <Input
                  id="cost"
                  type="text"
                  value={
                    maintenance.cost
                      ? `R$ ${formatCurrency(maintenance.cost)}`
                      : "-"
                  }
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mechanic">Mecânico</Label>
                <Input
                  id="mechanic"
                  value={maintenance.mechanic || "-"}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Fornecedor</Label>
                <Input
                  id="provider"
                  value={maintenance.provider || "-"}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={maintenance.description}
                  disabled
                  className="bg-muted min-h-[100px]"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <PDFButtonWrapper
                maintenance={serializedMaintenance}
                vehicle={vehicle}
                items={items}
              />
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}

