"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { use } from "react";

import { updateDriverAction } from "@/actions/update-driver";
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
import { Card, CardContent } from "@/components/ui/card";
import { getDriverAction } from "@/actions/get-driver";
import { getVehiclesAction } from "@/actions/get-vehicles";

const driverSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  cpf: z.string().trim().min(11).max(11, { message: "CPF inválido" }),
  cnh: z.string().trim().min(1, { message: "CNH é obrigatória" }),
  cnhCategory: z.string().trim().min(1, { message: "Categoria CNH é obrigatória" }),
  cnhExpiry: z.string().min(1, { message: "Validade CNH é obrigatória" }),
  phone: z.string().trim().optional(),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  address: z.string().trim().optional(),
  status: z.enum(["ativo", "ferias", "inativo"]),
  currentVehicleId: z.string().optional(),
});

export default function EditarMotoristaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [vehicles, setVehicles] = useState<Array<{ id: string; plate: string; brand: string; model: string }>>([]);
  const resolvedParams = use(params);

  const form = useForm<z.infer<typeof driverSchema>>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: "",
      cpf: "",
      cnh: "",
      cnhCategory: "",
      cnhExpiry: "",
      phone: "",
      email: "",
      address: "",
      status: "ativo",
      currentVehicleId: "",
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [driverResult, vehiclesResult] = await Promise.all([
          getDriverAction(resolvedParams.id),
          getVehiclesAction(),
        ]);

        if (driverResult.error) {
          toast.error(driverResult.error);
          router.push("/motoristas");
          return;
        }

        if (vehiclesResult.vehicles) {
          setVehicles(vehiclesResult.vehicles);
        }

        if (driverResult.driver) {
          form.reset({
            name: driverResult.driver.name,
            cpf: driverResult.driver.cpf,
            cnh: driverResult.driver.cnh,
            cnhCategory: driverResult.driver.cnhCategory,
            cnhExpiry: driverResult.driver.cnhExpiry
              ? new Date(driverResult.driver.cnhExpiry).toISOString().split("T")[0]
              : "",
            phone: driverResult.driver.phone || "",
            email: driverResult.driver.email || "",
            address: driverResult.driver.address || "",
            status: driverResult.driver.status as "ativo" | "ferias" | "inativo",
            currentVehicleId: driverResult.driver.currentVehicleId || "",
          });
        }
      } catch (error) {
        toast.error("Erro ao carregar dados");
        router.push("/motoristas");
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [resolvedParams.id, form, router]);

  async function onSubmit(values: z.infer<typeof driverSchema>) {
    setIsLoading(true);
    try {
      const cnhExpiryDate = new Date(values.cnhExpiry);

      const result = await updateDriverAction({
        id: resolvedParams.id,
        ...values,
        cnhExpiry: cnhExpiryDate,
        currentVehicleId: values.currentVehicleId || undefined,
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        toast.error("Verifique os campos do formulário");
        return;
      }

      toast.success("Motorista atualizado com sucesso!");
      router.push(`/motoristas/${resolvedParams.id}`);
      router.refresh();
    } catch (error) {
      toast.error("Erro ao atualizar motorista");
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
          <PageTitle>Editar Motorista</PageTitle>
          <PageDescription>
            Atualize os dados do motorista
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FieldGroup>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do motorista" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF *</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cnh"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNH *</FormLabel>
                          <FormControl>
                            <Input placeholder="00000000000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cnhCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria CNH *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="E">E</SelectItem>
                              <SelectItem value="AB">AB</SelectItem>
                              <SelectItem value="AC">AC</SelectItem>
                              <SelectItem value="AD">AD</SelectItem>
                              <SelectItem value="AE">AE</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cnhExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Validade CNH *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Rua, Número, Bairro, Cidade - UF"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentVehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Veículo Atual</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value === "none" ? "" : value);
                          }}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um veículo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum veículo</SelectItem>
                            {vehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.plate} - {vehicle.brand} {vehicle.model}
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
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="ferias">Férias</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldGroup>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/motoristas/${resolvedParams.id}`)}
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

