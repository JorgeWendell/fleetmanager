"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Plus } from "lucide-react";
import Link from "next/link";
import { NewServiceOrderDialog } from "./components/new-service-order-dialog";

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

interface ServiceOrder {
  serviceOrder: {
    id: string;
    number: string;
    vehicleId: string;
    driverId: string | null;
    description: string;
    status: "aberta" | "em_andamento" | "concluida" | "cancelada";
    priority: "baixa" | "media" | "alta" | "urgente" | null;
    type: "preventiva" | "corretiva" | "preditiva" | null;
    currentMileage: string | null;
    mechanic: string | null;
    scheduledDate: Date | null;
    estimatedCost: string | null;
    startDate: Date;
    endDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  vehicle: {
    id: string;
    plate: string;
    brand: string;
    model: string;
  } | null;
  driver: {
    id: string;
    name: string;
  } | null;
}

interface OrdensServicoClientProps {
  serviceOrders: ServiceOrder[];
}

export function OrdensServicoClient({
  serviceOrders,
}: OrdensServicoClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "aberta":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "em_andamento":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "concluida":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelada":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "aberta":
        return "Aberta";
      case "em_andamento":
        return "em andamento";
      case "concluida":
        return "Concluída";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getPriorityBadgeColor = (priority: string | null) => {
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
  };

  const formatPriority = (priority: string | null) => {
    if (!priority) return "Média";
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatType = (type: string | null) => {
    if (!type) return "Corretiva";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const filteredServiceOrders = useMemo(() => {
    return serviceOrders.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.serviceOrder.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.vehicle &&
          item.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.serviceOrder.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.serviceOrder.status === statusFilter;

      const priority = item.serviceOrder.priority || "media";
      const matchesPriority =
        priorityFilter === "all" || priority === priorityFilter;

      const type = item.serviceOrder.type || "corretiva";
      const matchesType = typeFilter === "all" || type === typeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  }, [serviceOrders, searchTerm, statusFilter, priorityFilter, typeFilter]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Ordens de Serviço</PageTitle>
          <PageDescription>
            Gerencie as ordens de serviço da frota
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Ordem de Serviço
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por ID, placa ou descrição..."
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
              <SelectItem value="aberta">Aberta</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Corretiva">Corretiva</SelectItem>
              <SelectItem value="Preventiva">Preventiva</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Service Orders List */}
        {filteredServiceOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma ordem de serviço encontrada
          </div>
        ) : (
          <div className="space-y-4">
            {filteredServiceOrders.map((item) => {
              const priority = item.serviceOrder.priority || "media";
              const type = item.serviceOrder.type || "corretiva";
              const estimatedCost = item.serviceOrder.estimatedCost
                ? Number(item.serviceOrder.estimatedCost)
                : 0;
              const scheduledDate = item.serviceOrder.scheduledDate || item.serviceOrder.startDate;

              return (
                <Link
                  key={item.serviceOrder.id}
                  href={`/ordens-servico/${item.serviceOrder.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold">
                            {item.serviceOrder.number.startsWith("OS-")
                              ? item.serviceOrder.number
                              : `OS-${item.serviceOrder.number}`}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            className={`${getPriorityBadgeColor(
                              priority
                            )} border-0`}
                          >
                            {formatPriority(priority)}
                          </Badge>
                          <Badge
                            className={`${getStatusBadgeColor(
                              item.serviceOrder.status
                            )} border-0`}
                          >
                            {formatStatus(item.serviceOrder.status)}
                          </Badge>
                        </div>
                      </div>

                      {item.vehicle && (
                        <p className="text-sm text-muted-foreground mb-4">
                          Veículo: {item.vehicle.plate} |{" "}
                          {item.serviceOrder.description}
                        </p>
                      )}

                      <div className="grid grid-cols-4 gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Tipo</p>
                          <p className="font-medium">{formatType(type)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Criado em</p>
                          <p className="font-medium">
                            {formatDate(item.serviceOrder.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">
                            Agendado para
                          </p>
                          <p className="font-medium">
                            {formatDate(scheduledDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">
                            Custo Estimado
                          </p>
                          <p className="font-medium">
                            {estimatedCost > 0
                              ? formatCurrency(estimatedCost)
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </PageContent>

      <NewServiceOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </PageContainer>
  );
}

