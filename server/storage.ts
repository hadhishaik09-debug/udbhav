import {
  type User,
  type InsertUser,
  type ScannedMedicine,
  type InsertScannedMedicine,
  type Patient,
  type InsertPatient,
  type ShareToken,
  type InsertShareToken,
  type Document
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Patient methods
  getPatientByUserId(userId: string): Promise<Patient | undefined>;
  getPatientByToken(token: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatientToken(patientId: string, newToken: string): Promise<void>;

  // Document methods
  getDocumentsByPatient(patientId: string): Promise<Document[]>;
  getDocumentsByIds(ids: string[]): Promise<Document[]>;

  // Share Token methods
  createShareToken(token: any): Promise<ShareToken>;
  getShareToken(token: string): Promise<ShareToken | undefined>;
  getShareHistoryByPatient(patientId: string): Promise<ShareToken[]>;
  markShareTokenAsUsed(id: string): Promise<void>;
  updateShareTokenAccess(id: string): Promise<void>;
  revokeShareToken(id: string): Promise<void>;

  createScannedMedicine(scan: InsertScannedMedicine): Promise<ScannedMedicine>;
  getScannedMedicinesByUser(userId: string): Promise<ScannedMedicine[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private scans: Map<string, ScannedMedicine>;
  private patients: Map<string, Patient>;
  private documents: Map<string, Document>;
  private shareTokens: Map<string, ShareToken>;

  constructor() {
    this.users = new Map();
    this.scans = new Map();
    this.patients = new Map();
    this.documents = new Map();
    this.shareTokens = new Map();
    this.seed();
  }

  private seed() {
    const userId = "test-user-123";
    const patientId = "patient-alpha";
    
    this.users.set(userId, { id: userId, username: "hadhi", password: "password" });
    
    this.patients.set(patientId, {
      id: patientId,
      userId: userId,
      name: "Hadhi Shaik",
      email: "hadhi@example.com",
      permanentToken: "secure-token-abc-123"
    });

    const doc1 = randomUUID();
    this.documents.set(doc1, {
      id: doc1,
      patientId,
      fileUrl: "https://example.com/blood_report.pdf",
      type: "PDF",
      uploadedAt: new Date()
    });
  }

  // ... (getUser, getUserByUsername, createUser remain same)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPatientByUserId(userId: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(p => p.userId === userId);
  }

  async getPatientByToken(token: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(p => p.permanentToken === token);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = randomUUID();
    const patient: Patient = { 
      ...insertPatient, 
      id,
      userId: insertPatient.userId ?? null
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatientToken(patientId: string, newToken: string): Promise<void> {
    const patient = this.patients.get(patientId);
    if (patient) {
      patient.permanentToken = newToken;
      this.patients.set(patientId, patient);
    }
  }

  async getDocumentsByPatient(patientId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(d => d.patientId === patientId);
  }

  async getDocumentsByIds(ids: string[]): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(d => ids.includes(d.id));
  }

  async createShareToken(insertShareToken: InsertShareToken): Promise<ShareToken> {
    const id = randomUUID();
    const shareToken: ShareToken = { 
      ...insertShareToken, 
      id,
      isUsed: insertShareToken.isUsed ?? false,
      permissions: insertShareToken.permissions ?? "READ",
      createdAt: insertShareToken.createdAt ?? new Date(),
      accessedAt: insertShareToken.accessedAt ?? null
    };
    this.shareTokens.set(id, shareToken);
    return shareToken;
  }

  async getShareToken(token: string): Promise<ShareToken | undefined> {
    return Array.from(this.shareTokens.values()).find(st => st.token === token);
  }

  async updateShareTokenAccess(id: string): Promise<void> {
    const st = this.shareTokens.get(id);
    if (st) {
      st.accessedAt = new Date();
      this.shareTokens.set(id, st);
    }
  }

  async getShareHistoryByPatient(patientId: string): Promise<ShareToken[]> {
    return Array.from(this.shareTokens.values()).filter(st => st.patientId === patientId);
  }

  async markShareTokenAsUsed(id: string): Promise<void> {
    const st = this.shareTokens.get(id);
    if (st) {
      st.isUsed = true;
      this.shareTokens.set(id, st);
    }
  }

  async revokeShareToken(id: string): Promise<void> {
    this.shareTokens.delete(id);
  }

  async createScannedMedicine(insertScan: InsertScannedMedicine): Promise<ScannedMedicine> {
    const id = randomUUID();
    const scan: ScannedMedicine = {
      ...insertScan,
      id,
      imageUrl: insertScan.imageUrl || null,
      scannedAt: new Date()
    };
    this.scans.set(id, scan);
    return scan;
  }

  async getScannedMedicinesByUser(userId: string): Promise<ScannedMedicine[]> {
    return Array.from(this.scans.values()).filter(
      (scan) => scan.userId === userId,
    );
  }
}

export const storage = new MemStorage();
