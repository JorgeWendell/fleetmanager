import { db } from "@/db/index";
import { suppliersTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

import { FornecedoresClient } from "./fornecedores-client";

async function getSuppliers() {
  return await db.select().from(suppliersTable);
}

async function getSupplierStats() {
  const [total, active, avgRating] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(suppliersTable),
    db
      .select({ count: sql<number>`count(*)` })
      .from(suppliersTable)
      .where(eq(suppliersTable.isActive, true)),
    db
      .select({
        avg: sql<number>`COALESCE(AVG(CAST(${suppliersTable.rating} AS DECIMAL)), 0)`,
      })
      .from(suppliersTable),
  ]);

  return {
    total: Number(total[0]?.count || 0),
    active: Number(active[0]?.count || 0),
    averageRating: Number(avgRating[0]?.avg || 0),
  };
}

export default async function FornecedoresPage() {
  const [suppliers, stats] = await Promise.all([
    getSuppliers(),
    getSupplierStats(),
  ]);

  return <FornecedoresClient suppliers={suppliers} stats={stats} />;
}

