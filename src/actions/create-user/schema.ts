import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
  emailVerified: z.boolean().default(false),
  isAdministrator: z.boolean().default(false),
  isOperator: z.boolean().default(false),
  isManager: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

