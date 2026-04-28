import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResult } from '../api/fairsight';
import MetricsGrid from '../components/MetricsGrid';
import BiasChart from '../components/BiasChart';
import FlagsList from '../components/FlagsList';

/* ── Score Ring Component ────────────────────────────────────────── */
function ScoreRing({ score }) {
  const R = 54;
  const circ = 2 * Math.PI * R;
  const offset = circ - (score / 100) * circ;

  const color =
    score >= 75 ? '#10b981' :
    score >= 50 ? '#f59e0b' : '#ef4444';

  const label =
    score >= 75 ? 'Fair' :
    score >= 50 ? 'Moderate Risk' : 'High Risk';

  const desc =
    score >= 75
      ? 'This dataset passes most fairness checks. Continue monitoring as new data arrives.'
      : score >= 50
      ? 'Some fairness issues detected. Review flagged metrics and apply suggested fixes.'
      : 'Significant bias detected. Immediate remediation is strongly recommended before deployment.';

  return (
    <div className="score-section">
      <div className="score-ring">
        <svg width="140" height="140" viewBox="0 0 120 120">
          <circle className="ring-bg" cx="60" cy="60" r={R} />
          <circle
            className="ring-val"
            cx="60" cy="60" r={R}
            stroke={color}
            strokeDasharray={circ}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-center">
          <span className="score-number" style={{ color }}>{score}</span>
          <span className="score-label">/ 100</span>
        </div>
      </div>
      <div className="score-info">
        <h2>Fairness Score: <span style={{ color }}>{label}</span></h2>
        <p>{desc}</p>
      </div>
    </div>
  );
}

/* ── Missing Data Table ──────────────────────────────────────────── */
function MissingDataTable({ columnMissingRates = {} }) {
  const entries = Object.entries(columnMissingRates).filter(([, v]) => v > 0);
  if (!entries.length) return <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No missing data found ✅</p>;
  return (
    <div className="preview-table-wrap">
      <table className="preview-table">
        <thead><tr><th>Column</th><th>Missing %</th><th>Status</th></tr></thead>
        <tbody>
          {entries.map(([col, pct]) => (
            <tr key={col}>
              <td>{col}</td>
              <td>{pct}%</td>
              <td>
                <span className={`tag ${pct > 20 ? 'tag-red' : pct > 5 ? 'tag-yellow' : 'tag-green'}`}>
                  {pct > 20 ? '🔴 High' : pct > 5 ? '🟡 Medium' : '🟢 Low'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Results Page ────────────────────────────────────────────────── */
export default function Results() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getResult(id)
      .then((res) => { setResult(res.data); setLoading(false); })
      .catch(() => { setError('Could not load results. Please try again.'); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="loading-wrap" style={{ paddingTop: 80 }}>
      <div className="spinner" />
      <p>Loading analysis results…</p>
    </div>
  );

  if (error) return (
    <div className="container" style={{ paddingTop: 60 }}>
      <div className="alert alert-error">{error}</div>
      <Link to="/analyze" className="btn btn-primary" style={{ marginTop: 20 }}>← Try Again</Link>
    </div>
  );

  const ds = result.datasetId;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: 6 }}>Analysis Results</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              📄 {ds?.originalName} &nbsp;·&nbsp; {ds?.totalRows} rows
              &nbsp;·&nbsp; Protected: <strong style={{ color: 'var(--accent-light)' }}>{result.protectedAttribute}</strong>
              &nbsp;·&nbsp; Outcome: <strong style={{ color: 'var(--accent-light)' }}>{result.outcomeColumn}</strong>
            </p>
          </div>
          <Link to="/analyze" className="btn btn-outline">⚡ New Analysis</Link>
        </div>

        {/* Score */}
        <div className="section">
          <ScoreRing score={result.fairnessScore} />
        </div>

        {/* Metrics */}
        <div className="section">
          <div className="section-title">Fairness Metrics</div>
          <MetricsGrid metrics={result.metrics} />
        </div>

        {/* Chart */}
        <div className="section">
          <div className="section-title">Group Distribution</div>
          <BiasChart groupStats={result.groupStats} protectedAttribute={result.protectedAttribute} />
        </div>

        {/* Group Stats Table */}
        <div className="section">
          <div className="section-title">Group Statistics</div>
          <div className="preview-table-wrap">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>{result.protectedAttribute}</th>
                  <th>Total Rows</th>
                  <th>Positive Outcomes</th>
                  <th>Positive Rate</th>
                </tr>
              </thead>
              <tbody>
                {result.groupStats.map((g) => (
                  <tr key={g.group}>
                    <td><strong>{g.group}</strong></td>
                    <td>{g.count}</td>
                    <td>{g.positiveCount}</td>
                    <td>
                      <span className={`tag ${g.positiveRate >= 0.5 ? 'tag-green' : g.positiveRate >= 0.3 ? 'tag-yellow' : 'tag-red'}`}>
                        {(g.positiveRate * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Flags */}
        <div className="section">
          <div className="section-title">Bias Flags & Recommendations</div>
          <FlagsList flags={result.flags} />
        </div>

        {/* Missing data */}
        <div className="section">
          <div className="section-title">Column Missing Data Rates</div>
          <MissingDataTable columnMissingRates={result.columnMissingRates} />
        </div>

      </div>
    </div>
  );
}
