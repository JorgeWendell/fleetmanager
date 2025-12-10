"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createPurchaseRequestAction } from "@/actions/create-purchase-request";
import { getAllInventoryAction } from "@/actions/get-all-inventory";
import { getSuppliersAction } from "@/actions/get-suppliers";
import { getServiceOrdersAction } from "@/actions/get-service-orders";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const purchaseRequestSchema = z.object({
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

interface NewPurchaseRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    inventoryId?: string;
    quantity?: number;
    serviceOrderId?: string;
  };
}

interface InventoryItem {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface ServiceOrder {
  id: string;
  number: string;
}

export function NewPurchaseRequestDialog({
  open,
  onOpenChange,
  initialData,
}: NewPurchaseRequestDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);

  const form = useForm<z.infer<typeof purchaseRequestSchema>>({
    resolver: zodResolver(purchaseRequestSchema),
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
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
    }

    if (open) {
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset({
        inventoryId: "",
        quantity: 0,
        urgency: "media",
        serviceOrderId: "",
        supplierId: "",
        notes: "",
      });
    } else if (initialData) {
      // Preencher o formulário com os dados iniciais quando o dialog abrir
      form.reset({
        inventoryId: initialData.inventoryId || "",
        quantity: initialData.quantity || 0,
        urgency: "media",
        serviceOrderId: initialData.serviceOrderId || "",
        supplierId: "",
        notes: "",
      });
    }
  }, [open, form, initialData]);

  async function onSubmit(values: z.infer<typeof purchaseRequestSchema>) {
    setIsLoading(true);
    try {
      const result = await createPurchaseRequestAction({
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

      toast.success("Solicitação de compra criada com sucesso!");
      onOpenChange(false);
      // Se houver serviceOrderId, redirecionar para a página da ordem de serviço
      if (values.serviceOrderId) {
        router.push(`/ordens-servico/${values.serviceOrderId}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error("Erro ao criar solicitação de compra");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Compra</DialogTitle>
          <DialogDescription>
            Crie uma solicitação de compra para reposição de peças do estoque.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              {/* Item do Estoque - Linha inteira */}
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

              {/* Quantidade e Urgência - Mesma linha */}
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

              {/* Ordem de Serviço e Fornecedor - Mesma linha */}
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

              {/* Observações - Linha inteira */}
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Solicitação
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

