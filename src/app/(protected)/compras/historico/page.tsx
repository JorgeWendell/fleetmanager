import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { db } from "@/db/index";
import {
  purchasesTable,
  suppliersTable,
  inventoryTable,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

async function getReceivedPurchases() {
  return await db
    .select({
      purchase: purchasesTable,
      supplier: suppliersTable,
      inventory: inventoryTable,
    })
    .from(purchasesTable)
    .leftJoin(
      suppliersTable,
      eq(purchasesTable.supplierId, suppliersTable.id)
    )
    .leftJoin(
      inventoryTable,
      eq(purchasesTable.inventoryId, inventoryTable.id)
    )
    .where(eq(purchasesTable.status, "recebida"))
    .orderBy(desc(purchasesTable.createdAt));
}

export default async function ComprasHistoricoPage() {
  const purchases = await getReceivedPurchases();

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pendente: "Pendente",
      aprovada: "Aprovada",
      recebida: "Recebida",
      cancelada: "Cancelada",
    };
    return statusMap[status] || status;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "recebida":
        return "default";
      case "aprovada":
        return "secondary";
      case "pendente":
        return "outline";
      case "cancelada":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Calcular valor total para cada compra
  const calculateTotalAmount = (purchase: any, inventory: any) => {
    const totalAmount = parseFloat(purchase.totalAmount || "0");
    if (totalAmount > 0) {
      return totalAmount;
    }
    if (inventory) {
      const quantity = parseFloat(purchase.quantity || "0");
      const unitCost = parseFloat(inventory.unitCost || "0");
      return quantity * unitCost;
    }
    return 0;
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Histórico de Compras</PageTitle>
          <PageDescription>
            Solicitações de compra recebidas
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Compras Recebidas</CardTitle>
            <CardDescription>
              {purchases.length} solicitação
              {purchases.length !== 1 ? "ões" : ""} recebida
              {purchases.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma solicitação recebida registrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Data de Recebimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ver</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((item) => {
                    const totalAmount = calculateTotalAmount(
                      item.purchase,
                      item.inventory
                    );

                    return (
                      <TableRow key={item.purchase.id}>
                        <TableCell className="font-medium">
                          {item.purchase.number}
                        </TableCell>
                        <TableCell>
                          {item.inventory?.name || "-"}
                        </TableCell>
                        <TableCell>
                          {item.supplier?.name || "-"}
                        </TableCell>
                        <TableCell>
                          {item.purchase.quantity || "-"}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(totalAmount.toString())}
                        </TableCell>
                        <TableCell>
                          {formatDate(item.purchase.purchaseDate)}
                        </TableCell>
                        <TableCell>
                          {formatDate(item.purchase.deliveryDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(item.purchase.status)}>
                            {formatStatus(item.purchase.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/compras/${item.purchase.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}
