import OpenAI from 'openai';
import { analyzeMedicalDocument } from './documentAI';
import { getMedicineAdvice } from './medicineAdvisorAI';
const { getMedicineInformation } = require('./medicineAI');

export type Intent = 'MEDICINE_ADVICE' | 'DOCUMENT_ANALYSIS' | 'SYMPTOM_CHECK' | 'MEDICINE_INFO' | 'MEDICINE_PLAN' | 'GENERAL' | 'CLARIFY';

export interface ChatState {
  intent?: Intent;
  symptomFlow?: {
    symptoms: string[];
    questionsCount: number;
    answers: Record<string, string>;
  };
  medicineFlow?: {
    step: 'taken_medicine' | 'taken_time' | 'new_medicine' | 'completed';
    taken_medicine?: string;
    taken_time?: string;
    new_medicine?: string;
  };
  lastServiceData?: any;
}

export interface AssistantResponse {
  intent: Intent;
  type: 'message' | 'question' | 'assessment';
  content: string;
  data?: any;
  state?: ChatState;
}

const INTENT_PROMPT = `
Analyze the conversation and determine the user's PRIMARY intent. 
Possible Intents:
- MEDICINE_ADVICE: Questions about taking medicine, safety, timing, or interactions. (e.g., "Can I take another medicine?", "When should I take this?")
- DOCUMENT_ANALYSIS: Requests to explain a prescription, report, or medical document. Usually provided as text.
- SYMPTOM_CHECK: User describes symptoms (headache, fever, etc.).
- MEDICINE_PLAN: Requests to create a medication schedule, routine, or timetable.
- GENERAL: Greeting, small talk, or unrelated health questions.

Return ONLY the intent string. If unclear, return CLARIFY.
`;

const MEDICINE_ADVICE_PROMPT = `
You are a Medicine Advisor Assistant. Your goal is to collect three specific pieces of information to provide safety advice:
1. Which medicine the user ALREADY took.
2. AT WHAT TIME they took it.
3. Which NEW medicine they want to take.

RULES:
- ASK ONE QUESTION AT A TIME.
- If the user provides one of these in their message, move to the next.
- Once all three are known, return a JSON with status: "ready".

STRICT FORMAT (JSON):
{
  "status": "questioning",
  "nextQuestion": "The next question to ask",
  "collected": {
    "taken_medicine": "...",
    "taken_time": "...",
    "new_medicine": "..."
  }
}
OR
{
  "status": "ready",
  "collected": {
    "taken_medicine": "...",
    "taken_time": "...",
    "new_medicine": "..."
  }
}
`;

const SYMPTOM_ENGINE_PROMPT = `
You are an Advanced AI Symptom Checker.
GOAL: Conduct clinical assessment via ADAPTIVE QUESTIONING.

RULES:
1. ASK ONE QUESTION AT A TIME.
2. ADAPTIVE: Each question MUST depend on previous answers.
3. MULTI-SYMPTOM: Handle all mentioned symptoms.
4. DATA COLLECTION: Internally track and summarize responses.
5. COMPLETION: Stop after 3-5 questions or if severe, provide FINAL ASSESSMENT.

STRICT FINAL ASSESSMENT FORMAT (JSON):
{
  "status": "completed",
  "type": "assessment",
  "content": "I have completed the assessment.",
  "result": {
    "riskLevel": "Low" | "Medium" | "High",
    "riskColor": "green" | "yellow" | "red",
    "riskPercentage": number,
    "chartData": [{"label": "Viral", "value": 60}, {"label": "Other", "value": 40}],
    "safeMedicines": ["Only OTC"],
    "homeRemedies": ["List"],
    "precautions": ["List"],
    "dosAndDonts": { "do": ["..."], "dont": ["..."] },
    "recommendation": "Mild (Optional) / Medium (Recommended) / Severe (Immediate)"
  }
}

QUESTION FORMAT (JSON):
{
  "status": "questioning",
  "type": "question",
  "nextQuestion": "The next clinical question"
}
`;

export async function processAssistantChat(messages: any[], state: ChatState): Promise<AssistantResponse> {
  console.log(`[Central AI] Processing request for intent: ${state.intent || 'NEW'}`);
  const lastUserMessage = messages[messages.length - 1].content;


  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // 1. Detect Intent
      let currentIntent = state.intent;
      if (!currentIntent || currentIntent === 'GENERAL' || currentIntent === 'CLARIFY') {
        const intentRes = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "system", content: INTENT_PROMPT }, { role: "user", content: lastUserMessage }],
        });
        currentIntent = (intentRes.choices[0].message.content?.trim() as Intent) || 'GENERAL';
      }

      // 2. Route based on intent
      if (currentIntent === 'DOCUMENT_ANALYSIS') {
        // If message is short, ask for text. Otherwise analyze.
        if (lastUserMessage.length < 50 && !lastUserMessage.toLowerCase().includes('report')) {
           return {
             intent: 'DOCUMENT_ANALYSIS',
             type: 'message',
             content: "Please provide the text from your medical report or prescription for analysis.",
             state: { intent: currentIntent }
           };
        }
        const analysis = await analyzeMedicalDocument(lastUserMessage);
        return {
          intent: 'DOCUMENT_ANALYSIS',
          type: 'message',
          content: "I have analyzed the document text you provided. Here are the findings:",
          data: analysis,
          state: { intent: 'GENERAL' } // Reset intent after one-shot actions
        };
      }

      if (currentIntent === 'MEDICINE_INFO') {
        const medInfo = await getMedicineInformation(lastUserMessage);
        return {
          intent: 'MEDICINE_INFO',
          type: 'message',
          content: `Here is information about **${medInfo.medicine_name}**:`,
          data: medInfo,
          state: { intent: 'GENERAL' }
        };
      }

      if (currentIntent === 'MEDICINE_ADVICE') {
        const adviceRes = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: MEDICINE_ADVICE_PROMPT },
            ...messages
          ],
          response_format: { type: "json_object" }
        });
        
        const parsed = JSON.parse(adviceRes.choices[0].message.content || '{}');
        
        if (parsed.status === 'ready') {
          const advice = await getMedicineAdvice(lastUserMessage, parsed.collected);
          return {
            intent: 'MEDICINE_ADVICE',
            type: 'message',
            content: "READY_FOR_API",
            data: advice,
            state: { intent: 'GENERAL' }
          };
        }
 else {
          return {
            intent: 'MEDICINE_ADVICE',
            type: 'question',
            content: parsed.nextQuestion,
            state: { 
              intent: 'MEDICINE_ADVICE',
              medicineFlow: {
                step: 'completed', // Internal tracking handled by LLM context
                ...parsed.collected
              }
            }
          };
        }
      }

      if (currentIntent === 'SYMPTOM_CHECK') {
        const symptomRes = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: SYMPTOM_ENGINE_PROMPT },
            ...messages
          ],
          response_format: { type: "json_object" }
        });
        
        const parsed = JSON.parse(symptomRes.choices[0].message.content || '{}');
        
        if (parsed.status === 'completed') {
          return {
            intent: 'SYMPTOM_CHECK',
            type: 'assessment',
            content: "READY_FOR_API",
            data: parsed.result,
            state: { intent: 'GENERAL' } // Done
          };
        }
 else {
          return {
            intent: 'SYMPTOM_CHECK',
            type: 'question',
            content: parsed.nextQuestion,
            state: { 
              intent: 'SYMPTOM_CHECK', 
              symptomFlow: { 
                symptoms: state.symptomFlow?.symptoms || [],
                questionsCount: (state.symptomFlow?.questionsCount || 0) + 1,
                answers: { ...state.symptomFlow?.answers, [messages.length]: lastUserMessage }
              } 
            }
          };
        }
      }

      if (currentIntent === 'MEDICINE_PLAN') {
        const planRes = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are an AI Medication Planner. Create a structured medication plan. Return ONLY JSON with an array named 'plans' (objects: medicine_name, dosage, morning, afternoon, night, duration) and top-level fields: precautions, advice." },
            ...messages
          ],
          response_format: { type: "json_object" }
        });
        const parsed = JSON.parse(planRes.choices[0].message.content || '{}');
        return {
          intent: 'MEDICINE_PLAN',
          type: 'message',
          content: "I have generated your personalized medicine plan:",
          data: parsed,
          state: { intent: 'GENERAL' }
        };
      }



      if (currentIntent === 'CLARIFY') {
        return {
          intent: 'CLARIFY',
          type: 'message',
          content: "I'm not exactly sure how to help. Are you asking about symptoms, a specific medicine, or do you have a medical report to analyze?",
          state: { intent: 'CLARIFY' }
        };
      }

      // Default
      const genRes = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are Aushadhara AI, a helpful healthcare assistant. Provide safe, general info. Always include Disclaimer." },
          ...messages
        ]
      });

      return {
        intent: 'GENERAL',
        type: 'message',
        content: genRes.choices[0].message.content || "How can I assist you with your health today?",
        state: { intent: 'GENERAL' }
      };

    } catch (error: any) {
      console.error("[Central AI Error]", error);
    }
  }

  return {
    intent: 'GENERAL',
    type: 'message',
    content: "Service temporarily unavailable. Please try again later.",
    state: {}
  };
}
