"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AppSidebar } from "./app-sidebar";
import { getVisibleMenuItems } from "@/lib/permissions-client";

export function SidebarWithPermissions() {
  const session = authClient.useSession();
  const [filteredData, setFilteredData] = useState<any>(null);

  useEffect(() => {
    if (session.data?.user?.id) {
      // Buscar permissões do usuário
      fetch(`/api/user-permissions?userId=${session.data.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.permissions) {
            const visibleItems = getVisibleMenuItems(data.permissions);
            // Filtrar itens do menu baseado nas permissões
            const filtered = filterMenuItems(visibleItems);
            setFilteredData(filtered);
          }
        })
        .catch(() => {
          // Se der erro, mostrar tudo (fallback para admin)
          setFilteredData(null);
        });
    }
  }, [session.data?.user?.id]);

  // Se não carregou ainda ou é admin, mostrar tudo
  if (!filteredData) {
    return <AppSidebar />;
  }

  return <AppSidebar filteredData={filteredData} />;
}

function filterMenuItems(visibleItems: string[]) {
  const routeMap: Record<string, string> = {
    dashboard: "/dashboard",
    veiculos: "/veiculos",
    motoristas: "/motoristas",
    "ordens-servico": "/ordens-servico",
    manutencoes: "/manutencoes",
    estoque: "/estoque",
    compras: "/compras",
    fornecedores: "/fornecedores",
    custos: "/custos",
    relatorios: "/relatorios",
    configuracoes: "/configuracoes",
  };

  // Retornar estrutura filtrada
  return {
    navMain: [
      {
        label: "Menu",
        items: [
          // Filtrar baseado em visibleItems
        ],
      },
    ],
  };
}

