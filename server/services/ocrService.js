const { createWorker } = require('tesseract.js');
const fs = require('fs');

/**
 * OCR Service to extract text from images using Tesseract.js.
 * Implementation for Node.js backend.
 */
async function extractTextFromImage(imagePath) {
    try {
        console.log(`[OCR Service] Processing image: ${imagePath}`);

        // Check if file exists before processing
        if (!fs.existsSync(imagePath)) {
            console.error(`[OCR Error] File not found at ${imagePath}`);
            throw new Error(`Image file not found: ${imagePath}`);
        }

        // Initialize Tesseract Worker with English language
        const worker = await createWorker('eng');

        // Run OCR recognition
        const { data: { text } } = await worker.recognize(imagePath);

        // Clean up the worker to free memory
        await worker.terminate();

        console.log(`[OCR Service] Successfully extracted ${text.length} characters.`);
        return text;
    } catch (error) {
        console.error('[OCR Service Error]', error.message);
        throw new Error(`OCR processing failed: ${error.message}`);
    }
}

module.exports = {
    extractTextFromImage
};
