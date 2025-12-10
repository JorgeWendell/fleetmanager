import { z } from "zod";

export const updatePurchaseSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
  inventoryId: z.string().min(1, { message: "Item do Estoque é obrigatório" }),
  quantity: z.coerce
    .number()
    .min(0.01, { message: "Quantidade deve ser maior que 0" }),
  urgency: z.enum(["baixa", "media", "alta", "urgente"], {
    message: "Urgência é obrigatória",
  }),
  serviceOrderId: z.string().optional(),
  supplierId: z.string().optional(),
  notes: z.string().trim().optional(),
});

