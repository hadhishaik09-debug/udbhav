import { pgTable, serial, integer, text, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Table: patients
 * Stores core patient information and identity tokens.
 */
export const patients = pgTable("patients", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),
    permanentToken: text("permanent_token").unique().notNull(),
});

/**
 * Table: documents
 * Stores links to health records/files owned by patients.
 */
export const documents = pgTable("documents", {
    id: serial("id").primaryKey(),
    patientId: integer("patient_id").references(() => patients.id, { onDelete: 'cascade' }).notNull(),
    fileUrl: text("file_url").notNull(),
    type: varchar("type", { length: 50 }),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

/**
 * Table: share_tokens
 * Stores temporary tokens used for QR-based sharing access.
 */
export const shareTokens = pgTable("share_tokens", {
    id: serial("id").primaryKey(),
    patientId: integer("patient_id").references(() => patients.id, { onDelete: 'cascade' }).notNull(),
    token: text("token").unique().notNull(),
    expiryTime: timestamp("expiry_time").notNull(),
    isUsed: boolean("is_used").default(false).notNull(),
    permissions: varchar("permissions", { length: 50 }).default('READ').notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -- Relationships --

export const patientsRelations = relations(patients, ({ many }) => ({
    documents: many(documents),
    shareTokens: many(shareTokens),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
    patient: one(patients, {
        fields: [documents.patientId],
        references: [patients.id],
    }),
}));

export const shareTokensRelations = relations(shareTokens, ({ one }) => ({
    patient: one(patients, {
        fields: [shareTokens.patientId],
        references: [patients.id],
    }),
}));

// -- Zod Schemas for Validation --

export const insertPatientSchema = createInsertSchema(patients);
export const selectPatientSchema = createSelectSchema(patients);

export const insertDocumentSchema = createInsertSchema(documents);
export const selectDocumentSchema = createSelectSchema(documents);

export const insertShareTokenSchema = createInsertSchema(shareTokens);
export const selectShareTokenSchema = createSelectSchema(shareTokens);

export type Patient = z.infer<typeof selectPatientSchema>;
export type Document = z.infer<typeof selectDocumentSchema>;
export type ShareToken = z.infer<typeof selectShareTokenSchema>;
