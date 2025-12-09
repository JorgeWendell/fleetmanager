import { z } from "zod";

export const updateInventorySchema = z.object({
  id: z.string(),
  codFabricante: z.string().trim().min(1, { message: "Código do Fabricante é obrigatório" }),
  name: z.string().trim().min(1, { message: "Nome da Peça é obrigatório" }),
  code: z.string().trim().min(1, { message: "Código é obrigatório" }),
  category: z.string().trim().min(1, { message: "Categoria é obrigatória" }),
  unit: z.string().trim().min(1, { message: "Unidade é obrigatória" }),
  quantity: z.coerce.number().min(0).default(0),
  minQuantity: z.coerce.number().min(0).default(0),
  maxQuantity: z.coerce.number().min(0).default(0),
  unitCost: z.coerce.number().min(0).default(0),
  location: z.string().trim().optional(),
  supplierId: z.string().optional(),
  observations: z.string().trim().optional(),
  lastPurchase: z.string().optional(),
});

