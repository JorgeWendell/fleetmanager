import { z } from "zod";

export const createDriverSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  cpf: z.string().trim().min(11, { message: "CPF é obrigatório" }),
  cnh: z.string().trim().min(1, { message: "CNH é obrigatória" }),
  cnhCategory: z.string().trim().min(1, { message: "Categoria CNH é obrigatória" }),
  cnhExpiry: z.coerce.date({ message: "Data de validade inválida" }),
  phone: z.string().trim().optional(),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  address: z.string().trim().optional(),
  status: z.enum(["ativo", "ferias", "inativo"]).default("ativo"),
});

