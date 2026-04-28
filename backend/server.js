require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const uploadRoutes = require('./routes/upload');
const analysisRoutes = require('./routes/analysis');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/upload', uploadRoutes);
app.use('/api/analysis', analysisRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FairSight API is running 🟢' });
});

// ─── MongoDB Connection ───────────────────────────────────────────────────────
let isConnected = false; // cache connection across warm serverless invocations

async function connectDB() {
  if (isConnected) return;

  let mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.includes('localhost')) {
    // Local dev only — spin up in-memory MongoDB
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      console.log('⚙️  Starting in-memory MongoDB for local dev…');
      const memServer = await MongoMemoryServer.create();
      mongoUri = memServer.getUri();
      console.log('✅ In-memory MongoDB ready');
    } catch {
      throw new Error(
        '❌ No MONGO_URI set and mongodb-memory-server is unavailable.\n' +
        '   Set MONGO_URI in your .env file (e.g. MongoDB Atlas connection string).'
      );
    }
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  isConnected = true;
  console.log('✅ Mongoose connected to MongoDB');
}

// ─── Start ────────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDB();
    // Only call listen when running directly (not on Vercel)
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 FairSight API → http://localhost:${PORT}`);
        console.log(`   Health: http://localhost:${PORT}/api/health`);
      });
    }
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    if (!process.env.VERCEL) process.exit(1);
  }
}

startServer();

// Export for Vercel serverless handler
module.exports = app;
