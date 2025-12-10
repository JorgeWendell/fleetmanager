"use client";

import { PDFExportButton } from "./pdf-export-button";

interface PDFButtonWrapperProps {
  maintenance: {
    id: string;
    type: string;
    description: string;
    cost: string | null;
    mileage: number;
    startDate: string | null;
    endDate: string | null;
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

export function PDFButtonWrapper({
  maintenance,
  vehicle,
  items,
}: PDFButtonWrapperProps) {
  // Converter strings ISO de volta para Date objects
  const maintenanceWithDates = {
    ...maintenance,
    startDate: maintenance.startDate ? new Date(maintenance.startDate) : null,
    endDate: maintenance.endDate ? new Date(maintenance.endDate) : null,
  };

  return (
    <PDFExportButton
      maintenance={maintenanceWithDates}
      vehicle={vehicle}
      items={items}
    />
  );
}

