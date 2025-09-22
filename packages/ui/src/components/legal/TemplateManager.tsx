'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTemplateStore } from '../../stores/useTemplateStore'
import { useSofiaStore } from '../../stores/useSofiaStore'

export interface LegalTemplate {
  id: string
  name: string
  type: 'will' | 'power_of_attorney' | 'living_will' | 'trust' | 'contract'
  jurisdiction: 'SK' | 'CZ' | 'EU' | 'UNIVERSAL'
  version: string
  lastUpdated: Date
  content: string
  placeholders: TemplatePlaceholder[]
  requiredFields: string[]
  optionalFields: string[]
  legalRequirements: LegalRequirement[]
  category: 'basic' | 'advanced' | 'professional'
  description: string
  isActive: boolean
}

export interface TemplatePlaceholder {
  id: string
  name: string
  type: 'text' | 'date' | 'number' | 'select' | 'textarea' | 'currency' | 'percentage'
  label: string
  description: string
  required: boolean
  validation?: {
    pattern?: string
    min?: number
    max?: number
    options?: string[]
  }
  defaultValue?: any
}

export interface LegalRequirement {
  id: string
  type: 'witness' | 'notarization' | 'registration' | 'signature' | 'date' | 'format'
  description: string
  jurisdiction: string[]
  mandatory: boolean
  alternativeOptions?: string[]
}

const TemplateManager: React.FC = () => {
  const {
    templates,
    selectedTemplate,
    isLoading,
    loadTemplates,
    selectTemplate,
    updateTemplate,
    validateTemplate,
    exportTemplate
  } = useTemplateStore()

  const { addMessage, isVisible } = useSofiaStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterJurisdiction, setFilterJurisdiction] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesJurisdiction = filterJurisdiction === 'all' || template.jurisdiction === filterJurisdiction
    const matchesType = filterType === 'all' || template.type === filterType

    return matchesSearch && matchesJurisdiction && matchesType && template.isActive
  })

  const handleTemplateSelect = (template: LegalTemplate) => {
    selectTemplate(template.id)
    setShowPreview(true)

    if (isVisible) {
      addMessage({
        id: `template-selected-${Date.now()}`,
        type: 'info',
        content: `Vybrala si šablónu "${template.name}". Pozrime si jej požiadavky a nastavenia. 📋`,
        timestamp: new Date(),
        priority: 'medium'
      })
    }
  }

  const handleTemplateValidation = async (templateId: string) => {
    try {
      const isValid = await validateTemplate(templateId)

      if (isVisible) {
        addMessage({
          id: `template-validation-${Date.now()}`,
          type: isValid ? 'success' : 'warning',
          content: isValid
            ? 'Šablóna je platná a pripravená na použitie! ✅'
            : 'V šablóne som našla niektoré problémy. Pozri si detaily v sekcii validácie. ⚠️',
          timestamp: new Date(),
          priority: 'medium'
        })
      }
    } catch (error) {
      console.error('Template validation error:', error)
    }
  }

  const getTemplateTypeIcon = (type: string) => {
    const icons = {
      will: '📜',
      power_of_attorney: '⚖️',
      living_will: '🏥',
      trust: '🏛️',
      contract: '📋'
    }
    return icons[type as keyof typeof icons] || '📄'
  }

  const getJurisdictionBadge = (jurisdiction: string) => {
    const colors = {
      SK: 'bg-blue-100 text-blue-800',
      CZ: 'bg-red-100 text-red-800',
      EU: 'bg-green-100 text-green-800',
      UNIVERSAL: 'bg-gray-100 text-gray-800'
    }
    return colors[jurisdiction as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      basic: 'bg-emerald-100 text-emerald-800',
      advanced: 'bg-amber-100 text-amber-800',
      professional: 'bg-purple-100 text-purple-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="template-manager max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Správca právnych šablón</h1>
        <p className="text-gray-600">
          Vyber si vhodnú šablónu pre tvoj právny dokument. Všetky šablóny sú pripravené pre rôzne jurisdikcie.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vyhľadávanie
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Hľadaj šablóny..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Jurisdiction Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jurisdikcia
            </label>
            <select
              value={filterJurisdiction}
              onChange={(e) => setFilterJurisdiction(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Všetky</option>
              <option value="SK">Slovensko</option>
              <option value="CZ">Česko</option>
              <option value="EU">Európska únia</option>
              <option value="UNIVERSAL">Univerzálne</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ dokumentu
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Všetky typy</option>
              <option value="will">Testament</option>
              <option value="power_of_attorney">Plná moc</option>
              <option value="living_will">Životná vôľa</option>
              <option value="trust">Trust</option>
              <option value="contract">Zmluva</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="flex items-center justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="ml-3 text-gray-600">Načítavam šablóny...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleTemplateSelect(template)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            layout
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getTemplateTypeIcon(template.type)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">v{template.version}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getJurisdictionBadge(template.jurisdiction)}`}>
                    {template.jurisdiction}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryBadge(template.category)}`}>
                    {template.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {template.description}
              </p>

              {/* Requirements */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                  {template.requiredFields.length} povinných polí
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  {template.optionalFields.length} voliteľných polí
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                  {template.legalRequirements.length} právnych požiadaviek
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTemplateValidation(template.id)
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Validovať
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPreview(true)
                    selectTemplate(template.id)
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Náhľad
                </button>
              </div>

              {/* Last Updated */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Aktualizované: {template.lastUpdated.toLocaleDateString('sk-SK')}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && !isLoading && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Žiadne šablóny nenájdené
          </h3>
          <p className="text-gray-600 mb-6">
            Skús zmeniť filtre alebo vyhľadávacie kritériá.
          </p>
        </motion.div>
      )}

      {/* Template Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedTemplate && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <TemplatePreview
                template={selectedTemplate}
                onClose={() => setShowPreview(false)}
                onUse={() => {
                  setShowPreview(false)
                  // Navigate to will generator with this template
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sofia Help */}
      {filteredTemplates.length > 0 && (
        <motion.div
          className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✨</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Sofia radí</h4>
              <p className="text-gray-700">
                Pre začiatočníkov odporúčam "základné" šablóny. Pokročilí užívatelia môžu použiť "pokročilé"
                verzie s viacerými možnosťami. Ak si nie si istý/á, pozri si náhľad šablóny pred použitím.
                Každá šablóna má rôzne právne požiadavky podľa jurisdikcie! 💙
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Template Preview Component
interface TemplatePreviewProps {
  template: LegalTemplate
  onClose: () => void
  onUse: () => void
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onClose, onUse }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'requirements' | 'fields'>('preview')

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getTemplateTypeIcon(template.type)}</div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
            <p className="text-sm text-gray-500">
              {template.jurisdiction} • v{template.version} • {template.category}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['preview', 'requirements', 'fields'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'preview' && 'Náhľad'}
            {tab === 'requirements' && 'Požiadavky'}
            {tab === 'fields' && 'Polia'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'preview' && (
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
              {template.content}
            </pre>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="space-y-4">
            {template.legalRequirements.map((req) => (
              <div key={req.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{req.type}</h4>
                  <span className={`px-2 py-1 text-xs rounded ${
                    req.mandatory ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {req.mandatory ? 'Povinné' : 'Voliteľné'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                <p className="text-xs text-gray-500">
                  Jurisdikcie: {req.jurisdiction.join(', ')}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'fields' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Povinné polia</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {template.placeholders
                  .filter(p => p.required)
                  .map((field) => (
                    <div key={field.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-900">{field.label}</div>
                      <div className="text-sm text-red-700">{field.description}</div>
                      <div className="text-xs text-red-600 mt-1">{field.type}</div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Voliteľné polia</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {template.placeholders
                  .filter(p => !p.required)
                  .map((field) => (
                    <div key={field.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-medium text-blue-900">{field.label}</div>
                      <div className="text-sm text-blue-700">{field.description}</div>
                      <div className="text-xs text-blue-600 mt-1">{field.type}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {template.description}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Zrušiť
          </button>
          <button
            onClick={onUse}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Použiť šablónu
          </button>
        </div>
      </div>
    </div>
  )
}

export default TemplateManager