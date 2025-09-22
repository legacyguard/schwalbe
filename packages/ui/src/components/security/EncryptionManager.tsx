'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEncryptionStore } from '../../stores/useEncryptionStore'
import { useSofiaStore } from '../../stores/useSofiaStore'

export interface EncryptionKey {
  id: string
  name: string
  type: 'master' | 'document' | 'timecapsule' | 'backup'
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305' | 'RSA-4096'
  createdAt: Date
  expiresAt?: Date
  isActive: boolean
  usage: string[]
  strength: 'high' | 'maximum'
}

export interface EncryptionStatus {
  documentsEncrypted: number
  totalDocuments: number
  timecapsulesEncrypted: number
  totalTimecapsules: number
  backupsEncrypted: number
  totalBackups: number
  overallProgress: number
  lastEncryption: Date | null
}

const EncryptionManager: React.FC = () => {
  const {
    encryptionKeys,
    encryptionStatus,
    isInitialized,
    isEncrypting,
    initializeEncryption,
    generateMasterKey,
    encryptDocument,
    encryptTimeCapsule,
    decryptData,
    rotateKeys,
    getEncryptionHealth,
    exportKeys,
    importKeys
  } = useEncryptionStore()

  const { addMessage, isVisible } = useSofiaStore()

  const [showKeyDetails, setShowKeyDetails] = useState<string | null>(null)
  const [masterPassword, setMasterPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  const [encryptionProgress, setEncryptionProgress] = useState(0)

  useEffect(() => {
    if (!isInitialized) {
      setShowPasswordSetup(true)
    }
  }, [isInitialized])

  useEffect(() => {
    if (encryptionStatus) {
      const progress = Math.round(
        ((encryptionStatus.documentsEncrypted + encryptionStatus.timecapsulesEncrypted + encryptionStatus.backupsEncrypted) /
        (encryptionStatus.totalDocuments + encryptionStatus.totalTimecapsules + encryptionStatus.totalBackups)) * 100
      )
      setEncryptionProgress(progress)
    }
  }, [encryptionStatus])

  const handleInitializeEncryption = async () => {
    if (masterPassword !== confirmPassword) {
      if (isVisible) {
        addMessage({
          id: `password-mismatch-${Date.now()}`,
          type: 'warning',
          content: 'Heslá sa nezhodujú. Prosím, zadaj rovnaké heslo do oboch polí. 🔐',
          timestamp: new Date(),
          priority: 'high'
        })
      }
      return
    }

    if (masterPassword.length < 12) {
      if (isVisible) {
        addMessage({
          id: `password-weak-${Date.now()}`,
          type: 'warning',
          content: 'Heslo musí mať aspoň 12 znakov pre maximálnu bezpečnosť. Pridaj číslice, veľké písmená a špeciálne znaky! 🔒',
          timestamp: new Date(),
          priority: 'high'
        })
      }
      return
    }

    try {
      await initializeEncryption(masterPassword)
      setShowPasswordSetup(false)
      setMasterPassword('')
      setConfirmPassword('')

      if (isVisible) {
        addMessage({
          id: `encryption-initialized-${Date.now()}`,
          type: 'success',
          content: 'Šifrovanie je úspešne nastavené! Tvoje dáta sú teraz chránené najmodernejšou kryptografiou. Tvoja bezpečnosť je mojou prioritou! 🛡️✨',
          timestamp: new Date(),
          priority: 'high'
        })
      }
    } catch (error) {
      console.error('Encryption initialization error:', error)

      if (isVisible) {
        addMessage({
          id: `encryption-error-${Date.now()}`,
          type: 'error',
          content: 'Nastala chyba pri nastavovaní šifrovania. Prosím, skús to znovu. Tvoja bezpečnosť je dôležitá! 🔧',
          timestamp: new Date(),
          priority: 'high'
        })
      }
    }
  }

  const handleEncryptAll = async () => {
    try {
      await encryptDocument('all')
      await encryptTimeCapsule('all')

      if (isVisible) {
        addMessage({
          id: `encrypt-all-${Date.now()}`,
          type: 'success',
          content: 'Všetky tvoje dáta sú teraz zašifrované! Môžeš mať pokojný spánok - tvoje súkromie je v bezpečí. 🌙🔐',
          timestamp: new Date(),
          priority: 'medium'
        })
      }
    } catch (error) {
      console.error('Bulk encryption error:', error)
    }
  }

  const handleKeyRotation = async () => {
    try {
      await rotateKeys()

      if (isVisible) {
        addMessage({
          id: `key-rotation-${Date.now()}`,
          type: 'success',
          content: 'Šifrovacie kľúče boli obnovené! Táto preventívna výmena zvyšuje bezpečnosť tvojich dát. 🔄🔐',
          timestamp: new Date(),
          priority: 'medium'
        })
      }
    } catch (error) {
      console.error('Key rotation error:', error)
    }
  }

  const getKeyTypeIcon = (type: string) => {
    const icons = {
      master: '👑',
      document: '📄',
      timecapsule: '⏰',
      backup: '💾'
    }
    return icons[type as keyof typeof icons] || '🔑'
  }

  const getStrengthColor = (strength: string) => {
    return strength === 'maximum' ? 'text-green-600' : 'text-blue-600'
  }

  const getStrengthBadge = (strength: string) => {
    return strength === 'maximum'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const healthScore = getEncryptionHealth()

  return (
    <div className="encryption-manager max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Správa šifrovania</h1>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isInitialized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isInitialized ? '🔐 Aktívne' : '⚠️ Nenastavené'}
            </div>
            {healthScore && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                healthScore >= 90 ? 'bg-green-100 text-green-800' :
                healthScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Zdravie: {healthScore}%
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-600">
          End-to-end šifrovanie pre maximálnu ochranu tvojich osobných údajov a dokumentov.
        </p>
      </motion.div>

      {/* Password Setup Modal */}
      <AnimatePresence>
        {showPasswordSetup && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🔐</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nastavenie master hesla
                </h3>
                <p className="text-gray-600 text-sm">
                  Vytvor silné heslo pre ochranu tvojich dát. Toto heslo nebude uložené na serveri - len ty ho budeš poznať.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Master heslo
                  </label>
                  <input
                    type="password"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    placeholder="Minimálne 12 znakov..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Použite kombináciu veľkých a malých písmen, čísel a špeciálnych znakov
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Potvrď heslo
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Znovu zadaj heslo..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Password Strength Indicator */}
                {masterPassword && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Sila hesla</span>
                      <span>{getPasswordStrength(masterPassword)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${getPasswordStrengthColor(masterPassword)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${getPasswordStrengthPercentage(masterPassword)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPasswordSetup(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Neskôr
                </button>
                <button
                  onClick={handleInitializeEncryption}
                  disabled={!masterPassword || !confirmPassword || masterPassword !== confirmPassword}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Nastaviť šifrovanie
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isInitialized && (
        <>
          {/* Encryption Status */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {encryptionStatus?.documentsEncrypted || 0}
              </div>
              <div className="text-sm text-gray-600">Dokumenty</div>
              <div className="text-xs text-gray-500 mt-1">
                z {encryptionStatus?.totalDocuments || 0} celkovo
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {encryptionStatus?.timecapsulesEncrypted || 0}
              </div>
              <div className="text-sm text-gray-600">Časové kapsuly</div>
              <div className="text-xs text-gray-500 mt-1">
                z {encryptionStatus?.totalTimecapsules || 0} celkovo
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {encryptionStatus?.backupsEncrypted || 0}
              </div>
              <div className="text-sm text-gray-600">Zálohy</div>
              <div className="text-xs text-gray-500 mt-1">
                z {encryptionStatus?.totalBackups || 0} celkovo
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {encryptionProgress}%
              </div>
              <div className="text-sm text-gray-600">Celkový pokrok</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${encryptionProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-wrap gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button
              onClick={handleEncryptAll}
              disabled={isEncrypting || encryptionProgress === 100}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isEncrypting ? 'Šifrujem...' : 'Zašifrovať všetko'}
            </button>

            <button
              onClick={handleKeyRotation}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Obnoviť kľúče
            </button>

            <button
              onClick={() => exportKeys()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Exportovať kľúče
            </button>

            <button
              onClick={() => document.getElementById('import-keys')?.click()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Importovať kľúče
            </button>
            <input
              id="import-keys"
              type="file"
              accept=".key,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) importKeys(file)
              }}
            />
          </motion.div>

          {/* Encryption Keys */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Šifrovacie kľúče</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {encryptionKeys.map((key) => (
                <motion.div
                  key={key.id}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                  whileHover={{ scale: 1.01 }}
                  layout
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getKeyTypeIcon(key.type)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{key.name}</h3>
                        <p className="text-sm text-gray-500">{key.algorithm}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getStrengthBadge(key.strength)}`}>
                        {key.strength}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${key.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Vytvorený:</span>
                      <span>{key.createdAt.toLocaleDateString('sk-SK')}</span>
                    </div>
                    {key.expiresAt && (
                      <div className="flex justify-between">
                        <span>Expiruje:</span>
                        <span className={key.expiresAt < new Date() ? 'text-red-600' : ''}>
                          {key.expiresAt.toLocaleDateString('sk-SK')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Použitie:</span>
                      <span>{key.usage.join(', ')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowKeyDetails(showKeyDetails === key.id ? null : key.id)}
                    className="w-full mt-4 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {showKeyDetails === key.id ? 'Skryť detaily' : 'Zobraziť detaily'}
                  </button>

                  <AnimatePresence>
                    {showKeyDetails === key.id && (
                      <motion.div
                        className="mt-4 p-4 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="space-y-2 text-xs text-gray-600">
                          <div><strong>ID:</strong> {key.id}</div>
                          <div><strong>Typ:</strong> {key.type}</div>
                          <div><strong>Algoritmus:</strong> {key.algorithm}</div>
                          <div><strong>Stav:</strong> {key.isActive ? 'Aktívny' : 'Neaktívny'}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Sofia Security Insight */}
      {isInitialized && (
        <motion.div
          className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🛡️</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Sofia o bezpečnosti</h4>
              <p className="text-gray-700">
                Tvoje dáta sú chránené vojenskou kryptografiou AES-256. Šifrujem všetko lokálne -
                ani ja nemám prístup k tvojim nešifrovaným údajom. Tvoje súkromie je pre mňa sväté!
                {healthScore && healthScore < 90 && ' Odporúčam obnoviť niektoré kľúče pre maximálnu bezpečnosť.'}
                {encryptionProgress < 100 && ' Dokončime šifrovanie všetkých tvojich dát.'}
                💙🔐
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Helper functions
function getPasswordStrength(password: string): string {
  const score = calculatePasswordScore(password)
  if (score >= 80) return 'Veľmi silné'
  if (score >= 60) return 'Silné'
  if (score >= 40) return 'Stredné'
  if (score >= 20) return 'Slabé'
  return 'Veľmi slabé'
}

function getPasswordStrengthColor(password: string): string {
  const score = calculatePasswordScore(password)
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-yellow-500'
  if (score >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

function getPasswordStrengthPercentage(password: string): number {
  return calculatePasswordScore(password)
}

function calculatePasswordScore(password: string): number {
  let score = 0

  // Length bonus
  score += Math.min(password.length * 4, 40)

  // Character variety
  if (/[a-z]/.test(password)) score += 5
  if (/[A-Z]/.test(password)) score += 5
  if (/[0-9]/.test(password)) score += 5
  if (/[^A-Za-z0-9]/.test(password)) score += 10

  // Length penalties/bonuses
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10
  if (password.length < 8) score -= 20

  // Pattern penalties
  if (/(.)\1{2,}/.test(password)) score -= 10 // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 10 // Common sequences

  return Math.max(0, Math.min(100, score))
}

export default EncryptionManager