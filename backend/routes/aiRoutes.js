const express = require('express');
const multer = require('multer');
const { enhanceSummary, calculateMatchScore, parseResume, generateCoverLetter, recommendCourses, chatAssistant, mockInterview } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Setup multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.post('/enhance-summary', protect, enhanceSummary);
router.post('/match-score', protect, calculateMatchScore);
router.post('/parse-resume', protect, upload.single('resume'), parseResume);
router.post('/cover-letter', protect, generateCoverLetter);
router.post('/recommend-courses', protect, recommendCourses);
router.post('/chat', protect, chatAssistant);
router.post('/mock-interview', protect, mockInterview);

router.post('/echo-pdf', (req, res) => {
  const { pdfBase64, filename } = req.body;
  if (!pdfBase64) return res.status(400).send('No PDF data provided');
  
  // Strip the base64 prefix
  const base64Data = pdfBase64.replace(/^data:.*?;base64,/, "");
  const binaryData = Buffer.from(base64Data, 'base64');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename || 'resume.pdf'}"`);
  res.setHeader('Content-Length', binaryData.length);
  
  res.send(binaryData);
});

module.exports = router;
