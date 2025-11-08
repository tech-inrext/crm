import React from 'react';
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

const data = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [12, 18, 15, 22, 31, 18, 15],
      backgroundColor: '#4285f4',
      borderRadius: 2,
      barPercentage: 1.5,
      categoryPercentage: 0.5,
    },
  ],
};

export default function LeadGenerationChart() {
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
        
       
      </div>
      <div style={{ height: 350 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
