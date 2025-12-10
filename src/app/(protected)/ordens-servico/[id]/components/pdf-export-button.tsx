"use client";

import { useState } from "react";
import { Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { ServiceOrderPDFDocument } from "./service-order-pdf";

interface PDFExportButtonProps {
  serviceOrder: {
    number: string;
    description: string;
    status: string;
    priority: string;
    type: string;
    startDate: Date | null;
    scheduledDate: Date | null;
    endDate: Date | null;
    currentMileage: string | null;
    mechanic: string | null;
    estimatedCost: string | null;
    validatedBy: string | null;
    validationDate: Date | null;
  };
  vehicle: {
    plate: string;
    brand: string;
    model: string;
    year: number;
  } | null;
  items: Array<{
    item: {
      description: string;
      requiredQuantity: string;
    };
    inventory: {
      unitCost: string | null;
      location: string | null;
    } | null;
  }>;
}

export function PDFExportButton({
  serviceOrder,
  vehicle,
  items,
}: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const doc = (
        <ServiceOrderPDFDocument
          serviceOrder={serviceOrder}
          vehicle={vehicle}
          items={items}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `OS-${serviceOrder.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownloadPDF}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </>
      )}
    </Button>
  );
}

