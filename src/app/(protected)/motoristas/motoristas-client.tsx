"use client";

import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus } from "lucide-react";

import { NewDriverDialog } from "./components/new-driver-dialog";

interface MotoristasClientProps {
  drivers: Array<{
    id: string;
    name: string;
    cpf: string;
    cnh: string;
    cnhCategory: string;
    cnhExpiry: Date;
    phone: string | null;
    email: string | null;
    status: string;
    currentVehicle: {
      plate: string;
      brand: string;
      model: string;
    } | null;
  }>;
}

export function MotoristasClient({ drivers }: MotoristasClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const matchesSearch =
        searchTerm === "" ||
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.cnh.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (driver.email && driver.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || driver.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  const getStatusBadgeColor = (status: string) => {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Gestão de Motoristas</PageTitle>
          <PageDescription>
            Gerencie os motoristas da frota
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button
            onClick={() => {
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Novo Motorista
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome, CNH ou email..."
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
              <SelectItem value="ferias">Férias</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredDrivers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum motorista encontrado
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDrivers.map((driver) => (
              <Link key={driver.id} href={`/motoristas/${driver.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{driver.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          CNH: {driver.cnh}
                        </p>
                      </div>
                      <Badge
                        className={`${getStatusBadgeColor(driver.status)} border-0`}
                      >
                        {formatStatus(driver.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Categoria:</span>
                        <span className="text-sm font-medium">{driver.cnhCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Validade CNH:</span>
                        <span className="text-sm font-medium">
                          {formatDate(driver.cnhExpiry)}
                        </span>
                      </div>
                      {driver.phone && (
                        <div className="flex justify-between">
                          <span className="text-sm">Telefone:</span>
                          <span className="text-sm font-medium">{driver.phone}</span>
                        </div>
                      )}
                      {driver.email && (
                        <div className="flex justify-between">
                          <span className="text-sm">Email:</span>
                          <span className="text-sm font-medium">{driver.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 mt-4 pt-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Veículo atual:</span>
                        {driver.currentVehicle ? (
                          <span className="text-sm font-medium">
                            {driver.currentVehicle.plate} - {driver.currentVehicle.brand} {driver.currentVehicle.model}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Nenhum veículo</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </PageContent>

      <NewDriverDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
        }}
        driver={null}
      />
    </PageContainer>
  );
}

