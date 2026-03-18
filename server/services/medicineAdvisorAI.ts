import OpenAI from 'openai';

/**
 * AI Service for medicine safety, timing, and interactions.
 */
export async function getMedicineAdvice(query: string, data?: { taken_medicine: string, taken_time: string, new_medicine: string }) {
  const systemPrompt = `
    You are a Senior Pharmacist and Clinical Advisor.
    Provide timing, safety, and interaction advice for medications.
    
    If specific medication details are provided:
    - Taken Medicine: ${data?.taken_medicine || 'Not specified'}
    - Taken Time: ${data?.taken_time || 'Not specified'}
    - New Medicine: ${data?.new_medicine || 'Not specified'}
    
    Analyze if it's safe to take the new medicine given the previous one and the timing.

    RULES:
    1. Only suggest safe OTC medications if applicable.
    2. Do NOT prescribe strong drugs.
    3. Be specific about timing (e.g., "before breakfast", "after dinner").
    4. Mention key contraindications and drug-drug interactions.
    5. Always include a safety disclaimer.
    
    Response Format (JSON):
    {
      "advice": "Main advice text about whether it is safe and why",
      "safety": "Safety warnings",
      "timing": "Recommended schedule for the new medicine",
      "interactions": ["list", "of", "interactions"],
      "disclaimer": "This is AI-generated info. Consult a doctor."
    }
  `;

  const userContent = data 
    ? `Is it safe to take ${data.new_medicine} after I took ${data.taken_medicine} at ${data.taken_time}?`
    : query;

  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      return JSON.parse(content || '{}');
    } catch (error: any) {
      console.error("[Medicine Advisor AI Error]", error.message);
    }
  }

  // Fallback Mock
  return {
    advice: "Generally, medications like Paracetamol should be taken after food to avoid stomach irritation. If you just took a similar painkiller, wait at least 4-6 hours.",
    safety: "Do not exceed more than 4g of Paracetamol in 24 hours.",
    timing: "Every 4-6 hours as needed for pain or fever.",
    interactions: ["Alcohol", "Warfarin (at high doses)"],
    disclaimer: "This is AI-generated info for educational purposes. Consult a doctor."
  };
}
