"use client";

import { useState } from "react";
import { ShoppingCart, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { AddPartDialog } from "../components/add-part-dialog";
import { NewPurchaseRequestDialog } from "@/app/(protected)/compras/components/new-purchase-request-dialog";

interface OrdensServicoDetailClientProps {
  serviceOrderId: string;
}

export function OrdensServicoDetailClient({
  serviceOrderId,
}: OrdensServicoDetailClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchaseInitialData, setPurchaseInitialData] = useState<{
    inventoryId?: string;
    quantity?: number;
    serviceOrderId?: string;
  } | null>(null);

  const handleRequestPurchase = (data: {
    inventoryId: string;
    quantity: number;
  }) => {
    setPurchaseInitialData({
      inventoryId: data.inventoryId,
      quantity: data.quantity,
      serviceOrderId: serviceOrderId,
    });
    setPurchaseDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Peças Necessárias</CardTitle>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Adicionar Peça
        </Button>
      </div>

      <AddPartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        serviceOrderId={serviceOrderId}
        onRequestPurchase={handleRequestPurchase}
      />

      <NewPurchaseRequestDialog
        open={purchaseDialogOpen}
        onOpenChange={(open) => {
          setPurchaseDialogOpen(open);
          if (!open) {
            setPurchaseInitialData(null);
          }
        }}
        initialData={purchaseInitialData || undefined}
      />
    </>
  );
}

