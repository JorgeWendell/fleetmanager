"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createVehicleAction } from "@/actions/create-vehicle";
import { updateVehicleAction } from "@/actions/update-vehicle";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getDriversAction } from "@/actions/get-drivers";

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
  inMaintenance: z.boolean().default(false),
  currentDriverId: z.string().optional(),
});

interface VehicleData {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  chassis: string | null;
  renavam: string | null;
  mileage: number;
  fuelType: string;
  status: string;
  inMaintenance: boolean;
}

interface NewVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: VehicleData | null;
}

export function NewVehicleDialog({
  open,
  onOpenChange,
  vehicle,
}: NewVehicleDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [drivers, setDrivers] = useState<Array<{ id: string; name: string; cnh: string }>>([]);
  const isEditing = !!vehicle;

  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plate: vehicle?.plate || "",
      brand: vehicle?.brand || "",
      model: vehicle?.model || "",
      year: vehicle?.year || new Date().getFullYear(),
      color: vehicle?.color || "",
      chassis: vehicle?.chassis || "",
      renavam: vehicle?.renavam || "",
      mileage: vehicle?.mileage || 0,
      fuelType: vehicle?.fuelType || "",
      inMaintenance: vehicle?.inMaintenance || false,
      currentDriverId: vehicle?.currentDriverId || "",
    },
  });

  useEffect(() => {
    async function loadDrivers() {
      try {
        const result = await getDriversAction();
        if (result.drivers) {
          setDrivers(result.drivers);
        }
      } catch (error) {
        console.error("Erro ao carregar motoristas", error);
      }
    }

    loadDrivers();
  }, []);

  useEffect(() => {
    if (vehicle) {
      form.reset({
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color || "",
        chassis: vehicle.chassis || "",
        renavam: vehicle.renavam || "",
        mileage: vehicle.mileage,
        fuelType: vehicle.fuelType,
        inMaintenance: vehicle.inMaintenance,
        currentDriverId: vehicle.currentDriverId || "",
      });
    } else {
      form.reset({
        plate: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
        chassis: "",
        renavam: "",
        mileage: 0,
        fuelType: "",
        inMaintenance: false,
        currentDriverId: "",
      });
    }
  }, [vehicle, form]);

  async function onSubmit(values: z.infer<typeof vehicleSchema>) {
    setIsLoading(true);
    try {
      let result;
      if (isEditing && vehicle) {
        result = await updateVehicleAction({
          id: vehicle.id,
          ...values,
          status: vehicle.status,
          inMaintenance: values.inMaintenance,
          currentDriverId: values.currentDriverId || undefined,
        });
      } else {
        result = await createVehicleAction(values);
      }

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        toast.error("Verifique os campos do formulário");
        return;
      }

      toast.success(
        isEditing
          ? "Veículo atualizado com sucesso!"
          : "Veículo cadastrado com sucesso!"
      );
      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        isEditing ? "Erro ao atualizar veículo" : "Erro ao cadastrar veículo"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do veículo"
              : "Preencha os dados do veículo para cadastrá-lo no sistema"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ABC-1234"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
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
                          <SelectItem value="eletrico">Elétrico</SelectItem>
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
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ford" {...field} />
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
                        <Input placeholder="Ex: Fiesta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2024"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                        <Input placeholder="Ex: Branco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quilometragem</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                {isEditing ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

