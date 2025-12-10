"use server";

import { db } from "@/db/index";
import { usersTable } from "@/db/schema";

/**
 * Atualiza todos os usuários existentes para serem administradores
 */
export async function updateAllUsersToAdmin() {
  try {
    await db
      .update(usersTable)
      .set({
        isAdministrator: true,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.isAdministrator, false));

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar usuários:", error);
    return { success: false, error: "Erro ao atualizar usuários" };
  }
}

