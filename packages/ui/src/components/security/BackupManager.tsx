'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBackupStore } from '../../stores/useBackupStore'
import { useSofiaStore } from '../../stores/useSofiaStore'

export interface BackupJob {
  id: string
  name: string
  description: string
  type: 'full' | 'incremental' | 'differential'
  schedule: BackupSchedule
  status: 'active' | 'paused' | 'failed' | 'completed'
  lastRun: Date | null
  nextRun: Date | null
  dataTypes: BackupDataType[]
  encryption: boolean
  compression: boolean
  retentionDays: number
  size: number
  createdAt: Date
}

export interface BackupSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'manual'
  time: string // HH:MM format
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  timezone: string
}

export interface BackupDataType {
  type: 'documents' | 'timecapsules' | 'templates' | 'settings' | 'audit_logs' | 'user_data'
  included: boolean
  filter?: string
}

export interface BackupFile {
  id: string
  jobId: string
  filename: string
  size: number
  type: 'full' | 'incremental' | 'differential'
  createdAt: Date
  isEncrypted: boolean
  isCompressed: boolean
  checksum: string
  downloadUrl?: string
  storageLocation: 'local' | 'cloud' | 'external'
  expiresAt: Date | null
}

export interface RecoveryPoint {
  id: string
  name: string
  description: string
  createdAt: Date
  dataTypes: string[]
  size: number
  isVerified: boolean
  canRestore: boolean
  recoveryTime: number // estimated minutes
  dependencies: string[]
}

const BackupManager: React.FC = () => {
  const {
    backupJobs,
    backupFiles,
    recoveryPoints,
    isRunning,
    lastBackup,
    storageUsage,
    createBackupJob,
    updateBackupJob,
    deleteBackupJob,
    runBackup,
    restoreFromBackup,
    verifyBackup,
    downloadBackup,
    uploadBackup,
    getStorageStats,
    scheduleBackup,
    cancelBackup
  } = useBackupStore()

  const { addMessage, isVisible } = useSofiaStore()

  const [activeTab, setActiveTab] = useState<'jobs' | 'files' | 'recovery' | 'settings'>('jobs')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupFile | null>(null)
  const [recoveryInProgress, setRecoveryInProgress] = useState(false)

  useEffect(() => {
    getStorageStats()
  }, [])

  const handleCreateBackup = async (jobData: Omit<BackupJob, 'id' | 'status' | 'lastRun' | 'nextRun' | 'size' | 'createdAt'>) => {
    try {
      const jobId = await createBackupJob(jobData)

      if (isVisible) {
        addMessage({
          id: `backup-created-${Date.now()}`,
          type: 'success',
          content: `Nová záloha "${jobData.name}" bola vytvorená! ${jobData.schedule.frequency === 'manual' ? 'Môžeš ju spustiť manuálne.' : 'Automaticky sa spustí podľa plánu.'} 💾✨`,
          timestamp: new Date(),
          priority: 'medium'
        })
      }

      setShowCreateModal(false)
      return jobId
    } catch (error) {
      console.error('Backup creation error:', error)
    }
  }

  const handleRunBackup = async (jobId: string) => {
    try {
      await runBackup(jobId)

      if (isVisible) {
        addMessage({
          id: `backup-started-${Date.now()}`,
          type: 'info',
          content: 'Zálohovanie sa spustilo! Môžeš pokračovať v práci, upozorním ťa keď bude hotové. ⏳',
          timestamp: new Date(),
          priority: 'medium'
        })
      }
    } catch (error) {
      console.error('Backup run error:', error)
    }
  }

  const handleRestoreBackup = async (backupId: string, options: any) => {
    if (!confirm('Si si istý/á, že chceš obnoviť dáta z tejto zálohy? Aktuálne dáta môžu byť prepísané.')) {
      return
    }

    setRecoveryInProgress(true)

    try {
      await restoreFromBackup(backupId, options)

      if (isVisible) {
        addMessage({
          id: `backup-restored-${Date.now()}`,
          type: 'success',
          content: 'Dáta boli úspešne obnovené zo zálohy! Skontroluj, či je všetko v poriadku. 🔄✅',
          timestamp: new Date(),
          priority: 'high'
        })
      }
    } catch (error) {
      console.error('Backup restore error:', error)

      if (isVisible) {
        addMessage({
          id: `backup-restore-error-${Date.now()}`,
          type: 'error',
          content: 'Nastala chyba pri obnovovaní dát. Skús to znovu alebo kontaktuj podporu. 🔧',
          timestamp: new Date(),
          priority: 'high'
        })
      }
    } finally {
      setRecoveryInProgress(false)
    }
  }

  const handleVerifyBackup = async (backupId: string) => {
    try {
      const isValid = await verifyBackup(backupId)

      if (isVisible) {
        addMessage({
          id: `backup-verified-${Date.now()}`,
          type: isValid ? 'success' : 'warning',
          content: isValid
            ? 'Záloha je v poriadku a môže byť použitá na obnovenie dát! ✅'
            : 'Záloha má problémy. Vytvor novú zálohu pre bezpečnosť. ⚠️',
          timestamp: new Date(),
          priority: 'medium'
        })
      }
    } catch (error) {
      console.error('Backup verification error:', error)
    }
  }

  const getJobStatusIcon = (status: string) => {
    const icons = {
      active: '🟢',
      paused: '⏸️',
      failed: '🔴',
      completed: '✅'
    }
    return icons[status as keyof typeof icons] || '❓'
  }

  const getJobStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600 bg-green-50 border-green-200',
      paused: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      failed: 'text-red-600 bg-red-50 border-red-200',
      completed: 'text-blue-600 bg-blue-50 border-blue-200'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getBackupTypeIcon = (type: string) => {
    const icons = {
      full: '📦',
      incremental: '📈',
      differential: '📊'
    }
    return icons[type as keyof typeof icons] || '💾'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `pred ${days} dňami`
    if (hours > 0) return `pred ${hours} hodinami`
    return 'nedávno'
  }

  return (
    <div className="backup-manager max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Správa záloh</h1>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isRunning ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {isRunning ? '⚡ Zálohuje sa' : '✅ Pripravené'}
            </div>
            {lastBackup && (
              <div className="text-sm text-gray-600">
                Posledná záloha: {formatUptime(lastBackup)}
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-600">
          Automatické zálohovanie a obnova dát s pokročilým šifrovaním a kompresiou.
        </p>
      </motion.div>

      {/* Storage Usage */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {backupJobs.filter(j => j.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Aktívne úlohy</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {backupFiles.length}
          </div>
          <div className="text-sm text-gray-600">Záložné súbory</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {formatFileSize(storageUsage.used)}
          </div>
          <div className="text-sm text-gray-600">Použité miesto</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {recoveryPoints.filter(rp => rp.isVerified).length}
          </div>
          <div className="text-sm text-gray-600">Body obnovy</div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {[
          { id: 'jobs', label: 'Úlohy', icon: '⚙️', count: backupJobs.length },
          { id: 'files', label: 'Súbory', icon: '📁', count: backupFiles.length },
          { id: 'recovery', label: 'Obnova', icon: '🔄', count: recoveryPoints.length },
          { id: 'settings', label: 'Nastavenia', icon: '⚙️', count: null }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
            {tab.count !== null && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <motion.div
            key="jobs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Záložné úlohy</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Vytvoriť úlohu
              </button>
            </div>

            <div className="space-y-4">
              {backupJobs.map((job) => (
                <motion.div
                  key={job.id}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                  layout
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getBackupTypeIcon(job.type)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.name}</h3>
                          <p className="text-sm text-gray-500">{job.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getJobStatusColor(job.status)}`}>
                          {getJobStatusIcon(job.status)} {job.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Typ:</span>
                          <br />
                          {job.type}
                        </div>

                        <div>
                          <span className="font-medium">Plán:</span>
                          <br />
                          {job.schedule.frequency} o {job.schedule.time}
                        </div>

                        <div>
                          <span className="font-medium">Posledný beh:</span>
                          <br />
                          {job.lastRun ? job.lastRun.toLocaleString('sk-SK') : 'Nikdy'}
                        </div>

                        <div>
                          <span className="font-medium">Ďalší beh:</span>
                          <br />
                          {job.nextRun ? job.nextRun.toLocaleString('sk-SK') : 'N/A'}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.dataTypes.filter(dt => dt.included).map((dataType) => (
                          <span key={dataType.type} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {dataType.type}
                          </span>
                        ))}
                        {job.encryption && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            🔐 Šifrované
                          </span>
                        )}
                        {job.compression && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                            📦 Komprimované
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRunBackup(job.id)}
                        disabled={isRunning || job.status === 'paused'}
                        className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Spustiť teraz
                      </button>

                      <button
                        onClick={() => {
                          const newStatus = job.status === 'active' ? 'paused' : 'active'
                          updateBackupJob(job.id, { status: newStatus })
                        }}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          job.status === 'active'
                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {job.status === 'active' ? 'Pozastaviť' : 'Aktivovať'}
                      </button>

                      <button
                        onClick={() => deleteBackupJob(job.id)}
                        className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Zmazať
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {backupJobs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">⚙️</div>
                  <p>Žiadne záložné úlohy. Vytvor prvú úlohu pre automatické zálohovanie.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <motion.div
            key="files"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Záložné súbory</h2>

            <div className="space-y-4">
              {backupFiles.map((file) => (
                <motion.div
                  key={file.id}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                  layout
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getBackupTypeIcon(file.type)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{file.filename}</h3>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • {file.createdAt.toLocaleString('sk-SK')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {file.isEncrypted && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              🔐 Šifrované
                            </span>
                          )}
                          {file.isCompressed && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              📦 Komprimované
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded ${
                            file.storageLocation === 'cloud' ? 'bg-blue-100 text-blue-800' :
                            file.storageLocation === 'local' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {file.storageLocation}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Checksum:</span> {file.checksum.slice(0, 16)}...
                        {file.expiresAt && (
                          <>
                            {' • '}
                            <span className="font-medium">Expiruje:</span> {file.expiresAt.toLocaleDateString('sk-SK')}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVerifyBackup(file.id)}
                        className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Overiť
                      </button>

                      <button
                        onClick={() => downloadBackup(file.id)}
                        className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        Stiahnuť
                      </button>

                      <button
                        onClick={() => setSelectedBackup(file)}
                        className="px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        Obnoviť
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recovery Tab */}
        {activeTab === 'recovery' && (
          <motion.div
            key="recovery"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Body obnovy</h2>

            <div className="space-y-4">
              {recoveryPoints.map((point) => (
                <motion.div
                  key={point.id}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                  layout
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">🔄</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{point.name}</h3>
                          <p className="text-sm text-gray-500">{point.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          {point.isVerified && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              ✅ Overené
                            </span>
                          )}
                          {point.canRestore && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              🔄 Obnoviteľné
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Vytvorené:</span>
                          <br />
                          {point.createdAt.toLocaleString('sk-SK')}
                        </div>

                        <div>
                          <span className="font-medium">Veľkosť:</span>
                          <br />
                          {formatFileSize(point.size)}
                        </div>

                        <div>
                          <span className="font-medium">Čas obnovy:</span>
                          <br />
                          ~{point.recoveryTime} minút
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {point.dataTypes.map((dataType) => (
                          <span key={dataType} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {dataType}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {point.canRestore && (
                        <button
                          onClick={() => handleRestoreBackup(point.id, {})}
                          disabled={recoveryInProgress}
                          className="px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 disabled:opacity-50 transition-colors"
                        >
                          {recoveryInProgress ? 'Obnovuje sa...' : 'Obnoviť'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sofia Backup Insight */}
      <motion.div
        className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">💾</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">Sofia o zálohovaní</h4>
            <p className="text-gray-700">
              Tvoje dáta sú automaticky zálohované každý deň a šifrované pred uložením.
              Aktuálne mám {backupFiles.length} záložných súborov zabezpečujúcich {formatFileSize(storageUsage.used)} tvojich údajov.
              {backupJobs.filter(j => j.status === 'active').length === 0 && ' Odporúčam vytvoriť aspoň jednu automatickú zálohu!'}
              V prípade problémov môžeš obnoviť dáta do minúty. Tvoja bezpečnosť je garantovaná! 🛡️💙
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default BackupManager