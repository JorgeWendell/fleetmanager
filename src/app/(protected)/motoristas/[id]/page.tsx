import { db } from "@/db/index";
import {
  driversTable,
  serviceOrdersTable,
  vehiclesTable,
} from "@/db/schema";
import { eq, and, or, desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Badge } from "@/components/ui/badge";

async function getDriver(id: string) {
  const [driver] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.id, id))
    .limit(1);

  return driver;
}

async function getDriverCurrentVehicle(driverId: string) {
  const driver = await getDriver(driverId);
  if (!driver || !driver.currentVehicleId) {
    return null;
  }

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, driver.currentVehicleId))
    .limit(1);

  return vehicle || null;
}

function calculateTimeAtCompany(hireDate: Date): string {
  const now = new Date();
  const years = now.getFullYear() - hireDate.getFullYear();
  const months = now.getMonth() - hireDate.getMonth();
  
  if (years > 0) {
    return `${years} ${years === 1 ? "ano" : "anos"}`;
  } else if (months > 0) {
    return `${months} ${months === 1 ? "mês" : "meses"}`;
  } else {
    return "Menos de 1 mês";
  }
}

function calculateDaysUntilExpiry(expiryDate: Date): number {
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default async function MotoristaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const driver = await getDriver(id);

  if (!driver) {
    return (
      <PageContainer>
        <PageContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Motorista não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/motoristas">Voltar</Link>
            </Button>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  const currentVehicle = driver.currentVehicleId
    ? await db
        .select()
        .from(vehiclesTable)
        .where(eq(vehiclesTable.id, driver.currentVehicleId))
        .limit(1)
        .then((result) => result[0] || null)
    : null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "ferias":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "inativo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const timeAtCompany = calculateTimeAtCompany(driver.createdAt);
  const daysUntilExpiry = calculateDaysUntilExpiry(driver.cnhExpiry);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/motoristas">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">Voltar</span>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="space-y-6">
        {/* Main Driver Information Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{driver.name}</h1>
                <p className="text-sm text-muted-foreground mb-4">
                  CNH: {driver.cnh}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(driver.status)} border-0`}>
                  {formatStatus(driver.status)}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/motoristas/${driver.id}/editar`}>
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
                  <p className="text-sm text-muted-foreground mb-1">
                    Categoria CNH
                  </p>
                  <p className="font-medium">{driver.cnhCategory}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Validade CNH
                  </p>
                  <p className="font-medium">
                    {formatDate(driver.cnhExpiry)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Data de Contratação
                  </p>
                  <p className="font-medium">
                    {formatDate(driver.createdAt)}
                  </p>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-4">
                {driver.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Telefone
                    </p>
                    <p className="font-medium">{driver.phone}</p>
                  </div>
                )}
                {driver.email && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{driver.email}</p>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Veículo Atual
                  </p>
                  {currentVehicle ? (
                    <div className="space-y-1">
                      <Link
                        href={`/veiculos/${currentVehicle.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium block"
                      >
                        {currentVehicle.plate}
                      </Link>
                      <Link
                        href={`/veiculos/${currentVehicle.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium block"
                      >
                        {currentVehicle.brand} {currentVehicle.model}
                      </Link>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhum veículo</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tempo de Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timeAtCompany}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${getStatusColor(driver.status)} border-0`}>
                {formatStatus(driver.status)}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dias até vencimento CNH
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {daysUntilExpiry > 0 ? (
                  `${daysUntilExpiry} ${daysUntilExpiry === 1 ? "dia" : "dias"}`
                ) : (
                  <span className="text-red-600">Vencida</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}

