import { z } from "zod";

export const updateVehicleSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
  plate: z.string().trim().min(1, { message: "Placa é obrigatória" }),
  brand: z.string().trim().min(1, { message: "Marca é obrigatória" }),
  model: z.string().trim().min(1, { message: "Modelo é obrigatório" }),
  year: z.coerce.number().int().min(1900).max(2100, { message: "Ano inválido" }),
  color: z.string().trim().optional(),
  chassis: z.string().trim().optional(),
  renavam: z.string().trim().optional(),
  mileage: z.coerce.number().int().min(0).default(0),
  fuelType: z.string().trim().min(1, { message: "Tipo de combustível é obrigatório" }),
  status: z.enum(["disponivel", "em_uso", "manutencao", "inativo"]),
  inMaintenance: z.boolean().default(false),
  currentDriverId: z.string().optional(),
  lastMaintenance: z.coerce.date().optional().nullable(),
  nextMaintenance: z.coerce.date().optional().nullable(),
});

