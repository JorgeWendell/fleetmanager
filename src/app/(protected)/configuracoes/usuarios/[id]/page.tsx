import { db } from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/components/ui/page-container";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UsuarioEditButton } from "./usuario-edit-button";

async function getUser(id: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  return user;
}

export default async function UsuarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    return (
      <PageContainer>
        <PageContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Usuário não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/configuracoes/usuarios">Voltar</Link>
            </Button>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/configuracoes/usuarios">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Detalhes do Usuário</h1>
              <p className="text-muted-foreground">
                Informações do usuário do sistema
              </p>
            </div>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informações do Usuário</CardTitle>
              <UsuarioEditButton user={user} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={user.name}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailVerified">Status do Email</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="emailVerified"
                    checked={user.emailVerified}
                    disabled
                    className="bg-muted"
                  />
                  <Badge
                    variant={user.emailVerified ? "default" : "secondary"}
                    className="border-0"
                  >
                    {user.emailVerified ? "Verificado" : "Não Verificado"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="createdAt">Data de Criação</Label>
                <Input
                  id="createdAt"
                  value={formatDate(user.createdAt)}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Ativo</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={user.isActive ?? true}
                    disabled
                    className="bg-muted"
                  />
                  <Badge
                    variant={user.isActive ?? true ? "default" : "secondary"}
                    className="border-0"
                  >
                    {user.isActive ?? true ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <Label className="text-base font-semibold mb-4 block">Níveis de Acesso</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isAdministrator">Administrador</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isAdministrator"
                      checked={user.isAdministrator}
                      disabled
                      className="bg-muted"
                    />
                    <Badge
                      variant={user.isAdministrator ? "default" : "secondary"}
                      className="border-0"
                    >
                      {user.isAdministrator ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isOperator">Operador</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isOperator"
                      checked={user.isOperator}
                      disabled
                      className="bg-muted"
                    />
                    <Badge
                      variant={user.isOperator ? "default" : "secondary"}
                      className="border-0"
                    >
                      {user.isOperator ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isManager">Gerente</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isManager"
                      checked={user.isManager}
                      disabled
                      className="bg-muted"
                    />
                    <Badge
                      variant={user.isManager ? "default" : "secondary"}
                      className="border-0"
                    >
                      {user.isManager ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}

