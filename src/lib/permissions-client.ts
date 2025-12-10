/**
 * Funções de permissões que podem ser usadas no cliente
 * (não dependem do banco de dados)
 */

export interface UserPermissions {
  isAdministrator: boolean;
  isOperator: boolean;
  isManager: boolean;
}

/**
 * Verifica se o usuário tem acesso a uma rota específica
 */
export function hasAccessToRoute(
  permissions: UserPermissions,
  route: string
): boolean {
  // Administrador tem acesso total
  if (permissions.isAdministrator) {
    return true;
  }

  // Rotas permitidas para Gerente
  const managerRoutes = [
    "/dashboard",
    "/veiculos",
    "/motoristas",
    "/ordens-servico",
    "/manutencoes",
    "/estoque",
    "/compras",
    "/fornecedores",
  ];

  // Rotas permitidas para Operador
  const operatorRoutes = ["/ordens-servico", "/manutencoes"];

  if (permissions.isManager) {
    return managerRoutes.some((r) => route.startsWith(r));
  }

  if (permissions.isOperator) {
    return operatorRoutes.some((r) => route.startsWith(r));
  }

  return false;
}

/**
 * Verifica quais itens do menu o usuário pode ver
 */
export function getVisibleMenuItems(permissions: UserPermissions): string[] {
  if (permissions.isAdministrator) {
    // Administrador vê tudo
    return [
      "dashboard",
      "veiculos",
      "motoristas",
      "ordens-servico",
      "manutencoes",
      "estoque",
      "compras",
      "fornecedores",
      "custos",
      "relatorios",
      "configuracoes",
    ];
  }

  if (permissions.isManager) {
    return [
      "dashboard",
      "veiculos",
      "motoristas",
      "ordens-servico",
      "manutencoes",
      "estoque",
      "compras",
      "fornecedores",
    ];
  }

  if (permissions.isOperator) {
    return ["ordens-servico", "manutencoes"];
  }

  return [];
}
