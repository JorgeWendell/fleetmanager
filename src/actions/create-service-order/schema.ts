import { z } from "zod";

export const createServiceOrderSchema = z.object({
  vehicleId: z.string().min(1, { message: "Veículo é obrigatório" }),
  type: z.enum(["preventiva", "corretiva", "preditiva"], {
    required_error: "Tipo é obrigatório",
  }),
  priority: z.enum(["baixa", "media", "alta", "urgente"], {
    required_error: "Prioridade é obrigatória",
  }),
  currentMileage: z.coerce.number().min(0, { message: "Quilometragem deve ser maior ou igual a 0" }),
  mechanic: z.string().trim().optional(),
  description: z.string().trim().min(1, { message: "Descrição é obrigatória" }),
  scheduledDate: z.string().optional(),
  estimatedCost: z.coerce.number().min(0).optional(),
});

