/**
 * Script para atualizar todos os usuários existentes para serem administradores
 * Execute com: npx tsx src/scripts/update-existing-users.ts
 */

import { db } from "../db/index";
import { usersTable } from "../db/schema";

async function updateAllUsersToAdmin() {
  try {
    console.log("Atualizando todos os usuários para administradores...");
    
    const result = await db.update(usersTable).set({
      isAdministrator: true,
      updatedAt: new Date(),
    });

    console.log("✅ Todos os usuários foram atualizados para administradores!");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao atualizar usuários:", error);
    return { success: false, error };
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateAllUsersToAdmin()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { updateAllUsersToAdmin };

