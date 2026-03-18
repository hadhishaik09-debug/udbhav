import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const patients = pgTable("patients", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  permanentToken: text("permanent_token").unique().notNull(),
});

export const documents = pgTable("documents", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  fileUrl: text("file_url").notNull(),
  type: varchar("type", { length: 50 }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const share_tokens = pgTable("share_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  token: text("token").unique().notNull(),
  documentIds: jsonb("document_ids").notNull(), // Array of document IDs
  expiryTime: timestamp("expiry_time").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  permissions: varchar("permissions", { length: 50 }).default('READ').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  accessedAt: timestamp("accessed_at"),
});

export const scanned_medicines = pgTable("scanned_medicines", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  medicineName: text("medicine_name").notNull(),
  uses: jsonb("uses").notNull(),
  dosage: text("dosage").notNull(),
  sideEffects: jsonb("side_effects").notNull(),
  precautions: jsonb("precautions").notNull(),
  warnings: jsonb("warnings").notNull(),
  drugInteractions: jsonb("drug_interactions").notNull(),
  imageUrl: text("image_url"),
  scannedAt: timestamp("scanned_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPatientSchema = createInsertSchema(patients);
export const insertDocumentSchema = createInsertSchema(documents);
export const insertShareTokenSchema = createInsertSchema(share_tokens);

export const insertScannedMedicineSchema = createInsertSchema(scanned_medicines).omit({
  id: true,
  scannedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertShareToken = z.infer<typeof insertShareTokenSchema>;
export type User = typeof users.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type ShareToken = typeof share_tokens.$inferSelect;
export type ScannedMedicine = typeof scanned_medicines.$inferSelect;
export type InsertScannedMedicine = z.infer<typeof insertScannedMedicineSchema>;
