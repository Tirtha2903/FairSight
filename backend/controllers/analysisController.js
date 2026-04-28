const fs = require('fs');
const csv = require('csv-parser');
const Dataset = require('../models/Dataset');
const AnalysisResult = require('../models/AnalysisResult');
const { analyzeDataset } = require('../utils/biasDetector');

// POST /api/analysis/run
exports.runAnalysis = async (req, res) => {
  try {
    const { datasetId, protectedAttribute, outcomeColumn, positiveOutcome } =
      req.body;

    if (!datasetId || !protectedAttribute || !outcomeColumn || !positiveOutcome) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found.' });
    }

    // Re-parse the CSV from disk
    const rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(dataset.filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    // Run bias detection
    const result = analyzeDataset(
      rows,
      protectedAttribute,
      outcomeColumn,
      positiveOutcome
    );

    // Persist result
    const analysisResult = new AnalysisResult({
      datasetId,
      protectedAttribute,
      outcomeColumn,
      positiveOutcome,
      ...result,
    });
    await analysisResult.save();

    return res.status(201).json({
      message: 'Analysis complete',
      resultId: analysisResult._id,
      fairnessScore: result.fairnessScore,
    });
  } catch (err) {
    console.error('Analysis error:', err);
    return res.status(500).json({ error: 'Server error during analysis.' });
  }
};

// GET /api/analysis/:id
exports.getResult = async (req, res) => {
  try {
    const result = await AnalysisResult.findById(req.params.id).populate(
      'datasetId',
      'originalName totalRows columns'
    );
    if (!result) {
      return res.status(404).json({ error: 'Result not found.' });
    }
    return res.json(result);
  } catch (err) {
    console.error('Fetch result error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/analysis/  ← list all analyses
exports.listResults = async (req, res) => {
  try {
    const results = await AnalysisResult.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('datasetId', 'originalName totalRows');
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
};
