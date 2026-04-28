const mongoose = require('mongoose');

const FlagSchema = new mongoose.Schema({
  metric: String,
  severity: { type: String, enum: ['critical', 'warning', 'ok'] },
  value: Number,
  threshold: Number,
  message: String,
  suggestion: String,
});

const GroupStatSchema = new mongoose.Schema({
  group: String,
  count: Number,
  positiveCount: Number,
  positiveRate: Number,
});

const AnalysisResultSchema = new mongoose.Schema(
  {
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      required: true,
    },
    protectedAttribute: { type: String, required: true },
    outcomeColumn: { type: String, required: true },
    positiveOutcome: { type: String, required: true },
    fairnessScore: { type: Number, min: 0, max: 100 },
    metrics: {
      demographicParity: Number,
      disparateImpact: Number,
      statisticalParityDiff: Number,
      classImbalance: Number,
      missingDataBias: Number,
    },
    groupStats: [GroupStatSchema],
    flags: [FlagSchema],
    columnMissingRates: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnalysisResult', AnalysisResultSchema);
