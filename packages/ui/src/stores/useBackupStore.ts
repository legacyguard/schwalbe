import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BackupJob, BackupFile, RecoveryPoint, BackupSchedule, BackupDataType } from '../components/security/BackupManager'

interface StorageStats {
  total: number
  used: number
  available: number
  cloudUsed: number
  localUsed: number
}

interface BackupStore {
  // State
  backupJobs: BackupJob[]
  backupFiles: BackupFile[]
  recoveryPoints: RecoveryPoint[]
  isRunning: boolean
  lastBackup: Date | null
  storageUsage: StorageStats

  // Actions
  createBackupJob: (job: Omit<BackupJob, 'id' | 'status' | 'lastRun' | 'nextRun' | 'size' | 'createdAt'>) => Promise<string>
  updateBackupJob: (jobId: string, updates: Partial<BackupJob>) => Promise<void>
  deleteBackupJob: (jobId: string) => Promise<void>
  runBackup: (jobId: string) => Promise<void>
  scheduleBackup: (jobId: string) => Promise<void>
  cancelBackup: (jobId: string) => Promise<void>

  // File Management
  downloadBackup: (fileId: string) => Promise<void>
  uploadBackup: (file: File) => Promise<string>
  deleteBackupFile: (fileId: string) => Promise<void>
  verifyBackup: (fileId: string) => Promise<boolean>

  // Recovery
  restoreFromBackup: (backupId: string, options: RestoreOptions) => Promise<void>
  createRecoveryPoint: (name: string, description: string, dataTypes: string[]) => Promise<string>
  deleteRecoveryPoint: (pointId: string) => Promise<void>

  // Storage
  getStorageStats: () => Promise<void>
  cleanupOldBackups: () => Promise<void>
  optimizeStorage: () => Promise<void>
}

interface RestoreOptions {
  targetLocation?: string
  overwriteExisting?: boolean
  dataTypesToRestore?: string[]
  validateBeforeRestore?: boolean
}

// Default backup job templates
const defaultBackupJobs: BackupJob[] = [
  {
    id: 'daily-full-backup',
    name: 'Denná kompletná záloha',
    description: 'Automatická denná záloha všetkých dát',
    type: 'full',
    schedule: {
      frequency: 'daily',
      time: '02:00',
      timezone: 'Europe/Bratislava'
    },
    status: 'active',
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000), // In 2 hours (simulating 2 AM)
    dataTypes: [
      { type: 'documents', included: true },
      { type: 'timecapsules', included: true },
      { type: 'templates', included: true },
      { type: 'settings', included: true },
      { type: 'user_data', included: true },
      { type: 'audit_logs', included: false }
    ],
    encryption: true,
    compression: true,
    retentionDays: 30,
    size: 256 * 1024 * 1024, // 256 MB
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'weekly-incremental',
    name: 'Týždenná inkrementálna záloha',
    description: 'Týždenná záloha len zmenených súborov',
    type: 'incremental',
    schedule: {
      frequency: 'weekly',
      time: '03:00',
      dayOfWeek: 0, // Sunday
      timezone: 'Europe/Bratislava'
    },
    status: 'active',
    lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Week ago
    nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
    dataTypes: [
      { type: 'documents', included: true },
      { type: 'timecapsules', included: true },
      { type: 'templates', included: false },
      { type: 'settings', included: true },
      { type: 'user_data', included: true },
      { type: 'audit_logs', included: true }
    ],
    encryption: true,
    compression: true,
    retentionDays: 90,
    size: 64 * 1024 * 1024, // 64 MB
    createdAt: new Date('2024-01-15')
  }
]

// Sample backup files
const sampleBackupFiles: BackupFile[] = [
  {
    id: 'backup-file-1',
    jobId: 'daily-full-backup',
    filename: 'legacyguard-full-2024-09-22.backup',
    size: 256 * 1024 * 1024,
    type: 'full',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isEncrypted: true,
    isCompressed: true,
    checksum: 'sha256:a1b2c3d4e5f6789012345678901234567890abcdef',
    storageLocation: 'cloud',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'backup-file-2',
    jobId: 'weekly-incremental',
    filename: 'legacyguard-incremental-2024-09-15.backup',
    size: 64 * 1024 * 1024,
    type: 'incremental',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isEncrypted: true,
    isCompressed: true,
    checksum: 'sha256:b2c3d4e5f6789012345678901234567890abcdef01',
    storageLocation: 'cloud',
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'backup-file-3',
    jobId: 'daily-full-backup',
    filename: 'legacyguard-full-2024-09-21.backup',
    size: 245 * 1024 * 1024,
    type: 'full',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isEncrypted: true,
    isCompressed: true,
    checksum: 'sha256:c3d4e5f6789012345678901234567890abcdef012',
    storageLocation: 'local',
    expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
  }
]

// Sample recovery points
const sampleRecoveryPoints: RecoveryPoint[] = [
  {
    id: 'recovery-point-1',
    name: 'Kompletná obnova - September 2024',
    description: 'Bod obnovy obsahujúci všetky dáta k 22. septembru 2024',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    dataTypes: ['documents', 'timecapsules', 'templates', 'settings', 'user_data'],
    size: 256 * 1024 * 1024,
    isVerified: true,
    canRestore: true,
    recoveryTime: 15,
    dependencies: []
  },
  {
    id: 'recovery-point-2',
    name: 'Dokumenty a časové kapsuly',
    description: 'Čiastočná obnova len dokumentov a časových kapsúl',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    dataTypes: ['documents', 'timecapsules'],
    size: 128 * 1024 * 1024,
    isVerified: true,
    canRestore: true,
    recoveryTime: 8,
    dependencies: ['recovery-point-1']
  },
  {
    id: 'recovery-point-3',
    name: 'Nastavenia a šablóny',
    description: 'Obnova systémových nastavení a právnych šablón',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    dataTypes: ['settings', 'templates'],
    size: 32 * 1024 * 1024,
    isVerified: false,
    canRestore: false,
    recoveryTime: 3,
    dependencies: []
  }
]

export const useBackupStore = create<BackupStore>()(
  persist(
    (set, get) => ({
      // Initial state
      backupJobs: defaultBackupJobs,
      backupFiles: sampleBackupFiles,
      recoveryPoints: sampleRecoveryPoints,
      isRunning: false,
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000),
      storageUsage: {
        total: 5 * 1024 * 1024 * 1024, // 5 GB
        used: 565 * 1024 * 1024, // 565 MB
        available: 4.5 * 1024 * 1024 * 1024,
        cloudUsed: 320 * 1024 * 1024,
        localUsed: 245 * 1024 * 1024
      },

      // Actions
      createBackupJob: async (jobData) => {
        const newJob: BackupJob = {
          ...jobData,
          id: `backup-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'active',
          lastRun: null,
          nextRun: calculateNextRun(jobData.schedule),
          size: 0,
          createdAt: new Date()
        }

        set((state) => ({
          backupJobs: [...state.backupJobs, newJob]
        }))

        // Schedule the backup
        await get().scheduleBackup(newJob.id)

        return newJob.id
      },

      updateBackupJob: async (jobId, updates) => {
        set((state) => ({
          backupJobs: state.backupJobs.map(job =>
            job.id === jobId
              ? {
                  ...job,
                  ...updates,
                  nextRun: updates.schedule ? calculateNextRun(updates.schedule) : job.nextRun
                }
              : job
          )
        }))

        // Reschedule if schedule changed
        if (updates.schedule) {
          await get().scheduleBackup(jobId)
        }
      },

      deleteBackupJob: async (jobId) => {
        // Cancel any running backup
        await get().cancelBackup(jobId)

        // Remove associated files
        const job = get().backupJobs.find(j => j.id === jobId)
        if (job) {
          const associatedFiles = get().backupFiles.filter(f => f.jobId === jobId)
          for (const file of associatedFiles) {
            await get().deleteBackupFile(file.id)
          }
        }

        set((state) => ({
          backupJobs: state.backupJobs.filter(job => job.id !== jobId)
        }))
      },

      runBackup: async (jobId) => {
        const job = get().backupJobs.find(j => j.id === jobId)
        if (!job) throw new Error('Backup job not found')

        set({ isRunning: true })

        try {
          // Update job status
          await get().updateBackupJob(jobId, { status: 'active' })

          // Simulate backup process
          await simulateBackupProcess(job)

          // Create backup file
          const backupFile: BackupFile = {
            id: `backup-file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            jobId,
            filename: `legacyguard-${job.type}-${new Date().toISOString().split('T')[0]}.backup`,
            size: Math.floor(Math.random() * 200 * 1024 * 1024) + 50 * 1024 * 1024, // 50-250 MB
            type: job.type,
            createdAt: new Date(),
            isEncrypted: job.encryption,
            isCompressed: job.compression,
            checksum: generateChecksum(),
            storageLocation: 'cloud',
            expiresAt: new Date(Date.now() + job.retentionDays * 24 * 60 * 60 * 1000)
          }

          set((state) => ({
            backupFiles: [...state.backupFiles, backupFile],
            lastBackup: new Date()
          }))

          // Update job
          await get().updateBackupJob(jobId, {
            lastRun: new Date(),
            nextRun: calculateNextRun(job.schedule),
            size: backupFile.size
          })

          // Create recovery point for full backups
          if (job.type === 'full') {
            await get().createRecoveryPoint(
              `Automatická obnova - ${new Date().toLocaleDateString('sk-SK')}`,
              `Automaticky vytvorený bod obnovy z úlohy ${job.name}`,
              job.dataTypes.filter(dt => dt.included).map(dt => dt.type)
            )
          }

          // Update storage stats
          await get().getStorageStats()

        } catch (error) {
          console.error('Backup failed:', error)
          await get().updateBackupJob(jobId, { status: 'failed' })
          throw error
        } finally {
          set({ isRunning: false })
        }
      },

      scheduleBackup: async (jobId) => {
        const job = get().backupJobs.find(j => j.id === jobId)
        if (!job || job.schedule.frequency === 'manual') return

        // TODO: Implement actual scheduling with cron jobs or similar
        console.log(`Scheduling backup job ${job.name} for ${job.schedule.frequency} at ${job.schedule.time}`)
      },

      cancelBackup: async (jobId) => {
        // TODO: Cancel running backup process
        console.log(`Cancelling backup job ${jobId}`)
        set({ isRunning: false })
      },

      // File Management
      downloadBackup: async (fileId) => {
        const file = get().backupFiles.find(f => f.id === fileId)
        if (!file) throw new Error('Backup file not found')

        try {
          // TODO: Generate download URL and initiate download
          console.log(`Downloading backup file: ${file.filename}`)

          // Simulate download
          const blob = new Blob(['Backup file content'], { type: 'application/octet-stream' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = file.filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        } catch (error) {
          console.error('Download failed:', error)
          throw error
        }
      },

      uploadBackup: async (file) => {
        try {
          // TODO: Upload file to storage
          console.log(`Uploading backup file: ${file.name}`)

          // Simulate upload
          await new Promise(resolve => setTimeout(resolve, 2000))

          const backupFile: BackupFile = {
            id: `backup-file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            jobId: 'manual-upload',
            filename: file.name,
            size: file.size,
            type: 'full', // Assume full backup for uploads
            createdAt: new Date(),
            isEncrypted: false, // User uploads may not be encrypted
            isCompressed: false,
            checksum: await calculateFileChecksum(file),
            storageLocation: 'local',
            expiresAt: null
          }

          set((state) => ({
            backupFiles: [...state.backupFiles, backupFile]
          }))

          await get().getStorageStats()

          return backupFile.id
        } catch (error) {
          console.error('Upload failed:', error)
          throw error
        }
      },

      deleteBackupFile: async (fileId) => {
        const file = get().backupFiles.find(f => f.id === fileId)
        if (!file) return

        try {
          // TODO: Delete from storage
          console.log(`Deleting backup file: ${file.filename}`)

          set((state) => ({
            backupFiles: state.backupFiles.filter(f => f.id !== fileId)
          }))

          await get().getStorageStats()
        } catch (error) {
          console.error('Delete failed:', error)
          throw error
        }
      },

      verifyBackup: async (fileId) => {
        const file = get().backupFiles.find(f => f.id === fileId)
        if (!file) throw new Error('Backup file not found')

        try {
          // TODO: Verify file integrity
          console.log(`Verifying backup file: ${file.filename}`)

          // Simulate verification
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Random verification result (90% success rate)
          return Math.random() > 0.1
        } catch (error) {
          console.error('Verification failed:', error)
          return false
        }
      },

      // Recovery
      restoreFromBackup: async (backupId, options = {}) => {
        const { recoveryPoints, backupFiles } = get()
        const recoveryPoint = recoveryPoints.find(rp => rp.id === backupId)
        const backupFile = backupFiles.find(bf => bf.id === backupId)

        if (!recoveryPoint && !backupFile) {
          throw new Error('Backup or recovery point not found')
        }

        try {
          console.log(`Restoring from backup: ${backupId}`)

          // Simulate restoration process
          const estimatedTime = recoveryPoint?.recoveryTime || 10
          for (let i = 0; i <= estimatedTime; i++) {
            await new Promise(resolve => setTimeout(resolve, 100)) // Fast simulation
            // Update progress if needed
          }

          console.log('Restoration completed successfully')
        } catch (error) {
          console.error('Restoration failed:', error)
          throw error
        }
      },

      createRecoveryPoint: async (name, description, dataTypes) => {
        const newRecoveryPoint: RecoveryPoint = {
          id: `recovery-point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          description,
          createdAt: new Date(),
          dataTypes,
          size: Math.floor(Math.random() * 500 * 1024 * 1024) + 100 * 1024 * 1024, // 100-600 MB
          isVerified: true,
          canRestore: true,
          recoveryTime: Math.floor(Math.random() * 20) + 5, // 5-25 minutes
          dependencies: []
        }

        set((state) => ({
          recoveryPoints: [...state.recoveryPoints, newRecoveryPoint]
        }))

        return newRecoveryPoint.id
      },

      deleteRecoveryPoint: async (pointId) => {
        set((state) => ({
          recoveryPoints: state.recoveryPoints.filter(rp => rp.id !== pointId)
        }))
      },

      // Storage
      getStorageStats: async () => {
        try {
          const { backupFiles } = get()

          const cloudFiles = backupFiles.filter(f => f.storageLocation === 'cloud')
          const localFiles = backupFiles.filter(f => f.storageLocation === 'local')

          const cloudUsed = cloudFiles.reduce((sum, f) => sum + f.size, 0)
          const localUsed = localFiles.reduce((sum, f) => sum + f.size, 0)
          const totalUsed = cloudUsed + localUsed

          set((state) => ({
            storageUsage: {
              ...state.storageUsage,
              used: totalUsed,
              cloudUsed,
              localUsed,
              available: state.storageUsage.total - totalUsed
            }
          }))
        } catch (error) {
          console.error('Failed to get storage stats:', error)
        }
      },

      cleanupOldBackups: async () => {
        try {
          const { backupFiles } = get()
          const now = new Date()

          const expiredFiles = backupFiles.filter(file =>
            file.expiresAt && file.expiresAt < now
          )

          for (const file of expiredFiles) {
            await get().deleteBackupFile(file.id)
          }

          console.log(`Cleaned up ${expiredFiles.length} expired backup files`)
        } catch (error) {
          console.error('Cleanup failed:', error)
        }
      },

      optimizeStorage: async () => {
        try {
          // TODO: Implement storage optimization
          // - Compress old backups
          // - Deduplicate identical files
          // - Move old backups to cheaper storage
          console.log('Optimizing storage...')

          await new Promise(resolve => setTimeout(resolve, 2000))

          // Simulate some space savings
          set((state) => ({
            storageUsage: {
              ...state.storageUsage,
              used: state.storageUsage.used * 0.9 // 10% savings
            }
          }))

          console.log('Storage optimization completed')
        } catch (error) {
          console.error('Storage optimization failed:', error)
        }
      }
    }),
    {
      name: 'backup-store',
      partialize: (state) => ({
        backupJobs: state.backupJobs,
        lastBackup: state.lastBackup
      })
    }
  )
)

// Helper functions
function calculateNextRun(schedule: BackupSchedule): Date {
  const now = new Date()
  const [hours, minutes] = schedule.time.split(':').map(Number)

  let nextRun = new Date()
  nextRun.setHours(hours, minutes, 0, 0)

  switch (schedule.frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
      break

    case 'weekly':
      if (schedule.dayOfWeek !== undefined) {
        const currentDay = nextRun.getDay()
        const targetDay = schedule.dayOfWeek
        let daysUntilTarget = (targetDay - currentDay + 7) % 7

        if (daysUntilTarget === 0 && nextRun <= now) {
          daysUntilTarget = 7
        }

        nextRun.setDate(nextRun.getDate() + daysUntilTarget)
      }
      break

    case 'monthly':
      if (schedule.dayOfMonth !== undefined) {
        nextRun.setDate(schedule.dayOfMonth)
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1)
        }
      }
      break

    case 'manual':
      return new Date(2099, 11, 31) // Far future for manual backups
  }

  return nextRun
}

async function simulateBackupProcess(job: BackupJob): Promise<void> {
  // Simulate different backup times based on type
  const baseDuration = job.type === 'full' ? 5000 : job.type === 'incremental' ? 2000 : 3000
  const randomVariation = Math.random() * 2000

  await new Promise(resolve => setTimeout(resolve, baseDuration + randomVariation))
}

function generateChecksum(): string {
  return 'sha256:' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

async function calculateFileChecksum(file: File): Promise<string> {
  // Simulate checksum calculation
  await new Promise(resolve => setTimeout(resolve, 100))
  return generateChecksum()
}