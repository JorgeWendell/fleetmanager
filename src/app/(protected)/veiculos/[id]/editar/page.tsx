"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { use } from "react";

import { updateVehicleAction } from "@/actions/update-vehicle";
import { getVehicleAction } from "@/actions/get-vehicle";
import { getDriversAction } from "@/actions/get-drivers";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const vehicleSchema = z.object({
  plate: z.string().trim().min(1, { message: "Placa é obrigatória" }),
  brand: z.string().trim().min(1, { message: "Marca é obrigatória" }),
  model: z.string().trim().min(1, { message: "Modelo é obrigatório" }),
  year: z.coerce.number().int().min(1900).max(2100, { message: "Ano inválido" }),
  color: z.string().trim().optional(),
  chassis: z.string().trim().optional(),
  renavam: z.string().trim().optional(),
  mileage: z.coerce.number().int().min(0).default(0),
  fuelType: z.string().trim().min(1, { message: "Tipo de combustível é obrigatório" }),
  status: z.enum(["disponivel", "em_uso", "manutencao", "inativo"]),
  inMaintenance: z.boolean().default(false),
  currentDriverId: z.string().optional(),
  lastMaintenance: z.string().optional(),
  nextMaintenance: z.string().optional(),
});

export default function EditarVeiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [drivers, setDrivers] = useState<Array<{ id: string; name: string; cnh: string }>>([]);
  const resolvedParams = use(params);

  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      chassis: "",
      renavam: "",
      mileage: 0,
      fuelType: "",
      status: "disponivel",
      inMaintenance: false,
      currentDriverId: "",
      lastMaintenance: "",
      nextMaintenance: "",
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [vehicleResult, driversResult] = await Promise.all([
          getVehicleAction(resolvedParams.id),
          getDriversAction(),
        ]);

        if (vehicleResult.error) {
          toast.error(vehicleResult.error);
          router.push("/veiculos");
          return;
        }

        if (driversResult.drivers) {
          setDrivers(driversResult.drivers);
        }

        if (vehicleResult.vehicle) {
          form.reset({
            plate: vehicleResult.vehicle.plate,
            brand: vehicleResult.vehicle.brand,
            model: vehicleResult.vehicle.model,
            year: vehicleResult.vehicle.year,
            color: vehicleResult.vehicle.color || "",
            chassis: vehicleResult.vehicle.chassis || "",
            renavam: vehicleResult.vehicle.renavam || "",
            mileage: vehicleResult.vehicle.mileage,
            fuelType: vehicleResult.vehicle.fuelType,
            status: vehicleResult.vehicle.status as "disponivel" | "em_uso" | "manutencao" | "inativo",
            inMaintenance: vehicleResult.vehicle.inMaintenance,
            currentDriverId: vehicleResult.vehicle.currentDriverId || "",
            lastMaintenance: vehicleResult.vehicle.lastMaintenance
              ? new Date(vehicleResult.vehicle.lastMaintenance).toISOString().split("T")[0]
              : "",
            nextMaintenance: vehicleResult.vehicle.nextMaintenance
              ? new Date(vehicleResult.vehicle.nextMaintenance).toISOString().split("T")[0]
              : "",
          });
        }
      } catch (error) {
        toast.error("Erro ao carregar dados");
        router.push("/veiculos");
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [resolvedParams.id, form, router]);

  async function onSubmit(values: z.infer<typeof vehicleSchema>) {
    setIsLoading(true);
    try {
      const result = await updateVehicleAction({
        id: resolvedParams.id,
        ...values,
        currentDriverId: values.currentDriverId || undefined,
        lastMaintenance: values.lastMaintenance ? new Date(values.lastMaintenance) : null,
        nextMaintenance: values.nextMaintenance ? new Date(values.nextMaintenance) : null,
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        toast.error("Verifique os campos do formulário");
        return;
      }

      toast.success("Veículo atualizado com sucesso!");
      router.push(`/veiculos/${resolvedParams.id}`);
      router.refresh();
    } catch (error) {
      toast.error("Erro ao atualizar veículo");
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
          <PageTitle className="text-3xl font-bold">Editar Veículo</PageTitle>
          <PageDescription className="text-base">
            Atualize as informações do veículo
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa *</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca *</FormLabel>
                        <FormControl>
                          <Input placeholder="Volkswagen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Gol" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2020"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor</FormLabel>
                        <FormControl>
                          <Input placeholder="Branco" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="chassis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chassi</FormLabel>
                        <FormControl>
                          <Input placeholder="Chassi do veículo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="renavam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RENAVAM</FormLabel>
                        <FormControl>
                          <Input placeholder="RENAVAM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quilometragem *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fuelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Combustível *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="gasolina">Gasolina</SelectItem>
                            <SelectItem value="etanol">Etanol</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="flex">Flex</SelectItem>
                            <SelectItem value="gnv">GNV</SelectItem>
                            <SelectItem value="eletrico">Elétrico</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="disponivel">Disponível</SelectItem>
                          <SelectItem value="em_uso">Em Uso</SelectItem>
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lastMaintenance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Última Manutenção</FormLabel>
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
                    name="nextMaintenance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Próxima Manutenção</FormLabel>
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
                </div>

                <FormField
                  control={form.control}
                  name="currentDriverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motorista Atual</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value === "none" ? "" : value);
                        }}
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um motorista" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum motorista</SelectItem>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.name} - CNH: {driver.cnh}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-4 border-t">
                  <Label htmlFor="maintenance-switch" className="text-sm font-medium">
                    Manutenção
                  </Label>
                  <FormField
                    control={form.control}
                    name="inMaintenance"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            id="maintenance-switch"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </FieldGroup>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/veiculos/${resolvedParams.id}`)}
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
        </Card>
      </PageContent>
    </PageContainer>
  );
}

