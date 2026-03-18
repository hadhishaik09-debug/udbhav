import { Express, Request, Response } from "express";
import { processSymptomCheck } from "../services/symptomAI";

export async function registerSymptomCheckerRoutes(app: Express) {
  /**
   * POST /api/symptom-checker
   * Handles chat-based symptom checking with adaptive questioning.
   */
  app.post("/api/symptom-checker", async (req: Request, res: Response) => {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ success: false, message: "Conversation history is required." });
      }

      // Process with AI service
      const analysis = await processSymptomCheck(messages);

      return res.json({
        success: true,
        ...analysis
      });

    } catch (error: any) {
      console.error("[Symptom API Error]", error);
      return res.status(500).json({
        success: false,
        message: "Server error during symptom assessment.",
        error: error.message
      });
    }
  });
}
