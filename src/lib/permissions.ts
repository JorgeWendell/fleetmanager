import { db } from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UserPermissions } from "./permissions-client";
import { hasAccessToRoute, getVisibleMenuItems } from "./permissions-client";

// Re-exportar tipos e funções do cliente para compatibilidade
export type { UserPermissions } from "./permissions-client";
export { hasAccessToRoute, getVisibleMenuItems } from "./permissions-client";

/**
 * Obtém as permissões do usuário pelo ID
 */
export async function getUserPermissions(
  userId: string
): Promise<UserPermissions | null> {
  const [user] = await db
    .select({
      isAdministrator: usersTable.isAdministrator,
      isOperator: usersTable.isOperator,
      isManager: usersTable.isManager,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  return {
    isAdministrator: user.isAdministrator,
    isOperator: user.isOperator,
    isManager: user.isManager,
  };
}

// getVisibleMenuItems foi movido para permissions-client.ts
// para evitar importar o banco de dados em componentes do cliente

