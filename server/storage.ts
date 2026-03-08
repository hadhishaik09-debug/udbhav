import {
  type User,
  type InsertUser,
  type ScannedMedicine,
  type InsertScannedMedicine
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createScannedMedicine(scan: InsertScannedMedicine): Promise<ScannedMedicine>;
  getScannedMedicinesByUser(userId: string): Promise<ScannedMedicine[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private scans: Map<string, ScannedMedicine>;

  constructor() {
    this.users = new Map();
    this.scans = new Map();
  }

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
