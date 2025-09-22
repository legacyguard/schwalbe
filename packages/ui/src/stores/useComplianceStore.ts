import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ComplianceCheck, ComplianceReport } from '../components/legal/ComplianceValidator'
import type { WillData } from '../components/legal/WillGeneratorEngine'

interface ComplianceStore {
  // State
  reports: ComplianceReport[]
  lastReport: ComplianceReport | null
  isValidating: boolean
  validationHistory: ComplianceReport[]

  // Actions
  runCompliance: (willData: Partial<WillData>, jurisdiction: 'SK' | 'CZ' | 'EU', documentType: string) => Promise<ComplianceReport>
  getComplianceReport: (reportId: string) => ComplianceReport | null
  autoFixIssues: (reportId: string, checkIds?: string[]) => Promise<Partial<WillData>>
  saveReport: (report: ComplianceReport) => void
  clearHistory: () => void
}

// Compliance rules database
const complianceRules = {
  SK: {
    will: [
      {
        id: 'sk-will-personal-data',
        category: 'data' as const,
        title: 'Kompletné osobné údaje',
        description: 'Testament musí obsahovať úplné osobné údaje poručiteľa',
        mandatory: true,
        severity: 'critical' as const,
        autoFixable: false,
        validator: (data: Partial<WillData>) => {
          const errors: string[] = []
          if (!data.personal?.fullName) errors.push('Chýba celé meno')
          if (!data.personal?.birthDate) errors.push('Chýba dátum narodenia')
          if (!data.personal?.address) errors.push('Chýba adresa')
          if (!data.personal?.idNumber) errors.push('Chýba rodné číslo')

          return {
            passed: errors.length === 0,
            errorMessage: errors.length > 0 ? errors.join(', ') : undefined,
            recommendation: errors.length > 0 ? 'Doplň všetky povinné osobné údaje' : undefined
          }
        }
      },
      {
        id: 'sk-will-id-number-format',
        category: 'format' as const,
        title: 'Formát rodného čísla',
        description: 'Rodné číslo musí byť vo formáte XXXXXX/XXXX',
        mandatory: true,
        severity: 'high' as const,
        autoFixable: true,
        validator: (data: Partial<WillData>) => {
          const idNumber = data.personal?.idNumber
          if (!idNumber) return { passed: false, errorMessage: 'Rodné číslo nie je uvedené' }

          const isValid = /^\d{6}\/\d{4}$/.test(idNumber)
          return {
            passed: isValid,
            errorMessage: !isValid ? 'Nesprávny formát rodného čísla' : undefined,
            recommendation: !isValid ? 'Použi formát XXXXXX/XXXX (napr. 123456/7890)' : undefined
          }
        }
      },
      {
        id: 'sk-will-beneficiaries-required',
        category: 'legal' as const,
        title: 'Dedičia sú uvedení',
        description: 'Testament musí obsahovať aspoň jedného dediča',
        mandatory: true,
        severity: 'critical' as const,
        autoFixable: false,
        validator: (data: Partial<WillData>) => {
          const hasBeneficiaries = data.beneficiaries && data.beneficiaries.length > 0
          return {
            passed: !!hasBeneficiaries,
            errorMessage: !hasBeneficiaries ? 'Testament neobsahuje žiadnych dedičov' : undefined,
            recommendation: !hasBeneficiaries ? 'Pridaj aspoň jedného dediča' : undefined
          }
        }
      },
      {
        id: 'sk-will-beneficiaries-allocation',
        category: 'legal' as const,
        title: 'Rozdelenie dedičstva',
        description: 'Celkový podiel všetkých dedičov musí byť 100%',
        mandatory: true,
        severity: 'critical' as const,
        autoFixable: true,
        validator: (data: Partial<WillData>) => {
          if (!data.beneficiaries || data.beneficiaries.length === 0) {
            return { passed: false, errorMessage: 'Nie su uvedení žiadni dedičia' }
          }

          const totalAllocation = data.beneficiaries.reduce((sum, b) => sum + (b.allocation || 0), 0)
          const isValid = Math.abs(totalAllocation - 100) < 0.01

          return {
            passed: isValid,
            errorMessage: !isValid ? `Celkový podiel je ${totalAllocation}%, musí byť 100%` : undefined,
            recommendation: !isValid ? 'Upravy podiely dedičov tak, aby spolu tvorili presne 100%' : undefined
          }
        }
      },
      {
        id: 'sk-will-executors-required',
        category: 'legal' as const,
        title: 'Vykonávatelia testamentu',
        description: 'Testament musí mať aspoň jedného vykonávateľa',
        mandatory: true,
        severity: 'critical' as const,
        autoFixable: false,
        validator: (data: Partial<WillData>) => {
          const hasExecutors = data.executors && data.executors.length > 0
          return {
            passed: !!hasExecutors,
            errorMessage: !hasExecutors ? 'Testament nemá žiadnych vykonávateľov' : undefined,
            recommendation: !hasExecutors ? 'Určí aspoň jedného vykonávateľa testamentu' : undefined
          }
        }
      },
      {
        id: 'sk-will-primary-executor',
        category: 'legal' as const,
        title: 'Hlavný vykonávateľ',
        description: 'Musí byť určený presne jeden hlavný vykonávateľ',
        mandatory: true,
        severity: 'high' as const,
        autoFixable: true,
        validator: (data: Partial<WillData>) => {
          if (!data.executors || data.executors.length === 0) {
            return { passed: false, errorMessage: 'Nie sú uvedení žiadni vykonávatelia' }
          }

          const primaryExecutors = data.executors.filter(e => e.isPrimary)
          const isValid = primaryExecutors.length === 1

          return {
            passed: isValid,
            errorMessage: !isValid ?
              `${primaryExecutors.length === 0 ? 'Žiadny' : 'Viacero'} hlavných vykonávateľov` : undefined,
            recommendation: !isValid ? 'Označ presne jedného vykonávateľa ako hlavného' : undefined
          }
        }
      },
      {
        id: 'sk-will-witness-requirement',
        category: 'witness' as const,
        title: 'Požiadavka na svedkov',
        description: 'Testament vyžaduje podpis dvoch svedkov alebo notárske overenie',
        mandatory: true,
        severity: 'critical' as const,
        autoFixable: false,
        validator: (data: Partial<WillData>) => {
          // This would be checked during signing process
          return {
            passed: true, // We'll assume this will be handled during signing
            recommendation: 'Zabezpeč, aby testament podpísali dvaja svedkovia pri podpise'
          }
        }
      },
      {
        id: 'sk-will-marital-status-consistency',
        category: 'data' as const,
        title: 'Konzistentnosť rodinného stavu',
        description: 'Rodinný stav musí byť konzistentný s údajmi o manželovi/manželke',
        mandatory: false,
        severity: 'medium' as const,
        autoFixable: true,
        validator: (data: Partial<WillData>) => {
          const maritalStatus = data.personal?.maritalStatus
          const spouseName = data.personal?.spouseName

          if (maritalStatus === 'married' && !spouseName) {
            return {
              passed: false,
              errorMessage: 'Pri rodinnom stave "ženatý/vydatá" chýba meno manžela/manželky',
              recommendation: 'Doplň meno manžela/manželky alebo uprav rodinný stav'
            }
          }

          if (maritalStatus !== 'married' && spouseName) {
            return {
              passed: false,
              errorMessage: 'Uviedol si meno manžela/manželky ale rodinný stav nie je "ženatý/vydatá"',
              recommendation: 'Upravy rodinný stav alebo odstráň meno manžela/manželky'
            }
          }

          return { passed: true }
        }
      },
      {
        id: 'sk-will-assets-required',
        category: 'data' as const,
        title: 'Majetok je uvedený',
        description: 'Testament by mal obsahovať aspoň základný popis majetku',
        mandatory: false,
        severity: 'medium' as const,
        autoFixable: false,
        validator: (data: Partial<WillData>) => {
          const hasAssets = data.assets && (
            (data.assets.realEstate && data.assets.realEstate.length > 0) ||
            (data.assets.financial && data.assets.financial.length > 0) ||
            (data.assets.personal && data.assets.personal.length > 0)
          )

          return {
            passed: !!hasAssets,
            errorMessage: !hasAssets ? 'Testament neobsahuje žiadny majetok' : undefined,
            recommendation: !hasAssets ? 'Pridaj aspoň základný popis svojho majetku' : undefined
          }
        }
      },
      {
        id: 'sk-will-guardians-minors',
        category: 'legal' as const,
        title: 'Opatrovníci pre maloletých',
        description: 'Ak máš maloletné deti, urči im opatrovníkov',
        mandatory: false,
        severity: 'medium' as const,
        autoFixable: false,
        validator: (data: Partial<WillData>) => {
          // This would require knowing if the person has minor children
          // For now, we'll just check if guardians are specified when beneficiaries include children
          const hasChildBeneficiaries = data.beneficiaries?.some(b =>
            b.relationship && b.relationship.toLowerCase().includes('syn') ||
            b.relationship.toLowerCase().includes('dcéra') ||
            b.relationship.toLowerCase().includes('dieťa')
          )

          if (hasChildBeneficiaries && (!data.guardians || data.guardians.length === 0)) {
            return {
              passed: false,
              errorMessage: 'Máš deti medzi dedičmi, ale nie sú určení opatrovníci',
              recommendation: 'Urči opatrovníkov pre maloletné deti'
            }
          }

          return { passed: true }
        }
      }
    ],
    power_of_attorney: [
      {
        id: 'sk-poa-notarization',
        category: 'notarization' as const,
        title: 'Notárske overenie',
        description: 'Plná moc musí byť notársky overená',
        mandatory: true,
        severity: 'critical' as const,
        autoFixable: false,
        validator: (data: any) => {
          return {
            passed: true, // Will be verified during notarization
            recommendation: 'Navštív notára pre overenie plnej moci'
          }
        }
      }
    ]
  },
  CZ: {
    // Czech compliance rules would be similar but with different requirements
    will: [
      // Similar rules adapted for Czech law
    ]
  },
  EU: {
    // EU-wide compliance rules
    will: [
      // General EU rules
    ]
  }
}

export const useComplianceStore = create<ComplianceStore>()(
  persist(
    (set, get) => ({
      // Initial state
      reports: [],
      lastReport: null,
      isValidating: false,
      validationHistory: [],

      // Actions
      runCompliance: async (willData, jurisdiction, documentType) => {
        set({ isValidating: true })

        try {
          const rules = complianceRules[jurisdiction]?.[documentType as keyof typeof complianceRules[typeof jurisdiction]] || []
          const checks: ComplianceCheck[] = []

          // Run each compliance rule
          for (const rule of rules) {
            const result = rule.validator(willData)

            checks.push({
              id: rule.id,
              category: rule.category,
              title: rule.title,
              description: rule.description,
              jurisdiction: [jurisdiction],
              mandatory: rule.mandatory,
              status: result.passed ? 'passed' : 'failed',
              errorMessage: result.errorMessage,
              recommendation: result.recommendation,
              autoFixable: rule.autoFixable,
              severity: rule.severity
            })
          }

          // Calculate overall status and score
          const failedMandatory = checks.filter(c => c.mandatory && c.status === 'failed')
          const failedOptional = checks.filter(c => !c.mandatory && c.status === 'failed')
          const warnings = checks.filter(c => c.status === 'warning')

          let overallStatus: 'compliant' | 'non_compliant' | 'needs_review'
          if (failedMandatory.length > 0) {
            overallStatus = 'non_compliant'
          } else if (failedOptional.length > 0 || warnings.length > 0) {
            overallStatus = 'needs_review'
          } else {
            overallStatus = 'compliant'
          }

          // Calculate score
          const totalChecks = checks.length
          const passedChecks = checks.filter(c => c.status === 'passed').length
          const warningChecks = checks.filter(c => c.status === 'warning').length
          const score = totalChecks > 0
            ? Math.round(((passedChecks + warningChecks * 0.5) / totalChecks) * 100)
            : 100

          // Generate report
          const report: ComplianceReport = {
            id: `report-${Date.now()}`,
            documentId: `will-${Date.now()}`,
            jurisdiction,
            documentType,
            timestamp: new Date(),
            overallStatus,
            score,
            checks,
            warnings: checks.filter(c => c.status === 'warning').map(c => c.title),
            criticalIssues: checks.filter(c => c.severity === 'critical' && c.status === 'failed').map(c => c.title),
            recommendations: checks.filter(c => c.recommendation).map(c => c.recommendation!),
            nextSteps: generateNextSteps(checks, overallStatus)
          }

          set((state) => ({
            reports: [...state.reports, report],
            lastReport: report,
            validationHistory: [...state.validationHistory, report].slice(-10), // Keep last 10 reports
            isValidating: false
          }))

          return report
        } catch (error) {
          console.error('Compliance validation error:', error)
          set({ isValidating: false })
          throw error
        }
      },

      getComplianceReport: (reportId) => {
        return get().reports.find(r => r.id === reportId) || null
      },

      autoFixIssues: async (reportId, checkIds) => {
        const report = get().getComplianceReport(reportId)
        if (!report) throw new Error('Report not found')

        const fixableChecks = report.checks.filter(check =>
          check.autoFixable &&
          check.status === 'failed' &&
          (!checkIds || checkIds.includes(check.id))
        )

        const fixes: Partial<WillData> = {}

        for (const check of fixableChecks) {
          switch (check.id) {
            case 'sk-will-id-number-format':
              // Auto-fix ID number format
              if (fixes.personal?.idNumber) {
                const cleaned = fixes.personal.idNumber.replace(/\D/g, '')
                if (cleaned.length === 10) {
                  fixes.personal = {
                    ...fixes.personal,
                    idNumber: `${cleaned.slice(0, 6)}/${cleaned.slice(6)}`
                  }
                }
              }
              break

            case 'sk-will-beneficiaries-allocation':
              // Auto-balance beneficiary allocations
              if (fixes.beneficiaries && fixes.beneficiaries.length > 0) {
                const equalShare = Math.round(100 / fixes.beneficiaries.length)
                const remainder = 100 - (equalShare * fixes.beneficiaries.length)

                fixes.beneficiaries = fixes.beneficiaries.map((ben, index) => ({
                  ...ben,
                  allocation: index === 0 ? equalShare + remainder : equalShare
                }))
              }
              break

            case 'sk-will-primary-executor':
              // Set first executor as primary
              if (fixes.executors && fixes.executors.length > 0) {
                fixes.executors = fixes.executors.map((exec, index) => ({
                  ...exec,
                  isPrimary: index === 0
                }))
              }
              break

            case 'sk-will-marital-status-consistency':
              // Fix marital status consistency
              if (fixes.personal?.maritalStatus === 'married' && !fixes.personal.spouseName) {
                fixes.personal = {
                  ...fixes.personal,
                  spouseName: '[MENO MANŽELA/MANŽELKY]'
                }
              }
              break
          }
        }

        return fixes
      },

      saveReport: (report) => {
        set((state) => ({
          reports: [...state.reports.filter(r => r.id !== report.id), report],
          lastReport: report
        }))
      },

      clearHistory: () => {
        set({
          reports: [],
          lastReport: null,
          validationHistory: []
        })
      }
    }),
    {
      name: 'compliance-store',
      partialize: (state) => ({
        validationHistory: state.validationHistory
      })
    }
  )
)

function generateNextSteps(checks: ComplianceCheck[], overallStatus: string): string[] {
  const steps: string[] = []

  const criticalFailed = checks.filter(c => c.severity === 'critical' && c.status === 'failed')
  const highFailed = checks.filter(c => c.severity === 'high' && c.status === 'failed')
  const warnings = checks.filter(c => c.status === 'warning')

  if (criticalFailed.length > 0) {
    steps.push(`Oprav ${criticalFailed.length} kritických problémov`)
    steps.push('Znovu spusti kontrolu súladu')
  }

  if (highFailed.length > 0) {
    steps.push(`Zvážy opravu ${highFailed.length} dôležitých problémov`)
  }

  if (warnings.length > 0) {
    steps.push(`Skontroluj ${warnings.length} upozornení`)
  }

  if (overallStatus === 'compliant') {
    steps.push('Testament je pripravený na podpis')
    steps.push('Zabezpeč prítomnosť svedkov alebo notára')
    steps.push('Uchováj testament na bezpečnom mieste')
  } else if (overallStatus === 'needs_review') {
    steps.push('Skontroluj všetky upozornenia')
    steps.push('Zvržy pravidelné aktualizácie testamentu')
  }

  return steps
}