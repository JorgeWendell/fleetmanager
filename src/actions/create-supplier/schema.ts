import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome da empresa é obrigatório" }),
  cnpj: z.string().trim().min(1, { message: "CNPJ é obrigatório" }),
  category: z.string().trim().min(1, { message: "Categoria é obrigatória" }),
  contactPerson: z.string().trim().min(1, { message: "Nome do contato é obrigatório" }),
  phone: z.string().trim().min(1, { message: "Telefone é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }).min(1, { message: "Email é obrigatório" }),
  website: z.string().trim().optional(),
  address: z.string().trim().min(1, { message: "Endereço completo é obrigatório" }),
  paymentTerms: z.string().trim().optional(),
  deliveryDays: z.coerce.number().int().min(0).optional(),
  observations: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

