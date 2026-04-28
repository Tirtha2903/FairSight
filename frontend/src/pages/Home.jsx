import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '⚖️', title: 'Disparate Impact', desc: 'Checks if the 80% four-fifths rule is violated between demographic groups.' },
  { icon: '📊', title: 'Statistical Parity', desc: 'Measures the raw difference in positive outcome rates across groups.' },
  { icon: '🔍', title: 'Demographic Parity', desc: 'Flags when groups receive significantly different outcome rates.' },
  { icon: '⚠️', title: 'Class Imbalance', desc: 'Detects when protected groups are underrepresented in your data.' },
  { icon: '🗂️', title: 'Missing Data Bias', desc: 'Identifies if missing values are concentrated in specific groups.' },
  { icon: '💡', title: 'Fix Suggestions', desc: 'Actionable guidance to correct each type of detected bias.' },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">🛡️ AI Fairness &amp; Bias Detection</div>
          <h1>Make AI Decisions<br />Fair for Everyone</h1>
          <p>
            Upload any dataset and instantly detect hidden discrimination in automated
            decisions — hiring, loans, healthcare and more. Get a fairness score,
            detailed metrics, and actionable fix suggestions.
          </p>
          <div className="hero-cta">
            <Link to="/analyze" className="btn btn-primary">⚡ Start Analysis</Link>
            <a href="#how" className="btn btn-outline">How it works</a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="features" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-title" style={{ marginBottom: 28 }}>How It Works</div>
          <div className="steps">
            {[
              { n: '1', title: 'Upload CSV', desc: 'Drag and drop your dataset. We support any CSV file up to 10 MB.' },
              { n: '2', title: 'Configure Columns', desc: 'Select the protected attribute (e.g. gender) and the outcome column.' },
              { n: '3', title: 'Run Analysis', desc: 'Our engine computes 5 fairness metrics in real time.' },
              { n: '4', title: 'Review & Fix', desc: 'See your fairness score, flags, and specific remediation steps.' },
            ].map((s) => (
              <div key={s.n} className="step">
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="features">
        <div className="container">
          <div className="section-title" style={{ marginBottom: 28 }}>What We Detect</div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>
              Ready to audit your data?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
              Try it instantly with our sample hiring dataset — no sign-up needed.
            </p>
            <Link to="/analyze" className="btn btn-primary">⚡ Analyze Now — It's Free</Link>
          </div>
        </div>
      </section>
    </>
  );
}
