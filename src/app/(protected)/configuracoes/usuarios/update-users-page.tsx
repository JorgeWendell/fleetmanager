"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateAllUsersToAdmin } from "@/actions/update-all-users-to-admin";
import { toast } from "sonner";
import { useState } from "react";

export function UpdateUsersPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const result = await updateAllUsersToAdmin();
      if (result.success) {
        toast.success("Todos os usuários foram atualizados para administradores!");
      } else {
        toast.error(result.error || "Erro ao atualizar usuários");
      }
    } catch (error) {
      toast.error("Erro ao atualizar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atualizar Usuários Existentes</CardTitle>
        <CardDescription>
          Atualiza todos os usuários existentes para serem administradores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleUpdate} disabled={isLoading}>
          {isLoading ? "Atualizando..." : "Atualizar Todos para Administrador"}
        </Button>
      </CardContent>
    </Card>
  );
}

