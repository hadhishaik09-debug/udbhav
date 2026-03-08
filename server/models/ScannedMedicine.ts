import { pgTable, serial, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Persisted model for Scanned Medicines in PostgreSQL using Drizzle ORM.
 * Matches requested fields: userId, medicineName, uses, sideEffects, dosage, warnings, scannedAt, imageUrl.
 */
export const scannedMedicines = pgTable("scanned_medicines_v2", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    medicineName: text("medicine_name").notNull(),
    uses: jsonb("uses").notNull(), // Array of strings
    dosage: text("dosage").notNull(),
    sideEffects: jsonb("side_effects").notNull(), // Array of strings
    precautions: jsonb("precautions").notNull(), // Array of strings
    warnings: jsonb("warnings").notNull(), // Array of strings
    drugInteractions: jsonb("drug_interactions").notNull(), // Array of strings
    imageUrl: text("image_url"),
    scannedAt: timestamp("scanned_at").defaultNow().notNull(),
});

export const insertScannedMedicineSchema = createInsertSchema(scannedMedicines);
export const selectScannedMedicineSchema = createSelectSchema(scannedMedicines);

export type ScannedMedicine = z.infer<typeof selectScannedMedicineSchema>;
export type InsertScannedMedicine = z.infer<typeof insertScannedMedicineSchema>;
