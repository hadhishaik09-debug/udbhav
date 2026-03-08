/**
 * Advanced utility to extract a medicine name from raw OCR text.
 * Improved logic to handle concatenation, casing, and varied strip layouts.
 */
function extractMedicineName(ocrText) {
    if (!ocrText || typeof ocrText !== 'string') return null;

    console.log("[Extraction] Analyzing OCR text for medicine names...");

    // Clean text: remove non-alphanumeric chars (keep spaces and basic symbols)
    const normalizedText = ocrText.replace(/[^\w\s.-]/g, ' ');
    const lines = normalizedText.split('\n');

    // Filtering regex for technical noise
    const technicalKeywords = /Batch|Exp|Mfg|Date|No|Lot|Qty|Price|Rs|Lic|Code|Store|Keep|Marketed|Manufactured|By|In|Of|From|Pack|Strip/i;

    // Key pharmaceutical suffixes/prefixes to boost confidence
    const medicineIndicators = /mol|fen|zine|pine|pril|sartan|dine|mine|statin|cillin|mycin|vir|azole|pam|lam|ide|cef|tin|mic/i;

    let candidates = [];

    for (let line of lines) {
        let text = line.trim();
        if (text.length < 3) continue;

        // Clean common background noise from technical lines
        if (technicalKeywords.test(text)) continue;

        // Focus on tokens that look like medicine names
        const words = text.split(/[\s/-]+/);
        for (let word of words) {
            // Remove digits and units (500mg, 10ml, etc)
            let w = word.replace(/\d+\s*(mg|ml|mcg|g|%)|tablets|capsules|tabs|caps/gi, '').trim();
            w = w.replace(/[^a-zA-Z]/g, ''); // Extract purely alpha

            if (w.length < 4) continue;
            if (technicalKeywords.test(w)) continue;

            let weight = 0;
            if (medicineIndicators.test(w.toLowerCase())) weight += 15;
            if (/^[A-Z]{5,}$/.test(w)) weight += 10; // ALL CAPS strongly indicates Brand/Generic
            if (/^[A-Z][a-z]+/.test(word)) weight += 5; // Title Case

            candidates.push({ name: w, weight });
        }
    }

    // Sort by weight DESC
    const sorted = candidates.sort((a, b) => b.weight - a.weight);

    if (sorted.length > 0) {
        const best = sorted[0].name;
        // Format to Title Case for better display
        const finalName = best.charAt(0).toUpperCase() + best.slice(1).toLowerCase();
        console.log(`[Extraction] Best Candidate: ${finalName} (Weight: ${sorted[0].weight})`);
        return finalName;
    }

    // Last resort fallback: find any word >= 5 chars that is NOT technical
    for (let line of lines) {
        const words = line.split(' ');
        for (let w of words) {
            const clean = w.replace(/[^a-zA-Z]/g, '');
            if (clean.length >= 5 && !technicalKeywords.test(clean)) {
                return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
            }
        }
    }

    return null;
}

module.exports = {
    extractMedicineName
};
