"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Package,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { NewInventoryDialog } from "./components/new-inventory-dialog";

interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  codFabricante: string | null;
  observations: string | null;
  category: string | null;
  unit: string;
  quantity: string;
  minQuantity: string | null;
  maxQuantity: string | null;
  unitCost: string | null;
  location: string | null;
  supplierId: string | null;
  supplier: {
    id: string;
    name: string;
  } | null;
}

interface EstoqueClientProps {
  inventory: InventoryItem[];
  stats: {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
}

export function EstoqueClient({ inventory, stats }: EstoqueClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      };
    }
    return {
      label: "Normal",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    inventory.forEach((item) => {
      if (item.category) {
        cats.add(item.category);
      }
    });
    return Array.from(cats).sort();
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    let filtered = inventory;

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          (item.code &&
            item.code.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (item.codFabricante &&
            item.codFabricante.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (item.description &&
            item.description.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    return filtered;
  }, [inventory, searchTerm, categoryFilter]);

  const totalValue = useMemo(() => {
    return filteredInventory.reduce((sum, item) => {
      const qty = Number(item.quantity);
      const cost = item.unitCost ? Number(item.unitCost) : 0;
      return sum + qty * cost;
    }, 0);
  }, [filteredInventory]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Estoque de Peças</PageTitle>
          <PageDescription>
            Gerencie o inventário de peças e materiais
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Peça
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Itens
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <div className="text-xs text-muted-foreground">
                Diferentes peças
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalValue)}
              </div>
              <div className="text-xs text-muted-foreground">Em estoque</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estoque Baixo
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.lowStockCount}
              </div>
              <p className="text-xs text-muted-foreground">Itens críticos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.outOfStockCount}
              </div>
              <p className="text-xs text-muted-foreground">Itens zerados</p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Stock Alert */}
        {(stats.outOfStockCount > 0 || stats.lowStockCount > 0) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">
                  Atenção: Itens com estoque crítico
                </h3>
                <ul className="text-sm text-orange-800 space-y-1">
                  {stats.outOfStockCount > 0 && (
                    <li>• {stats.outOfStockCount} item(ns) sem estoque</li>
                  )}
                  {stats.lowStockCount > 0 && (
                    <li>
                      • {stats.lowStockCount} item(ns) com estoque abaixo do
                      mínimo
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Inventory Items Cards */}
        {filteredInventory.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum item encontrado
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredInventory.map((item) => {
              const status = getStockStatus(item.quantity, item.minQuantity);
              const quantity = Number(item.quantity);
              const unitCost = item.unitCost ? Number(item.unitCost) : 0;
              const totalValue = quantity * unitCost;
              const isLowStock =
                quantity === 0 ||
                (item.minQuantity && quantity <= Number(item.minQuantity));

              return (
                <Link key={item.id} href={`/estoque/${item.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold">{item.name}</h3>
                        <Badge className={`${status.color} border-0`}>
                          {status.label}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        {item.code && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Código:
                            </span>
                            <span className="font-medium">{item.code}</span>
                          </div>
                        )}
                        {item.codFabricante && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Código do Fabricante:
                            </span>
                            <span className="font-medium">
                              {item.codFabricante}
                            </span>
                          </div>
                        )}
                        {item.category && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Categoria:
                            </span>
                            <span className="font-medium">{item.category}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Quantidade:
                          </span>
                          <span
                            className={`font-medium ${
                              isLowStock ? "text-orange-600" : ""
                            }`}
                          >
                            {quantity.toLocaleString("pt-BR")} {item.unit}
                          </span>
                        </div>
                        {item.minQuantity && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Estoque Mínimo:
                            </span>
                            <span className="font-medium">
                              {Number(item.minQuantity).toLocaleString("pt-BR")}{" "}
                              {item.unit}
                            </span>
                          </div>
                        )}
                        {item.unitCost && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Valor Unitário:
                            </span>
                            <span className="font-medium">
                              {formatCurrency(unitCost)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Valor Total:
                          </span>
                          <span className="font-medium">
                            {formatCurrency(totalValue)}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 mt-4 pt-4">
                        {item.location && (
                          <div className="flex justify-between mb-4">
                            <span className="text-sm text-muted-foreground">
                              Localização:
                            </span>
                            <span className="text-sm font-medium">
                              {item.location}
                            </span>
                          </div>
                        )}
                        {item.location && item.supplier && (
                          <div className="border-t border-gray-200 pt-4"></div>
                        )}
                        {item.supplier && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Fornecedor:
                            </span>
                            <span className="text-sm font-medium">
                              {item.supplier.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </PageContent>

      <NewInventoryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
        }}
      />
    </PageContainer>
  );
}
