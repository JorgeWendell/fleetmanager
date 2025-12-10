import { db } from "@/db/index";
import { usersTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { UsuariosClient } from "./usuarios-client";
import { UpdateUsersPage } from "./update-users-page";

async function getUsers() {
  return await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
}

export default async function UsuariosPage() {
  const users = await getUsers();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle className="text-3xl font-bold">Gestão de Usuários</PageTitle>
          <PageDescription className="text-base">
            Gerencie os usuários do sistema
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <UpdateUsersPage />
        <div className="mt-6">
          <UsuariosClient users={users} />
        </div>
      </PageContent>
    </PageContainer>
  );
}

