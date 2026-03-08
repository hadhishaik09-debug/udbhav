import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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

export const insertScannedMedicineSchema = createInsertSchema(scanned_medicines).omit({
  id: true,
  scannedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ScannedMedicine = typeof scanned_medicines.$inferSelect;
export type InsertScannedMedicine = z.infer<typeof insertScannedMedicineSchema>;
