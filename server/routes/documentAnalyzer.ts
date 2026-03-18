import { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { extractTextFromImage } from "../services/ocrService";
import { analyzeMedicalDocument } from "../services/documentAI";

/**
 * Registers Document Analyzer routes to the Express application.
 * Independent of the Medicine Scanner module.
 */
export async function registerDocumentAnalyzerRoutes(app: Express) {
  
  // Reuse multer configuration pattern
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "doc-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for docs
  });

  /**
   * POST /api/analyze-document
   * Performs OCR on an image/document and uses AI to generate structured insights.
   */
  app.post("/api/analyze-document", upload.single("document"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No document file provided." });
      }

      const filePath = req.file.path;
      console.log(`[Document API] Processing: ${req.file.filename}`);

      // 1. OCR Stage - Shared logic with Medicine Scanner
      const rawText = await extractTextFromImage(filePath);
      if (!rawText || rawText.length < 10) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({ success: false, message: "OCR could not extract enough text from this document." });
      }

      // 2. AI Stage - Specialized Document Analysis
      const analysis = await analyzeMedicalDocument(rawText);

      // Success Response
      return res.json({
        success: true,
        analysis,
        document_url: `/uploads/${req.file.filename}`,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error("[Document API Error]", error);
      return res.status(500).json({
        success: false,
        message: "Server error occurred during document analysis.",
        error: error.message
      });
    }
  });
}
