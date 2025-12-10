import { z } from "zod";

export const updatePurchaseStatusSchema = z.object({
  purchaseId: z.string().min(1, { message: "ID da compra é obrigatório" }),
  status: z.enum(["pendente", "aprovada", "recebida", "cancelada"]),
  approvedBy: z
    .string()
    .min(1, { message: "Aprovado por é obrigatório" })
    .optional(),
  approvalDate: z.date().optional(),
});
