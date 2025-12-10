"use client";

import { useState } from "react";
import { Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { MaintenancePDFDocument } from "./maintenance-pdf";

interface PDFExportButtonProps {
  maintenance: {
    id: string;
    type: string;
    description: string;
    cost: string | null;
    mileage: number;
    startDate: Date | null;
    endDate: Date | null;
    provider: string | null;
    mechanic: string | null;
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
  maintenance,
  vehicle,
  items,
}: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const doc = (
        <MaintenancePDFDocument
          maintenance={maintenance}
          vehicle={vehicle}
          items={items}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Manutencao-${maintenance.id.slice(0, 8)}.pdf`;
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

