"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

interface ServiceOrderPDFProps {
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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2px solid #3b82f6",
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 5,
  },
  companySubtitle: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 10,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: "1px solid #e2e8f0",
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: "40%",
    color: "#64748b",
    fontWeight: "bold",
  },
  value: {
    width: "60%",
    color: "#1e293b",
  },
  badge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
    marginRight: 5,
  },
  badgeSuccess: {
    backgroundColor: "#10b981",
    color: "#ffffff",
  },
  badgeWarning: {
    backgroundColor: "#f59e0b",
    color: "#ffffff",
  },
  badgeDanger: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
  },
  badgeInfo: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 8,
    fontWeight: "bold",
    fontSize: 9,
    borderBottom: "1px solid #cbd5e1",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1px solid #e2e8f0",
  },
  tableCell: {
    fontSize: 9,
    color: "#1e293b",
  },
  col1: { width: "40%" },
  col2: { width: "15%" },
  col3: { width: "20%" },
  col4: { width: "25%" },
  totalSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    border: "1px solid #e2e8f0",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1px solid #e2e8f0",
    fontSize: 8,
    color: "#64748b",
    textAlign: "center",
  },
});

function formatDate(date: Date | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatCurrency(value: string | null) {
  if (!value) return "R$ 0,00";
  const numValue = parseFloat(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
}

function formatStatus(status: string) {
  const statusMap: Record<string, string> = {
    aberta: "Aberta",
    em_andamento: "Em Andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
  };
  return statusMap[status] || status;
}

function formatPriority(priority: string) {
  const priorityMap: Record<string, string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    urgente: "Urgente",
  };
  return priorityMap[priority] || priority;
}

function formatType(type: string) {
  const typeMap: Record<string, string> = {
    preventiva: "Preventiva",
    corretiva: "Corretiva",
    preditiva: "Preditiva",
  };
  return typeMap[type] || type;
}

export function ServiceOrderPDFDocument({
  serviceOrder,
  vehicle,
  items,
}: ServiceOrderPDFProps) {
  const totalPartsCost = items.reduce((sum, itemData) => {
    const requiredQty = parseFloat(itemData.item.requiredQuantity || "0");
    const unitCost = itemData.inventory
      ? parseFloat(itemData.inventory.unitCost || "0")
      : 0;
    return sum + requiredQty * unitCost;
  }, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>Fleet Manager</Text>
          <Text style={styles.companySubtitle}>
            Sistema de Gestão de Frotas
          </Text>
          <Text style={styles.documentTitle}>Ordem de Serviço</Text>
        </View>

        {/* Service Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Ordem de Serviço</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Número da OS:</Text>
            <Text style={styles.value}>{serviceOrder.number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{formatStatus(serviceOrder.status)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Prioridade:</Text>
            <Text style={styles.value}>
              {formatPriority(serviceOrder.priority)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.value}>{formatType(serviceOrder.type)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Descrição:</Text>
            <Text style={styles.value}>{serviceOrder.description}</Text>
          </View>
        </View>

        {/* Vehicle Info */}
        {vehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações do Veículo</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Placa:</Text>
              <Text style={styles.value}>{vehicle.plate}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Marca/Modelo:</Text>
              <Text style={styles.value}>
                {vehicle.brand} {vehicle.model}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Ano:</Text>
              <Text style={styles.value}>{vehicle.year}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Quilometragem:</Text>
              <Text style={styles.value}>
                {serviceOrder.currentMileage
                  ? `${parseFloat(serviceOrder.currentMileage).toLocaleString("pt-BR")} km`
                  : "-"}
              </Text>
            </View>
          </View>
        )}

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes do Serviço</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Mecânico Responsável:</Text>
            <Text style={styles.value}>
              {serviceOrder.mechanic || "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Criação:</Text>
            <Text style={styles.value}>
              {formatDate(serviceOrder.startDate)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data Agendada:</Text>
            <Text style={styles.value}>
              {formatDate(serviceOrder.scheduledDate)}
            </Text>
          </View>
          {serviceOrder.endDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Data de Conclusão:</Text>
              <Text style={styles.value}>
                {formatDate(serviceOrder.endDate)}
              </Text>
            </View>
          )}
          {serviceOrder.validatedBy && (
            <View style={styles.row}>
              <Text style={styles.label}>Validado por:</Text>
              <Text style={styles.value}>{serviceOrder.validatedBy}</Text>
            </View>
          )}
          {serviceOrder.validationDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Data de Validação:</Text>
              <Text style={styles.value}>
                {formatDate(serviceOrder.validationDate)}
              </Text>
            </View>
          )}
        </View>

        {/* Parts List */}
        {items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Peças Utilizadas</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.col1]}>Peça</Text>
                <Text style={[styles.tableCell, styles.col2]}>Qtd</Text>
                <Text style={[styles.tableCell, styles.col3]}>Valor Unit.</Text>
                <Text style={[styles.tableCell, styles.col4]}>Valor Total</Text>
              </View>
              {items.map((itemData, index) => {
                const requiredQty = parseFloat(
                  itemData.item.requiredQuantity || "0"
                );
                const unitCost = itemData.inventory
                  ? parseFloat(itemData.inventory.unitCost || "0")
                  : 0;
                const totalValue = requiredQty * unitCost;

                return (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.col1]}>
                      {itemData.item.description}
                    </Text>
                    <Text style={[styles.tableCell, styles.col2]}>
                      {requiredQty}
                    </Text>
                    <Text style={[styles.tableCell, styles.col3]}>
                      {formatCurrency(unitCost.toString())}
                    </Text>
                    <Text style={[styles.tableCell, styles.col4]}>
                      {formatCurrency(totalValue.toString())}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Custo Total:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(serviceOrder.estimatedCost || totalPartsCost.toString())}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Documento gerado em {new Date().toLocaleDateString("pt-BR")} às{" "}
            {new Date().toLocaleTimeString("pt-BR")}
          </Text>
          <Text style={{ marginTop: 5 }}>
            Fleet Manager - Sistema de Gestão de Frotas
          </Text>
        </View>
      </Page>
    </Document>
  );
}

