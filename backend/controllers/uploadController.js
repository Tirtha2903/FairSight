const fs = require('fs');
const csv = require('csv-parser');
const Dataset = require('../models/Dataset');

exports.uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const rows = [];

    // Parse the CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    if (rows.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or invalid.' });
    }

    const columns = Object.keys(rows[0]);
    const preview = rows.slice(0, 5);

    const dataset = new Dataset({
      filename: req.file.filename,
      originalName: req.file.originalname,
      totalRows: rows.length,
      columns,
      preview,
      filePath,
    });

    await dataset.save();

    return res.status(201).json({
      message: 'Dataset uploaded successfully',
      datasetId: dataset._id,
      columns,
      totalRows: rows.length,
      preview,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Server error during upload.' });
  }
};
