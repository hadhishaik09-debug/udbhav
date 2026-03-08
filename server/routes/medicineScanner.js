const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractTextFromImage } = require('../services/ocrService');
const { extractMedicineName } = require('../utils/extractMedicineName');
const { getMedicineInformation } = require('../services/medicineAI');

/**
 * Registers Medicine Scanner routes to the Express application.
 * Follows the pattern requested in traditional Node.js/JavaScript.
 */
async function registerMedicineScannerRoutes(app) {
    // Multer configuration for file uploads
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

    const upload = multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    });

    // POST /api/scan-medicine
    app.post('/api/scan-medicine', upload.single('image'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: "No image file provided." });
            }

            const imagePath = req.file.path;
            console.log(`[API] Processing scan for: ${req.file.filename}`);

            // 1. OCR Stage - Extracting raw text from image
            const rawText = await extractTextFromImage(imagePath);
            if (!rawText || rawText.length < 5) {
                fs.unlinkSync(imagePath);
                return res.status(400).json({ success: false, message: "OCR could not detect significant text in the image." });
            }

            // 2. Extraction Stage - Identifying the medicine name
            const medicineName = extractMedicineName(rawText);
            if (!medicineName) {
                fs.unlinkSync(imagePath);
                return res.status(400).json({ success: false, message: "Could not identify a medicine name from the strip." });
            }

            // 3. AI Information Stage - Retrieving medical profile
            const medicineInfo = await getMedicineInformation(medicineName);

            // Success Response
            return res.json({
                success: true,
                medicine: medicineInfo,
                image_url: `/uploads/${req.file.filename}`,
                detected_text: rawText // included for transparency
            });

        } catch (error) {
            console.error('[API Error]', error);
            return res.status(500).json({
                success: false,
                message: "A server error occurred during scanning.",
                error: error.message
            });
        }
    });
}

module.exports = { registerMedicineScannerRoutes };
