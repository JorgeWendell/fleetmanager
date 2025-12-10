import { z } from "zod";

export const updateServiceOrderStatusSchema = z.object({
  serviceOrderId: z.string().min(1, { message: "ID da ordem de serviço é obrigatório" }),
  status: z.enum(["aberta", "em_andamento", "concluida", "cancelada"], {
    message: "Status é obrigatório",
  }),
  validatedBy: z.string().optional(),
  validationDate: z.date().optional(),
});

