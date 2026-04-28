import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="dot" />
          FairSight
        </Link>
        <div className="navbar-links">
          <Link to="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/analyze" className={pathname === '/analyze' ? 'active' : ''}>Analyze</Link>
          <Link to="/analyze" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
            ⚡ Run Analysis
          </Link>
        </div>
      </div>
    </nav>
  );
}
