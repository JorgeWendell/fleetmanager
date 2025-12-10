"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { use } from "react";

import { updatePurchaseAction } from "@/actions/update-purchase";
import { getPurchaseAction } from "@/actions/get-purchase";
import { getAllInventoryAction } from "@/actions/get-all-inventory";
import { getSuppliersAction } from "@/actions/get-suppliers";
import { getServiceOrdersAction } from "@/actions/get-service-orders";
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

const purchaseSchema = z.object({
  inventoryId: z.string().min(1, { message: "Item do Estoque é obrigatório" }),
  quantity: z.coerce
    .number()
    .min(0.01, { message: "Quantidade deve ser maior que 0" }),
  urgency: z.enum(["baixa", "media", "alta", "urgente"], {
    required_error: "Urgência é obrigatória",
  }),
  serviceOrderId: z.string().optional(),
  supplierId: z.string().optional(),
  notes: z.string().trim().optional(),
});

export default function EditarCompraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [suppliers, setSuppliers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [serviceOrders, setServiceOrders] = useState<
    Array<{ id: string; number: string }>
  >([]);
  const resolvedParams = use(params);

  const form = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      inventoryId: "",
      quantity: 0,
      urgency: "media",
      serviceOrderId: "",
      supplierId: "",
      notes: "",
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Carregar dados necessários
        const [inventoryResult, suppliersResult, serviceOrdersResult] =
          await Promise.all([
            getAllInventoryAction(),
            getSuppliersAction(),
            getServiceOrdersAction(),
          ]);

        if (inventoryResult.items) {
          setInventoryItems(inventoryResult.items);
        }
        if (suppliersResult.suppliers) {
          setSuppliers(suppliersResult.suppliers);
        }
        if (serviceOrdersResult.serviceOrders) {
          setServiceOrders(serviceOrdersResult.serviceOrders);
        }

        // Carregar solicitação de compra
        const result = await getPurchaseAction(resolvedParams.id);
        if (result.error) {
          toast.error(result.error);
          router.push("/compras");
          return;
        }

        if (result.purchase) {
          form.reset({
            inventoryId: result.purchase.inventoryId || "",
            quantity: result.purchase.quantity
              ? parseFloat(result.purchase.quantity)
              : 0,
            urgency: result.purchase.urgency || "media",
            serviceOrderId: result.purchase.serviceOrderId || "",
            supplierId: result.purchase.supplierId || "",
            notes: result.purchase.notes || "",
          });
        }
      } catch (error) {
        toast.error("Erro ao carregar dados");
        router.push("/compras");
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [resolvedParams.id, form, router]);

  async function onSubmit(values: z.infer<typeof purchaseSchema>) {
    setIsLoading(true);
    try {
      const result = await updatePurchaseAction({
        id: resolvedParams.id,
        inventoryId: values.inventoryId,
        quantity: values.quantity,
        urgency: values.urgency,
        serviceOrderId: values.serviceOrderId || undefined,
        supplierId: values.supplierId || undefined,
        notes: values.notes || undefined,
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        toast.error("Verifique os campos do formulário");
        return;
      }

      toast.success("Solicitação de compra atualizada com sucesso!");
      router.push(`/compras/${resolvedParams.id}`);
    } catch (error) {
      toast.error("Erro ao atualizar solicitação de compra");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingData) {
    return (
      <PageContainer>
        <PageContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Editar Solicitação de Compra</PageTitle>
          <PageDescription>
            Atualize as informações da solicitação de compra
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FieldGroup>
                  <FormField
                    control={form.control}
                    name="inventoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item do Estoque *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o item" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {inventoryItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
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
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgência *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a urgência" />
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="serviceOrderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ordem de Serviço (Opcional)</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value === "none" ? "" : value);
                            }}
                            value={field.value || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a OS" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhuma OS</SelectItem>
                              {serviceOrders.map((order) => (
                                <SelectItem key={order.id} value={order.id}>
                                  {order.number}
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
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fornecedor (Opcional)</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value === "none" ? "" : value);
                            }}
                            value={field.value || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o fornecedor" />
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
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Adicione observações sobre a solicitação..."
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldGroup>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
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

