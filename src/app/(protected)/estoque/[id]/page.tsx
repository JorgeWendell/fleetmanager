import { db } from "@/db/index";
import {
  inventoryTable,
  suppliersTable,
  purchasesTable,
  purchaseItemsTable,
} from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Pencil, ShoppingCart } from "lucide-react";

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
import { Progress } from "@/components/ui/progress";

async function getInventoryItem(id: string) {
  const [item] = await db
    .select({
      inventory: inventoryTable,
      supplier: suppliersTable,
    })
    .from(inventoryTable)
    .leftJoin(suppliersTable, eq(inventoryTable.supplierId, suppliersTable.id))
    .where(eq(inventoryTable.id, id))
    .limit(1);

  if (!item) {
    return null;
  }

  return {
    ...item.inventory,
    supplier: item.supplier,
  };
}

async function getLastPurchase(inventoryId: string) {
  const lastPurchase = await db
    .select({
      purchase: purchasesTable,
    })
    .from(purchaseItemsTable)
    .innerJoin(
      purchasesTable,
      eq(purchaseItemsTable.purchaseId, purchasesTable.id)
    )
    .where(eq(purchaseItemsTable.inventoryId, inventoryId))
    .orderBy(desc(purchasesTable.purchaseDate))
    .limit(1);

  return lastPurchase[0]?.purchase || null;
}

async function getPurchaseRequests(inventoryId: string) {
  const requests = await db
    .select({
      purchase: purchasesTable,
    })
    .from(purchaseItemsTable)
    .innerJoin(
      purchasesTable,
      eq(purchaseItemsTable.purchaseId, purchasesTable.id)
    )
    .where(eq(purchaseItemsTable.inventoryId, inventoryId))
    .orderBy(desc(purchasesTable.createdAt));

  return requests.map((r) => r.purchase);
}

export default async function EstoqueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getInventoryItem(id);

  if (!item) {
    return (
      <PageContainer>
        <PageContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Item não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/estoque">Voltar</Link>
            </Button>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  // Usar lastPurchase do banco se disponível, senão buscar da última compra
  const lastPurchaseDate = item.lastPurchase 
    ? item.lastPurchase 
    : (await getLastPurchase(id))?.purchaseDate || null;

  const purchaseRequests = await getPurchaseRequests(id);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getStockStatus = (quantity: string, minQuantity: string | null) => {
    const qty = Number(quantity);
    const minQty = minQuantity ? Number(minQuantity) : null;

    if (qty === 0) {
      return {
        label: "Sem Estoque",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
    }
    if (minQty !== null && qty <= minQty) {
      return {
        label: "Baixo",
        color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      };
    }
    return {
      label: "Normal",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
  };

  const quantity = Number(item.quantity);
  const minQuantity = item.minQuantity ? Number(item.minQuantity) : 0;
  const maxQuantity = item.maxQuantity ? Number(item.maxQuantity) : 0;
  const unitCost = item.unitCost ? Number(item.unitCost) : 0;
  const totalValue = quantity * unitCost;

  // Calcular porcentagem de ocupação do estoque
  const stockPercentage =
    maxQuantity > 0 ? (quantity / maxQuantity) * 100 : 0;

  const status = getStockStatus(item.quantity, item.minQuantity);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/estoque">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">Voltar</span>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="space-y-6">
        {/* Main Item Information Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
                {item.code && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Código: {item.code}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${status.color} border-0`}>
                  {status.label}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/estoque/${item.id}/editar`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
                <Button size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Solicitar Compra
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {item.category && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Categoria</p>
                    <p className="font-medium">{item.category}</p>
                  </div>
                )}
                {item.location && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Localização</p>
                    <p className="font-medium">{item.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Unidade</p>
                  <p className="font-medium">{item.unit}</p>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Quantidade Atual
                  </p>
                  <p className="font-medium">
                    {quantity.toLocaleString("pt-BR")}
                  </p>
                </div>
                {item.minQuantity && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Estoque Mínimo
                    </p>
                    <p className="font-medium">
                      {Number(item.minQuantity).toLocaleString("pt-BR")}
                    </p>
                  </div>
                )}
                {item.maxQuantity && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Estoque Máximo
                    </p>
                    <p className="font-medium">
                      {Number(item.maxQuantity).toLocaleString("pt-BR")}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {item.unitCost && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Valor Unitário
                    </p>
                    <p className="font-medium">{formatCurrency(unitCost)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Valor Total em Estoque
                  </p>
                  <p className="font-medium">{formatCurrency(totalValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Última Compra
                  </p>
                  <p className="font-medium">
                    {lastPurchaseDate ? formatDate(lastPurchaseDate) : "-"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Level Card */}
        <Card>
          <CardHeader>
            <CardTitle>Nível de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Ocupação do Estoque</p>
                  <p className="text-sm font-medium">
                    {stockPercentage.toFixed(1)}%
                  </p>
                </div>
                <Progress value={stockPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-red-800 mb-1">
                    Mínimo
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {minQuantity.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Atual
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {quantity.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-green-800 mb-1">
                    Máximo
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {maxQuantity > 0
                      ? maxQuantity.toLocaleString("pt-BR")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Supplier Card */}
        {item.supplier && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <CardTitle className="text-lg">Fornecedor Principal</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/fornecedores/${item.supplier.id}`}>
                    Ver Fornecedor
                  </Link>
                </Button>
              </div>
              <div className="space-y-2">
                <p className="font-medium">{item.supplier.name}</p>
                {item.supplier.cnpj && (
                  <p className="text-sm text-muted-foreground">
                    CNPJ: {item.supplier.cnpj}
                  </p>
                )}
                {item.supplier.contactPerson && (
                  <p className="text-sm text-muted-foreground">
                    Contato: {item.supplier.contactPerson}
                  </p>
                )}
                {item.supplier.phone && (
                  <p className="text-sm text-muted-foreground">
                    Telefone: {item.supplier.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Requests Card */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Compra Relacionadas</CardTitle>
          </CardHeader>
          <CardContent>
            {purchaseRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma solicitação de compra registrada
              </p>
            ) : (
              <div className="space-y-4">
                {purchaseRequests.map((request) => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case "pendente":
                        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
                      case "aprovada":
                        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
                      case "recebida":
                        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
                      case "cancelada":
                        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
                      default:
                        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
                    }
                  };

                  const formatStatus = (status: string) => {
                    switch (status) {
                      case "pendente":
                        return "Pendente";
                      case "aprovada":
                        return "Aprovada";
                      case "recebida":
                        return "Recebida";
                      case "cancelada":
                        return "Cancelada";
                      default:
                        return status;
                    }
                  };

                  return (
                    <div
                      key={request.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium mb-1">{request.number}</p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Data: {formatDate(request.purchaseDate)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Valor: {formatCurrency(Number(request.totalAmount))}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          className={`${getStatusColor(request.status)} border-0`}
                        >
                          {formatStatus(request.status)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}

