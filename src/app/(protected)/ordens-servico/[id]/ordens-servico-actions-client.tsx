"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, Pencil, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { updateServiceOrderStatusAction } from "@/actions/update-service-order-status";
import { PDFExportButton } from "./components/pdf-export-button";

const validationFormSchema = z.object({
  validatedBy: z.string().min(1, { message: "Validado por é obrigatório" }),
  validationDate: z.date({ required_error: "Data da validação é obrigatória" }),
});

interface OrdensServicoActionsClientProps {
  serviceOrderId: string;
  currentStatus: string;
  serviceOrder: {
    number: string;
    description: string;
    status: string;
    priority: string;
    type: string;
    startDate: Date | null;
    scheduledDate: Date | null;
    endDate: Date | null;
    currentMileage: string | null;
    mechanic: string | null;
    estimatedCost: string | null;
    validatedBy: string | null;
    validationDate: Date | null;
  };
  vehicle: {
    plate: string;
    brand: string;
    model: string;
    year: number;
  } | null;
  items: Array<{
    item: {
      description: string;
      requiredQuantity: string;
    };
    inventory: {
      unitCost: string | null;
      location: string | null;
    } | null;
  }>;
}

export function OrdensServicoActionsClient({
  serviceOrderId,
  currentStatus,
  serviceOrder,
  vehicle,
  items,
}: OrdensServicoActionsClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const validationForm = useForm<z.infer<typeof validationFormSchema>>({
    resolver: zodResolver(validationFormSchema),
    defaultValues: {
      validatedBy: "",
      validationDate: new Date(),
    },
  });

  // Sincronizar o estado local com o currentStatus quando ele mudar
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  // Usar currentStatus do servidor para determinar se está concluída (mais confiável)
  const isInProgress = currentStatus === "em_andamento";
  const isCompleted = currentStatus === "concluida";
  const isCancelled = currentStatus === "cancelada";

  // Abrir dialog de validação quando o status mudar para "concluida"
  useEffect(() => {
    if (
      status === "concluida" &&
      status !== currentStatus &&
      !isSavingStatus &&
      !validationDialogOpen &&
      currentStatus !== "concluida"
    ) {
      setPendingStatus(status);
      setValidationDialogOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, currentStatus]);

  async function handleStatusChange(newStatus: string) {
    // Se for "concluida", não salvar ainda, apenas abrir o dialog
    if (newStatus === "concluida") {
      setStatus(newStatus);
      return;
    }

    setIsSavingStatus(true);
    setStatus(newStatus);

    try {
      const result = await updateServiceOrderStatusAction({
        serviceOrderId,
        status: newStatus as "aberta" | "em_andamento" | "concluida" | "cancelada",
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        setStatus(currentStatus);
        return;
      }

      if (result?.validationErrors) {
        toast.error("Erro ao atualizar status");
        setStatus(currentStatus);
        return;
      }

      toast.success("Status atualizado com sucesso!");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao atualizar status");
      setStatus(currentStatus);
    } finally {
      setIsSavingStatus(false);
    }
  }

  async function onValidationSubmit(
    values: z.infer<typeof validationFormSchema>
  ) {
    setIsSavingStatus(true);

    try {
      const result = await updateServiceOrderStatusAction({
        serviceOrderId,
        status: "concluida",
        validatedBy: values.validatedBy,
        validationDate: values.validationDate,
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        toast.error("Erro ao concluir ordem de serviço");
        return;
      }

      toast.success("Ordem de serviço concluída com sucesso!");
      setValidationDialogOpen(false);
      validationForm.reset();
      // Redirecionar para a lista de ordens de serviço
      window.location.href = "/ordens-servico";
    } catch (error) {
      toast.error("Erro ao concluir ordem de serviço");
    } finally {
      setIsSavingStatus(false);
    }
  }

  return (
    <div className="flex items-end gap-4">
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">
          Alterar Status
        </label>
        <Select
          value={currentStatus}
          onValueChange={handleStatusChange}
          disabled={isSavingStatus || isCompleted}
        >
          <SelectTrigger className="h-10">
            <SelectValue />
            {isSavingStatus && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="aberta"
              disabled={isInProgress || isCompleted || isCancelled}
            >
              Aberta
            </SelectItem>
            <SelectItem value="em_andamento" disabled={isCompleted}>
              Em Andamento
            </SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada" disabled={isCompleted}>
              Cancelada
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isInProgress || isCompleted || isCancelled}
          onClick={() => {
            if (!isInProgress && !isCompleted && !isCancelled) {
              setStatus("concluida");
            }
          }}
        >
          <Check className="h-4 w-4 mr-2" />
          Concluir
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isInProgress || isCompleted || isCancelled}
          onClick={() => {
            if (!isInProgress && !isCompleted && !isCancelled) {
              handleStatusChange("cancelada");
            }
          }}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          disabled={isInProgress || isCompleted || isCancelled}
        >
          <Link
            href={`/ordens-servico/${serviceOrderId}/editar`}
            onClick={(e) => {
              if (isInProgress || isCompleted || isCancelled) {
                e.preventDefault();
              }
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
        <PDFExportButton
          serviceOrder={serviceOrder}
          vehicle={vehicle}
          items={items}
        />
      </div>

      {/* Dialog de Validação */}
      <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Concluir Ordem de Serviço</DialogTitle>
            <DialogDescription>
              Preencha os dados da validação para concluir a ordem de serviço
            </DialogDescription>
          </DialogHeader>

          <Form {...validationForm}>
            <form
              onSubmit={validationForm.handleSubmit(onValidationSubmit)}
              className="space-y-4"
            >
              <FormField
                control={validationForm.control}
                name="validatedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validado por *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome do validador"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={validationForm.control}
                name="validationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Validação *</FormLabel>
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
                    setValidationDialogOpen(false);
                    setStatus(currentStatus); // Reverter para o status atual do servidor
                    setPendingStatus(null);
                    validationForm.reset();
                  }}
                  disabled={isSavingStatus}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSavingStatus}>
                  {isSavingStatus && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirmar Conclusão
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

