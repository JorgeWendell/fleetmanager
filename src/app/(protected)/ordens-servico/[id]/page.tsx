import { db } from "@/db/index";
import {
  serviceOrdersTable,
  vehiclesTable,
  serviceOrderItemsTable,
  inventoryTable,
  purchasesTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Box, AlertTriangle, X, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/components/ui/page-container";
import { Badge } from "@/components/ui/badge";
import { OrdensServicoDetailClient } from "./ordens-servico-detail-client";
import { OrdensServicoActionsClient } from "./ordens-servico-actions-client";

async function getServiceOrder(id: string) {
  const [serviceOrder] = await db
    .select()
    .from(serviceOrdersTable)
    .where(eq(serviceOrdersTable.id, id))
    .limit(1);

  return serviceOrder;
}

async function getServiceOrderVehicle(vehicleId: string) {
  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, vehicleId))
    .limit(1);

  return vehicle;
}

async function getServiceOrderItems(serviceOrderId: string) {
  return await db
    .select({
      item: serviceOrderItemsTable,
      inventory: inventoryTable,
      purchaseRequest: purchasesTable,
    })
    .from(serviceOrderItemsTable)
    .leftJoin(
      inventoryTable,
      eq(serviceOrderItemsTable.inventoryId, inventoryTable.id)
    )
    .leftJoin(
      purchasesTable,
      eq(serviceOrderItemsTable.purchaseRequestId, purchasesTable.id)
    )
    .where(eq(serviceOrderItemsTable.serviceOrderId, serviceOrderId));
}

function getPriorityBadgeColor(priority: string) {
  switch (priority) {
    case "urgente":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "alta":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "media":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "baixa":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case "aberta":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "em_andamento":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "concluida":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "cancelada":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
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

function formatStatus(status: string) {
  const statusMap: Record<string, string> = {
    aberta: "Aberta",
    em_andamento: "Em Andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
  };
  return statusMap[status] || status;
}

function formatType(type: string) {
  const typeMap: Record<string, string> = {
    preventiva: "Preventiva",
    corretiva: "Corretiva",
    preditiva: "Preditiva",
  };
  return typeMap[type] || type;
}

export default async function ServiceOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const serviceOrder = await getServiceOrder(id);

  if (!serviceOrder) {
    return (
      <PageContainer>
        <PageContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Ordem de serviço não encontrada
            </p>
            <Button asChild className="mt-4">
              <Link href="/ordens-servico">Voltar</Link>
            </Button>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  const [vehicle, items] = await Promise.all([
    getServiceOrderVehicle(serviceOrder.vehicleId),
    getServiceOrderItems(serviceOrder.id),
  ]);

  // Calcular o total de todas as peças
  const totalPartsCost = items.reduce((sum, itemData) => {
    const item = itemData.item;
    const inventory = itemData.inventory;
    const requiredQty = parseFloat(item.requiredQuantity || "0");
    const unitCost = inventory ? parseFloat(inventory.unitCost || "0") : 0;
    return sum + requiredQty * unitCost;
  }, 0);

  // Garantir que o custo estimado seja igual ao total das peças
  const estimatedCost = parseFloat(serviceOrder.estimatedCost || "0");
  const shouldUpdateCost = Math.abs(estimatedCost - totalPartsCost) > 0.01;

  // Se houver diferença, atualizar o custo estimado no banco
  if (shouldUpdateCost) {
    await db
      .update(serviceOrdersTable)
      .set({
        estimatedCost: totalPartsCost.toString(),
        updatedAt: new Date(),
      })
      .where(eq(serviceOrdersTable.id, serviceOrder.id));

    // Recarregar o serviceOrder com o valor atualizado
    const [updatedServiceOrder] = await db
      .select()
      .from(serviceOrdersTable)
      .where(eq(serviceOrdersTable.id, serviceOrder.id))
      .limit(1);

    if (updatedServiceOrder) {
      serviceOrder.estimatedCost = updatedServiceOrder.estimatedCost;
    }
  }

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

  const formatMileage = (mileage: string | null) => {
    if (!mileage) return "-";
    const numValue = parseFloat(mileage);
    return `${numValue.toLocaleString("pt-BR")} km`;
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/ordens-servico">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">Voltar</span>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="space-y-6">
          {/* Main Service Order Information Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {serviceOrder.number}
                  </h1>
                  <p className="text-base text-muted-foreground">
                    {serviceOrder.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getPriorityBadgeColor(serviceOrder.priority)} border-0`}
                  >
                    Prioridade:{" "}
                    {formatPriority(serviceOrder.priority).toLowerCase()}
                  </Badge>
                  <Badge
                    className={`${getStatusBadgeColor(serviceOrder.status)} border-0`}
                  >
                    {formatStatus(serviceOrder.status).toLowerCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Veículo
                    </p>
                    <Link
                      href={`/veiculos/${vehicle?.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {vehicle?.plate} - {vehicle?.brand} {vehicle?.model}
                    </Link>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Tipo de Manutenção
                    </p>
                    <p className="font-medium">
                      {formatType(serviceOrder.type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Quilometragem
                    </p>
                    <p className="font-medium">
                      {formatMileage(serviceOrder.currentMileage)}
                    </p>
                  </div>
                </div>

                {/* Middle Column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Data de Criação
                    </p>
                    <p className="font-medium">
                      {formatDate(serviceOrder.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Data Agendada
                    </p>
                    <p className="font-medium">
                      {formatDate(serviceOrder.scheduledDate)}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Mecânico Responsável
                    </p>
                    <p className="font-medium">
                      {serviceOrder.mechanic || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Custo Estimado
                    </p>
                    <p className="font-medium">
                      {formatCurrency(serviceOrder.estimatedCost)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <OrdensServicoActionsClient
                serviceOrderId={serviceOrder.id}
                currentStatus={serviceOrder.status}
                serviceOrder={{
                  number: serviceOrder.number,
                  description: serviceOrder.description,
                  status: serviceOrder.status,
                  priority: serviceOrder.priority,
                  type: serviceOrder.type,
                  startDate: serviceOrder.startDate,
                  scheduledDate: serviceOrder.scheduledDate,
                  endDate: serviceOrder.endDate,
                  currentMileage: serviceOrder.currentMileage,
                  mechanic: serviceOrder.mechanic,
                  estimatedCost: serviceOrder.estimatedCost,
                  validatedBy: serviceOrder.validatedBy,
                  validationDate: serviceOrder.validationDate,
                }}
                vehicle={
                  vehicle
                    ? {
                        plate: vehicle.plate,
                        brand: vehicle.brand,
                        model: vehicle.model,
                        year: vehicle.year,
                      }
                    : null
                }
                items={items.map((itemData) => ({
                  item: {
                    description: itemData.item.description,
                    requiredQuantity: itemData.item.requiredQuantity,
                  },
                  inventory: itemData.inventory
                    ? {
                        unitCost: itemData.inventory.unitCost,
                        location: itemData.inventory.location,
                      }
                    : null,
                }))}
              />
            </CardContent>
          </Card>

          {/* Required Parts Section */}
          <Card>
            <CardHeader>
              <OrdensServicoDetailClient serviceOrderId={serviceOrder.id} />
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma peça adicionada ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {items.map((itemData) => {
                    const item = itemData.item;
                    const inventory = itemData.inventory;
                    const purchaseRequest = itemData.purchaseRequest;
                    const requiredQty = parseFloat(
                      item.requiredQuantity || "0"
                    );
                    const availableQty = inventory
                      ? parseFloat(inventory.quantity || "0")
                      : 0;
                    const unitCost = inventory
                      ? parseFloat(inventory.unitCost || "0")
                      : 0;
                    const totalValue = requiredQty * unitCost;
                    const isInsufficient = availableQty < requiredQty;
                    const isOutOfStock = availableQty === 0;

                    return (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-base mb-1">
                              {item.description}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Quantidade necessária: {requiredQty}
                            </p>
                          </div>
                          {isOutOfStock && (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-0">
                              <X className="h-3 w-3 mr-1" />
                              Sem Estoque
                            </Badge>
                          )}
                          {isInsufficient && !isOutOfStock && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-0">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Insuficiente
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">
                              Estoque Disponível
                            </p>
                            <p
                              className={`font-medium ${
                                isOutOfStock ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {availableQty} unidades
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">
                              Localização
                            </p>
                            <p className="font-medium">
                              {inventory?.location || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">
                              Valor Unitário
                            </p>
                            <p className="font-medium">
                              {formatCurrency(unitCost.toString())}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">
                              Valor Total
                            </p>
                            <p className="font-medium">
                              {formatCurrency(totalValue.toString())}
                            </p>
                          </div>
                        </div>

                        {purchaseRequest &&
                          purchaseRequest.status !== "recebida" && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  Solicitação de compra criada:{" "}
                                  <span className="font-medium">
                                    {purchaseRequest.number}
                                  </span>
                                </p>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/compras/${purchaseRequest.id}`}>
                                  Ver Solicitação
                                </Link>
                              </Button>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Description Section */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição do Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{serviceOrder.description}</p>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}
