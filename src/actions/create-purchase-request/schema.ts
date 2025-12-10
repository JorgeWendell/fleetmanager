import { z } from "zod";

export const createPurchaseRequestSchema = z.object({
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

