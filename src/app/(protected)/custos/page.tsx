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
import { db } from "@/db/index";
import { costsTable, vehiclesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getCosts() {
  return await db
    .select({
      cost: costsTable,
      vehicle: vehiclesTable,
    })
    .from(costsTable)
    .leftJoin(vehiclesTable, eq(costsTable.vehicleId, vehiclesTable.id))
    .orderBy(costsTable.date);
}

export default async function CustosPage() {
  const costs = await getCosts();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const totalCosts = costs.reduce(
    (sum, item) => sum + Number(item.cost.amount),
    0
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Custos</PageTitle>
          <PageDescription>
            Análise de custos do sistema de gestão de frotas
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total de Custos</CardTitle>
              <CardDescription>Registros totais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{costs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Valor Total</CardTitle>
              <CardDescription>Soma de todos os custos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalCosts.toString())}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Custos</CardTitle>
            <CardDescription>
              {costs.length} registro{costs.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {costs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum custo registrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costs.map((item) => (
                    <TableRow key={item.cost.id}>
                      <TableCell>
                        {formatDate(item.cost.date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.cost.category}
                      </TableCell>
                      <TableCell>{item.cost.description}</TableCell>
                      <TableCell>{item.vehicle?.plate || "-"}</TableCell>
                      <TableCell>
                        {formatCurrency(item.cost.amount)}
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

