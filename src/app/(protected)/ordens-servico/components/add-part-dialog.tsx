"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Box } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { addServiceOrderItemAction } from "@/actions/add-service-order-item";
import { getAllInventoryAction } from "@/actions/get-all-inventory";
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

const addPartSchema = z.object({
  inventoryId: z.string().min(1, { message: "Peça é obrigatória" }),
  requiredQuantity: z.number().min(0.01, { message: "Quantidade deve ser maior que 0" }),
});

interface AddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceOrderId: string;
  onRequestPurchase?: (data: { inventoryId: string; quantity: number }) => void;
}

interface InventoryItem {
  id: string;
  name: string;
  code: string | null;
  quantity: string | null;
}

export function AddPartDialog({
  open,
  onOpenChange,
  serviceOrderId,
  onRequestPurchase,
}: AddPartDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const form = useForm<z.infer<typeof addPartSchema>>({
    resolver: zodResolver(addPartSchema),
    defaultValues: {
      inventoryId: "",
      requiredQuantity: 0,
    },
  });

  const selectedQuantity = selectedItem
    ? parseFloat(selectedItem.quantity || "0")
    : 0;
  const isOutOfStock = selectedQuantity === 0;

  useEffect(() => {
    async function loadInventory() {
      try {
        const result = await getAllInventoryAction();
        if (result.items) {
          setInventoryItems(result.items);
        }
      } catch (error) {
        console.error("Erro ao carregar estoque", error);
      }
    }

    if (open) {
      loadInventory();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset({
        inventoryId: "",
        requiredQuantity: 0,
      });
      setSelectedItem(null);
    }
  }, [open, form]);

  async function onSubmit(values: z.infer<typeof addPartSchema>) {
    // Se o estoque estiver zerado e houver callback para solicitar compra
    if (isOutOfStock && onRequestPurchase) {
      onRequestPurchase({
        inventoryId: values.inventoryId,
        quantity: values.requiredQuantity,
      });
      onOpenChange(false);
      return;
    }

    // Se o estoque estiver zerado mas não houver callback, apenas mostrar erro
    if (isOutOfStock) {
      toast.error("Estoque zerado. Não é possível adicionar a peça.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await addServiceOrderItemAction({
        serviceOrderId,
        inventoryId: values.inventoryId,
        requiredQuantity: values.requiredQuantity,
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        toast.error("Verifique os campos do formulário");
        return;
      }

      toast.success("Peça adicionada com sucesso!");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error("Erro ao adicionar peça");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Peça</DialogTitle>
          <DialogDescription>
            Selecione a peça e a quantidade necessária para a ordem de serviço.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <FormField
                control={form.control}
                name="inventoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peça *</FormLabel>
                    <div className="flex items-center gap-2">
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const item = inventoryItems.find((i) => i.id === value);
                          setSelectedItem(item || null);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma peça" />
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
                      {selectedItem && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          Estoque: {selectedQuantity.toLocaleString("pt-BR")} unidades
                        </span>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requiredQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Digite a quantidade"
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
                <Box className="h-4 w-4 mr-2" />
                {isOutOfStock ? "Solicitar Compra" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

