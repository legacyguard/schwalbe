import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Eye,
  MousePointer,
  Award,
  AlertTriangle,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Star,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { useAnalyticsStore } from '../../stores/useAnalyticsStore';

interface BusinessIntelligenceDashboardProps {
  className?: string;
}

type TimeRange = '1h' | '24h' | '7d' | '30d' | '90d';
type ChartType = 'bar' | 'line' | 'pie' | 'area';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  description?: string;
}

const BusinessIntelligenceDashboard: React.FC<BusinessIntelligenceDashboardProps> = ({
  className = '',
}) => {
  // Analytics Store
  const {
    realTimeMetrics,
    featureUsage,
    behaviorInsights,
    events,
    sessions,
    userJourneys,
    getConversionRate,
    getBounceRate,
    getActiveUsers,
    updateRealTimeMetrics,
    calculateAdoptionRates,
    generateInsights,
    exportAnalytics,
  } = useAnalyticsStore();

  // State
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update metrics on mount and periodically
  useEffect(() => {
    updateRealTimeMetrics();
    calculateAdoptionRates();
    generateInsights();

    const interval = setInterval(() => {
      updateRealTimeMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate time-based data
  const timeFrameData = useMemo(() => {
    const now = new Date();
    const timeframes = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    };

    const cutoff = new Date(now.getTime() - timeframes[timeRange]);
    const filteredEvents = events.filter(e => new Date(e.timestamp) > cutoff);
    const filteredSessions = sessions.filter(s => new Date(s.startTime) > cutoff);

    return { filteredEvents, filteredSessions };
  }, [events, sessions, timeRange]);

  // Metric cards data
  const metricCards: MetricCard[] = [
    {
      title: 'Aktívni používatelia',
      value: realTimeMetrics.activeUsers,
      change: 12.5,
      trend: 'up',
      icon: Users,
      color: 'emerald',
      description: 'Počet aktívnych používateľov za poslednú hodinu',
    },
    {
      title: 'Konverzná miera',
      value: `${getConversionRate(timeRange).toFixed(1)}%`,
      change: -2.3,
      trend: 'down',
      icon: Target,
      color: 'blue',
      description: 'Percento používateľov, ktorí dokončili cieľ',
    },
    {
      title: 'Priemerná doba relácie',
      value: `${Math.round(realTimeMetrics.avgSessionDuration / 1000 / 60)}min`,
      change: 8.7,
      trend: 'up',
      icon: Clock,
      color: 'purple',
      description: 'Priemerný čas strávený v aplikácii',
    },
    {
      title: 'Miera odskoku',
      value: `${getBounceRate(timeRange).toFixed(1)}%`,
      change: -5.2,
      trend: 'up',
      icon: TrendingDown,
      color: 'orange',
      description: 'Percento používateľov, ktorí opustili stránku po jednom zobrazení',
    },
    {
      title: 'Celkové zobrazenia stránok',
      value: realTimeMetrics.pageViews,
      change: 15.3,
      trend: 'up',
      icon: Eye,
      color: 'indigo',
      description: 'Počet zobrazení stránok za vybrané obdobie',
    },
    {
      title: 'Počet interakcií',
      value: timeFrameData.filteredEvents.filter(e => e.type === 'click').length,
      change: 9.1,
      trend: 'up',
      icon: MousePointer,
      color: 'pink',
      description: 'Celkový počet kliknutí a interakcií',
    },
  ];

  // Feature adoption chart data
  const featureAdoptionData = featureUsage
    .sort((a, b) => b.adoptionRate - a.adoptionRate)
    .slice(0, 10)
    .map(feature => ({
      name: feature.feature,
      adoption: feature.adoptionRate,
      usage: feature.usageCount,
      users: feature.uniqueUsers,
    }));

  // User journey data
  const journeyData = userJourneys
    .reduce((acc, journey) => {
      const pathKey = journey.steps.map(s => s.page).join(' → ');
      if (!acc[pathKey]) {
        acc[pathKey] = {
          path: pathKey,
          count: 0,
          completionRate: 0,
          avgDuration: 0,
        };
      }
      acc[pathKey].count++;
      if (journey.goalAchieved) acc[pathKey].completionRate++;
      return acc;
    }, {} as Record<string, any>);

  const topJourneys = Object.values(journeyData)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5)
    .map((journey: any) => ({
      ...journey,
      completionRate: (journey.completionRate / journey.count) * 100,
    }));

  // Time series data for trends
  const trendData = useMemo(() => {
    const days = Math.min(parseInt(timeRange.replace(/[^\d]/g, '')) || 1, 30);
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayEvents = events.filter(e => {
        const eventDate = new Date(e.timestamp);
        return eventDate >= dayStart && eventDate <= dayEnd;
      });

      data.push({
        date: dayStart.toLocaleDateString('sk-SK', { month: 'short', day: 'numeric' }),
        pageViews: dayEvents.filter(e => e.type === 'page_view').length,
        conversions: dayEvents.filter(e => e.type === 'milestone_achieved').length,
        interactions: dayEvents.filter(e => e.type === 'click').length,
        users: new Set(dayEvents.map(e => e.anonymizedUserId)).size,
      });
    }

    return data;
  }, [events, timeRange]);

  // Colors for charts
  const chartColors = {
    primary: '#059669',
    secondary: '#3B82F6',
    tertiary: '#8B5CF6',
    quaternary: '#F59E0B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  };

  const pieColors = ['#059669', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1'];

  // Export functionality
  const handleExport = async (format: 'json' | 'csv') => {
    setIsLoading(true);
    try {
      const blob = await exportAnalytics(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-600" />
            Business Intelligence
          </h1>
          <p className="text-gray-600 mt-1">
            Prehľad výkonnosti a správanie používateľov
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option value="1h">Posledná hodina</option>
            <option value="24h">Posledných 24 hodín</option>
            <option value="7d">Posledných 7 dní</option>
            <option value="30d">Posledných 30 dní</option>
            <option value="90d">Posledných 90 dní</option>
          </select>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtre
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('json')}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 border"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ grafu
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as ChartType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                >
                  <option value="bar">Stĺpcový graf</option>
                  <option value="line">Čiarový graf</option>
                  <option value="area">Plošný graf</option>
                  <option value="pie">Koláčový graf</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metrika
                </label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                >
                  <option value="overview">Prehľad</option>
                  <option value="users">Používatelia</option>
                  <option value="features">Funkcie</option>
                  <option value="journeys">Cesty používateľov</option>
                  <option value="conversions">Konverzie</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    updateRealTimeMetrics();
                    calculateAdoptionRates();
                    generateInsights();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Activity className="w-4 h-4" />
                  Obnoviť dáta
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                    <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                </div>

                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </span>
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.trend === 'up' ? 'text-green-600' :
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : null}
                    {Math.abs(metric.change)}%
                  </div>
                </div>

                {metric.description && (
                  <p className="text-xs text-gray-500">{metric.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Adoption Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-emerald-600" />
              Adopcia funkcií
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'bar' ? (
              <BarChart data={featureAdoptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="adoption" fill={chartColors.primary} radius={4} />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={featureAdoptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="adoption" stroke={chartColors.primary} strokeWidth={3} />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={featureAdoptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="adoption" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.3} />
              </AreaChart>
            ) : (
              <PieChart>
                <Pie
                  data={featureAdoptionData.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="adoption"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {featureAdoptionData.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Trend Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Trendy výkonnosti
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pageViews" stroke={chartColors.primary} strokeWidth={2} name="Zobrazenia" />
              <Line type="monotone" dataKey="conversions" stroke={chartColors.secondary} strokeWidth={2} name="Konverzie" />
              <Line type="monotone" dataKey="users" stroke={chartColors.tertiary} strokeWidth={2} name="Používatelia" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* User Journeys & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top User Journeys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Najčastejšie cesty používateľov
          </h3>

          <div className="space-y-4">
            {topJourneys.map((journey, index) => (
              <div key={index} className="border-l-4 border-emerald-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {journey.path}
                  </span>
                  <span className="text-sm text-gray-500">{journey.count}x</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${journey.completionRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 min-w-fit">
                    {journey.completionRate.toFixed(1)}% úspešnosť
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Behavior Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-600" />
            Insights a odporúčania
          </h3>

          <div className="space-y-4">
            {behaviorInsights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.impact === 'high' ? 'border-red-500 bg-red-50' :
                  insight.impact === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1 rounded ${
                    insight.impact === 'high' ? 'bg-red-100 text-red-600' :
                    insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {insight.type === 'opportunity' ? (
                      <Zap className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <div className="text-xs text-gray-500">
                      Spoľahlivosť: {(insight.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {behaviorInsights.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Zatiaľ žiadne insights k dispozícii</p>
                <p className="text-sm">Insights sa generujú automaticky na základe dát používateľov</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Real-time Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Real-time aktivita
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Najnavštevovanejšie stránky</h4>
            <div className="space-y-2">
              {realTimeMetrics.topPages.slice(0, 5).map((page, index) => (
                <div key={page.page} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 truncate">{page.page}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-indigo-500 rounded-full h-1 transition-all duration-500"
                        style={{
                          width: `${(page.views / Math.max(...realTimeMetrics.topPages.map(p => p.views))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 min-w-fit">{page.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Features */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Najpoužívanejšie funkcie</h4>
            <div className="space-y-2">
              {realTimeMetrics.topFeatures.slice(0, 5).map((feature, index) => (
                <div key={feature.feature} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 truncate">{feature.feature}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-emerald-500 rounded-full h-1 transition-all duration-500"
                        style={{
                          width: `${(feature.usage / Math.max(...realTimeMetrics.topFeatures.map(f => f.usage))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 min-w-fit">{feature.usage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessIntelligenceDashboard;