import { Express, Request, Response } from "express";
import { processAssistantChat } from "../services/centralAI";

export async function registerCentralAssistantRoutes(app: Express) {
  /**
   * POST /api/chat
   * Unified entry point for the AI Assistant.
   * Handles symptoms, document queries, and medicine advice.
   */
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { messages, state } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ success: false, message: "Conversation history is required." });
      }

      // Process with Central AI Assistant
      const response = await processAssistantChat(messages, state || {});

      return res.json({
        success: true,
        ...response
      });

    } catch (error: any) {
      console.error("[Chat API Error]", error);
      return res.status(500).json({
        success: false,
        message: "Assistant service is temporarily unavailable.",
        error: error.message
      });
    }
  });

  /**
   * POST /api/medicine-advisor
   */
  app.post("/api/medicine-advisor", async (req: Request, res: Response) => {
    try {
      const { taken_medicine, taken_time, new_medicine, query } = req.body;
      
      // If we have collected specific fields, call advice service directly
      if (taken_medicine && taken_time && new_medicine) {
        const { getMedicineAdvice } = await import("../services/medicineAdvisorAI");
        const advice = await getMedicineAdvice(query || "", { taken_medicine, taken_time, new_medicine });
        return res.json({ success: true, ...advice, intent: 'MEDICINE_ADVICE' });
      }

      // Fallback to general chat processing
      const response = await processAssistantChat(
        [{ role: 'user', content: query || "I need medicine advice." }], 
        { intent: 'MEDICINE_ADVICE' }
      );
      
      res.json({ success: true, ...response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/analyze-document", async (req: Request, res: Response) => {
    const { text } = req.body;
    const response = await processAssistantChat([{ role: 'user', content: text }], { intent: 'DOCUMENT_ANALYSIS' });
    res.json({ success: true, ...response });
  });

  app.post("/api/generate-plan", async (req: Request, res: Response) => {
    const { messages } = req.body;
    const response = await processAssistantChat(messages, { intent: 'MEDICINE_PLAN' });
    res.json({ success: true, ...response });
  });

  app.post("/api/scan-medicine", async (req: Request, res: Response) => {
    const { query } = req.body;
    const response = await processAssistantChat([{ role: 'user', content: query }], { intent: 'MEDICINE_INFO' });
    res.json({ success: true, ...response });
  });

  app.post("/api/symptom-checker", async (req: Request, res: Response) => {
    const { messages } = req.body;
    const response = await processAssistantChat(messages, { intent: 'SYMPTOM_CHECK' });
    res.json({ success: true, ...response });
  });
}
