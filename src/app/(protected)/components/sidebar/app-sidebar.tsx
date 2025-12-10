"use client";

import {
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Truck,
  UsersIcon,
  Wrench,
  ClipboardList,
  Package,
  ShoppingCart,
  Building2,
  DollarSign,
  FileText,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

import { NavMain } from "./nav-main";
import { getVisibleMenuItems, UserPermissions } from "@/lib/permissions-client";

const allMenuItems = {
  navMain: [
    {
      label: "Menu",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          items: [
            {
              title: "Dashboard",
              url: "/dashboard",
            },
          ],
        },
        {
          title: "Veículos",
          url: "/veiculos",
          icon: Truck,
          items: [
            {
              title: "Lista de Veículos",
              url: "/veiculos",
            },
          ],
        },
        {
          title: "Motoristas",
          url: "/motoristas",
          icon: UsersIcon,
          items: [
            {
              title: "Lista de Motoristas",
              url: "/motoristas",
            },
          ],
        },
        {
          title: "Ordens de Serviço",
          url: "/ordens-servico",
          icon: ClipboardList,
          items: [
            {
              title: "Lista de Ordens",
              url: "/ordens-servico",
            },
          ],
        },
        {
          title: "Manutenções",
          url: "/manutencoes",
          icon: Wrench,
          items: [
            {
              title: "Histórico",
              url: "/manutencoes",
            },
          ],
        },
        {
          title: "Estoque",
          url: "/estoque",
          icon: Package,
          items: [
            {
              title: "Lista de Itens",
              url: "/estoque",
            },
          ],
        },
        {
          title: "Compras",
          url: "/compras",
          icon: ShoppingCart,
          items: [
            {
              title: "Lista de Compras",
              url: "/compras",
            },
            {
              title: "Histórico",
              url: "/compras/historico",
            },
          ],
        },
        {
          title: "Fornecedores",
          url: "/fornecedores",
          icon: Building2,
          items: [
            {
              title: "Lista de Fornecedores",
              url: "/fornecedores",
            },
          ],
        },
        {
          title: "Custos",
          url: "/custos",
          icon: DollarSign,
          items: [
            {
              title: "Análise de Custos",
              url: "/custos",
            },
          ],
        },
        {
          title: "Relatórios",
          url: "/relatorios",
          icon: FileText,
          items: [
            {
              title: "Relatórios",
              url: "/relatorios",
            },
          ],
        },
        {
          title: "Configurações",
          url: "/configuracoes/usuarios",
          icon: Settings,
          items: [
            {
              title: "Usuários",
              url: "/configuracoes/usuarios",
            },
          ],
        },
      ],
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  permissions?: UserPermissions;
}

export function AppSidebar({
  permissions,
  ...props
}: AppSidebarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const session = authClient.useSession();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
      },
    });
  };

  const toggleTheme = () => {
    const currentTheme = theme || "light";
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  // Filtrar itens do menu baseado nas permissões
  const getFilteredMenuItems = () => {
    // Se não tem permissões ou é admin, mostrar tudo
    if (!permissions || permissions.isAdministrator) {
      return allMenuItems.navMain;
    }

    const visibleItems = getVisibleMenuItems(permissions);
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

    const filteredItems = allMenuItems.navMain[0].items.filter((item) => {
      const menuKey = Object.keys(routeMap).find(
        (key) => routeMap[key] === item.url
      );
      return menuKey && visibleItems.includes(menuKey);
    });

    return [
      {
        ...allMenuItems.navMain[0],
        items: filteredItems,
      },
    ];
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <Image
        src="/logo.png"
        alt="Logo"
        width={150}
        height={150}
        className="mx-auto mt-4"
      />
      <SidebarContent>
        <NavMain groups={getFilteredMenuItems()} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar>
                    <AvatarFallback>
                      {session.data?.user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">{session.data?.user.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {session.data?.user.email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={toggleTheme}>
                  {!mounted ? (
                    <>
                      <Moon />
                      Alternar Tema
                    </>
                  ) : theme === "dark" ? (
                    <>
                      <Sun />
                      Modo Claro
                    </>
                  ) : (
                    <>
                      <Moon />
                      Modo Escuro
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
