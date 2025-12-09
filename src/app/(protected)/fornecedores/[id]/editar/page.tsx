"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { use } from "react";

import { updateSupplierAction } from "@/actions/update-supplier";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getSupplierAction } from "@/actions/get-supplier";

const supplierSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome da empresa é obrigatório" }),
  cnpj: z.string().trim().min(1, { message: "CNPJ é obrigatório" }),
  category: z.string().trim().min(1, { message: "Categoria é obrigatória" }),
  contactPerson: z.string().trim().min(1, { message: "Nome do contato é obrigatório" }),
  phone: z.string().trim().min(1, { message: "Telefone é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }).min(1, { message: "Email é obrigatório" }),
  website: z.string().trim().optional(),
  address: z.string().trim().min(1, { message: "Endereço completo é obrigatório" }),
  paymentTerms: z.string().trim().optional(),
  deliveryDays: z.coerce.number().int().min(0).optional(),
  observations: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

export default function EditarFornecedorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const resolvedParams = use(params);

  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      category: "",
      contactPerson: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      paymentTerms: "",
      deliveryDays: 0,
      observations: "",
      isActive: true,
    },
  });

  useEffect(() => {
    async function loadSupplier() {
      try {
        const result = await getSupplierAction(resolvedParams.id);
        if (result.error) {
          toast.error(result.error);
          router.push("/fornecedores");
          return;
        }

        if (result.supplier) {
          form.reset({
            name: result.supplier.name,
            cnpj: result.supplier.cnpj || "",
            category: result.supplier.category || "",
            contactPerson: result.supplier.contactPerson || "",
            phone: result.supplier.phone || "",
            email: result.supplier.email || "",
            website: result.supplier.website || "",
            address: result.supplier.address || "",
            paymentTerms: result.supplier.paymentTerms || "",
            deliveryDays: result.supplier.deliveryDays || 0,
            observations: result.supplier.observations || "",
            isActive: result.supplier.isActive,
          });
        }
      } catch (error) {
        toast.error("Erro ao carregar fornecedor");
        router.push("/fornecedores");
      } finally {
        setIsLoadingData(false);
      }
    }

    loadSupplier();
  }, [resolvedParams.id, form, router]);

  async function onSubmit(values: z.infer<typeof supplierSchema>) {
    setIsLoading(true);
    try {
      const result = await updateSupplierAction({
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

      toast.success("Fornecedor atualizado com sucesso!");
      router.push("/fornecedores");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao atualizar fornecedor");
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
          <PageTitle className="text-3xl font-bold">Editar Fornecedor</PageTitle>
          <PageDescription className="text-base">
            Atualize os dados do fornecedor
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
                        <FormLabel>Nome da Empresa *</FormLabel>
                        <FormControl>
                          <Input placeholder="AutoPeças Brasil Ltda" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ *</FormLabel>
                          <FormControl>
                            <Input placeholder="12.345.678/0001-90" {...field} />
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
                                <SelectValue placeholder="Peças Automotivas" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Peças Automotivas">Peças Automotivas</SelectItem>
                              <SelectItem value="Filtros e Lubrificantes">Filtros e Lubrificantes</SelectItem>
                              <SelectItem value="Peças Importadas">Peças Importadas</SelectItem>
                              <SelectItem value="Serviços de Manutenção">Serviços de Manutenção</SelectItem>
                              <SelectItem value="Pneus e Rodas">Pneus e Rodas</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
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
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Contato *</FormLabel>
                          <FormControl>
                            <Input placeholder="Carlos Mendes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 3456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contato@autopecasbrasil.com.br"
                            {...field}
                          />
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
                        <FormLabel>Endereço Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Av. Industrial, 1500 - São Paulo/SP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="www.autopecasbrasil.com.br" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="paymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condições de Pagamento</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="30 dias" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="À vista">À vista</SelectItem>
                              <SelectItem value="30 dias">30 dias</SelectItem>
                              <SelectItem value="60 dias">60 dias</SelectItem>
                              <SelectItem value="90 dias">90 dias</SelectItem>
                              <SelectItem value="Boleto">Boleto</SelectItem>
                              <SelectItem value="Cartão">Cartão</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prazo de Entrega (dias)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="5"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : 0
                                )
                              }
                              value={field.value || 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Informações adicionais sobre o fornecedor..."
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Label htmlFor="active-switch" className="text-sm font-medium">
                      Ativo
                    </Label>
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              id="active-switch"
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
                    onClick={() => router.push("/fornecedores")}
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

