"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateUserSchema } from "./schema";
import argon2 from "argon2";

export const updateUserAction = actionClient
  .schema(updateUserSchema)
  .action(async ({ parsedInput }) => {
    // Verificar se o email já existe em outro usuário
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, parsedInput.email))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== parsedInput.id) {
      return { serverError: "Email já cadastrado para outro usuário" };
    }

    const updateData: {
      name: string;
      email: string;
      password?: string;
      emailVerified: boolean;
      isAdministrator: boolean;
      isOperator: boolean;
      isManager: boolean;
      updatedAt: Date;
    } = {
      name: parsedInput.name,
      email: parsedInput.email,
      emailVerified: parsedInput.emailVerified,
      isAdministrator: parsedInput.isAdministrator,
      isOperator: parsedInput.isOperator,
      isManager: parsedInput.isManager,
      updatedAt: new Date(),
    };

    // Se a senha foi fornecida, fazer hash usando argon2 (mesmo algoritmo do better-auth)
    if (parsedInput.password) {
      updateData.password = await argon2.hash(parsedInput.password);
    }

    await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, parsedInput.id));

    return { success: true };
  });

