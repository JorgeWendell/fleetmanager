"use server";

import { db } from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserAction(id: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  if (!user) {
    return { error: "Usuário não encontrado" };
  }

  return { user };
}

