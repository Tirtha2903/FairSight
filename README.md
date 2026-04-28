# 🛡️ FairSight — Unbiased AI Decision Platform

> Detect and fix hidden bias in datasets and automated decisions — for hiring, loans, healthcare, and more.

**MERN Stack** | Google Solutions Challenge 2026 | [Live Demo](#)

---

## 🚀 Local Development

### Prerequisites
- Node.js ≥ 18  
- No MongoDB installation needed! (uses in-memory DB automatically)

```bash
# 1. Backend
cd backend
npm install
npm run dev          # → http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev          # → http://localhost:5174
```

### Test with sample data
Use `sample_hiring_data.csv` in the project root:
- **Protected Attribute:** `gender`
- **Outcome Column:** `hired`  
- **Positive Outcome Value:** `yes`

---

## ☁️ Vercel Deployment

### Step 1 — Get a Free MongoDB Atlas URI

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Sign up free
2. Create a cluster → Click **Connect** → **Drivers** → Copy the connection string
3. Replace `<password>` with your DB user password

### Step 2 — Deploy Backend

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo → Set **Root Directory** to `backend`
3. Add environment variable:
   ```
   MONGO_URI = mongodb+srv://user:pass@cluster.mongodb.net/fairsight
   ```
4. Deploy → Note your backend URL (e.g. `https://fairsight-api.vercel.app`)

### Step 3 — Deploy Frontend

1. **Add New Project** → same repo → Root Directory: `frontend`
2. Add environment variable:
   ```
   VITE_API_URL = https://your-backend-name.vercel.app
   ```
3. Deploy → Your app is live! 🎉

---

## 📊 Bias Metrics

| Metric | Threshold | What it detects |
|--------|-----------|-----------------|
| Disparate Impact | ≥ 0.80 | 80% rule: minority / majority positive rate |
| Statistical Parity Diff | ≤ 0.10 | Raw outcome rate gap between groups |
| Demographic Parity | ≤ 0.05 | Average deviation from overall positive rate |
| Class Imbalance | ≤ 0.15 | Skewed group representation in dataset |
| Missing Data Bias | ≤ 0.05 | Missing outcome values concentrated in one group |

---

## 🗂️ Project Structure

```
Project4/
├── backend/
│   ├── server.js              ← Express + auto MongoDB
│   ├── models/                ← Mongoose schemas
│   ├── utils/biasDetector.js  ← Pure-JS bias engine (5 metrics)
│   ├── controllers/           ← Upload + Analysis logic
│   ├── routes/                ← /api/upload & /api/analysis
│   └── vercel.json            ← Vercel serverless config
├── frontend/
│   ├── src/pages/             ← Home, Analyze, Results
│   ├── src/components/        ← MetricsGrid, BiasChart, FlagsList
│   └── vercel.json            ← SPA routing config
└── sample_hiring_data.csv
```
