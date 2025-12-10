"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createUserSchema } from "./schema";
import { auth } from "@/lib/auth";

export const createUserAction = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    // Verificar se o email já existe
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, parsedInput.email))
      .limit(1);

    if (existingUser.length > 0) {
      return { serverError: "Email já cadastrado" };
    }

    try {
      // Criar usuário usando a API do better-auth
      const result = await auth.api.signUpEmail({
        body: {
          email: parsedInput.email,
          password: parsedInput.password,
          name: parsedInput.name,
        },
      });

      if (!result || !result.user) {
        return { serverError: "Erro ao criar usuário" };
      }

      // Atualizar campos customizados
      await db
        .update(usersTable)
        .set({
          emailVerified: parsedInput.emailVerified,
          isAdministrator: parsedInput.isAdministrator,
          isOperator: parsedInput.isOperator,
          isManager: parsedInput.isManager,
          isActive: parsedInput.isActive,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, result.user.id));

      return { success: true, id: result.user.id };
    } catch (error: any) {
      if (error?.message?.includes("already exists") || error?.code === "USER_ALREADY_EXISTS") {
        return { serverError: "Email já cadastrado" };
      }
      console.error("Erro ao criar usuário:", error);
      return { serverError: error?.message || "Erro ao criar usuário" };
    }
  });

