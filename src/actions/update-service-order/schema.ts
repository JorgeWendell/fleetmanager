import { z } from "zod";

export const updateServiceOrderSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
  vehicleId: z.string().min(1, { message: "Veículo é obrigatório" }),
  type: z.enum(["preventiva", "corretiva", "preditiva"], {
    message: "Tipo é obrigatório",
  }),
  priority: z.enum(["baixa", "media", "alta", "urgente"], {
    message: "Prioridade é obrigatória",
  }),
  currentMileage: z.coerce
    .number()
    .min(0, { message: "Quilometragem deve ser maior ou igual a 0" }),
  mechanic: z.string().trim().optional(),
  description: z.string().trim().min(1, { message: "Descrição é obrigatória" }),
  scheduledDate: z.string().optional(),
  estimatedCost: z.coerce.number().min(0).optional(),
});

