import AdminLogin from '@/components/admin/AdminLogin';
import { DATA_API_URL, adminFetch, hasAdminSession } from '@/lib/api';
import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = DATA_API_URL;

interface AnalyticsData {
  total_visits_30d: number;
  today_visits: number;
  error_searches_7d: number;
  popular_errors: Array<{
    code: string;
    title: string;
    search_count: number;
    category: string;
    severity: string;
  }>;
  visits_chart: Array<{
    date: string;
    visits: number;
  }>;
  devices: Array<{
    device_type: string;
    count: number;
  }>;
}

export default function Analytics() {
  const [authenticated, setAuthenticated] = useState(hasAdminSession);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authenticated) fetchAnalytics();
  }, [authenticated]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminFetch(`${API_URL}?action=analytics_overview`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const result = await response.json();
      setData(result);
    } catch (err) {
      if (!hasAdminSession()) setAuthenticated(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) return <AdminLogin onSuccess={() => setAuthenticated(true)} />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1a] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-white text-xl">Загрузка статистики...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1a] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-red-400">Ошибка: {error || 'Нет данных'}</div>
      </div>
    );
  }

  // Подготовка данных для графика визитов
  const visitsChartData = {
    labels: data.visits_chart.map(v => {
      const date = new Date(v.date);
      return `${date.getDate()}.${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'Визиты',
        data: data.visits_chart.map(v => v.visits),
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Подготовка данных для графика устройств
  const devicesChartData = {
    labels: data.devices.map(d => d.device_type || 'Unknown'),
    datasets: [
      {
        data: data.devices.map(d => d.count),
        backgroundColor: ['#60a5fa', '#f87171', '#34d399', '#a78bfa'],
        borderWidth: 0
      }
    ]
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 border-red-500/50';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'info': return 'bg-blue-500/20 border-blue-500/50';
      default: return 'bg-gray-500/20 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1a] to-[#0a0a0f] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Icon name="BarChart3" className="w-10 h-10 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Аналитика сайта</h1>
              <p className="text-white/60 mt-1">Статистика посещений и популярных ошибок</p>
            </div>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Icon name="RefreshCw" className="w-4 h-4" />
            Обновить
          </button>
        </div>

        {/* Статистические карточки */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="Users" className="w-6 h-6 text-blue-400" />
              <h3 className="text-white/80 text-sm font-medium">Визиты за 30 дней</h3>
            </div>
            <p className="text-4xl font-bold text-white">{data.total_visits_30d}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="TrendingUp" className="w-6 h-6 text-green-400" />
              <h3 className="text-white/80 text-sm font-medium">Визиты сегодня</h3>
            </div>
            <p className="text-4xl font-bold text-white">{data.today_visits}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="Search" className="w-6 h-6 text-purple-400" />
              <h3 className="text-white/80 text-sm font-medium">Поиски ошибок (7д)</h3>
            </div>
            <p className="text-4xl font-bold text-white">{data.error_searches_7d}</p>
          </div>
        </div>

        {/* Графики */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* График визитов */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="LineChart" className="w-5 h-5 text-blue-400" />
              Визиты за 14 дней
            </h3>
            <Line 
              data={visitsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                  }
                },
                scales: {
                  x: {
                    ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  },
                  y: {
                    ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>

          {/* График устройств */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="Smartphone" className="w-5 h-5 text-blue-400" />
              Устройства (30 дней)
            </h3>
            {data.devices.length > 0 ? (
              <Pie 
                data={devicesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: 'rgba(255, 255, 255, 0.8)' }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff'
                    }
                  }
                }}
              />
            ) : (
              <div className="text-white/40 text-center py-12">Нет данных</div>
            )}
          </div>
        </div>

        {/* Топ кодов ошибок */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">
            <Icon name="AlertTriangle" className="w-6 h-6 text-yellow-400" />
            Топ-10 кодов ошибок
          </h3>
          <div className="space-y-3">
            {data.popular_errors.map((error, idx) => (
              <div
                key={error.code}
                className={`flex items-center justify-between p-4 rounded-lg border ${getSeverityBg(error.severity)}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-white/10 px-3 py-1 rounded text-white/60 text-sm font-mono min-w-[3rem] text-center">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-lg font-mono">{error.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(error.severity)}`}>
                        {error.severity}
                      </span>
                      <span className="text-xs text-white/40 px-2 py-0.5 bg-white/10 rounded">
                        {error.category === 'obd2' ? 'OBD2' : 'BMW'}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm mt-1">{error.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Search" className="w-4 h-4 text-white/40" />
                  <span className="text-white font-bold text-xl">{error.search_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
