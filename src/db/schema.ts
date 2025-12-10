import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  emailVerified: boolean("email_verified").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "disponivel",
  "em_uso",
  "manutencao",
  "inativo",
]);

export const vehiclesTable = pgTable("vehicles", {
  id: text("id").primaryKey(),
  plate: text("plate").notNull().unique(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  color: text("color"),
  category: text("category"),
  chassis: text("chassis").unique(),
  renavam: text("renavam").unique(),
  status: vehicleStatusEnum("status").notNull().default("disponivel"),
  mileage: integer("mileage").notNull().default(0),
  fuelType: text("fuel_type").notNull(),
  inMaintenance: boolean("in_maintenance").notNull().default(false),
  currentDriverId: text("current_driver_id"),
  lastMaintenance: timestamp("last_maintenance"),
  nextMaintenance: timestamp("next_maintenance"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const driverStatusEnum = pgEnum("driver_status", [
  "ativo",
  "ferias",
  "inativo",
]);

export const driversTable = pgTable("drivers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cpf: text("cpf").notNull().unique(),
  cnh: text("cnh").notNull().unique(),
  cnhCategory: text("cnh_category").notNull(),
  cnhExpiry: timestamp("cnh_expiry").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  status: driverStatusEnum("status").notNull().default("ativo"),
  currentVehicleId: text("current_vehicle_id"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const maintenanceTypeEnum = pgEnum("maintenance_type", [
  "preventiva",
  "corretiva",
  "revisao",
]);

export const maintenancesTable = pgTable("maintenances", {
  id: text("id").primaryKey(),
  vehicleId: text("vehicle_id")
    .notNull()
    .references(() => vehiclesTable.id, { onDelete: "cascade" }),
  type: maintenanceTypeEnum("type").notNull(),
  description: text("description").notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  mileage: integer("mileage").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  provider: text("provider"),
  mechanic: text("mechanic"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const serviceOrderStatusEnum = pgEnum("service_order_status", [
  "aberta",
  "em_andamento",
  "concluida",
  "cancelada",
]);

export const serviceOrderPriorityEnum = pgEnum("service_order_priority", [
  "baixa",
  "media",
  "alta",
  "urgente",
]);

export const serviceOrderTypeEnum = pgEnum("service_order_type", [
  "preventiva",
  "corretiva",
  "preditiva",
]);

export const serviceOrdersTable = pgTable("service_orders", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  vehicleId: text("vehicle_id")
    .notNull()
    .references(() => vehiclesTable.id, { onDelete: "cascade" }),
  driverId: text("driver_id").references(() => driversTable.id),
  description: text("description").notNull(),
  status: serviceOrderStatusEnum("status").notNull().default("aberta"),
  priority: serviceOrderPriorityEnum("priority").notNull().default("media"),
  type: serviceOrderTypeEnum("type").notNull().default("corretiva"),
  currentMileage: numeric("current_mileage", { precision: 10, scale: 2 }),
  mechanic: text("mechanic"),
  scheduledDate: timestamp("scheduled_date"),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }),
  validatedBy: text("validated_by"),
  validationDate: timestamp("validation_date"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const serviceOrderItemsTable = pgTable("service_order_items", {
  id: text("id").primaryKey(),
  serviceOrderId: text("service_order_id")
    .notNull()
    .references(() => serviceOrdersTable.id, { onDelete: "cascade" }),
  inventoryId: text("inventory_id").references(() => inventoryTable.id),
  description: text("description").notNull(),
  requiredQuantity: numeric("required_quantity", {
    precision: 10,
    scale: 2,
  }).notNull(),
  purchaseRequestId: text("purchase_request_id").references(
    () => purchasesTable.id
  ),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const suppliersTable = pgTable("suppliers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cnpj: text("cnpj").unique(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  contactPerson: text("contact_person"),
  category: text("category"),
  website: text("website"),
  paymentTerms: text("payment_terms"),
  deliveryDays: integer("delivery_days"),
  observations: text("observations"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const inventoryTable = pgTable("inventory", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code"),
  codFabricante: text("cod_fabricante"),
  observations: text("observations"),
  category: text("category"),
  unit: text("unit").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  minQuantity: numeric("min_quantity", { precision: 10, scale: 2 }),
  maxQuantity: numeric("max_quantity", { precision: 10, scale: 2 }),
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }),
  location: text("location"),
  supplierId: text("supplier_id").references(() => suppliersTable.id),
  lastPurchase: timestamp("last_purchase"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const purchaseStatusEnum = pgEnum("purchase_status", [
  "pendente",
  "aprovada",
  "recebida",
  "cancelada",
]);

export const purchaseUrgencyEnum = pgEnum("purchase_urgency", [
  "baixa",
  "media",
  "alta",
  "urgente",
]);

export const purchasesTable = pgTable("purchases", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  inventoryId: text("inventory_id").references(() => inventoryTable.id),
  serviceOrderId: text("service_order_id").references(
    () => serviceOrdersTable.id
  ),
  supplierId: text("supplier_id").references(() => suppliersTable.id),
  urgency: purchaseUrgencyEnum("urgency").notNull().default("media"),
  quantity: numeric("quantity", { precision: 10, scale: 2 }),
  status: purchaseStatusEnum("status").notNull().default("pendente"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  purchaseDate: timestamp("purchase_date").notNull(),
  deliveryDate: timestamp("delivery_date"),
  receiverName: text("receiver_name"),
  invoiceNumber: text("invoice_number"),
  approvedBy: text("approved_by"),
  approvalDate: timestamp("approval_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const purchaseItemsTable = pgTable("purchase_items", {
  id: text("id").primaryKey(),
  purchaseId: text("purchase_id")
    .notNull()
    .references(() => purchasesTable.id, { onDelete: "cascade" }),
  inventoryId: text("inventory_id").references(() => inventoryTable.id),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }).notNull(),
  totalCost: numeric("total_cost", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const costsTable = pgTable("costs", {
  id: text("id").primaryKey(),
  vehicleId: text("vehicle_id").references(() => vehiclesTable.id),
  maintenanceId: text("maintenance_id").references(() => maintenancesTable.id),
  purchaseId: text("purchase_id").references(() => purchasesTable.id),
  serviceOrderId: text("service_order_id").references(
    () => serviceOrdersTable.id
  ),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
