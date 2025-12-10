"use client";

import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

import { NewUserDialog } from "./components/new-user-dialog";

interface UsuariosClientProps {
  users: Array<{
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    isAdministrator: boolean;
    isOperator: boolean;
    isManager: boolean;
    createdAt: Date;
  }>;
}

export function UsuariosClient({ users }: UsuariosClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesVerified =
        verifiedFilter === "all" ||
        (verifiedFilter === "verified" && user.emailVerified) ||
        (verifiedFilter === "unverified" && !user.emailVerified);

      return matchesSearch && matchesVerified;
    });
  }, [users, searchTerm, verifiedFilter]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Gestão de Usuários</PageTitle>
          <PageDescription>
            Gerencie os usuários do sistema
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button
            onClick={() => {
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="verified">Verificados</SelectItem>
              <SelectItem value="unverified">Não Verificados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum usuário encontrado
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <Link key={user.id} href={`/configuracoes/usuarios/${user.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Badge
                        variant={user.emailVerified ? "default" : "secondary"}
                        className="border-0"
                      >
                        {user.emailVerified ? "Verificado" : "Não Verificado"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Data de Criação:</span>
                        <span className="text-sm font-medium">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </PageContent>

      <NewUserDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
        }}
        user={null}
      />
    </PageContainer>
  );
}

