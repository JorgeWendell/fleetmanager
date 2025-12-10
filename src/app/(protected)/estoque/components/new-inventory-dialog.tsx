"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createInventoryAction } from "@/actions/create-inventory";
import { getSuppliersAction } from "@/actions/get-suppliers";
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

const inventorySchema = z.object({
  codFabricante: z.string().trim().min(1, { message: "Código do Fabricante é obrigatório" }),
  name: z.string().trim().min(1, { message: "Nome da Peça é obrigatório" }),
  code: z.string().trim().min(1, { message: "Código é obrigatório" }),
  category: z.string().trim().min(1, { message: "Categoria é obrigatória" }),
  unit: z.string().trim().min(1, { message: "Unidade é obrigatória" }),
  quantity: z.number().min(0),
  minQuantity: z.number().min(0),
  maxQuantity: z.number().min(0),
  unitCost: z.number().min(0),
  location: z.string().trim().optional(),
  supplierId: z.string().optional(),
  observations: z.string().trim().optional(),
  lastPurchase: z.string().optional(),
});

interface NewInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewInventoryDialog({
  open,
  onOpenChange,
}: NewInventoryDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);

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
    async function loadSuppliers() {
      try {
        const result = await getSuppliersAction();
        if (result.suppliers) {
          setSuppliers(result.suppliers);
        }
      } catch (error) {
        console.error("Erro ao carregar fornecedores", error);
      }
    }

    if (open) {
      loadSuppliers();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset({
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
      });
    }
  }, [open, form]);

  async function onSubmit(values: z.infer<typeof inventorySchema>) {
    setIsLoading(true);
    try {
      const result = await createInventoryAction(values);

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        toast.error("Verifique os campos do formulário");
        return;
      }

      toast.success("Peça cadastrada com sucesso!");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error("Erro ao cadastrar peça");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Peça</DialogTitle>
          <DialogDescription>
            Adicione uma nova peça ao estoque do sistema
          </DialogDescription>
        </DialogHeader>

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
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Peça
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

