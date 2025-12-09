import { z } from "zod";

export const createVehicleSchema = z.object({
  plate: z.string().trim().min(1, { message: "Placa é obrigatória" }),
  brand: z.string().trim().min(1, { message: "Marca é obrigatória" }),
  model: z.string().trim().min(1, { message: "Modelo é obrigatório" }),
  year: z.coerce.number().int().min(1900).max(2100, { message: "Ano inválido" }),
  color: z.string().trim().optional(),
  chassis: z.string().trim().optional(),
  renavam: z.string().trim().optional(),
  mileage: z.coerce.number().int().min(0).default(0),
  fuelType: z.string().trim().min(1, { message: "Tipo de combustível é obrigatório" }),
  inMaintenance: z.boolean().default(false),
});

