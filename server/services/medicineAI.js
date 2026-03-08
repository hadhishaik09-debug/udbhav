const OpenAI = require('openai');

/**
 * AI Service to retrieve detailed medicine information.
 * Uses OpenAI if API key exists, otherwise falls back to a smart local mock database.
 */
async function getMedicineInformation(medicineName) {
    const formattedName = medicineName.toUpperCase();
    console.log(`[AI Service] Generating medical profile for: ${formattedName}`);

    // Smart Local Mock Database for common medicines
    const localDatabase = {
        "PARACETAMOL": {
            medicine_name: "Paracetamol",
            brand_name: "Calpol / Panadol / Crocin",
            uses: ["Headache", "Fever", "Muscle pain", "Toothache"],
            dosage: "500mg-1g every 4-6 hours. Max 4g in 24 hours.",
            side_effects: ["Nausea", "Stomach pain", "Loss of appetite", "Jaundice (overdose)"],
            warnings: ["Severe liver damage may occur if you take more than max dose.", "Avoid with alcohol."],
            precautions: ["Limit to 4 doses in 24 hours.", "Patients with liver disease must consult doctor."],
            drug_interactions: ["Warfarin", "Certain anticonvulsants"],
            manufacturer: "Various (Common: GSK / Sanofi)",
            storage: "Store below 30°C in a dry place."
        },
        "AZITHROMYCIN": {
            medicine_name: "Azithromycin",
            brand_name: "Azithral / Zithromax",
            uses: ["Bacterial infections", "Sinusitis", "Pneumonia", "Skin infections"],
            dosage: "Typically 500mg once daily for 3 to 5 days.",
            side_effects: ["Diarrhea", "Nausea", "Vomiting", "Abdominal pain"],
            warnings: ["Do not use if allergic to macrolides.", "May cause heart rhythm changes (QT prolongation)."],
            precautions: ["Finish the full course even if feeling better.", "Inform doctor of kidney issues."],
            drug_interactions: ["Antacids containing aluminum", "Digoxin", "Warfarin"],
            manufacturer: "Various (Common: Pfizer / Cipla)",
            storage: "Store at room temperature away from moisture."
        },
        "METFORMIN": {
            medicine_name: "Metformin",
            brand_name: "Glycomet / Glucophage",
            uses: ["Type 2 Diabetes mellitus", "PCOS (off-label)"],
            dosage: "Usually started at 500mg once or twice daily with meals.",
            side_effects: ["Stomach upset", "Metallic taste", "Flatulence", "Vitamin B12 deficiency"],
            warnings: ["Lactic acidosis is a rare but serious complication.", "Discontinue before contrast imaging."],
            precautions: ["Monitor kidney function regularly.", "Take with food to reduce stomach upset."],
            drug_interactions: ["Contrast dyes", "Insulin", "Diuretics"],
            manufacturer: "Various (Common: USV / Merck)",
            storage: "Keep in a cool, dry place."
        },
        "PANTOPRAZOLE": {
            medicine_name: "Pantoprazole",
            brand_name: "Pan / Pantocid",
            uses: ["Acidity", "Heartburn", "Gastric ulcers", "GERD"],
            dosage: "40mg usually taken 30-60 minutes before breakfast.",
            side_effects: ["Headache", "Diarrhea", "Joint pain", "Low magnesium (long term)"],
            warnings: ["Long term use may increase risk of bone fractures.", "Not for immediate relief of heartburn."],
            precautions: ["Inform doctor if using for more than 4 weeks.", "Regularly monitor B12 levels if used long-term."],
            drug_interactions: ["Atazanavir", "Methotrexate", "Ketoconazole"],
            manufacturer: "Various (Common: Alkem / Sun Pharma)",
            storage: "Store in original container to protect from light."
        }
    };

    // Generic fallback for unknown medicines in mock mode
    const genericMock = {
        medicine_name: medicineName,
        brand_name: "Generic Formulation",
        uses: ["Condition-specific treatment", "Consult with pharmacist"],
        dosage: "As directed by physician",
        side_effects: ["Mild nausea", "Dizziness", "Potential allergic reaction"],
        warnings: ["Keep out of reach of children.", "Read label carefully before use."],
        precautions: ["Inform doctor of existing health conditions.", "Do not exceed recommended dose."],
        drug_interactions: ["Consult a physician for contraindications"],
        manufacturer: "Information not available",
        storage: "Store in a cool, dry place."
    };

    // Use OpenAI if API key is present
    if (process.env.OPENAI_API_KEY) {
        try {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a senior clinical pharmacologist. Provide factual, structured medicine JSON data." },
                    { role: "user", content: `Explain the medicine: ${medicineName}. Return fields: medicine_name, brand_name, uses (array), dosage, side_effects (array), warnings (array), precautions (array), drug_interactions (array), manufacturer, storage.` }
                ],
                response_format: { type: "json_object" }
            });
            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error("[AI Service Error]", error.message);
            // Fall through to local fallback on API error
        }
    }

    // Return smart mock or generic mock
    console.warn("[AI Warning] Using local database/mock for:", formattedName);
    const result = localDatabase[formattedName] || genericMock;
    return result;
}

module.exports = { getMedicineInformation };
