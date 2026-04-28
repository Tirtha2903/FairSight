const express = require('express');
const {
  runAnalysis,
  getResult,
  listResults,
} = require('../controllers/analysisController');

const router = express.Router();

router.post('/run', runAnalysis);       // POST /api/analysis/run
router.get('/', listResults);           // GET  /api/analysis/
router.get('/:id', getResult);          // GET  /api/analysis/:id

module.exports = router;
