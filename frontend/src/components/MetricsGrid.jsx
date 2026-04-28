import React from 'react';

const METRICS_META = {
  disparateImpact:        { label: 'Disparate Impact',       desc: '80% rule ratio (minority ÷ majority)', good: (v) => v >= 0.8, fmt: (v) => (v * 100).toFixed(1) + '%' },
  statisticalParityDiff:  { label: 'Stat. Parity Diff',      desc: 'Difference in positive outcome rates',  good: (v) => v <= 0.1, fmt: (v) => (v * 100).toFixed(1) + 'pp' },
  demographicParity:      { label: 'Demographic Parity',     desc: 'Avg deviation from overall rate',       good: (v) => v <= 0.05, fmt: (v) => (v * 100).toFixed(1) + '%' },
  classImbalance:         { label: 'Class Imbalance',         desc: 'Std deviation of group proportions',   good: (v) => v <= 0.15, fmt: (v) => v.toFixed(3) },
  missingDataBias:        { label: 'Missing Data Bias',       desc: 'Max missing rate across groups',       good: (v) => v <= 0.05, fmt: (v) => (v * 100).toFixed(1) + '%' },
};

export default function MetricsGrid({ metrics = {} }) {
  return (
    <div className="metrics-grid">
      {Object.entries(METRICS_META).map(([key, meta]) => {
        const val = metrics[key];
        if (val === undefined) return null;
        const isGood = meta.good(val);
        const color = isGood ? 'var(--green)' : val > 0.3 ? 'var(--red)' : 'var(--yellow)';
        return (
          <div className="metric-card" key={key}>
            <p className="m-label">{meta.label}</p>
            <p className="m-value" style={{ color }}>{meta.fmt(val)}</p>
            <p className="m-desc">{meta.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
