import { count, eq, isNull, isNotNull, sql, and, lte, or } from "drizzle-orm";

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
import { RouteGuard } from "@/components/route-guard";
import {
  driversTable,
  maintenancesTable,
  serviceOrdersTable,
  vehiclesTable,
  inventoryTable,
  purchasesTable,
  suppliersTable,
  costsTable,
} from "@/db/schema";
import {
  Truck,
  UsersIcon,
  Wrench,
  ClipboardList,
  Package,
  ShoppingCart,
  Building2,
  DollarSign,
} from "lucide-react";

async function getDashboardStats() {
  const [
    totalVehicles,
    availableVehicles,
    totalDrivers,
    activeDrivers,
    totalMaintenances,
    pendingMaintenances,
    totalServiceOrders,
    openServiceOrders,
    totalInventory,
    lowStockItems,
    totalPurchases,
    pendingPurchases,
    totalSuppliers,
    activeSuppliers,
    totalCosts,
  ] = await Promise.all([
    db.select({ count: count() }).from(vehiclesTable),
    db
      .select({ count: count() })
      .from(vehiclesTable)
      .where(eq(vehiclesTable.status, "disponivel")),
    db.select({ count: count() }).from(driversTable),
    db
      .select({ count: count() })
      .from(driversTable)
      .where(eq(driversTable.status, "ativo")),
    db.select({ count: count() }).from(maintenancesTable),
    db
      .select({ count: count() })
      .from(maintenancesTable)
      .where(isNull(maintenancesTable.endDate)),
    db.select({ count: count() }).from(serviceOrdersTable),
    db
      .select({ count: count() })
      .from(serviceOrdersTable)
      .where(eq(serviceOrdersTable.status, "aberta")),
    db.select({ count: count() }).from(inventoryTable),
    db
      .select({ count: count() })
      .from(inventoryTable)
      .where(
        or(
          eq(sql`CAST(${inventoryTable.quantity} AS DECIMAL)`, sql`0`),
          and(
            isNotNull(inventoryTable.minQuantity),
            lte(
              sql`CAST(${inventoryTable.quantity} AS DECIMAL)`,
              sql`CAST(${inventoryTable.minQuantity} AS DECIMAL)`
            )
          )
        )
      ),
    db.select({ count: count() }).from(purchasesTable),
    db
      .select({ count: count() })
      .from(purchasesTable)
      .where(eq(purchasesTable.status, "pendente")),
    db.select({ count: count() }).from(suppliersTable),
    db
      .select({ count: count() })
      .from(suppliersTable)
      .where(eq(suppliersTable.isActive, true)),
    db.select({ count: count() }).from(costsTable),
  ]);

  return {
    vehicles: {
      total: totalVehicles[0]?.count || 0,
      available: availableVehicles[0]?.count || 0,
    },
    drivers: {
      total: totalDrivers[0]?.count || 0,
      active: activeDrivers[0]?.count || 0,
    },
    maintenances: {
      total: totalMaintenances[0]?.count || 0,
      pending: pendingMaintenances[0]?.count || 0,
    },
    serviceOrders: {
      total: totalServiceOrders[0]?.count || 0,
      open: openServiceOrders[0]?.count || 0,
    },
    inventory: {
      total: totalInventory[0]?.count || 0,
      lowStock: lowStockItems[0]?.count || 0,
    },
    purchases: {
      total: totalPurchases[0]?.count || 0,
      pending: pendingPurchases[0]?.count || 0,
    },
    suppliers: {
      total: totalSuppliers[0]?.count || 0,
      active: activeSuppliers[0]?.count || 0,
    },
    costs: {
      total: totalCosts[0]?.count || 0,
    },
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Visão geral do sistema de gestão de frotas
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Veículos
              </CardTitle>
              <Truck className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.vehicles.total}</div>
              <CardDescription className="pt-1">
                {stats.vehicles.available} disponíveis
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Motoristas</CardTitle>
              <UsersIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.drivers.total}</div>
              <CardDescription className="pt-1">
                {stats.drivers.active} ativos
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ordens de Serviço
              </CardTitle>
              <ClipboardList className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.serviceOrders.total}
              </div>
              <CardDescription className="pt-1">
                {stats.serviceOrders.open} abertas
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manutenções</CardTitle>
              <Wrench className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.maintenances.total}
              </div>
              <CardDescription className="pt-1">
                {stats.maintenances.pending} pendentes
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque</CardTitle>
              <Package className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inventory.total}</div>
              <CardDescription className="pt-1">
                Itens cadastrados
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compras</CardTitle>
              <ShoppingCart className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.purchases.total}</div>
              <CardDescription className="pt-1">
                {stats.purchases.pending} pendentes
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fornecedores
              </CardTitle>
              <Building2 className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suppliers.total}</div>
              <CardDescription className="pt-1">
                {stats.suppliers.active} ativos
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custos</CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.costs.total}</div>
              <CardDescription className="pt-1">
                Registros totais
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}
