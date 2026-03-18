import type { Express } from "express";
import { createServer, type Server } from "node:http";
import * as fs from "fs";
import { registerMedicineScannerRoutes } from "./routes/medicineScanner";
import { registerPatientRoutes } from "./routes/patient";
import { registerDocumentAnalyzerRoutes } from "./routes/documentAnalyzer";
import { registerCentralAssistantRoutes } from "./routes/centralAssistant";

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure upload directory exists for multer
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  // put application routes here
  // prefix all routes with /api
  await registerMedicineScannerRoutes(app);
  await registerPatientRoutes(app);
  await registerDocumentAnalyzerRoutes(app);
  await registerCentralAssistantRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
