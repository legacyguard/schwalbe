'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWillStore } from '../../stores/useWillStore'
import { useSofiaStore } from '../../stores/useSofiaStore'
import { useDocumentStore } from '../../stores/useDocumentStore'

export interface WillSection {
  id: string
  title: string
  completed: boolean
  required: boolean
  data: Record<string, any>
}

export interface WillGeneratorState {
  sections: WillSection[]
  currentSection: string
  jurisdiction: 'SK' | 'CZ' | 'EU'
  completionPercentage: number
  isValid: boolean
  generatedContent: string
  lastSaved: Date | null
}

export interface WillData {
  personal: {
    fullName: string
    birthDate: string
    birthPlace: string
    nationality: string
    address: string
    idNumber: string
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
    spouseName?: string
  }
  assets: {
    realEstate: Array<{
      type: 'house' | 'apartment' | 'land' | 'commercial'
      address: string
      description: string
      estimatedValue: number
      ownership: 'full' | 'partial'
      ownershipPercentage?: number
    }>
    financial: Array<{
      type: 'bank_account' | 'investment' | 'pension' | 'insurance'
      institution: string
      accountNumber?: string
      description: string
      estimatedValue: number
    }>
    personal: Array<{
      type: 'jewelry' | 'art' | 'vehicle' | 'collection' | 'other'
      description: string
      estimatedValue: number
      sentimentalValue: boolean
    }>
  }
  beneficiaries: Array<{
    id: string
    name: string
    relationship: string
    birthDate: string
    address: string
    allocation: number
    specificBequests: string[]
    conditions?: string
  }>
  guardians: Array<{
    id: string
    name: string
    relationship: string
    address: string
    phone: string
    email: string
    forMinors: boolean
  }>
  executors: Array<{
    id: string
    name: string
    relationship: string
    address: string
    phone: string
    email: string
    isPrimary: boolean
    compensation?: number
  }>
  specialInstructions: {
    digitalAssets: string
    burial: string
    charityDonations: string
    petCare: string
    businessSuccession: string
    other: string
  }
}

const WillGeneratorEngine: React.FC = () => {
  const { documents } = useDocumentStore()
  const { addMessage, isVisible } = useSofiaStore()
  const {
    willData,
    sections,
    currentSection,
    jurisdiction,
    updateWillData,
    setCurrentSection,
    setJurisdiction,
    generateWillContent,
    validateSection,
    calculateCompletion
  } = useWillStore()

  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    analyzeExistingDocuments()
  }, [documents])

  const analyzeExistingDocuments = async () => {
    if (documents.length === 0) return

    setIsProcessing(true)

    try {
      const extractedData: Partial<WillData> = {
        personal: {},
        assets: { realEstate: [], financial: [], personal: [] },
        beneficiaries: [],
        guardians: [],
        executors: [],
        specialInstructions: {}
      }

      documents.forEach(doc => {
        switch (doc.category) {
          case 'Bývanie':
            if (doc.ocrData?.includes('vlastníctvo') || doc.ocrData?.includes('nehnuteľnosť')) {
              const realEstate = extractRealEstateFromOCR(doc.ocrData)
              if (realEstate) extractedData.assets!.realEstate!.push(realEstate)
            }
            break
          case 'Financie':
            if (doc.ocrData?.includes('účet') || doc.ocrData?.includes('IBAN')) {
              const financial = extractFinancialFromOCR(doc.ocrData)
              if (financial) extractedData.assets!.financial!.push(financial)
            }
            break
          case 'Dokumenty':
            if (doc.ocrData?.includes('rodný list') || doc.ocrData?.includes('občiansky')) {
              const personal = extractPersonalFromOCR(doc.ocrData)
              Object.assign(extractedData.personal!, personal)
            }
            break
        }
      })

      updateWillData(extractedData)

      if (isVisible) {
        addMessage({
          id: `will-analysis-${Date.now()}`,
          type: 'suggestion',
          content: `Úžasné! Analyzovala som tvoje nahrané dokumenty a automaticky som vyplnila niektoré údaje pre testament. Našla som ${extractedData.assets!.realEstate!.length} nehnuteľností a ${extractedData.assets!.financial!.length} finančných účtov. Pozrime si to spoločne! ✨`,
          timestamp: new Date(),
          priority: 'high'
        })
      }

    } catch (error) {
      console.error('Error analyzing documents:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const extractRealEstateFromOCR = (ocrText: string): any => {
    const addressMatch = ocrText.match(/adresa[:\s]*([^\n]+)/i)
    const typeMatch = ocrText.match(/(dom|byt|pozemok|komerčný)/i)

    return {
      type: typeMatch?.[1]?.toLowerCase() === 'dom' ? 'house' :
            typeMatch?.[1]?.toLowerCase() === 'byt' ? 'apartment' : 'land',
      address: addressMatch?.[1]?.trim() || '',
      description: 'Automaticky extrahované z dokumentu',
      estimatedValue: 0,
      ownership: 'full'
    }
  }

  const extractFinancialFromOCR = (ocrText: string): any => {
    const ibanMatch = ocrText.match(/([A-Z]{2}\d{2}[\s\d]+)/i)
    const bankMatch = ocrText.match(/(banka|bank)[:\s]*([^\n]+)/i)

    return {
      type: 'bank_account',
      institution: bankMatch?.[2]?.trim() || 'Neznáma banka',
      accountNumber: ibanMatch?.[1]?.replace(/\s/g, '') || '',
      description: 'Automaticky extrahované z dokumentu',
      estimatedValue: 0
    }
  }

  const extractPersonalFromOCR = (ocrText: string): any => {
    const nameMatch = ocrText.match(/meno[:\s]*([^\n]+)/i)
    const birthMatch = ocrText.match(/narodeni[ae][:\s]*(\d{1,2}\.?\d{1,2}\.?\d{4})/i)
    const addressMatch = ocrText.match(/bydlisko[:\s]*([^\n]+)/i)

    return {
      fullName: nameMatch?.[1]?.trim() || '',
      birthDate: birthMatch?.[1]?.trim() || '',
      address: addressMatch?.[1]?.trim() || ''
    }
  }

  const handleSectionComplete = async (sectionId: string) => {
    const isValid = await validateSection(sectionId)

    if (isValid) {
      if (isVisible) {
        addMessage({
          id: `section-complete-${Date.now()}`,
          type: 'celebration',
          content: `Výborne! Sekcia "${sections.find(s => s.id === sectionId)?.title}" je kompletná. Pokračujme ďalej! 🎉`,
          timestamp: new Date(),
          priority: 'medium'
        })
      }

      const nextSection = sections.find(s => !s.completed && s.required)
      if (nextSection) {
        setCurrentSection(nextSection.id)
      } else {
        setShowPreview(true)
      }
    }
  }

  const handleGeneratePreview = async () => {
    setIsProcessing(true)

    try {
      await generateWillContent()
      setShowPreview(true)

      if (isVisible) {
        addMessage({
          id: `will-generated-${Date.now()}`,
          type: 'success',
          content: `Testament je pripravený na kontrolu! Pozri si náhľad a skontroluj všetky údaje. Ak niečo nie je v poriadku, môžeme to upraviť. 📋✨`,
          timestamp: new Date(),
          priority: 'high'
        })
      }
    } catch (error) {
      console.error('Error generating will:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const completionPercentage = calculateCompletion()

  return (
    <div className="will-generator-engine">
      {/* Progress Header */}
      <motion.div
        className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Generátor Testamentu</h2>
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value as 'SK' | 'CZ' | 'EU')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="SK">Slovenské právo</option>
            <option value="CZ">České právo</option>
            <option value="EU">EU právo</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Dokončené: {completionPercentage}%</span>
              <span>{sections.filter(s => s.completed).length} / {sections.length} sekcií</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {completionPercentage >= 80 && (
            <motion.button
              onClick={handleGeneratePreview}
              disabled={isProcessing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isProcessing ? 'Generujem...' : 'Vytvoriť náhľad'}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Document Analysis Status */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-amber-800">Analyzujem tvoje dokumenty...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              section.completed
                ? 'bg-green-50 border-green-200 shadow-sm'
                : section.id === currentSection
                ? 'bg-blue-50 border-blue-300 shadow-md'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setCurrentSection(section.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            layout
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                section.completed ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {section.completed && (
                  <motion.svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </motion.svg>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {getSectionDescription(section.id)}
            </p>

            {section.required && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                Povinné
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Sofia Suggestion */}
      {completionPercentage < 30 && (
        <motion.div
          className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✨</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Sofia radí</h4>
              <p className="text-gray-700">
                Začni s osobnými údajmi a majetkom - tieto sekcie sú najdôležitejšie.
                Ak máš nahrané dokumenty, už som vyplnila niektoré informácie za teba!
                Krok za krokom vytvoríme testament, ktorý ochráni tvoju rodinu. 💙
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

const getSectionDescription = (sectionId: string): string => {
  const descriptions: Record<string, string> = {
    personal: 'Základné osobné údaje potrebné pre testament',
    assets: 'Zoznam všetkého majetku - nehnuteľnosti, účty, cennosti',
    beneficiaries: 'Kto zdedí tvoj majetok a v akých podieloch',
    guardians: 'Opatrovníci pre maloletých detí',
    executors: 'Osoby, ktoré vykonajú tvoju poslednú vôľu',
    instructions: 'Špeciálne pokyny a želania'
  }
  return descriptions[sectionId] || 'Dôležitá sekcia testamentu'
}

export default WillGeneratorEngine