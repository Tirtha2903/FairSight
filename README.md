# 🛡️ FairSight — Unbiased AI Decision Platform

> Detect hidden bias in datasets and automated decisions — for hiring, loans, healthcare, and more.

Built with **MERN Stack** for Google Solutions Challenge 2026.

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally on port 27017

### 1. Backend
```bash
cd backend
npm install
npm run dev
# → http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 3. Test with sample data
Use `sample_hiring_data.csv` in the project root.
- **Protected Attribute:** `gender`
- **Outcome Column:** `hired`
- **Positive Outcome Value:** `yes`

---

## 📊 Bias Metrics Explained

| Metric | Threshold | Meaning |
|--------|-----------|---------|
| Disparate Impact | ≥ 0.80 | Minority / majority positive rate ratio (80% rule) |
| Statistical Parity Diff | ≤ 0.10 | Raw difference in positive rates between groups |
| Demographic Parity | ≤ 0.05 | Average deviation from overall positive rate |
| Class Imbalance | ≤ 0.15 | Std deviation of group proportions in dataset |
| Missing Data Bias | ≤ 0.05 | Max fraction of missing outcomes in any group |

---

## 🗂️ Project Structure
```
Project4/
├── backend/          Express API + MongoDB + Bias Engine
├── frontend/         React + Vite SPA
└── sample_hiring_data.csv
```
