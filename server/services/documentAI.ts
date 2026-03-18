import OpenAI from 'openai';

/**
 * AI Service to analyze medical documents (prescriptions, lab reports, etc.).
 * Extracts structured data from raw OCR text.
 */
export async function analyzeMedicalDocument(rawText: string) {
  console.log(`[Document AI] Analyzing document text (${rawText.length} chars)`);

  const systemPrompt = `
    You are an expert medical document analyst. Analyze the provided clinical text and return a structured JSON response.
    The response must follow this format:
    {
      "summary": "Short explanation of the document",
      "medicines": [
        {
          "name": "Medicine name",
          "dosage": "Strength/Amount",
          "timing": "When to take it",
          "clickable": true
        }
      ],
      "instructions": "General instructions from the doctor",
      "report_analysis": "Detailed analysis of lab values or clinical findings. Identify high/low values if applicable.",
      "certificate_details": "If a medical certificate, include diagnosis and duration."
    }
    
    Guidelines:
    - Language: Professional yet simple enough for a patient to understand.
    - Medicines: Only include detectable medications. Set 'clickable' to true for all.
    - Safety: If the text is not a medical document or is illegible, return an appropriate summary stating so.
  `;

  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze the following medical text: \n\n${rawText}` }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      if (!content) throw new Error("Empty AI response");
      
      return JSON.parse(content);
    } catch (error: any) {
      console.error("[Document AI Error]", error.message);
      // Fall through to mock
    }
  }

  // Fallback Mock Response for demo purposes when API key is missing
  console.warn("[Document AI Warning] Using mock response (API key missing or failed)");
  return {
    "summary": "This document appears to be a clinical report. (Mock Mode)",
    "medicines": [
      {
        "name": "Amoxicillin",
        "dosage": "500mg",
        "timing": "TDS for 5 days",
        "clickable": true
      },
      {
        "name": "Paracetamol",
        "dosage": "650mg",
        "timing": "SOS for fever",
        "clickable": true
      }
    ],
    "instructions": "Maintain proper hydration and rest.",
    "report_analysis": "Clinical observation suggests mild infection. Parameters are within expected mock ranges.",
    "certificate_details": "N/A"
  };
}
