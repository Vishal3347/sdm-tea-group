'use client';
import { useState, useEffect } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import {
  Users, Sprout, IndianRupee, Bug, Droplets, TrendingUp, RefreshCw
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import api from '../../lib/api';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-tea-900">{value}</p>
      <p className="text-tea-600 text-sm mt-0.5">{label}</p>
      {sub && <p className="text-tea-400 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dashRes, chartRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/production/chart'),
      ]);
      setStats(dashRes.data);
      const labels = chartRes.data.map(d => format(new Date(d._id), 'MMM d'));
      const kgData = chartRes.data.map(d => d.totalKg);
      const revenueData = chartRes.data.map(d => d.totalRevenue);
      setChartData({ labels, kgData, revenueData });
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const chartConfig = chartData ? {
    labels: chartData.labels,
    datasets: [
      {
        label: 'KG Produced',
        data: chartData.kgData,
        borderColor: '#2d6b35',
        backgroundColor: 'rgba(45,107,53,0.08)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#2d6b35',
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: '#1e4424',
        titleColor: '#fff',
        bodyColor: '#d1fae5',
        callbacks: {
          label: (ctx) => ` ${ctx.raw.toLocaleString()} KG`,
        }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#dceedd' }, ticks: { color: '#5fa466' } },
      x: { grid: { display: false }, ticks: { color: '#5fa466' } },
    },
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <RefreshCw className="w-6 h-6 text-tea-500 animate-spin" />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-tea-900">Dashboard</h1>
          <p className="text-tea-500 text-sm mt-1">SDM Tea Group LLP – Sultanicherra · {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <StatCard
            icon={Users}
            label="Workers Today"
            value={stats?.todayWorkers?.toLocaleString() ?? '0'}
            sub="Labour entries today"
            color="bg-tea-600"
          />
          <StatCard
            icon={Sprout}
            label="KG Produced Today"
            value={`${stats?.todayKg?.toLocaleString() ?? '0'} KG`}
            sub="Total leaf production"
            color="bg-emerald-600"
          />
          <StatCard
            icon={IndianRupee}
            label="Revenue Today"
            value={`₹${stats?.todayRevenue?.toLocaleString() ?? '0'}`}
            sub="Total earnings today"
            color="bg-gold-500"
          />
        </div>

        {/* Chart + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Production Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-tea-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-tea-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-tea-500" />
                7-Day Production (KG)
              </h2>
            </div>
            {chartConfig ? (
              <Line data={chartConfig} options={chartOptions} height={80} />
            ) : (
              <div className="h-40 flex items-center justify-center text-tea-400 text-sm">No production data yet</div>
            )}
          </div>

          {/* Recent Alerts */}
          <div className="space-y-4">
            {/* Latest Pest */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-tea-100">
              <h2 className="font-semibold text-tea-900 flex items-center gap-2 mb-3">
                <Bug className="w-4 h-4 text-red-500" />
                Latest Pest Report
              </h2>
              {stats?.latestPest ? (
                <div>
                  <p className="text-sm font-medium text-tea-800">{stats.latestPest.pestType}</p>
                  <p className="text-xs text-tea-500 mt-1">Section: {stats.latestPest.section}</p>
                  <p className="text-xs text-tea-400 mt-1">{format(new Date(stats.latestPest.date), 'MMM d, yyyy')}</p>
                  {stats.latestPest.notes && (
                    <p className="text-xs text-tea-500 mt-2 italic">"{stats.latestPest.notes}"</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-tea-400">No pest reports</p>
              )}
            </div>

            {/* Latest Irrigation */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-tea-100">
              <h2 className="font-semibold text-tea-900 flex items-center gap-2 mb-3">
                <Droplets className="w-4 h-4 text-blue-500" />
                Latest Irrigation
              </h2>
              {stats?.latestIrrigation ? (
                <div>
                  <p className="text-sm font-medium text-tea-800">
                    Section: {stats.latestIrrigation.section}
                  </p>
                  <div className="mt-1">
                    <span className={stats.latestIrrigation.irrigationDone ? 'badge-green' : 'badge-red'}>
                      {stats.latestIrrigation.irrigationDone ? 'Done' : 'Not Done'}
                    </span>
                  </div>
                  {stats.latestIrrigation.duration && (
                    <p className="text-xs text-tea-500 mt-1">{stats.latestIrrigation.duration}h duration</p>
                  )}
                  <p className="text-xs text-tea-400 mt-1">{format(new Date(stats.latestIrrigation.date), 'MMM d, yyyy')}</p>
                </div>
              ) : (
                <p className="text-sm text-tea-400">No irrigation logs</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
