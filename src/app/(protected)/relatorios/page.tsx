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

export default async function RelatoriosPage() {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Relatórios</PageTitle>
          <PageDescription>
            Gere relatórios detalhados do sistema
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Veículos</CardTitle>
              <CardDescription>
                Relatório completo de veículos e status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Em breve
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relatório de Manutenções</CardTitle>
              <CardDescription>
                Histórico e custos de manutenções
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Em breve
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relatório de Custos</CardTitle>
              <CardDescription>
                Análise detalhada de custos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Em breve
              </p>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}

