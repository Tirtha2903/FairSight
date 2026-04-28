require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const uploadRoutes = require('./routes/upload');
const analysisRoutes = require('./routes/analysis');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/upload', uploadRoutes);
app.use('/api/analysis', analysisRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FairSight API is running 🟢' });
});

// ─── MongoDB Connection ───────────────────────────────────────────────────────
async function startServer() {
  let mongoUri = process.env.MONGO_URI;

  // If no external URI provided, spin up an in-memory MongoDB (no install needed!)
  if (!mongoUri || mongoUri.includes('localhost')) {
    console.log('⚙️  Starting in-memory MongoDB (no local install required)…');
    const memServer = await MongoMemoryServer.create();
    mongoUri = memServer.getUri();
    console.log('✅ In-memory MongoDB ready at', mongoUri);
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Mongoose connected');

  app.listen(PORT, () => {
    console.log(`🚀 FairSight API running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('❌ Startup error:', err.message);
  process.exit(1);
});
