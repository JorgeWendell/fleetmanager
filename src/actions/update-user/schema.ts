import { z } from "zod";

export const updateUserSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }).optional(),
  emailVerified: z.boolean().default(false),
  isAdministrator: z.boolean().default(false),
  isOperator: z.boolean().default(false),
  isManager: z.boolean().default(false),
});

