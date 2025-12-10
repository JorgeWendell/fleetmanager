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

import { NewVehicleDialog } from "./components/new-vehicle-dialog";

interface VeiculosClientProps {
  vehicles: Array<{
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    color: string | null;
    mileage: number;
    status: string;
    fuelType: string;
    inMaintenance: boolean;
    currentDriver: {
      name: string;
    } | null;
  }>;
}

export function VeiculosClient({ vehicles }: VeiculosClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        searchTerm === "" ||
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || vehicle.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

  const getStatusBadgeColor = (status: string, inMaintenance: boolean) => {
    if (inMaintenance) {
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    }
    switch (status) {
      case "disponivel":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "em_uso":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "manutencao":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "inativo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatStatus = (status: string, inMaintenance: boolean) => {
    if (inMaintenance) {
      return "Manutenção";
    }
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Gestão de Veículos</PageTitle>
          <PageDescription>
            Gerencie toda a sua frota de veículos
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button
            onClick={() => {
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Novo Veículo
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por placa, marca ou modelo..."
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
              <SelectItem value="disponivel">Disponível</SelectItem>
              <SelectItem value="em_uso">Em Uso</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum veículo encontrado
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <Link key={vehicle.id} href={`/veiculos/${vehicle.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{vehicle.plate}</h3>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.brand} {vehicle.model}
                        </p>
                      </div>
                      <Badge
                        className={`${getStatusBadgeColor(vehicle.status, vehicle.inMaintenance)} border-0`}
                      >
                        {formatStatus(vehicle.status, vehicle.inMaintenance)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-sm">Ano:</span>
                        <span className="text-sm font-medium">{vehicle.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Cor:</span>
                        <span className="text-sm font-medium">{vehicle.color || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">KM:</span>
                        <span className="text-sm font-medium">
                          {vehicle.mileage.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Combustível:</span>
                        <span className="text-sm font-medium capitalize">
                          {vehicle.fuelType}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 mt-4 pt-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Motorista atual:</span>
                        {vehicle.currentDriver ? (
                          <span className="text-sm font-medium">
                            {vehicle.currentDriver.name}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Nenhum motorista
                          </span>
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

      <NewVehicleDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
        }}
        vehicle={null}
      />
    </PageContainer>
  );
}
