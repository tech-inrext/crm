import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options: any = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: '#eceff1',
        drawBorder: true,
        borderColor: '#222',
        borderWidth: 2,
        lineWidth: 1,
      },
      ticks: { font: { size: 20 }, color: '#222' }
    },
    y: {
      grid: {
        color: '#ddd',
        lineWidth: 2,
        borderDash: [6, 6]
      },
      ticks: { stepSize: 8, font: { size: 20 }, color: '#222' },
      min: 0,
      max: 32
    }
  }
};

type Props = {
  period?: 'week' | 'month'
}

export default function LeadGenerationChart({ period = 'month' }: Props) {
  const [chartData, setChartData] = useState<any>({ labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets: [{ data: [0,0,0,0,0,0,0], backgroundColor: '#4285f4' }] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v0/analytics/lead-generation?period=${period}`, { credentials: 'same-origin' });
        const json = await res.json();
        if (cancelled) return;
        if (!json || !json.success) {
          setError(json?.error || 'Failed to load');
          return;
        }
        setChartData({ labels: json.labels, datasets: [{ data: json.data, backgroundColor: '#4285f4' }] });
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    // refresh on focus/visibility
    const onFocus = () => { load(); };
    const onVis = () => { if (!document.hidden) load(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    const id = setInterval(() => load(), 20000);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
      clearInterval(id);
    };
  }, [period]);

  return (
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)",
      border: "1px solid #eceff1",
      padding: "32px 28px 18px 28px",
      maxWidth: "850px"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px"
      }}>
        <div style={{ fontWeight: 600, color: '#222' }}>{loading ? 'Loading...' : (error ? 'Error loading data' : '')}</div>
      </div>
      <div style={{ height: 350 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
