const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    totalRows: { type: Number, default: 0 },
    columns: [{ type: String }],
    preview: [{ type: mongoose.Schema.Types.Mixed }], // first 5 rows
    filePath: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dataset', DatasetSchema);
