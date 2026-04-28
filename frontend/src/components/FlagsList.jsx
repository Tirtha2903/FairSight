import React from 'react';

const SEVERITY_MAP = {
  critical: { icon: '🔴', label: 'Critical', cls: 'tag-red' },
  warning:  { icon: '🟡', label: 'Warning',  cls: 'tag-yellow' },
  ok:       { icon: '🟢', label: 'OK',        cls: 'tag-green' },
};

export default function FlagsList({ flags = [] }) {
  if (!flags.length) return <p style={{ color: 'var(--text-muted)' }}>No flags generated.</p>;

  return (
    <div className="flags-list">
      {flags.map((flag, i) => {
        const s = SEVERITY_MAP[flag.severity] || SEVERITY_MAP.ok;
        return (
          <div key={i} className={`flag-card ${flag.severity}`}>
            <span className="flag-icon">{s.icon}</span>
            <div className="flag-body">
              <div className="flag-header">
                <h3>{flag.metric}</h3>
                <span className={`tag ${s.cls}`}>{s.label}</span>
                <span className="tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                  Value: {typeof flag.value === 'number' ? flag.value.toFixed(3) : flag.value}
                </span>
              </div>
              <p className="flag-message">{flag.message}</p>
              <p className="flag-suggestion">💡 {flag.suggestion}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
