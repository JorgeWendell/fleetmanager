"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { NewPurchaseRequestDialog } from "./components/new-purchase-request-dialog";

interface Purchase {
  purchase: {
    id: string;
    number: string;
    supplierId: string;
    status: "pendente" | "aprovada" | "recebida" | "cancelada";
    totalAmount: string;
    quantity: string | null;
    purchaseDate: Date;
    deliveryDate: Date | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  supplier: {
    id: string;
    name: string;
  } | null;
  inventory: {
    id: string;
    unitCost: string | null;
  } | null;
}

interface ComprasClientProps {
  purchases: Purchase[];
  stats: {
    total: number;
    pending: number;
    urgent: number;
    totalValue: number;
    lowStock: number;
  };
}

export function ComprasClient({ purchases, stats }: ComprasClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const getStatusBadgeColor = (status: string) => {
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

  const filteredPurchases = useMemo(() => {
    return purchases.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.purchase.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier &&
          item.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || item.purchase.status === statusFilter;

      const matchesSupplier =
        supplierFilter === "all" ||
        (supplierFilter === "none" && !item.supplier) ||
        item.supplier?.id === supplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }, [purchases, searchTerm, statusFilter, supplierFilter]);

  // Obter lista única de fornecedores para o filtro
  const suppliers = useMemo(() => {
    const uniqueSuppliers = new Map<string, { id: string; name: string }>();
    purchases.forEach((item) => {
      if (item.supplier && !uniqueSuppliers.has(item.supplier.id)) {
        uniqueSuppliers.set(item.supplier.id, item.supplier);
      }
    });
    return Array.from(uniqueSuppliers.values());
  }, [purchases]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Solicitações de Compra</PageTitle>
          <PageDescription>
            Gerencie as solicitações de compra de peças
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Solicitação
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Solicitações
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Todas as solicitações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.urgent}</div>
              <p className="text-xs text-muted-foreground">Alta prioridade</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalValue.toString())}
              </div>
              <p className="text-xs text-muted-foreground">
                Compras realizadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {stats.lowStock > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-1">
                      Atenção: Estoque Baixo
                    </h3>
                    <p className="text-sm text-orange-800">
                      {stats.lowStock} item(ns) com estoque abaixo do mínimo
                      recomendado
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/estoque">Ver todos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter Bar */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por ID ou item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovada">Aprovada</SelectItem>
              <SelectItem value="recebida">Recebida</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Purchase Requests List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Solicitações de Compra</h2>
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma solicitação encontrada
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPurchases.map((item) => (
                <Link
                  key={item.purchase.id}
                  href={`/compras/${item.purchase.id}`}
                  className="block"
                >
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">
                          Solicitação #{item.purchase.number}
                        </h3>
                      </div>
                      <Badge
                        className={`${getStatusBadgeColor(
                          item.purchase.status
                        )} border-0`}
                      >
                        {formatStatus(item.purchase.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      {item.supplier && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Fornecedor:
                          </span>
                          <span className="font-medium">
                            {item.supplier.name}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Data da Solicitação:
                        </span>
                        <span className="font-medium">
                          {formatDate(item.purchase.purchaseDate)}
                        </span>
                      </div>
                      {item.purchase.deliveryDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Data de Entrega:
                          </span>
                          <span className="font-medium">
                            {formatDate(item.purchase.deliveryDate)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Valor Total:
                        </span>
                        <span className="font-medium">
                          {(() => {
                            const totalAmount = parseFloat(
                              item.purchase.totalAmount || "0"
                            );
                            // Se totalAmount for 0 ou null, calcular baseado em quantidade × valor unitário
                            if (totalAmount === 0 && item.inventory) {
                              const quantity = parseFloat(
                                item.purchase.quantity || "0"
                              );
                              const unitCost = parseFloat(
                                item.inventory.unitCost || "0"
                              );
                              const calculatedTotal = quantity * unitCost;
                              return formatCurrency(calculatedTotal.toString());
                            }
                            return formatCurrency(item.purchase.totalAmount);
                          })()}
                        </span>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PageContent>

      <NewPurchaseRequestDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </PageContainer>
  );
}

