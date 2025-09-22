'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useComplianceStore } from '../../stores/useComplianceStore'
import { useSofiaStore } from '../../stores/useSofiaStore'
import type { WillData } from './WillGeneratorEngine'

export interface ComplianceCheck {
  id: string
  category: 'legal' | 'format' | 'data' | 'signature' | 'witness' | 'notarization'
  title: string
  description: string
  jurisdiction: string[]
  mandatory: boolean
  status: 'pending' | 'checking' | 'passed' | 'failed' | 'warning'
  errorMessage?: string
  recommendation?: string
  autoFixable: boolean
  severity: 'critical' | 'high' | 'medium' | 'low'
}

export interface ComplianceReport {
  id: string
  documentId: string
  jurisdiction: string
  documentType: string
  timestamp: Date
  overallStatus: 'compliant' | 'non_compliant' | 'needs_review'
  score: number
  checks: ComplianceCheck[]
  warnings: string[]
  criticalIssues: string[]
  recommendations: string[]
  nextSteps: string[]
}

interface ComplianceValidatorProps {
  willData: Partial<WillData>
  jurisdiction: 'SK' | 'CZ' | 'EU'
  onValidationComplete: (report: ComplianceReport) => void
  showDetailedView?: boolean
}

const ComplianceValidator: React.FC<ComplianceValidatorProps> = ({
  willData,
  jurisdiction,
  onValidationComplete,
  showDetailedView = true
}) => {
  const {
    runCompliance,
    getComplianceReport,
    autoFixIssues,
    isValidating,
    lastReport
  } = useComplianceStore()

  const { addMessage, isVisible } = useSofiaStore()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showAutoFix, setShowAutoFix] = useState(false)

  useEffect(() => {
    if (willData && Object.keys(willData).length > 0) {
      validateCompliance()
    }
  }, [willData, jurisdiction])

  const validateCompliance = async () => {
    try {
      const report = await runCompliance(willData, jurisdiction, 'will')
      onValidationComplete(report)

      if (isVisible) {
        const criticalCount = report.checks.filter(c => c.severity === 'critical' && c.status === 'failed').length
        const warningCount = report.checks.filter(c => c.status === 'warning').length

        if (criticalCount > 0) {
          addMessage({
            id: `compliance-critical-${Date.now()}`,
            type: 'warning',
            content: `Našla som ${criticalCount} kritických problémov v tvojom testamente. Pozri si detaily a oprav ich pred dokončením. ⚠️`,
            timestamp: new Date(),
            priority: 'high'
          })
        } else if (warningCount > 0) {
          addMessage({
            id: `compliance-warning-${Date.now()}`,
            type: 'info',
            content: `Testament vyzerá dobre! Mám len ${warningCount} menších pripomienok. Môžeme pokračovať. ✅`,
            timestamp: new Date(),
            priority: 'medium'
          })
        } else {
          addMessage({
            id: `compliance-success-${Date.now()}`,
            type: 'success',
            content: `Perfektne! Testament spĺňa všetky právne požiadavky. Môžeme ho dokončiť! 🎉`,
            timestamp: new Date(),
            priority: 'medium'
          })
        }
      }
    } catch (error) {
      console.error('Compliance validation error:', error)
    }
  }

  const handleAutoFix = async () => {
    try {
      const fixedData = await autoFixIssues(lastReport?.id || '')

      if (isVisible) {
        addMessage({
          id: `autofix-${Date.now()}`,
          type: 'success',
          content: 'Automaticky som opravila všetky problémy, ktoré sa dali. Pozri si aktualizované údaje! 🔧',
          timestamp: new Date(),
          priority: 'medium'
        })
      }
    } catch (error) {
      console.error('Auto-fix error:', error)
    }
  }

  const filteredChecks = lastReport?.checks.filter(check =>
    activeCategory === 'all' || check.category === activeCategory
  ) || []

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: '⏳',
      checking: '🔄',
      passed: '✅',
      failed: '❌',
      warning: '⚠️'
    }
    return icons[status as keyof typeof icons] || '❓'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-gray-500',
      checking: 'text-blue-500',
      passed: 'text-green-500',
      failed: 'text-red-500',
      warning: 'text-amber-500'
    }
    return colors[status as keyof typeof colors] || 'text-gray-500'
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      legal: '⚖️',
      format: '📄',
      data: '📊',
      signature: '✍️',
      witness: '👥',
      notarization: '🏛️'
    }
    return icons[category as keyof typeof icons] || '📋'
  }

  if (!lastReport) {
    return (
      <div className="compliance-validator p-6">
        <div className="text-center py-8">
          <motion.div
            className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600">Spúšťam kontrolu súladu s právnymi požiadavkami...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="compliance-validator max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Kontrola súladu s právom</h2>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {jurisdiction} právo • {lastReport.documentType}
            </span>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              lastReport.overallStatus === 'compliant'
                ? 'bg-green-100 text-green-800'
                : lastReport.overallStatus === 'needs_review'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {lastReport.overallStatus === 'compliant' && 'Vyhovuje'}
              {lastReport.overallStatus === 'needs_review' && 'Vyžaduje kontrolu'}
              {lastReport.overallStatus === 'non_compliant' && 'Nevyhovuje'}
            </div>
          </div>
        </div>

        {/* Score and Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={lastReport.score >= 80 ? '#10b981' : lastReport.score >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - lastReport.score / 100) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">{lastReport.score}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Celkové skóre</p>
            </div>

            {/* Statistics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kontroly prešli</span>
                <span className="font-medium text-green-600">
                  {lastReport.checks.filter(c => c.status === 'passed').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Upozornenia</span>
                <span className="font-medium text-yellow-600">
                  {lastReport.checks.filter(c => c.status === 'warning').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Chyby</span>
                <span className="font-medium text-red-600">
                  {lastReport.checks.filter(c => c.status === 'failed').length}
                </span>
              </div>
            </div>

            {/* Critical Issues */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Kritické problémy</h4>
              {lastReport.criticalIssues.length > 0 ? (
                <ul className="space-y-1">
                  {lastReport.criticalIssues.slice(0, 3).map((issue, index) => (
                    <li key={index} className="text-sm text-red-600">• {issue}</li>
                  ))}
                  {lastReport.criticalIssues.length > 3 && (
                    <li className="text-sm text-gray-500">
                      +{lastReport.criticalIssues.length - 3} ďalších
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-sm text-green-600">Žiadne kritické problémy</p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={validateCompliance}
                disabled={isValidating}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isValidating ? 'Kontrolujem...' : 'Znovu skontrolovať'}
              </button>

              {lastReport.checks.some(c => c.autoFixable && c.status === 'failed') && (
                <button
                  onClick={handleAutoFix}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Automaticky opraviť
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {showDetailedView && (
        <>
          {/* Category Filter */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Všetky ({lastReport.checks.length})
              </button>

              {['legal', 'format', 'data', 'signature', 'witness', 'notarization'].map(category => {
                const count = lastReport.checks.filter(c => c.category === category).length
                if (count === 0) return null

                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getCategoryIcon(category)} {category} ({count})
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Compliance Checks */}
          <div className="space-y-4">
            {filteredChecks.map((check) => (
              <motion.div
                key={check.id}
                className={`p-6 rounded-xl border-2 ${
                  check.status === 'failed' && check.severity === 'critical'
                    ? 'border-red-200 bg-red-50'
                    : check.status === 'failed'
                    ? 'border-orange-200 bg-orange-50'
                    : check.status === 'warning'
                    ? 'border-yellow-200 bg-yellow-50'
                    : check.status === 'passed'
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                layout
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getCategoryIcon(check.category)}</span>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{check.title}</h3>
                        <span className={`text-lg ${getStatusColor(check.status)}`}>
                          {getStatusIcon(check.status)}
                        </span>
                        {check.mandatory && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                            Povinné
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{check.description}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityBadge(check.severity)}`}>
                    {check.severity}
                  </span>
                </div>

                {check.errorMessage && (
                  <div className="mb-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{check.errorMessage}</p>
                  </div>
                )}

                {check.recommendation && (
                  <div className="mb-3 p-3 bg-blue-100 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Odporúčanie:</h4>
                    <p className="text-sm text-blue-800">{check.recommendation}</p>
                  </div>
                )}

                {check.autoFixable && check.status === 'failed' && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      Tento problém môžem automaticky opraviť
                    </span>
                    <button
                      onClick={() => autoFixIssues(lastReport.id, [check.id])}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Opraviť
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Next Steps */}
          {lastReport.nextSteps.length > 0 && (
            <motion.div
              className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">📋</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Ďalšie kroky</h4>
                  <ul className="space-y-2">
                    {lastReport.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

export default ComplianceValidator