"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Check, Loader2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
import { confirmPurchaseReceiptAction } from "@/actions/confirm-purchase-receipt";
import { updatePurchaseStatusAction } from "@/actions/update-purchase-status";

const receiptFormSchema = z.object({
  receiptDate: z.date({ message: "Data de recebimento é obrigatória" }),
  receiverName: z
    .string()
    .min(1, { message: "Nome do recebedor é obrigatório" }),
  invoiceNumber: z.string().min(1, { message: "Nota Fiscal é obrigatória" }),
});

interface ComprasDetailClientProps {
  purchaseId: string;
  currentStatus: string;
  approvedBy?: string | null;
  approvalDate?: Date | null;
}

const approvalFormSchema = z.object({
  approvedBy: z.string().min(1, { message: "Aprovado por é obrigatório" }),
  approvalDate: z.date({ message: "Data de aprovação é obrigatória" }),
});

export function ComprasDetailClient({
  purchaseId,
  currentStatus,
  approvedBy,
  approvalDate,
}: ComprasDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(
    currentStatus === "aprovada" && !!approvedBy
  );

  const approvalForm = useForm<z.infer<typeof approvalFormSchema>>({
    resolver: zodResolver(approvalFormSchema),
    defaultValues: {
      approvedBy: "",
      approvalDate: new Date(),
    },
  });

  // Abrir dialog de aprovação quando o status mudar para "aprovada"
  useEffect(() => {
    if (
      status === "aprovada" &&
      status !== currentStatus &&
      !isSavingStatus &&
      !approvalDialogOpen
    ) {
      setPendingStatus(status);
      setApprovalDialogOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleStatusChange(newStatus: string) {
    setIsSavingStatus(true);
    try {
      const result = await updatePurchaseStatusAction({
        purchaseId,
        status: newStatus as "pendente" | "aprovada" | "recebida" | "cancelada",
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        setStatus(currentStatus); // Reverter para o status anterior
        return;
      }

      if (result?.validationErrors) {
        toast.error("Erro ao atualizar status");
        setStatus(currentStatus); // Reverter para o status anterior
        return;
      }

      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar status");
      setStatus(currentStatus); // Reverter para o status anterior
    } finally {
      setIsSavingStatus(false);
    }
  }

  async function onApprovalSubmit(values: z.infer<typeof approvalFormSchema>) {
    setIsSavingStatus(true);
    try {
      const result = await updatePurchaseStatusAction({
        purchaseId,
        status: "aprovada",
        approvedBy: values.approvedBy,
        approvalDate: values.approvalDate,
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        toast.error("Verifique os campos do formulário");
        return;
      }

      toast.success("Solicitação aprovada com sucesso!");
      setApprovalDialogOpen(false);
      setPendingStatus(null);
      setIsApproved(true);
      setStatus("aprovada");
      approvalForm.reset();
      router.refresh();
    } catch (error) {
      toast.error("Erro ao aprovar solicitação");
    } finally {
      setIsSavingStatus(false);
    }
  }

  const form = useForm<z.infer<typeof receiptFormSchema>>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      receiptDate: new Date(),
      receiverName: "",
      invoiceNumber: "",
    },
  });

  async function onReceiptSubmit(values: z.infer<typeof receiptFormSchema>) {
    setIsLoading(true);
    try {
      const result = await confirmPurchaseReceiptAction({
        purchaseId,
        receiptDate: values.receiptDate,
        receiverName: values.receiverName,
        invoiceNumber: values.invoiceNumber,
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        toast.error("Verifique os campos do formulário");
        return;
      }

      toast.success("Recebimento confirmado com sucesso!");
      setReceiptDialogOpen(false);
      router.push("/compras");
    } catch (error) {
      toast.error("Erro ao confirmar recebimento");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Alterar Status
              </label>
              <Select
                value={status}
                onValueChange={setStatus}
                disabled={isSavingStatus}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                  {isSavingStatus && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="pendente"
                    disabled={
                      status === "aprovada" ||
                      status === "recebida" ||
                      status === "cancelada"
                    }
                  >
                    Pendente
                  </SelectItem>
                  <SelectItem
                    value="aprovada"
                    disabled={status === "recebida"}
                  >
                    Aprovada
                  </SelectItem>
                  <SelectItem value="recebida">Recebida</SelectItem>
                  <SelectItem
                    value="cancelada"
                    disabled={status === "recebida"}
                  >
                    Cancelada
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {status !== "aprovada" &&
            status !== "recebida" &&
            status !== "cancelada" ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/compras/${purchaseId}/editar`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                onClick={(e) => e.preventDefault()}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {isApproved && (
              <Button
                className="bg-gray-900 hover:bg-gray-800 text-white"
                onClick={() => setReceiptDialogOpen(true)}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirmar Recebimento
              </Button>
            )}
          </div>

          {isApproved && (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // TODO: Implementar upload de arquivo
                  toast.info("Funcionalidade de upload em desenvolvimento");
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Enviar Arquivo
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Solicitação</DialogTitle>
            <DialogDescription>
              Preencha os dados da aprovação
            </DialogDescription>
          </DialogHeader>

          <Form {...approvalForm}>
            <form
              onSubmit={approvalForm.handleSubmit(onApprovalSubmit)}
              className="space-y-4"
            >
              <FormField
                control={approvalForm.control}
                name="approvedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aprovado por *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome do aprovador"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={approvalForm.control}
                name="approvalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Aprovação *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setApprovalDialogOpen(false);
                    setStatus(currentStatus);
                    setPendingStatus(null);
                    approvalForm.reset();
                  }}
                  disabled={isSavingStatus}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSavingStatus}>
                  {isSavingStatus && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirmar Aprovação
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Receipt Confirmation Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Recebimento</DialogTitle>
            <DialogDescription>
              Preencha os dados do recebimento da compra
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onReceiptSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="receiptDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Recebimento *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
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

              <FormField
                control={form.control}
                name="receiverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Recebedor *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome do recebedor"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nota Fiscal *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o número da nota fiscal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReceiptDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Concluir
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

