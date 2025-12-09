import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageActions,
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
import { db } from "@/db/index";
import { purchasesTable, suppliersTable } from "@/db/schema";
import { Plus } from "lucide-react";
import { eq } from "drizzle-orm";

async function getPurchases() {
  return await db
    .select({
      purchase: purchasesTable,
      supplier: suppliersTable,
    })
    .from(purchasesTable)
    .leftJoin(suppliersTable, eq(purchasesTable.supplierId, suppliersTable.id));
}

export default async function ComprasPage() {
  const purchases = await getPurchases();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pendente":
        return "destructive";
      case "aprovada":
        return "secondary";
      case "recebida":
        return "default";
      case "cancelada":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Compras</PageTitle>
          <PageDescription>
            Gerencie as compras de peças e materiais
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button asChild>
            <Link href="/compras/nova">
              <Plus className="h-4 w-4" />
              Nova Compra
            </Link>
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Compras</CardTitle>
            <CardDescription>
              {purchases.length} compra{purchases.length !== 1 ? "s" : ""}{" "}
              registrada{purchases.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma compra registrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Data Entrega</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((item) => (
                    <TableRow key={item.purchase.id}>
                      <TableCell className="font-medium">
                        {item.purchase.number}
                      </TableCell>
                      <TableCell>{item.supplier?.name || "-"}</TableCell>
                      <TableCell>
                        {formatDate(item.purchase.purchaseDate)}
                      </TableCell>
                      <TableCell>
                        {item.purchase.deliveryDate
                          ? formatDate(item.purchase.deliveryDate)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.purchase.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(item.purchase.status)}
                        >
                          {formatStatus(item.purchase.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}

