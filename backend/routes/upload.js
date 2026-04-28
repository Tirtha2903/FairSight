const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadDataset } = require('../controllers/uploadController');

const router = express.Router();

// On Vercel, only /tmp is writable. Locally, use backend/uploads/
const uploadDir = process.env.VERCEL
  ? '/tmp/fairsight-uploads'
  : path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s/g, '_'));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// POST /api/upload
router.post('/', upload.single('dataset'), uploadDataset);

module.exports = router;
