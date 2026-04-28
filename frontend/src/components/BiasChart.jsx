import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BiasChart({ groupStats = [], protectedAttribute = '' }) {
  if (!groupStats.length) return null;

  const labels = groupStats.map((g) => g.group);
  const posRates = groupStats.map((g) => +(g.positiveRate * 100).toFixed(1));
  const counts   = groupStats.map((g) => g.count);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const data = {
    labels,
    datasets: [
      {
        label: 'Positive Outcome Rate (%)',
        data: posRates,
        backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length] + 'cc'),
        borderColor: labels.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 2,
        borderRadius: 8,
        yAxisID: 'y',
      },
      {
        label: 'Group Size (rows)',
        data: counts,
        backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length] + '44'),
        borderColor: labels.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 1,
        borderRadius: 8,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } },
      },
      title: {
        display: true,
        text: `Outcome Distribution by ${protectedAttribute}`,
        color: '#f1f5f9',
        font: { family: 'Inter', size: 14, weight: '700' },
        padding: { bottom: 16 },
      },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: {
        type: 'linear', position: 'left',
        ticks: { color: '#94a3b8', callback: (v) => v + '%' },
        grid: { color: 'rgba(255,255,255,0.05)' },
        title: { display: true, text: 'Positive Rate (%)', color: '#64748b' },
      },
      y1: {
        type: 'linear', position: 'right',
        ticks: { color: '#94a3b8' },
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Group Size', color: '#64748b' },
      },
    },
  };

  return (
    <div className="chart-card">
      <Bar data={data} options={options} />
    </div>
  );
}
