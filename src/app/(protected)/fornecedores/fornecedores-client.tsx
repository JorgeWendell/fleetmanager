"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Star, Plus } from "lucide-react";
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

interface FornecedoresClientProps {
  suppliers: Array<{
    id: string;
    name: string;
    cnpj: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    contactPerson: string | null;
    category: string | null;
    website: string | null;
    paymentTerms: string | null;
    deliveryDays: number | null;
    observations: string | null;
    rating: string | null;
    isActive: boolean;
  }>;
  stats: {
    total: number;
    active: number;
    averageRating: number;
  };
}

export function FornecedoresClient({
  suppliers,
  stats,
}: FornecedoresClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesSearch =
        searchTerm === "" ||
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.cnpj &&
          supplier.cnpj.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (supplier.category &&
          supplier.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "ativo" && supplier.isActive) ||
        (statusFilter === "inativo" && !supplier.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, statusFilter]);

  const renderStars = (rating: number) => {
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
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Gestão de Fornecedores</PageTitle>
          <PageDescription>
            Gerencie os fornecedores de peças e serviços
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button asChild>
            <Link href="/fornecedores/novo">
              <Plus className="h-4 w-4" />
              Novo Fornecedor
            </Link>
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Fornecedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fornecedores Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome, CNPJ ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum fornecedor encontrado
          </div>
        ) : (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                   {filteredSuppliers.map((supplier) => (
                     <Link key={supplier.id} href={`/fornecedores/${supplier.id}`}>
                       <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                       <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{supplier.name}</h3>
                      {supplier.category && (
                        <p className="text-sm text-muted-foreground">
                          {supplier.category}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={`${
                        supplier.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      } border-0`}
                    >
                      {supplier.isActive ? "ativo" : "inativo"}
                    </Badge>
                  </div>

                  {supplier.rating && Number(supplier.rating) > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        {renderStars(Number(supplier.rating))}
                        <span className="text-sm text-muted-foreground">
                          {Number(supplier.rating).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    {supplier.cnpj && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CNPJ:</span>
                        <span className="font-medium">{supplier.cnpj}</span>
                      </div>
                    )}
                    {supplier.contactPerson && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contato:</span>
                        <span className="font-medium">
                          {supplier.contactPerson}
                        </span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telefone:</span>
                        <span className="font-medium">{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Endereço:</span>
                        <span className="font-medium text-right max-w-[60%]">
                          {supplier.address}
                        </span>
                      </div>
                    )}
                         </div>
                       </CardContent>
                     </Card>
                     </Link>
                   ))}
                 </div>
        )}
      </PageContent>
    </PageContainer>
  );
}

