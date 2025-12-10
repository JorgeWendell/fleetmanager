import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserPermissions, hasAccessToRoute } from "@/lib/permissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRoute: string;
}

export async function PermissionGuard({
  children,
  requiredRoute,
}: PermissionGuardProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const permissions = await getUserPermissions(session.user.id);

  if (!permissions) {
    redirect("/authentication");
  }

  // Administrador tem acesso total
  if (permissions.isAdministrator) {
    return <>{children}</>;
  }

  // Verificar se tem acesso à rota
  if (!hasAccessToRoute(permissions, requiredRoute)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

