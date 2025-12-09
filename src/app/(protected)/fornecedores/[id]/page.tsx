import { db } from "@/db/index";
import { suppliersTable, purchasesTable, purchaseItemsTable, inventoryTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Pencil, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Badge } from "@/components/ui/badge";

async function getSupplier(id: string) {
  const [supplier] = await db
    .select()
    .from(suppliersTable)
    .where(eq(suppliersTable.id, id))
    .limit(1);

  return supplier;
}

async function getSupplierStats(id: string) {
  const [partsCount, purchasesCount, totalValue] = await Promise.all([
    db
      .select({ count: sql<number>`count(DISTINCT ${purchaseItemsTable.inventoryId})` })
      .from(purchaseItemsTable)
      .innerJoin(purchasesTable, eq(purchaseItemsTable.purchaseId, purchasesTable.id))
      .where(eq(purchasesTable.supplierId, id)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(purchasesTable)
      .where(eq(purchasesTable.supplierId, id)),
    db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${purchasesTable.totalAmount} AS DECIMAL)), 0)`,
      })
      .from(purchasesTable)
      .where(eq(purchasesTable.supplierId, id)),
  ]);

  return {
    partsCount: Number(partsCount[0]?.count || 0),
    purchasesCount: Number(purchasesCount[0]?.count || 0),
    totalValue: Number(totalValue[0]?.total || 0),
  };
}

async function getSupplierParts(id: string) {
  const parts = await db
    .selectDistinct({
      id: inventoryTable.id,
      name: inventoryTable.name,
      code: sql<string | null>`NULL`,
      category: inventoryTable.category,
      price: sql<number>`MAX(CAST(${purchaseItemsTable.unitCost} AS DECIMAL))`,
      unit: inventoryTable.unit,
    })
    .from(purchaseItemsTable)
    .innerJoin(purchasesTable, eq(purchaseItemsTable.purchaseId, purchasesTable.id))
    .leftJoin(inventoryTable, eq(purchaseItemsTable.inventoryId, inventoryTable.id))
    .where(eq(purchasesTable.supplierId, id))
    .groupBy(inventoryTable.id, inventoryTable.name, inventoryTable.category, inventoryTable.unit);

  return parts;
}

async function getSupplierPurchases(id: string) {
  const purchases = await db
    .select({
      purchase: purchasesTable,
      item: purchaseItemsTable,
      inventory: inventoryTable,
    })
    .from(purchasesTable)
    .innerJoin(purchaseItemsTable, eq(purchasesTable.id, purchaseItemsTable.purchaseId))
    .leftJoin(inventoryTable, eq(purchaseItemsTable.inventoryId, inventoryTable.id))
    .where(eq(purchasesTable.supplierId, id))
    .orderBy(purchasesTable.purchaseDate);

  return purchases;
}

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5 && rating % 1 < 1;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      ))}
      {hasHalfStar && (
        <div className="relative h-4 w-4">
          <Star className="absolute h-4 w-4 text-yellow-400" />
          <div className="absolute left-0 top-0 h-4 w-2 overflow-hidden">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-yellow-400" />
      ))}
    </div>
  );
}

export default async function FornecedorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplier(id);

  if (!supplier) {
    return (
      <PageContainer>
        <PageContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Fornecedor não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/fornecedores">Voltar</Link>
            </Button>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  const [stats, parts, purchases] = await Promise.all([
    getSupplierStats(id),
    getSupplierParts(id),
    getSupplierPurchases(id),
  ]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/fornecedores">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">Voltar</span>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <PageContent className="space-y-6">
        {/* Main Company Information Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{supplier.name}</h1>
                {supplier.category && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {supplier.category}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${
                    supplier.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  } border-0`}
                >
                  {supplier.isActive ? "ativo" : "inativo"}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/fornecedores/${supplier.id}/editar`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {supplier.cnpj && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">CNPJ</p>
                    <p className="font-medium">{supplier.cnpj}</p>
                  </div>
                )}
                {supplier.contactPerson && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Contato</p>
                    <p className="font-medium">{supplier.contactPerson}</p>
                  </div>
                )}
                {supplier.createdAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Data de Cadastro
                    </p>
                    <p className="font-medium">
                      {formatDate(supplier.createdAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Middle Column */}
              <div className="space-y-4">
                {supplier.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                    <p className="font-medium">{supplier.phone}</p>
                  </div>
                )}
                {supplier.email && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{supplier.email}</p>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {supplier.rating && Number(supplier.rating) > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avaliação</p>
                    <div className="flex items-center gap-2">
                      {renderStars(Number(supplier.rating))}
                      <span className="text-sm font-medium">
                        {Number(supplier.rating).toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                )}
                {supplier.address && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Endereço</p>
                    <p className="font-medium">{supplier.address}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Peças Fornecidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.partsCount}</div>
              <CardDescription className="pt-1">Tipos de peças</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Compras Realizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.purchasesCount}</div>
              <CardDescription className="pt-1">Solicitações</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor Total Comprado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalValue)}
              </div>
              <CardDescription className="pt-1">Acumulado</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Parts Supplied Card */}
        <Card>
          <CardHeader>
            <CardTitle>Peças Fornecidas</CardTitle>
          </CardHeader>
          <CardContent>
            {parts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma peça cadastrada
              </div>
            ) : (
              <div className="space-y-4">
                {parts.map((part) => (
                  <div
                    key={part.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{part.name}</h3>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {part.code && (
                          <span>
                            <strong>Código:</strong> {part.code}
                          </span>
                        )}
                        {part.category && (
                          <span>
                            <strong>Categoria:</strong> {part.category}
                          </span>
                        )}
                      </div>
                    </div>
                    {part.price && (
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(Number(part.price))}
                        </p>
                        {part.unit && (
                          <p className="text-sm text-muted-foreground">
                            por {part.unit}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase History Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Histórico de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma compra registrada
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case "aprovada":
                        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
                      case "pendente":
                        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
                      case "recebida":
                        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
                      case "cancelada":
                        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
                      default:
                        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
                    }
                  };

                  const formatStatus = (status: string) => {
                    return status.charAt(0).toUpperCase() + status.slice(1);
                  };

                  return (
                    <div
                      key={`${purchase.purchase.id}-${purchase.item.id}`}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium mb-1">
                          {purchase.purchase.number} - {purchase.item.description}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Quantidade: {Number(purchase.item.quantity)} {purchase.inventory?.unit || "un"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Data: {formatDate(purchase.purchase.purchaseDate)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          className={`${getStatusColor(purchase.purchase.status)} border-0`}
                        >
                          {formatStatus(purchase.purchase.status)}
                        </Badge>
                        <p className="font-semibold">
                          {formatCurrency(Number(purchase.purchase.totalAmount))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}

