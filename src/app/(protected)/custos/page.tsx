import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db/index";
import { maintenancesTable, vehiclesTable } from "@/db/schema";
import { isNotNull, and, gte, lte, sql, eq } from "drizzle-orm";
import { DollarSign, Calendar, TrendingUp } from "lucide-react";

async function getMaintenanceCosts() {
  return await db
    .select({
      cost: maintenancesTable.cost,
      endDate: maintenancesTable.endDate,
    })
    .from(maintenancesTable)
    .where(isNotNull(maintenancesTable.cost));
}

async function getVehicleCosts() {
  return await db
    .select({
      vehicle: vehiclesTable,
      maintenance: maintenancesTable,
    })
    .from(vehiclesTable)
    .leftJoin(
      maintenancesTable,
      eq(vehiclesTable.id, maintenancesTable.vehicleId)
    );
}

export default async function CustosPage() {
  const maintenances = await getMaintenanceCosts();
  const vehicleCostsData = await getVehicleCosts();

  // Agrupar manutenções por veículo e calcular estatísticas
  const vehicleCostsMap = new Map<
    string,
    {
      vehicle: {
        id: string;
        plate: string;
        brand: string;
        model: string;
        mileage: number | null;
      };
      maintenances: Array<{ cost: string | null }>;
      totalCost: number;
      maintenanceCount: number;
      averageCost: number;
      currentKm: number;
      costPerKm: number;
    }
  >();

  vehicleCostsData.forEach((item) => {
    if (!item.vehicle) return;

    const vehicleId = item.vehicle.id;
    if (!vehicleCostsMap.has(vehicleId)) {
      vehicleCostsMap.set(vehicleId, {
        vehicle: {
          id: item.vehicle.id,
          plate: item.vehicle.plate,
          brand: item.vehicle.brand,
          model: item.vehicle.model,
          mileage: item.vehicle.mileage,
        },
        maintenances: [],
        totalCost: 0,
        maintenanceCount: 0,
        averageCost: 0,
        currentKm: item.vehicle.mileage || 0,
        costPerKm: 0,
      });
    }

    const vehicleData = vehicleCostsMap.get(vehicleId)!;
    if (item.maintenance && item.maintenance.cost) {
      vehicleData.maintenances.push({ cost: item.maintenance.cost });
    }
  });

  // Calcular estatísticas para cada veículo
  const vehicleCosts = Array.from(vehicleCostsMap.values())
    .map((data) => {
      const maintenancesWithCost = data.maintenances.filter(
        (m) => m.cost !== null
      );
      const totalCost = maintenancesWithCost.reduce(
        (sum, m) => sum + parseFloat(m.cost || "0"),
        0
      );
      const maintenanceCount = maintenancesWithCost.length;
      const averageCost =
        maintenanceCount > 0 ? totalCost / maintenanceCount : 0;
      const costPerKm = data.currentKm > 0 ? totalCost / data.currentKm : 0;

      return {
        ...data,
        totalCost,
        maintenanceCount,
        averageCost,
        costPerKm,
      };
    })
    .filter((v) => v.maintenanceCount > 0) // Apenas veículos com manutenções
    .sort((a, b) => b.totalCost - a.totalCost); // Ordenar por custo total decrescente

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatMonthYear = (date: Date) => {
    const month = new Intl.DateTimeFormat("pt-BR", {
      month: "short",
    })
      .format(date)
      .replace(".", "")
      .replace(" de", "");
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  const formatNumber = (value: number, decimals: number = 4) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Calcular custo total
  const totalCost = maintenances.reduce((sum, m) => {
    return sum + parseFloat(m.cost || "0");
  }, 0);

  const maintenanceCount = maintenances.length;

  // Data atual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Primeiro e último dia do mês atual
  const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
  const lastDayCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

  // Calcular custo do mês atual
  const currentMonthCost = maintenances
    .filter((m) => {
      if (!m.endDate) return false;
      const endDate = new Date(m.endDate);
      return endDate >= firstDayCurrentMonth && endDate <= lastDayCurrentMonth;
    })
    .reduce((sum, m) => sum + parseFloat(m.cost || "0"), 0);

  // Primeiro e último dia do mês anterior
  const firstDayPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
  const lastDayPreviousMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  // Calcular custo do mês anterior
  const previousMonthCost = maintenances
    .filter((m) => {
      if (!m.endDate) return false;
      const endDate = new Date(m.endDate);
      return endDate >= firstDayPreviousMonth && endDate <= lastDayPreviousMonth;
    })
    .reduce((sum, m) => sum + parseFloat(m.cost || "0"), 0);

  // Calcular variação percentual
  const variation =
    previousMonthCost > 0
      ? ((currentMonthCost - previousMonthCost) / previousMonthCost) * 100
      : 0;

  // Gerar últimos 6 meses
  const months: Array<{ month: Date; cost: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(currentYear, currentMonth - i, 1);
    const firstDay = new Date(currentYear, currentMonth - i, 1);
    const lastDay = new Date(
      currentYear,
      currentMonth - i + 1,
      0,
      23,
      59,
      59
    );

    const monthCost = maintenances
      .filter((m) => {
        if (!m.endDate) return false;
        const endDate = new Date(m.endDate);
        return endDate >= firstDay && endDate <= lastDay;
      })
      .reduce((sum, m) => sum + parseFloat(m.cost || "0"), 0);

    months.push({ month: monthDate, cost: monthCost });
  }

  // Encontrar o maior custo para calcular a porcentagem das barras
  const maxCost = Math.max(...months.map((m) => m.cost), 1);

  // Nome do mês atual em português
  const currentMonthName = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Controle de Custos</PageTitle>
          <PageDescription>Análise financeira da frota</PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {/* Custo Total */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Manutenções
              </p>
            </CardContent>
          </Card>

          {/* Mês Atual */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mês Atual</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(currentMonthCost)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentMonthName}
              </p>
            </CardContent>
          </Card>

          {/* Variação */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Variação</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  variation >= 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {variation >= 0 ? "+" : ""}
                {variation.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                vs. mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Evolução de Custos */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Custos (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {months.map((monthData, index) => {
                const percentage = maxCost > 0 ? (monthData.cost / maxCost) * 100 : 0;
                const monthName = formatMonthYear(monthData.month);

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{monthName}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(monthData.cost)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Custos por Veículo */}
        <Card>
          <CardHeader>
            <CardTitle>Custos por Veículo</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicleCosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum custo por veículo registrado
              </div>
            ) : (
              <div className="space-y-4">
                {vehicleCosts.map((vehicleData) => (
                  <Card key={vehicleData.vehicle.id} className="border">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {vehicleData.vehicle.plate}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {vehicleData.vehicle.brand} {vehicleData.vehicle.model}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {formatCurrency(vehicleData.totalCost)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {vehicleData.maintenanceCount} manutenção
                            {vehicleData.maintenanceCount !== 1 ? "ões" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Custo Médio
                          </p>
                          <p className="font-medium">
                            {formatCurrency(vehicleData.averageCost)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            KM Atual
                          </p>
                          <p className="font-medium">
                            {vehicleData.currentKm.toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Custo/KM
                          </p>
                          <p className="font-medium">
                            R$ {formatNumber(vehicleData.costPerKm)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}
