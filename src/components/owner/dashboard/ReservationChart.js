"use client";

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#9ca3af',
        font: { size: 10 },
      },
      grid: { display: false },
      border: { display: false },
    },
    x: {
      ticks: {
        color: '#9ca3af',
        font: { size: 10 },
      },
      grid: { display: false },
      border: { display: false },
    },
  },
};

export default function ReservationChart({ timeRange, reservationData }) {
  const barChartData = {
    labels: reservationData[timeRange].labels,
    datasets: [
      {
        label: 'Reservations',
        data: reservationData[timeRange].data,
        backgroundColor: 'rgba(96, 165, 250, 0.7)',
        borderColor: 'rgba(96, 165, 250, 1)',
        borderRadius: 8,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-gray-800">Reservation Overview</h3>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => onTimeRangeChange('today')} 
            className={`px-3 py-1 text-sm font-semibold rounded-md shadow-sm focus:outline-none ${timeRange === 'today' ? 'bg-white text-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            Today
          </button>
          <button 
            onClick={() => onTimeRangeChange('sevenDays')} 
            className={`px-3 py-1 text-sm font-semibold rounded-md focus:outline-none ${timeRange === 'sevenDays' ? 'bg-white text-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            7-days
          </button>
          <button 
            onClick={() => onTimeRangeChange('month')} 
            className={`px-3 py-1 text-sm font-semibold rounded-md focus:outline-none ${timeRange === 'month' ? 'bg-white text-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            Month
          </button>
        </div>
      </div>
      <div className="h-64">
        <Bar data={barChartData} options={barChartOptions} />
      </div>
    </div>
  );
} 