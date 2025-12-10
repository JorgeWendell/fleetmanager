import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permissions";
import { redirect } from "next/navigation";

import { AppSidebar } from "./components/sidebar/app-sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <SidebarProvider>
      <AppSidebar permissions={permissions} />
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
