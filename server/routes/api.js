const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const { db } = require('../firebase');

// Configure upload directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Import fetch dynamically since node 18+ has it built-in, or use an alternative
// Assuming Node.js >= 18 for native fetch
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { uid } = req.body; // User ID from frontend
        
        // 1. Send file to Python AI Service
        let aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5001/analyze';
        // Auto-append '/analyze' path if it is omitted in the environment variable
        if (process.env.AI_SERVICE_URL && !aiServiceUrl.endsWith('/analyze')) {
            aiServiceUrl = aiServiceUrl.replace(/\/$/, '') + '/analyze';
        }
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), { filename: req.file.originalname, contentType: req.file.mimetype });

        console.log(`Sending file to AI service at ${aiServiceUrl}`);
        
        // Use dynamically imported node-fetch or native fetch depending on version, 
        // fallback to using FormData pipe if needed, or axios. 
        // We'll use axios to make it simpler and foolproof.
        const axios = require('axios');
        const getAxiosConfig = (form) => ({
            headers: form.getHeaders(),
            timeout: 120000,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });

        let aiResult = {};
        try {
            let response;
            try {
                response = await axios.post(aiServiceUrl, formData, getAxiosConfig(formData));
            } catch (initialError) {
                const status = initialError.response?.status;
                const code = initialError.code;
                if ([502, 503].includes(status) || ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT'].includes(code)) {
                    await new Promise(resolve => setTimeout(resolve, 20000));
                    const retryFormData = new FormData();
                    retryFormData.append('file', fs.createReadStream(req.file.path), { filename: req.file.originalname, contentType: req.file.mimetype });
                    response = await axios.post(aiServiceUrl, retryFormData, getAxiosConfig(retryFormData));
                } else {
                    throw initialError;
                }
            }
            aiResult = response.data;
        } catch (aiError) {
            console.error("Status:", aiError.response?.status);
            console.error("Response:", aiError.response?.data);
            console.error("Code:", aiError.code);
            console.error("Message:", aiError.message);
            // Delete temp file
            fs.unlinkSync(req.file.path);
            const rawErrorMsg = aiError.response?.data?.error || aiError.message;
            return res.status(502).json({ error: 'AI analysis failed: ' + rawErrorMsg, details: rawErrorMsg });
        }

        // Default properties from AI response
        const { result = 'Pending', confidence = 0.0, reason = 'Unknown', heatmap = null } = aiResult;
        
        // 2. Save result to Firestore
        const uploadData = {
            fileName: req.file.originalname,
            userId: uid || 'anonymous',
            type: req.file.mimetype,
            result: result,
            confidence: confidence,
            reason: reason,
            timestamp: new Date().toISOString()
        };

        let savedDocId = null;
        if (db) {
            try {
                const docRef = await db.collection('uploads').add(uploadData);
                savedDocId = docRef.id;
            } catch (dbError) {
                console.warn("Firestore database save failed (Is Firestore initialized in test mode?):", dbError.message);
            }
        } else {
            console.warn("Firestore not initialized, skipping database save");
        }

        // 3. Clean up the uploaded file to save space (or keep it if needed for a dashboard)
        fs.unlinkSync(req.file.path);

        // 4. Return result to frontend
        return res.json({
            success: true,
            id: savedDocId,
            heatmap: heatmap,
            ...uploadData
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

// Get User History
router.get('/history/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        if (!db) {
            return res.json([]); // Return empty if db not configured
        }

        const snapshot = await db.collection('uploads')
            .where('userId', '==', uid)
            .orderBy('timestamp', 'desc')
            .get();

        const history = [];
        snapshot.forEach(doc => {
            history.push({ id: doc.id, ...doc.data() });
        });

        res.json(history);
    } catch (error) {
        console.warn('History Query Error (Is Firestore enabled?):', error.message);
        res.json([]); // Return empty history array gracefully
    }
});

module.exports = router;
