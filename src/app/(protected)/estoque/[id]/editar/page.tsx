"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { use } from "react";

import { updateInventoryAction } from "@/actions/update-inventory";
import { getInventoryAction } from "@/actions/get-inventory";
import { getSuppliersAction } from "@/actions/get-suppliers";
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

const inventorySchema = z.object({
  codFabricante: z.string().trim().min(1, { message: "Código do Fabricante é obrigatório" }),
  name: z.string().trim().min(1, { message: "Nome da Peça é obrigatório" }),
  code: z.string().trim().min(1, { message: "Código é obrigatório" }),
  category: z.string().trim().min(1, { message: "Categoria é obrigatória" }),
  unit: z.string().trim().min(1, { message: "Unidade é obrigatória" }),
  quantity: z.coerce.number().min(0).default(0),
  minQuantity: z.coerce.number().min(0).default(0),
  maxQuantity: z.coerce.number().min(0).default(0),
  unitCost: z.coerce.number().min(0).default(0),
  location: z.string().trim().optional(),
  supplierId: z.string().optional(),
  observations: z.string().trim().optional(),
  lastPurchase: z.string().optional(),
});

export default function EditarEstoquePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const resolvedParams = use(params);

  const form = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      codFabricante: "",
      name: "",
      code: "",
      category: "",
      unit: "",
      quantity: 0,
      minQuantity: 0,
      maxQuantity: 0,
      unitCost: 0,
      location: "",
      supplierId: "",
      observations: "",
      lastPurchase: "",
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Carregar fornecedores
        const suppliersResult = await getSuppliersAction();
        if (suppliersResult.suppliers) {
          setSuppliers(suppliersResult.suppliers);
        }

        // Carregar item do estoque
        const result = await getInventoryAction(resolvedParams.id);
        if (result.error) {
          toast.error(result.error);
          router.push("/estoque");
          return;
        }

        if (result.inventory) {
          const item = result.inventory;
          const lastPurchaseDate = item.lastPurchase
            ? new Date(item.lastPurchase).toISOString().split("T")[0]
            : "";

          form.reset({
            codFabricante: item.codFabricante || "",
            name: item.name,
            code: item.code || "",
            category: item.category || "",
            unit: item.unit,
            quantity: Number(item.quantity),
            minQuantity: item.minQuantity ? Number(item.minQuantity) : 0,
            maxQuantity: item.maxQuantity ? Number(item.maxQuantity) : 0,
            unitCost: item.unitCost ? Number(item.unitCost) : 0,
            location: item.location || "",
            supplierId: item.supplierId || "",
            observations: item.observations || "",
            lastPurchase: lastPurchaseDate,
          });
        }
      } catch (error) {
        toast.error("Erro ao carregar dados");
        router.push("/estoque");
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [resolvedParams.id, form, router]);

  async function onSubmit(values: z.infer<typeof inventorySchema>) {
    setIsLoading(true);
    try {
      const result = await updateInventoryAction({
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

      toast.success("Peça atualizada com sucesso!");
      router.push(`/estoque/${resolvedParams.id}`);
      router.refresh();
    } catch (error) {
      toast.error("Erro ao atualizar peça");
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
          <PageTitle className="text-3xl font-bold">Editar Peça</PageTitle>
          <PageDescription className="text-base">
            Atualize os dados da peça
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
                    <FormField
                      control={form.control}
                      name="codFabricante"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código do Fabricante *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: FO-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Peça *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Filtro de Óleo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: FO-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Filtros">Filtros</SelectItem>
                              <SelectItem value="Lubrificantes">Lubrificantes</SelectItem>
                              <SelectItem value="Peças Automotivas">Peças Automotivas</SelectItem>
                              <SelectItem value="Pneus e Rodas">Pneus e Rodas</SelectItem>
                              <SelectItem value="Baterias">Baterias</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Unidade">Unidade</SelectItem>
                            <SelectItem value="Litro">Litro</SelectItem>
                            <SelectItem value="Kg">Kg</SelectItem>
                            <SelectItem value="Metro">Metro</SelectItem>
                            <SelectItem value="Caixa">Caixa</SelectItem>
                            <SelectItem value="Pacote">Pacote</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade Inicial *</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="minQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estoque Mínimo *</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="maxQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estoque Máximo *</FormLabel>
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="unitCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Unitário (R$) *</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localização</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Prateleira A-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fornecedor Principal</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value === "none" ? "" : value);
                          }}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um fornecedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum fornecedor</SelectItem>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
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
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição / Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Informações adicionais sobre a peça"
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastPurchase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Última Compra</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            disabled
                            className="bg-muted cursor-not-allowed"
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
                    onClick={() => router.push(`/estoque/${resolvedParams.id}`)}
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

