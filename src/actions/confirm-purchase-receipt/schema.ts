import { z } from "zod";

export const confirmPurchaseReceiptSchema = z.object({
  purchaseId: z.string().min(1, { message: "ID da compra é obrigatório" }),
  receiptDate: z.date({ message: "Data de recebimento é obrigatória" }),
  receiverName: z
    .string()
    .min(1, { message: "Nome do recebedor é obrigatório" }),
  invoiceNumber: z.string().min(1, { message: "Nota Fiscal é obrigatória" }),
});

