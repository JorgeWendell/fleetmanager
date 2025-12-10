import { z } from "zod";

export const addServiceOrderItemSchema = z.object({
  serviceOrderId: z.string().min(1, { message: "Ordem de serviço é obrigatória" }),
  inventoryId: z.string().min(1, { message: "Peça é obrigatória" }),
  requiredQuantity: z.coerce
    .number()
    .min(0.01, { message: "Quantidade deve ser maior que 0" }),
});

