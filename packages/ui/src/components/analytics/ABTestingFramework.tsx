import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TestTube,
  Play,
  Pause,
  Stop,
  BarChart3,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Settings,
  Plus,
  Eye,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Download,
  Copy,
  RefreshCw,
  X,
} from 'lucide-react';
import { useAnalyticsStore } from '../../stores/useAnalyticsStore';

interface ABTestingFrameworkProps {
  className?: string;
}

interface TestVariant {
  id: string;
  name: string;
  description: string;
  traffic: number;
  config: Record<string, any>;
  conversions?: number;
  participants?: number;
  conversionRate?: number;
}

interface TestResults {
  variant: string;
  conversions: number;
  participants: number;
  conversionRate: number;
  confidence: number;
  significance: number;
  isWinner?: boolean;
}

const ABTestingFramework: React.FC<ABTestingFrameworkProps> = ({
  className = '',
}) => {
  // Analytics Store
  const {
    abTests,
    userVariants,
    events,
    createABTest,
    startABTest,
    stopABTest,
    getVariant,
    recordConversion,
    trackEvent,
  } = useAnalyticsStore();

  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    targetMetric: 'conversion_rate',
    variants: [
      { id: 'control', name: 'Control', description: 'Pôvodná verzia', traffic: 50, config: {} },
      { id: 'variant_a', name: 'Variant A', description: 'Testovacia verzia', traffic: 50, config: {} },
    ] as TestVariant[],
  });

  // Calculate test results
  const calculateTestResults = (testId: string): TestResults[] => {
    const test = abTests.find(t => t.id === testId);
    if (!test) return [];

    const testEvents = events.filter(e =>
      e.metadata?.testId === testId &&
      e.type === 'milestone_achieved' &&
      e.category === 'ab_test'
    );

    return test.variants.map(variant => {
      const variantEvents = testEvents.filter(e => e.metadata?.variant === variant.id);
      const allVariantEvents = events.filter(e => e.metadata?.testVariant === variant.id);

      const conversions = variantEvents.length;
      const participants = new Set(allVariantEvents.map(e => e.anonymizedUserId)).size;
      const conversionRate = participants > 0 ? (conversions / participants) * 100 : 0;

      return {
        variant: variant.id,
        conversions,
        participants,
        conversionRate,
        confidence: calculateConfidence(conversions, participants),
        significance: calculateSignificance(variant.id, testId),
      };
    });
  };

  // Statistical calculations
  const calculateConfidence = (conversions: number, participants: number): number => {
    if (participants === 0) return 0;
    const p = conversions / participants;
    const margin = 1.96 * Math.sqrt((p * (1 - p)) / participants);
    return Math.max(0, (1 - margin) * 100);
  };

  const calculateSignificance = (variantId: string, testId: string): number => {
    const results = calculateTestResults(testId);
    const control = results.find(r => r.variant === 'control');
    const variant = results.find(r => r.variant === variantId);

    if (!control || !variant || control === variant) return 0;

    // Simple z-test calculation
    const p1 = control.conversions / control.participants;
    const p2 = variant.conversions / variant.participants;
    const n1 = control.participants;
    const n2 = variant.participants;

    if (n1 === 0 || n2 === 0) return 0;

    const pooled = (control.conversions + variant.conversions) / (n1 + n2);
    const se = Math.sqrt(pooled * (1 - pooled) * (1/n1 + 1/n2));
    const z = Math.abs(p2 - p1) / se;

    // Convert z-score to significance level
    return Math.min(99.9, z * 30); // Simplified conversion
  };

  // Get test status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'green';
      case 'completed': return 'blue';
      case 'paused': return 'yellow';
      default: return 'gray';
    }
  };

  // Add new variant
  const addVariant = () => {
    const newVariant: TestVariant = {
      id: `variant_${String.fromCharCode(65 + newTest.variants.length - 1)}`.toLowerCase(),
      name: `Variant ${String.fromCharCode(65 + newTest.variants.length - 1)}`,
      description: '',
      traffic: 0,
      config: {},
    };

    setNewTest(prev => {
      const updatedVariants = [...prev.variants, newVariant];
      const equalTraffic = Math.floor(100 / updatedVariants.length);
      const remainder = 100 - (equalTraffic * updatedVariants.length);

      return {
        ...prev,
        variants: updatedVariants.map((variant, index) => ({
          ...variant,
          traffic: equalTraffic + (index === 0 ? remainder : 0),
        })),
      };
    });
  };

  // Remove variant
  const removeVariant = (variantId: string) => {
    if (newTest.variants.length <= 2) return;

    setNewTest(prev => {
      const updatedVariants = prev.variants.filter(v => v.id !== variantId);
      const equalTraffic = Math.floor(100 / updatedVariants.length);
      const remainder = 100 - (equalTraffic * updatedVariants.length);

      return {
        ...prev,
        variants: updatedVariants.map((variant, index) => ({
          ...variant,
          traffic: equalTraffic + (index === 0 ? remainder : 0),
        })),
      };
    });
  };

  // Create test
  const handleCreateTest = () => {
    if (!newTest.name.trim() || newTest.variants.length < 2) return;

    createABTest({
      name: newTest.name,
      description: newTest.description,
      status: 'draft',
      variants: newTest.variants,
      targetMetric: newTest.targetMetric,
    });

    setShowCreateModal(false);
    setNewTest({
      name: '',
      description: '',
      targetMetric: 'conversion_rate',
      variants: [
        { id: 'control', name: 'Control', description: 'Pôvodná verzia', traffic: 50, config: {} },
        { id: 'variant_a', name: 'Variant A', description: 'Testovacia verzia', traffic: 50, config: {} },
      ],
    });
  };

  // Test actions
  const handleStartTest = (testId: string) => {
    startABTest(testId);
    trackEvent({
      type: 'feature_used',
      category: 'ab_testing',
      action: 'start_test',
      label: testId,
      privacyLevel: 'anonymous',
    });
  };

  const handleStopTest = (testId: string) => {
    stopABTest(testId);
    trackEvent({
      type: 'feature_used',
      category: 'ab_testing',
      action: 'stop_test',
      label: testId,
      privacyLevel: 'anonymous',
    });
  };

  // Export test results
  const exportTestResults = (testId: string) => {
    const test = abTests.find(t => t.id === testId);
    const results = calculateTestResults(testId);

    if (!test) return;

    const exportData = {
      test: {
        id: test.id,
        name: test.name,
        description: test.description,
        status: test.status,
        startDate: test.startDate,
        endDate: test.endDate,
        targetMetric: test.targetMetric,
      },
      variants: test.variants,
      results: results,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-test-${test.name.replace(/\s+/g, '-').toLowerCase()}-results.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            <TestTube className="w-8 h-8 text-purple-600" />
            A/B Testing Framework
          </h1>
          <p className="text-gray-600 mt-1">
            Vytvárajte a spravujte A/B testy pre optimalizáciu používateľského zážitku
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'details' : 'list')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            {viewMode === 'list' ? <Eye className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
            {viewMode === 'list' ? 'Zobraziť detaily' : 'Zobraziť zoznam'}
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nový test
          </button>
        </div>
      </motion.div>

      {/* Tests Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TestTube className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Celkové testy</p>
              <p className="text-2xl font-bold text-gray-900">{abTests.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aktívne testy</p>
              <p className="text-2xl font-bold text-gray-900">
                {abTests.filter(t => t.status === 'running').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Dokončené</p>
              <p className="text-2xl font-bold text-gray-900">
                {abTests.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Účastníci</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(userVariants).length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tests List */}
      {viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">A/B Testy</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {abTests.map((test) => {
              const results = calculateTestResults(test.id);
              const winner = results.find(r => r.significance > 95 && r.conversionRate > 0);

              return (
                <div key={test.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{test.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(test.status)}-100 text-${getStatusColor(test.status)}-800`}>
                          {test.status === 'running' ? 'Aktívny' :
                           test.status === 'completed' ? 'Dokončený' :
                           test.status === 'paused' ? 'Pozastavený' : 'Návrh'}
                        </span>
                        {winner && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Víťaz: {test.variants.find(v => v.id === winner.variant)?.name}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-3">{test.description}</p>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {test.variants.length} variantov
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {test.targetMetric}
                        </span>
                        {test.startDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(test.startDate).toLocaleDateString('sk-SK')}
                          </span>
                        )}
                      </div>

                      {/* Variants Preview */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        {test.variants.map((variant) => {
                          const result = results.find(r => r.variant === variant.id);
                          return (
                            <div key={variant.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">{variant.name}</span>
                                <span className="text-xs text-gray-500">{variant.traffic}%</span>
                              </div>
                              {result && (
                                <div className="text-xs text-gray-600">
                                  {result.participants} účastníkov • {result.conversionRate.toFixed(1)}% konverzia
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {test.status === 'draft' && (
                        <button
                          onClick={() => handleStartTest(test.id)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Spustiť test"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}

                      {test.status === 'running' && (
                        <button
                          onClick={() => handleStopTest(test.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Zastaviť test"
                        >
                          <Stop className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedTest(test.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Zobraziť detaily"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => exportTestResults(test.id)}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                        title="Exportovať výsledky"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {abTests.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Žiadne A/B testy</h3>
                <p className="mb-4">Začnite vytvorením svojho prvého A/B testu</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Vytvoriť test
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Test Details */}
      {viewMode === 'details' && selectedTest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          {(() => {
            const test = abTests.find(t => t.id === selectedTest);
            const results = calculateTestResults(selectedTest);

            if (!test) return null;

            return (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{test.name}</h3>
                    <p className="text-gray-600">{test.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Test Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Status</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(test.status)}-100 text-${getStatusColor(test.status)}-800`}>
                      {test.status === 'running' ? 'Aktívny' :
                       test.status === 'completed' ? 'Dokončený' :
                       test.status === 'paused' ? 'Pozastavený' : 'Návrh'}
                    </span>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Účastníci</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {results.reduce((sum, r) => sum + r.participants, 0)}
                    </span>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Konverzie</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {results.reduce((sum, r) => sum + r.conversions, 0)}
                    </span>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">Najlepšia konverzia</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {Math.max(...results.map(r => r.conversionRate), 0).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Variants Results */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Výsledky variantov</h4>

                  {test.variants.map((variant) => {
                    const result = results.find(r => r.variant === variant.id);
                    const isWinner = result && result.significance > 95 &&
                      result.conversionRate === Math.max(...results.map(r => r.conversionRate));

                    return (
                      <div
                        key={variant.id}
                        className={`p-4 rounded-lg border-2 ${
                          isWinner ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h5 className="font-medium text-gray-900">{variant.name}</h5>
                            {isWinner && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                Víťaz
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{variant.traffic}% trafficu</span>
                        </div>

                        {variant.description && (
                          <p className="text-sm text-gray-600 mb-3">{variant.description}</p>
                        )}

                        {result && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs text-gray-500">Účastníci</span>
                              <p className="text-lg font-semibold text-gray-900">{result.participants}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Konverzie</span>
                              <p className="text-lg font-semibold text-gray-900">{result.conversions}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Konverzná miera</span>
                              <p className="text-lg font-semibold text-gray-900">
                                {result.conversionRate.toFixed(2)}%
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Signifikancia</span>
                              <p className={`text-lg font-semibold ${
                                result.significance > 95 ? 'text-green-600' :
                                result.significance > 90 ? 'text-yellow-600' : 'text-gray-600'
                              }`}>
                                {result.significance.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Create Test Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Vytvoriť nový A/B test</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Názov testu
                  </label>
                  <input
                    type="text"
                    value={newTest.name}
                    onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="napr. Nová verzia tlačidla"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Popis
                  </label>
                  <textarea
                    value={newTest.description}
                    onChange={(e) => setNewTest(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Stručný popis toho, čo testujete..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cieľová metrika
                  </label>
                  <select
                    value={newTest.targetMetric}
                    onChange={(e) => setNewTest(prev => ({ ...prev, targetMetric: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="conversion_rate">Konverzná miera</option>
                    <option value="click_through_rate">Click-through rate</option>
                    <option value="engagement_rate">Miera zapojenia</option>
                    <option value="completion_rate">Miera dokončenia</option>
                  </select>
                </div>

                {/* Variants */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Varianty</h4>
                    <button
                      onClick={addVariant}
                      className="flex items-center gap-2 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Pridať variant
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newTest.variants.map((variant, index) => (
                      <div key={variant.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Názov
                                </label>
                                <input
                                  type="text"
                                  value={variant.name}
                                  onChange={(e) => {
                                    const updatedVariants = [...newTest.variants];
                                    updatedVariants[index] = { ...variant, name: e.target.value };
                                    setNewTest(prev => ({ ...prev, variants: updatedVariants }));
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Traffic (%)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={variant.traffic}
                                  onChange={(e) => {
                                    const updatedVariants = [...newTest.variants];
                                    updatedVariants[index] = { ...variant, traffic: parseInt(e.target.value) || 0 };
                                    setNewTest(prev => ({ ...prev, variants: updatedVariants }));
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Popis
                              </label>
                              <input
                                type="text"
                                value={variant.description}
                                onChange={(e) => {
                                  const updatedVariants = [...newTest.variants];
                                  updatedVariants[index] = { ...variant, description: e.target.value };
                                  setNewTest(prev => ({ ...prev, variants: updatedVariants }));
                                }}
                                placeholder="Popis zmien v tomto variante..."
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          </div>

                          {newTest.variants.length > 2 && (
                            <button
                              onClick={() => removeVariant(variant.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Traffic Distribution Warning */}
                  {(() => {
                    const totalTraffic = newTest.variants.reduce((sum, v) => sum + v.traffic, 0);
                    return totalTraffic !== 100 && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700">
                          Celkový traffic je {totalTraffic}%. Mal by byť 100%.
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Zrušiť
                  </button>
                  <button
                    onClick={handleCreateTest}
                    disabled={!newTest.name.trim() || newTest.variants.length < 2}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Vytvoriť test
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ABTestingFramework;