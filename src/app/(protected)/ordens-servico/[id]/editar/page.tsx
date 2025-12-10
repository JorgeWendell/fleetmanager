"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { use } from "react";

import { updateServiceOrderAction } from "@/actions/update-service-order";
import { getServiceOrderAction } from "@/actions/get-service-order";
import { getVehiclesAction } from "@/actions/get-vehicles";
import { Button } from "@/components/ui/button";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const serviceOrderSchema = z.object({
  vehicleId: z.string().min(1, { message: "Veículo é obrigatório" }),
  type: z.enum(["preventiva", "corretiva", "preditiva"], {
    message: "Tipo é obrigatório",
  }),
  priority: z.enum(["baixa", "media", "alta", "urgente"], {
    message: "Prioridade é obrigatória",
  }),
  currentMileage: z.number().min(0, { message: "Quilometragem deve ser maior ou igual a 0" }),
  mechanic: z.string().trim().optional(),
  description: z.string().trim().min(1, { message: "Descrição é obrigatória" }),
  scheduledDate: z.string().optional(),
  estimatedCost: z.number().min(0, { message: "Custo estimado deve ser maior ou igual a 0" }).optional(),
});

export default function EditarOrdemServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [vehicles, setVehicles] = useState<
    Array<{ id: string; plate: string; brand: string; model: string }>
  >([]);
  const resolvedParams = use(params);

  const form = useForm<z.infer<typeof serviceOrderSchema>>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: {
      vehicleId: "",
      type: "corretiva",
      priority: "media",
      currentMileage: 0,
      mechanic: "",
      description: "",
      scheduledDate: "",
      estimatedCost: 0,
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [serviceOrderResult, vehiclesResult] = await Promise.all([
          getServiceOrderAction(resolvedParams.id),
          getVehiclesAction(),
        ]);

        if (serviceOrderResult.error) {
          toast.error(serviceOrderResult.error);
          router.push("/ordens-servico");
          return;
        }

        if (vehiclesResult.vehicles) {
          setVehicles(vehiclesResult.vehicles);
        }

        if (serviceOrderResult.serviceOrder) {
          const so = serviceOrderResult.serviceOrder;
          form.reset({
            vehicleId: so.vehicleId,
            type: so.type as "preventiva" | "corretiva" | "preditiva",
            priority: so.priority as "baixa" | "media" | "alta" | "urgente",
            currentMileage: so.currentMileage
              ? parseFloat(so.currentMileage)
              : 0,
            mechanic: so.mechanic || "",
            description: so.description,
            scheduledDate: so.scheduledDate
              ? new Date(so.scheduledDate).toISOString().split("T")[0]
              : "",
            estimatedCost: so.estimatedCost
              ? parseFloat(so.estimatedCost)
              : 0,
          });
        }
      } catch (error) {
        toast.error("Erro ao carregar ordem de serviço");
        router.push("/ordens-servico");
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [resolvedParams.id, form, router]);

  async function onSubmit(values: z.infer<typeof serviceOrderSchema>) {
    setIsLoading(true);
    try {
      const result = await updateServiceOrderAction({
        id: resolvedParams.id,
        ...values,
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        toast.error("Verifique os campos do formulário");
        return;
      }

      toast.success("Ordem de serviço atualizada com sucesso!");
      // Aguardar um pouco para garantir que o toast apareça antes de redirecionar
      setTimeout(() => {
        router.push(`/ordens-servico/${resolvedParams.id}`);
      }, 300);
    } catch (error) {
      toast.error("Erro ao atualizar ordem de serviço");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingData) {
    return (
      <PageContainer>
        <PageContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Editar Ordem de Serviço</PageTitle>
          <PageDescription>
            Atualize os dados da ordem de serviço
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="vehicleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Veículo *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o veículo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vehicles.map((vehicle) => (
                                  <SelectItem key={vehicle.id} value={vehicle.id}>
                                    {vehicle.plate}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioridade *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a prioridade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="baixa">Baixa</SelectItem>
                                <SelectItem value="media">Média</SelectItem>
                                <SelectItem value="alta">Alta</SelectItem>
                                <SelectItem value="urgente">Urgente</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currentMileage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quilometragem Atual *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="preventiva">
                                  Preventiva
                                </SelectItem>
                                <SelectItem value="corretiva">Corretiva</SelectItem>
                                <SelectItem value="preditiva">Preditiva</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Agendada</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estimatedCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custo Estimado (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Full Width Fields */}
                  <FormField
                    control={form.control}
                    name="mechanic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mecânico Responsável</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do mecânico"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o serviço a ser realizado..."
                            {...field}
                            rows={4}
                            className="h-auto"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldGroup>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/ordens-servico/${resolvedParams.id}`)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}

