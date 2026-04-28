import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Results from './pages/Results';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/results/:id" element={<Results />} />
      </Routes>
      <footer className="footer">
        <div className="container">
          🛡️ FairSight — Unbiased AI Decisions &nbsp;|&nbsp; Built for Google Solutions Challenge 2026
        </div>
      </footer>
    </BrowserRouter>
  );
}
