import { headers } from "next/headers";
import { db } from "@/db/index";
import {
  purchasesTable,
  inventoryTable,
  serviceOrdersTable,
  suppliersTable,
  vehiclesTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/components/ui/page-container";
import { Badge } from "@/components/ui/badge";
import { ComprasDetailClient } from "./compras-detail-client";

async function getPurchase(id: string) {
  const [purchase] = await db
    .select({
      purchase: purchasesTable,
      inventory: inventoryTable,
      serviceOrder: serviceOrdersTable,
      supplier: suppliersTable,
    })
    .from(purchasesTable)
    .leftJoin(inventoryTable, eq(purchasesTable.inventoryId, inventoryTable.id))
    .leftJoin(
      serviceOrdersTable,
      eq(purchasesTable.serviceOrderId, serviceOrdersTable.id)
    )
    .leftJoin(suppliersTable, eq(purchasesTable.supplierId, suppliersTable.id))
    .where(eq(purchasesTable.id, id))
    .limit(1);

  return purchase;
}

async function getServiceOrderVehicle(vehicleId: string | null) {
  if (!vehicleId) return null;

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, vehicleId))
    .limit(1);

  return vehicle;
}

function getUrgencyBadgeColor(urgency: string) {
  switch (urgency) {
    case "urgente":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "alta":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "media":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "baixa":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case "pendente":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "aprovada":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "recebida":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "cancelada":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function formatUrgency(urgency: string) {
  const urgencyMap: Record<string, string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    urgente: "Urgente",
  };
  return urgencyMap[urgency] || urgency;
}

function formatStatus(status: string) {
  const statusMap: Record<string, string> = {
    pendente: "Pendente",
    aprovada: "Aprovada",
    recebida: "Recebida",
    cancelada: "Cancelada",
  };
  return statusMap[status] || status;
}

function getPriorityBadgeColor(priority: string) {
  switch (priority) {
    case "urgente":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "alta":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "media":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "baixa":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function formatPriority(priority: string) {
  const priorityMap: Record<string, string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    urgente: "Urgente",
  };
  return priorityMap[priority] || priority;
}

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPurchase(id);

  if (!data || !data.purchase) {
    return (
      <PageContainer>
        <PageContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Solicitação de compra não encontrada
            </p>
            <Button asChild className="mt-4">
              <Link href="/compras">Voltar</Link>
            </Button>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  const { purchase, inventory, serviceOrder, supplier } = data;

  // Buscar veículo relacionado à ordem de serviço, se existir
  const vehicle = serviceOrder?.vehicleId
    ? await getServiceOrderVehicle(serviceOrder.vehicleId)
    : null;

  // Buscar usuário logado
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUser = session?.user;

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "R$ 0,00";
    const numValue = parseFloat(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  };

  const quantity = purchase.quantity ? parseFloat(purchase.quantity) : 0;
  const currentStock = inventory?.quantity ? parseFloat(inventory.quantity) : 0;
  const minStock = inventory?.minQuantity
    ? parseFloat(inventory.minQuantity)
    : null;
  const unitCost = inventory?.unitCost ? parseFloat(inventory.unitCost) : 0;
  // Usar totalAmount do banco se disponível e maior que 0, senão calcular
  const totalValue =
    purchase.totalAmount && parseFloat(purchase.totalAmount) > 0
      ? parseFloat(purchase.totalAmount)
      : quantity * unitCost;
  const isLowStock = minStock !== null && currentStock < minStock;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/compras">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">Voltar</span>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="space-y-6">
          {/* Main Purchase Request Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{purchase.number}</h1>
                  <p className="text-base font-semibold text-purple-600">
                    {inventory?.name || "-"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getUrgencyBadgeColor(purchase.urgency)} border-0`}
                  >
                    Urgência: {formatUrgency(purchase.urgency).toLowerCase()}
                  </Badge>
                  <Badge
                    className={`${getStatusBadgeColor(purchase.status)} border-0`}
                  >
                    {formatStatus(purchase.status).toLowerCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Item Solicitado
                    </p>
                    <p className="font-medium text-purple-600">
                      {inventory?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Quantidade
                    </p>
                    <p className="font-medium">
                      {quantity} {inventory?.unit || "Unidade"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Estoque Atual
                    </p>
                    <p
                      className={`font-medium ${
                        isLowStock ? "text-red-600" : ""
                      }`}
                    >
                      {currentStock} {inventory?.unit || "Unidade"}
                      {minStock !== null && ` (Mín: ${minStock})`}
                    </p>
                  </div>
                </div>

                {/* Middle Column */}
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Solicitante
                    </p>
                    <p className="font-medium">{currentUser?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Data da Solicitação
                    </p>
                    <p className="font-medium">
                      {formatDate(purchase.purchaseDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Aprovado por
                    </p>
                    <p className="font-medium">{purchase.approvedBy || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Data de Aprovação
                    </p>
                    <p className="font-medium">
                      {purchase.approvalDate
                        ? formatDate(purchase.approvalDate)
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Valor Unitário
                    </p>
                    <p className="font-medium">
                      {formatCurrency(unitCost.toString())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Valor Total
                    </p>
                    <p className="font-medium">
                      {formatCurrency(totalValue.toString())}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Service Order Card */}
          {serviceOrder && (
            <Card>
              <CardHeader>
                <CardTitle>Ordem de Serviço Relacionada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-base font-semibold">
                    {serviceOrder.number}
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      {serviceOrder.description || "-"}
                    </p>
                    <Badge
                      className={`${getPriorityBadgeColor(
                        serviceOrder.priority
                      )} border-0`}
                    >
                      {formatPriority(serviceOrder.priority).toLowerCase()}
                    </Badge>
                  </div>
                  {vehicle && (
                    <p className="text-sm text-muted-foreground">
                      Veículo: {vehicle.plate}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions Card */}
          <ComprasDetailClient
            purchaseId={purchase.id}
            currentStatus={purchase.status}
            approvedBy={purchase.approvedBy}
            approvalDate={purchase.approvalDate}
          />

          {/* Observations Card */}
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {purchase.notes || "Nenhuma observação registrada"}
              </p>
            </CardContent>
          </Card>

          {/* Receipt Information Card */}
          {purchase.status === "recebida" && (
            <Card>
              <CardHeader>
                <CardTitle>Dados de Recebimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Recebido por
                    </p>
                    <p className="font-medium">
                      {purchase.receiverName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Data de Recebimento
                    </p>
                    <p className="font-medium">
                      {purchase.deliveryDate
                        ? formatDate(purchase.deliveryDate)
                        : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
}
