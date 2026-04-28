import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDataset, runAnalysis } from '../api/fairsight';

export default function Analyze() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [step, setStep] = useState(1); // 1=upload, 2=configure, 3=running
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  // Upload state
  const [dataset, setDataset] = useState(null); // { datasetId, columns, totalRows, preview }

  // Config state
  const [protectedAttr, setProtectedAttr]   = useState('');
  const [outcomeCol, setOutcomeCol]         = useState('');
  const [positiveOutcome, setPositiveOutcome] = useState('');

  // ── File handling ────────────────────────────────────────────────
  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setError('Please upload a valid .csv file.');
      return;
    }
    setError('');
    setStep(3);
    try {
      const fd = new FormData();
      fd.append('dataset', file);
      const res = await uploadDataset(fd);
      setDataset(res.data);
      setStep(2);
    } catch (e) {
      setError(e.response?.data?.error || 'Upload failed. Is the backend running?');
      setStep(1);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // ── Run analysis ─────────────────────────────────────────────────
  const handleRun = async () => {
    if (!protectedAttr || !outcomeCol || !positiveOutcome.trim()) {
      setError('Please fill in all three configuration fields.');
      return;
    }
    setError('');
    setStep(3);
    try {
      const res = await runAnalysis({
        datasetId: dataset.datasetId,
        protectedAttribute: protectedAttr,
        outcomeColumn: outcomeCol,
        positiveOutcome: positiveOutcome.trim(),
      });
      navigate(`/results/${res.data.resultId}`);
    } catch (e) {
      setError(e.response?.data?.error || 'Analysis failed.');
      setStep(2);
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 780 }}>
        <div className="page-header" style={{ textAlign: 'left', paddingTop: 24 }}>
          <h1>Analyze Dataset</h1>
          <p>Upload a CSV file and configure which columns to inspect for bias.</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

        {/* ── Step 1: Upload ── */}
        {step === 1 && (
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <span className="upload-icon">📂</span>
            <h3>Drag & drop your CSV file here</h3>
            <p>or click anywhere to browse &nbsp;·&nbsp; Max 10 MB</p>
            <p style={{ marginTop: 14, color: 'var(--accent-light)', fontSize: '0.8rem' }}>
              💡 Don't have a file? Use <strong>sample_hiring_data.csv</strong> from the project root.
            </p>
          </div>
        )}

        {/* ── Step 3: Loading ── */}
        {step === 3 && (
          <div className="loading-wrap">
            <div className="spinner" />
            <p>Processing your dataset…</p>
          </div>
        )}

        {/* ── Step 2: Configure ── */}
        {step === 2 && dataset && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Dataset info */}
            <div className="alert alert-success">
              ✅ <strong>{dataset.originalName}</strong> uploaded — {dataset.totalRows} rows, {dataset.columns.length} columns
            </div>

            {/* Preview table */}
            <div>
              <div className="section-title">Data Preview (first 5 rows)</div>
              <div className="preview-table-wrap">
                <table className="preview-table">
                  <thead>
                    <tr>{dataset.columns.map((c) => <th key={c}>{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {dataset.preview.map((row, i) => (
                      <tr key={i}>
                        {dataset.columns.map((c) => <td key={c}>{row[c]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Config */}
            <div className="config-panel">
              <h2>⚙️ Configure Analysis</h2>
              <div className="form-row" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label>Protected Attribute Column</label>
                  <select value={protectedAttr} onChange={(e) => setProtectedAttr(e.target.value)}>
                    <option value="">— select column —</option>
                    {dataset.columns.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Outcome Column</label>
                  <select value={outcomeCol} onChange={(e) => setOutcomeCol(e.target.value)}>
                    <option value="">— select column —</option>
                    {dataset.columns.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Positive Outcome Value</label>
                  <input
                    type="text"
                    placeholder='e.g. "yes" or "1" or "approved"'
                    value={positiveOutcome}
                    onChange={(e) => setPositiveOutcome(e.target.value)}
                  />
                </div>
              </div>
              <div className="alert alert-info" style={{ marginTop: 16, fontSize: '0.83rem' }}>
                ℹ️ For the sample file: Protected Attribute = <strong>gender</strong>, Outcome = <strong>hired</strong>, Positive = <strong>yes</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={handleRun}>⚡ Run Bias Analysis</button>
              <button className="btn btn-outline" onClick={() => { setStep(1); setDataset(null); }}>
                ↩ Upload Different File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
