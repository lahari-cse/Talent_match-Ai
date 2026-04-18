const express = require('express');
const multer = require('multer');
const path = require('path');
const { getProfile, updateProfile, getAllProfiles, uploadProfileImage, uploadResume, downloadResume } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const fs = require('fs');

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) { cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

router.route('/all')
  .get(protect, getAllProfiles);

router.route('/')
  .get(protect, getProfile)
  .post(protect, updateProfile)
  .put(protect, updateProfile);

router.post('/upload-image', protect, upload.single('profileImage'), uploadProfileImage);
router.post('/upload-resume', protect, upload.single('resume'), uploadResume);
router.get('/download-resume', protect, downloadResume);

module.exports = router;
