import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db/index";
import { maintenancesTable, vehiclesTable } from "@/db/schema";
import { Plus } from "lucide-react";
import { eq, isNull } from "drizzle-orm";

async function getMaintenances() {
  return await db
    .select({
      maintenance: maintenancesTable,
      vehicle: vehiclesTable,
    })
    .from(maintenancesTable)
    .leftJoin(vehiclesTable, eq(maintenancesTable.vehicleId, vehiclesTable.id));
}

export default async function ManutencoesPage() {
  const maintenances = await getMaintenances();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Manutenções</PageTitle>
          <PageDescription>
            Histórico e gestão de manutenções dos veículos
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button asChild>
            <Link href="/manutencoes/nova">
              <Plus className="h-4 w-4" />
              Nova Manutenção
            </Link>
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Manutenções</CardTitle>
            <CardDescription>
              {maintenances.length} manutenção{maintenances.length !== 1 ? "ões" : ""}{" "}
              registrada{maintenances.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {maintenances.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma manutenção registrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Data Fim</TableHead>
                    <TableHead>Quilometragem</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenances.map((item) => (
                    <TableRow key={item.maintenance.id}>
                      <TableCell className="font-medium">
                        {item.vehicle?.plate || "-"}
                      </TableCell>
                      <TableCell>{formatType(item.maintenance.type)}</TableCell>
                      <TableCell>{item.maintenance.description}</TableCell>
                      <TableCell>
                        {formatDate(item.maintenance.startDate)}
                      </TableCell>
                      <TableCell>
                        {item.maintenance.endDate
                          ? formatDate(item.maintenance.endDate)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.maintenance.mileage.toLocaleString("pt-BR")} km
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.maintenance.cost)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.maintenance.endDate ? "default" : "destructive"
                          }
                        >
                          {item.maintenance.endDate ? "Concluída" : "Em Andamento"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}

