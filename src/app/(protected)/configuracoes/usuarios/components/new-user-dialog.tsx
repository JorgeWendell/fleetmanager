"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createUserAction } from "@/actions/create-user";
import { updateUserAction } from "@/actions/update-user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const userSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
  emailVerified: z.boolean().default(false),
  isAdministrator: z.boolean().default(false),
  isOperator: z.boolean().default(false),
  isManager: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().refine((val) => val === "" || val.length >= 6, {
    message: "Senha deve ter no mínimo 6 caracteres",
  }),
  emailVerified: z.boolean().default(false),
  isAdministrator: z.boolean().default(false),
  isOperator: z.boolean().default(false),
  isManager: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

interface UserData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  isAdministrator: boolean;
  isOperator: boolean;
  isManager: boolean;
  isActive?: boolean;
}

interface NewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserData | null;
}

export function NewUserDialog({
  open,
  onOpenChange,
  user,
}: NewUserDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!user;

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(isEditing ? updateUserSchema : userSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      emailVerified: user?.emailVerified || false,
      isAdministrator: user?.isAdministrator || false,
      isOperator: user?.isOperator || false,
      isManager: user?.isManager || false,
      isActive: user?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: "",
        emailVerified: user.emailVerified,
        isAdministrator: user.isAdministrator,
        isOperator: user.isOperator,
        isManager: user.isManager,
        isActive: user.isActive ?? true,
      });
    } else {
      form.reset({
        name: "",
        email: "",
        password: "",
        emailVerified: false,
        isAdministrator: false,
        isOperator: false,
        isManager: false,
        isActive: true,
      });
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        const result = await updateUserAction({
          id: user!.id,
          name: values.name,
          email: values.email,
          password: values.password && values.password.length > 0 ? values.password : undefined,
          emailVerified: values.emailVerified,
          isAdministrator: values.isAdministrator,
          isOperator: values.isOperator,
          isManager: values.isManager,
          isActive: values.isActive,
        });

        if (result?.serverError) {
          toast.error(result.serverError);
          return;
        }

        if (result?.validationErrors) {
          toast.error("Verifique os campos do formulário");
          return;
        }

        toast.success("Usuário atualizado com sucesso!");
      } else {
        const result = await createUserAction({
          name: values.name,
          email: values.email,
          password: values.password,
          emailVerified: values.emailVerified,
          isAdministrator: values.isAdministrator,
          isOperator: values.isOperator,
          isManager: values.isManager,
          isActive: values.isActive,
        });

        if (result?.serverError) {
          toast.error(result.serverError);
          return;
        }

        if (result?.validationErrors) {
          toast.error("Verifique os campos do formulário");
          return;
        }

        toast.success("Usuário criado com sucesso!");
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error("Erro ao salvar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do usuário"
              : "Preencha os dados para criar um novo usuário"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome completo" {...field} />
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
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Digite o email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Senha {isEditing ? "(deixe em branco para manter)" : "*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Digite a senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailVerified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Email Verificado</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel className="text-base font-semibold">Níveis de Acesso</FormLabel>
              
              <FormField
                control={form.control}
                name="isAdministrator"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Administrador</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isOperator"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Operador</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isManager"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Gerente</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Ativo</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

