import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserPermissions, hasAccessToRoute } from "@/lib/permissions";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRoute: string;
}

export async function RouteGuard({ children, requiredRoute }: RouteGuardProps) {
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

  if (!hasAccessToRoute(permissions, requiredRoute)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

