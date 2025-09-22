'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEmotionalGuidanceStore } from '../../stores/useEmotionalGuidanceStore'
import { useSofiaStore } from '../../stores/useSofiaStore'
import type { TimeCapsuleMessage } from './TimeCapsuleCreator'

export interface WritingPrompt {
  id: string
  category: 'family' | 'children' | 'spouse' | 'friends' | 'personal' | 'professional'
  emotionalTone: 'loving' | 'encouraging' | 'celebratory' | 'reflective' | 'instructional'
  title: string
  prompt: string
  followUpQuestions: string[]
  examples: string[]
  tips: string[]
  targetLength: 'short' | 'medium' | 'long'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface EmotionalTemplate {
  id: string
  name: string
  description: string
  structure: TemplateSection[]
  emotionalElements: string[]
  suggestedLength: number
  category: string
}

export interface TemplateSection {
  id: string
  title: string
  description: string
  placeholder: string
  required: boolean
  examples: string[]
}

interface EmotionalGuidanceProps {
  currentMessage: TimeCapsuleMessage | null
  onMessageUpdate: (updates: Partial<TimeCapsuleMessage>) => void
  onPromptApply: (prompt: WritingPrompt) => void
}

const EmotionalGuidance: React.FC<EmotionalGuidanceProps> = ({
  currentMessage,
  onMessageUpdate,
  onPromptApply
}) => {
  const {
    prompts,
    templates,
    guidanceHistory,
    loadPrompts,
    getPromptsForContext,
    generatePersonalizedPrompt,
    saveGuidanceSession
  } = useEmotionalGuidanceStore()

  const { addMessage: addSofiaMessage, isVisible, getCurrentMood } = useSofiaStore()

  const [activeTab, setActiveTab] = useState<'prompts' | 'templates' | 'guidance'>('prompts')
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<EmotionalTemplate | null>(null)
  const [showPersonalizedPrompts, setShowPersonalizedPrompts] = useState(false)
  const [writingProgress, setWritingProgress] = useState(0)

  useEffect(() => {
    loadPrompts()
  }, [])

  useEffect(() => {
    if (currentMessage?.content?.text) {
      const textLength = currentMessage.content.text.length
      const targetLength = getTargetLengthForTone(currentMessage.emotionalTone)
      setWritingProgress(Math.min((textLength / targetLength) * 100, 100))
    }
  }, [currentMessage?.content?.text, currentMessage?.emotionalTone])

  const getTargetLengthForTone = (tone: string): number => {
    const targets = {
      loving: 500,
      encouraging: 400,
      celebratory: 300,
      reflective: 600,
      instructional: 700
    }
    return targets[tone as keyof typeof targets] || 500
  }

  const getContextualPrompts = () => {
    if (!currentMessage) return []

    return getPromptsForContext({
      category: currentMessage.category,
      emotionalTone: currentMessage.emotionalTone,
      recipientCount: currentMessage.recipients.length,
      hasMedia: (currentMessage.content?.media?.length || 0) > 0
    })
  }

  const handlePromptSelection = async (prompt: WritingPrompt) => {
    setSelectedPrompt(prompt)
    onPromptApply(prompt)

    if (isVisible) {
      addSofiaMessage({
        id: `prompt-selected-${Date.now()}`,
        type: 'suggestion',
        content: `Vybrala si si krásny návod na písanie! ${prompt.title} ti pomôže napísať úprimnú správu. Sleduj moje tipy a nech sa tvoje srdce prejaví. ✍️💝`,
        timestamp: new Date(),
        priority: 'medium'
      })
    }

    // Save guidance session
    await saveGuidanceSession({
      messageId: currentMessage?.id || '',
      promptUsed: prompt.id,
      sessionType: 'prompt_selection',
      timestamp: new Date()
    })
  }

  const handleTemplateApplication = async (template: EmotionalTemplate) => {
    setSelectedTemplate(template)

    // Apply template structure to message
    const templateContent = template.structure
      .map(section => `${section.title}:\n${section.placeholder}\n`)
      .join('\n')

    if (currentMessage) {
      onMessageUpdate({
        content: {
          ...currentMessage.content,
          text: templateContent
        }
      })
    }

    if (isVisible) {
      addSofiaMessage({
        id: `template-applied-${Date.now()}`,
        type: 'success',
        content: `Použila som šablónu "${template.name}"! Teraz môžeš vyplniť jednotlivé sekcie svojimi vlastnými slovami. Každá časť má svoj účel a spolu vytvoria krásnu správu. 🎨`,
        timestamp: new Date(),
        priority: 'medium'
      })
    }

    await saveGuidanceSession({
      messageId: currentMessage?.id || '',
      templateUsed: template.id,
      sessionType: 'template_application',
      timestamp: new Date()
    })
  }

  const generatePersonalizedSuggestion = async () => {
    if (!currentMessage) return

    setShowPersonalizedPrompts(true)

    try {
      const personalizedPrompt = await generatePersonalizedPrompt({
        currentContent: currentMessage.content?.text || '',
        emotionalTone: currentMessage.emotionalTone,
        category: currentMessage.category,
        recipientRelationships: currentMessage.recipients.map(r => r.relationship),
        userHistory: guidanceHistory
      })

      if (isVisible && personalizedPrompt) {
        addSofiaMessage({
          id: `personalized-prompt-${Date.now()}`,
          type: 'suggestion',
          content: personalizedPrompt,
          timestamp: new Date(),
          priority: 'high'
        })
      }
    } catch (error) {
      console.error('Error generating personalized prompt:', error)
    }
  }

  const getEmotionalToneIcon = (tone: string) => {
    const icons = {
      loving: '💕',
      encouraging: '💪',
      celebratory: '🎉',
      reflective: '🤔',
      instructional: '📚'
    }
    return icons[tone as keyof typeof icons] || '💝'
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      family: '👨‍👩‍👧‍👦',
      children: '🧒',
      spouse: '💑',
      friends: '👥',
      personal: '🪞',
      professional: '💼'
    }
    return icons[category as keyof typeof icons] || '📝'
  }

  const contextualPrompts = getContextualPrompts()

  return (
    <div className="emotional-guidance bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sofia ti pomáha písať</h3>
          <p className="text-sm text-gray-600">
            Personalizované rady pre písanie významných správ
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {currentMessage && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{getEmotionalToneIcon(currentMessage.emotionalTone)}</span>
              <span>{getCategoryIcon(currentMessage.category)}</span>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${writingProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span>{Math.round(writingProgress)}%</span>
            </div>
          )}

          <button
            onClick={generatePersonalizedSuggestion}
            className="px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            ✨ Osobný tip
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'prompts', label: 'Návody', icon: '📝' },
          { id: 'templates', label: 'Šablóny', icon: '📋' },
          { id: 'guidance', label: 'Rady', icon: '💡' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Writing Prompts */}
        {activeTab === 'prompts' && (
          <motion.div
            key="prompts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {contextualPrompts.length > 0 ? (
              <>
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Odporúčané pre tvoju správu:
                </div>
                {contextualPrompts.map((prompt) => (
                  <motion.div
                    key={prompt.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-all"
                    onClick={() => handlePromptSelection(prompt)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{prompt.title}</h4>
                      <div className="flex space-x-1">
                        <span className="text-sm">{getEmotionalToneIcon(prompt.emotionalTone)}</span>
                        <span className="text-sm">{getCategoryIcon(prompt.category)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{prompt.prompt}</p>

                    {prompt.examples.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <strong>Príklad:</strong> "{prompt.examples[0]}"
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex space-x-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded ${
                          prompt.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                          prompt.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {prompt.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {prompt.targetLength}
                        </span>
                      </div>
                      <span className="text-xs text-purple-600 font-medium">
                        Klikni pre použitie →
                      </span>
                    </div>
                  </motion.div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📝</div>
                <p>Načítavam návody pre tvoju správu...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Templates */}
        {activeTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {templates.map((template) => (
              <motion.div
                key={template.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-all"
                onClick={() => handleTemplateApplication(template)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <span className="text-xs text-gray-500">
                    {template.structure.length} sekcií
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {template.structure.slice(0, 4).map((section) => (
                    <div key={section.id} className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                      {section.title}
                    </div>
                  ))}
                  {template.structure.length > 4 && (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                      +{template.structure.length - 4} ďalších
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Odporúčaná dĺžka: ~{template.suggestedLength} slov
                  </div>
                  <span className="text-xs text-purple-600 font-medium">
                    Použiť šablónu →
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Guidance */}
        {activeTab === 'guidance' && (
          <motion.div
            key="guidance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Writing Tips */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-3">✨ Sofia radí</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Píš tak, ako keby si rozprával s tou osobou priamo</p>
                <p>• Nezabudni na konkrétne spomienky a detaily</p>
                <p>• Vyjadruj svoje city úprimne a otvorene</p>
                <p>• Pridaj osobné pozdravy a prezývky</p>
                <p>• Zakončí správu s láskou a nádejou</p>
              </div>
            </div>

            {/* Emotional Tone Guide */}
            {currentMessage && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  {getEmotionalToneIcon(currentMessage.emotionalTone)} Tvoj tón: {currentMessage.emotionalTone}
                </h4>
                <div className="text-sm text-gray-700">
                  {currentMessage.emotionalTone === 'loving' && (
                    <div className="space-y-1">
                      <p>• Používaj slová ako "milujem", "drahý/á", "vzácny/a"</p>
                      <p>• Zdieľaj osobné momenty a spomienky</p>
                      <p>• Vyjadruj vďačnosť za spoločné chvíle</p>
                    </div>
                  )}
                  {currentMessage.emotionalTone === 'encouraging' && (
                    <div className="space-y-1">
                      <p>• Používaj pozitívne a posilňujúce slová</p>
                      <p>• Zdôrazňuj silné stránky príjemcu</p>
                      <p>• Vyjadri vieru v jeho/jej schopnosti</p>
                    </div>
                  )}
                  {currentMessage.emotionalTone === 'celebratory' && (
                    <div className="space-y-1">
                      <p>• Oslavuj úspechy a míľniky</p>
                      <p>• Vyjadruj radosť a hrdosť</p>
                      <p>• Použij pozitívnu a energickú reč</p>
                    </div>
                  )}
                  {currentMessage.emotionalTone === 'reflective' && (
                    <div className="space-y-1">
                      <p>• Zdieľaj múdrosť a životné skúsenosti</p>
                      <p>• Zamysli sa nad zmyslom a účelom</p>
                      <p>• Buď úprimný a autentický</p>
                    </div>
                  )}
                  {currentMessage.emotionalTone === 'instructional' && (
                    <div className="space-y-1">
                      <p>• Buď jasný a konkrétny</p>
                      <p>• Organizuj informácie logicky</p>
                      <p>• Pridaj praktické príklady</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Feedback */}
            {writingProgress > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">📊 Tvoj pokrok</h4>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-green-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${writingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(writingProgress)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {writingProgress < 25 && 'Skvelý začiatok! Pokračuj v písaní.'}
                  {writingProgress >= 25 && writingProgress < 50 && 'Dobre ti to ide! Pridaj viac detailov.'}
                  {writingProgress >= 50 && writingProgress < 75 && 'Výborne! Správa naberá krásny tvar.'}
                  {writingProgress >= 75 && writingProgress < 100 && 'Takmer hotovo! Možno ešte posledné dotyky.'}
                  {writingProgress >= 100 && 'Perfektne! Správa má ideálnu dĺžku.'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Prompt Details */}
      <AnimatePresence>
        {selectedPrompt && (
          <motion.div
            className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-purple-900">
                Aktívny návod: {selectedPrompt.title}
              </h4>
              <button
                onClick={() => setSelectedPrompt(null)}
                className="text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </div>

            {selectedPrompt.followUpQuestions.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-purple-800 mb-2">
                  Otázky na zamyslenie:
                </h5>
                <ul className="space-y-1 text-sm text-purple-700">
                  {selectedPrompt.followUpQuestions.map((question, index) => (
                    <li key={index}>• {question}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedPrompt.tips.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-purple-800 mb-2">Tipy:</h5>
                <ul className="space-y-1 text-sm text-purple-700">
                  {selectedPrompt.tips.map((tip, index) => (
                    <li key={index}>💡 {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EmotionalGuidance