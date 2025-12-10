"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createDriverAction } from "@/actions/create-driver";
import { updateDriverAction } from "@/actions/update-driver";
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

const driverSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  cpf: z.string().trim().min(11, { message: "CPF é obrigatório" }),
  cnh: z.string().trim().min(1, { message: "CNH é obrigatória" }),
  cnhCategory: z.string().trim().min(1, { message: "Categoria CNH é obrigatória" }),
  cnhExpiry: z.date({ message: "Data de validade inválida" }),
  phone: z.string().trim().optional(),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  address: z.string().trim().optional(),
  status: z.enum(["ativo", "ferias", "inativo"]),
});

interface DriverData {
  id: string;
  name: string;
  cpf: string;
  cnh: string;
  cnhCategory: string;
  cnhExpiry: Date;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: string;
}

interface NewDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver?: DriverData | null;
}

export function NewDriverDialog({
  open,
  onOpenChange,
  driver,
}: NewDriverDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!driver;

  const form = useForm<z.infer<typeof driverSchema>>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: driver?.name || "",
      cpf: driver?.cpf || "",
      cnh: driver?.cnh || "",
      cnhCategory: driver?.cnhCategory || "",
      cnhExpiry: driver?.cnhExpiry || new Date(),
      phone: driver?.phone || "",
      email: driver?.email || "",
      address: driver?.address || "",
      status: (driver?.status as "ativo" | "ferias" | "inativo") || "ativo",
    },
  });

  useEffect(() => {
    if (driver) {
      form.reset({
        name: driver.name,
        cpf: driver.cpf,
        cnh: driver.cnh,
        cnhCategory: driver.cnhCategory,
        cnhExpiry: driver.cnhExpiry,
        phone: driver.phone || "",
        email: driver.email || "",
        address: driver.address || "",
        status: driver.status as "ativo" | "ferias" | "inativo",
      });
    } else {
      form.reset({
        name: "",
        cpf: "",
        cnh: "",
        cnhCategory: "",
        cnhExpiry: new Date(),
        phone: "",
        email: "",
        address: "",
        status: "ativo",
      });
    }
  }, [driver, form]);

  async function onSubmit(values: z.infer<typeof driverSchema>) {
    setIsLoading(true);
    try {
      let result;
      if (isEditing && driver) {
        result = await updateDriverAction({
          id: driver.id,
          ...values,
        });
      } else {
        result = await createDriverAction(values);
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
          ? "Motorista atualizado com sucesso!"
          : "Motorista cadastrado com sucesso!"
      );
      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        isEditing ? "Erro ao atualizar motorista" : "Erro ao cadastrar motorista"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Motorista" : "Novo Motorista"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do motorista"
              : "Preencha os dados do motorista para cadastrá-lo no sistema"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cnh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNH *</FormLabel>
                      <FormControl>
                        <Input placeholder="Número da CNH" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnhCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
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
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value
                              ? formatDateForInput(field.value)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 98765-4321" {...field} />
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
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço completo" {...field} />
                    </FormControl>
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

