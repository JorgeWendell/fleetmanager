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
import { serviceOrdersTable, vehiclesTable, driversTable } from "@/db/schema";
import { Plus } from "lucide-react";
import { eq } from "drizzle-orm";

async function getServiceOrders() {
  return await db
    .select({
      serviceOrder: serviceOrdersTable,
      vehicle: vehiclesTable,
      driver: driversTable,
    })
    .from(serviceOrdersTable)
    .leftJoin(vehiclesTable, eq(serviceOrdersTable.vehicleId, vehiclesTable.id))
    .leftJoin(driversTable, eq(serviceOrdersTable.driverId, driversTable.id));
}

export default async function OrdensServicoPage() {
  const serviceOrders = await getServiceOrders();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "aberta":
        return "default";
      case "em_andamento":
        return "secondary";
      case "concluida":
        return "outline";
      case "cancelada":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Ordens de Serviço</PageTitle>
          <PageDescription>
            Gerencie as ordens de serviço dos veículos
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button asChild>
            <Link href="/ordens-servico/nova">
              <Plus className="h-4 w-4" />
              Nova Ordem
            </Link>
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Ordens de Serviço</CardTitle>
            <CardDescription>
              {serviceOrders.length} ordem{serviceOrders.length !== 1 ? "ens" : ""}{" "}
              registrada{serviceOrders.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {serviceOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma ordem de serviço registrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Data Fim</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceOrders.map((item) => (
                    <TableRow key={item.serviceOrder.id}>
                      <TableCell className="font-medium">
                        {item.serviceOrder.number}
                      </TableCell>
                      <TableCell>{item.vehicle?.plate || "-"}</TableCell>
                      <TableCell>{item.driver?.name || "-"}</TableCell>
                      <TableCell>{item.serviceOrder.description}</TableCell>
                      <TableCell>
                        {formatDate(item.serviceOrder.startDate)}
                      </TableCell>
                      <TableCell>
                        {item.serviceOrder.endDate
                          ? formatDate(item.serviceOrder.endDate)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(item.serviceOrder.status)}
                        >
                          {formatStatus(item.serviceOrder.status)}
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

