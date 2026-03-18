import OpenAI from 'openai';

export interface SymptomState {
  messages: { role: 'user' | 'assistant'; content: string }[];
  symptoms: string[];
  riskScore: number;
}

export interface SymptomAnalysis {
  status: 'questioning' | 'completed';
  nextQuestion?: string;
  result?: {
    riskLevel: 'Low' | 'Medium' | 'High';
    riskColor: string;
    riskPercentage: number;
    chartData: { label: string; value: number }[];
    safeMedicines: string[];
    homeRemedies: string[];
    precautions: string[];
    dosAndDonts: { do: string[]; dont: string[] };
    recommendation: string;
  };
}

const SYSTEM_PROMPT = `
You are an advanced AI Symptom Checker. Your goal is to assess user symptoms through adaptive questioning.

RULES:
1. ASK ONE QUESTION AT A TIME. Do not overwhelm the user.
2. ADAPTIVE: Each question should depend on previous answers. If the user mentions mild headache, ask about duration or light sensitivity. If they mention high fever, ask about stiff neck or confusion.
3. MULTI-SYMPTOM: If multiple symptoms are mentioned, address them collectively.
4. SCORING: Internally maintain a risk score (0-100).
5. COMPLETION: Once you have enough info (usually 3-5 questions) or if symptoms are critical, stop questioning and provide a structured final assessment.
6. SAFETY: Never prescribe strong medications. Only suggest OTC (Paracetamol, Cetirizine, etc.). Always include a disclaimer.

FINAL ASSESSMENT JSON FORMAT:
{
  "status": "completed",
  "result": {
    "riskLevel": "Low" | "Medium" | "High",
    "riskColor": "green" | "yellow" | "red",
    "riskPercentage": number,
    "chartData": [{"label": "Viral", "value": 70}, {"label": "Other", "value": 30}],
    "safeMedicines": ["List of OTC meds"],
    "homeRemedies": ["List of remedies"],
    "precautions": ["List of precautions"],
    "dosAndDonts": { "do": ["..."], "dont": ["..."] },
    "recommendation": "Mild (Optional consult) / Medium (Recommended) / Severe (Immediate)"
  }
}

QUESTIONING JSON FORMAT:
{
  "status": "questioning",
  "nextQuestion": "The follow-up question text"
}
`;

export async function processSymptomCheck(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<SymptomAnalysis> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("Empty response from AI");
      return JSON.parse(content);
    } catch (error: any) {
      console.error("[Symptom AI Error]", error.message);
    }
  }

  // Fallback if API fails or is missing
  const lastUserMsg = messages[messages.length - 1].content.toLowerCase();
  
  if (messages.length < 4) {
    return {
      status: "questioning",
      nextQuestion: "I see. How long have you been feeling this way, and are there any other symptoms like fever or dizziness?"
    };
  }

  return {
    status: "completed",
    result: {
      riskLevel: "Medium",
      riskColor: "yellow",
      riskPercentage: 45,
      chartData: [{ label: "Infection", value: 40 }, { label: "Stress", value: 60 }],
      safeMedicines: ["Paracetamol (500mg)", "Oral Rehydration Salts"],
      homeRemedies: ["Adequate rest", "Warm fluids", "Avoid cold items"],
      precautions: ["Monitor temperature every 6 hours", "Avoid crowded places"],
      dosAndDonts: {
        do: ["Drink 3L water", "Sleep 8+ hours"],
        dont: ["Self-medicate with antibiotics", "Heavy physical activity"]
      },
      recommendation: "Recommended Consult: Please visit a general physician if symptoms persist for 24+ hours."
    }
  };
}
