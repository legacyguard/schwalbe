import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WillData, WillSection } from '../components/legal/WillGeneratorEngine'

interface WillStore {
  // State
  willData: Partial<WillData>
  sections: WillSection[]
  currentSection: string
  jurisdiction: 'SK' | 'CZ' | 'EU'
  isGenerating: boolean
  generatedContent: string
  validationErrors: Record<string, string[]>
  lastSaved: Date | null

  // Actions
  updateWillData: (data: Partial<WillData>) => void
  setCurrentSection: (sectionId: string) => void
  setJurisdiction: (jurisdiction: 'SK' | 'CZ' | 'EU') => void
  validateSection: (sectionId: string) => Promise<boolean>
  calculateCompletion: () => number
  generateWillContent: () => Promise<void>
  saveWillData: () => Promise<void>
  resetWill: () => void
}

const initialSections: WillSection[] = [
  {
    id: 'personal',
    title: 'Osobné údaje',
    completed: false,
    required: true,
    data: {}
  },
  {
    id: 'assets',
    title: 'Majetok',
    completed: false,
    required: true,
    data: {}
  },
  {
    id: 'beneficiaries',
    title: 'Dedičia',
    completed: false,
    required: true,
    data: {}
  },
  {
    id: 'guardians',
    title: 'Opatrovníci',
    completed: false,
    required: false,
    data: {}
  },
  {
    id: 'executors',
    title: 'Vykonávatelia',
    completed: false,
    required: true,
    data: {}
  },
  {
    id: 'instructions',
    title: 'Špeciálne pokyny',
    completed: false,
    required: false,
    data: {}
  }
]

export const useWillStore = create<WillStore>()(
  persist(
    (set, get) => ({
      // Initial state
      willData: {},
      sections: initialSections,
      currentSection: 'personal',
      jurisdiction: 'SK',
      isGenerating: false,
      generatedContent: '',
      validationErrors: {},
      lastSaved: null,

      // Actions
      updateWillData: (data) => {
        set((state) => ({
          willData: {
            ...state.willData,
            ...data
          },
          lastSaved: new Date()
        }))

        // Auto-validate affected sections
        const affectedSections = detectAffectedSections(data)
        affectedSections.forEach(sectionId => {
          get().validateSection(sectionId)
        })
      },

      setCurrentSection: (sectionId) => {
        set({ currentSection: sectionId })
      },

      setJurisdiction: (jurisdiction) => {
        set({ jurisdiction })
        // Re-validate all sections when jurisdiction changes
        get().sections.forEach(section => {
          get().validateSection(section.id)
        })
      },

      validateSection: async (sectionId) => {
        const { willData, jurisdiction } = get()
        const errors: string[] = []

        switch (sectionId) {
          case 'personal':
            if (!willData.personal?.fullName) errors.push('Meno je povinné')
            if (!willData.personal?.birthDate) errors.push('Dátum narodenia je povinný')
            if (!willData.personal?.address) errors.push('Adresa je povinná')
            if (jurisdiction === 'SK' && !willData.personal?.idNumber) {
              errors.push('Rodné číslo je povinné pre slovenské právo')
            }
            break

          case 'assets':
            const hasRealEstate = willData.assets?.realEstate?.length > 0
            const hasFinancial = willData.assets?.financial?.length > 0
            const hasPersonal = willData.assets?.personal?.length > 0

            if (!hasRealEstate && !hasFinancial && !hasPersonal) {
              errors.push('Musíš uviesť aspoň jeden druh majetku')
            }

            // Validate real estate
            willData.assets?.realEstate?.forEach((estate, index) => {
              if (!estate.address) errors.push(`Adresa nehnuteľnosti ${index + 1} je povinná`)
              if (!estate.estimatedValue || estate.estimatedValue <= 0) {
                errors.push(`Hodnota nehnuteľnosti ${index + 1} musí byť kladná`)
              }
            })
            break

          case 'beneficiaries':
            if (!willData.beneficiaries?.length) {
              errors.push('Musíš uviesť aspoň jedného dediča')
            }

            const totalAllocation = willData.beneficiaries?.reduce(
              (sum, ben) => sum + (ben.allocation || 0), 0
            ) || 0

            if (Math.abs(totalAllocation - 100) > 0.01) {
              errors.push('Celkový podiel dedičov musí byť 100%')
            }

            willData.beneficiaries?.forEach((ben, index) => {
              if (!ben.name) errors.push(`Meno dediča ${index + 1} je povinné`)
              if (!ben.relationship) errors.push(`Vzťah k dedičovi ${index + 1} je povinný`)
              if (!ben.allocation || ben.allocation <= 0) {
                errors.push(`Podiel dediča ${index + 1} musí byť kladný`)
              }
            })
            break

          case 'executors':
            if (!willData.executors?.length) {
              errors.push('Musíš uviesť aspoň jedného vykonávateľa testamentu')
            }

            const primaryExecutors = willData.executors?.filter(ex => ex.isPrimary) || []
            if (primaryExecutors.length !== 1) {
              errors.push('Musí byť presne jeden hlavný vykonávateľ')
            }

            willData.executors?.forEach((exec, index) => {
              if (!exec.name) errors.push(`Meno vykonávateľa ${index + 1} je povinné`)
              if (!exec.address) errors.push(`Adresa vykonávateľa ${index + 1} je povinná`)
              if (!exec.phone && !exec.email) {
                errors.push(`Kontakt na vykonávateľa ${index + 1} je povinný`)
              }
            })
            break

          case 'guardians':
            // Optional but validate if provided
            willData.guardians?.forEach((guardian, index) => {
              if (!guardian.name) errors.push(`Meno opatrovníka ${index + 1} je povinné`)
              if (!guardian.address) errors.push(`Adresa opatrovníka ${index + 1} je povinná`)
            })
            break

          case 'instructions':
            // Optional section - no validation needed
            break
        }

        // Update section completion status
        const isValid = errors.length === 0
        set((state) => ({
          sections: state.sections.map(section =>
            section.id === sectionId
              ? { ...section, completed: isValid }
              : section
          ),
          validationErrors: {
            ...state.validationErrors,
            [sectionId]: errors
          }
        }))

        return isValid
      },

      calculateCompletion: () => {
        const { sections } = get()
        const requiredSections = sections.filter(s => s.required)
        const completedRequired = requiredSections.filter(s => s.completed)
        const optionalSections = sections.filter(s => !s.required)
        const completedOptional = optionalSections.filter(s => s.completed)

        // Required sections count as 80%, optional as 20%
        const requiredWeight = 0.8
        const optionalWeight = 0.2

        const requiredCompletion = requiredSections.length > 0
          ? (completedRequired.length / requiredSections.length) * requiredWeight
          : requiredWeight

        const optionalCompletion = optionalSections.length > 0
          ? (completedOptional.length / optionalSections.length) * optionalWeight
          : 0

        return Math.round((requiredCompletion + optionalCompletion) * 100)
      },

      generateWillContent: async () => {
        set({ isGenerating: true })

        try {
          const { willData, jurisdiction } = get()
          const template = await getWillTemplate(jurisdiction)
          const content = await populateTemplate(template, willData)

          set({
            generatedContent: content,
            isGenerating: false,
            lastSaved: new Date()
          })
        } catch (error) {
          console.error('Error generating will content:', error)
          set({ isGenerating: false })
          throw error
        }
      },

      saveWillData: async () => {
        try {
          const { willData } = get()
          // TODO: Save to Supabase
          console.log('Saving will data:', willData)

          set({ lastSaved: new Date() })
        } catch (error) {
          console.error('Error saving will data:', error)
          throw error
        }
      },

      resetWill: () => {
        set({
          willData: {},
          sections: initialSections,
          currentSection: 'personal',
          generatedContent: '',
          validationErrors: {},
          lastSaved: null
        })
      }
    }),
    {
      name: 'will-store',
      partialize: (state) => ({
        willData: state.willData,
        sections: state.sections,
        jurisdiction: state.jurisdiction,
        lastSaved: state.lastSaved
      })
    }
  )
)

// Helper functions
function detectAffectedSections(data: Partial<WillData>): string[] {
  const sections: string[] = []

  if (data.personal) sections.push('personal')
  if (data.assets) sections.push('assets')
  if (data.beneficiaries) sections.push('beneficiaries')
  if (data.guardians) sections.push('guardians')
  if (data.executors) sections.push('executors')
  if (data.specialInstructions) sections.push('instructions')

  return sections
}

async function getWillTemplate(jurisdiction: 'SK' | 'CZ' | 'EU'): Promise<string> {
  // TODO: Load template from database or file system
  const templates = {
    SK: `TESTAMENT

Ja, {fullName}, narodený/á {birthDate} v {birthPlace}, {nationality}, bytom {address}, rodné číslo {idNumber}, tým týmto vyhlasujem:

1. ZRUŠENIE PREDCHÁDZAJÚCICH TESTAMENTOV
Týmto zrušujem všetky predchádzajúce testamenty a kodaily.

2. DEDIČSTVO
{beneficiariesSection}

3. VYKONÁVATELIA TESTAMENTU
{executorsSection}

{guardiansSection}

{specialInstructionsSection}

Toto je môj posledný testament, ktorý som napísal pri plnom vedomí a z vlastnej vôle.

Miesto a dátum: {place}, {date}

Podpis: ________________________
        {fullName}`,

    CZ: `ZÁVĚŤ

Já, {fullName}, narozený/á {birthDate} v {birthPlace}, {nationality}, bydliště {address}, rodné číslo {idNumber}, tímto prohlašuji:

1. ZRUŠENÍ PŘEDCHOZÍCH ZÁVĚTÍ
Tímto ruším všechny předchozí závěti a kodicily.

2. DĚDICTVÍ
{beneficiariesSection}

3. VYKONAVATELÉ ZÁVĚTI
{executorsSection}

{guardiansSection}

{specialInstructionsSection}

Toto je má poslední vůle, kterou jsem napsal při plném vědomí a z vlastní vůle.

Místo a datum: {place}, {date}

Podpis: ________________________
        {fullName}`,

    EU: `LAST WILL AND TESTAMENT

I, {fullName}, born {birthDate} in {birthPlace}, {nationality}, residing at {address}, hereby declare:

1. REVOCATION OF PRIOR WILLS
I hereby revoke all prior wills and codicils.

2. BEQUESTS
{beneficiariesSection}

3. EXECUTORS
{executorsSection}

{guardiansSection}

{specialInstructionsSection}

This is my last will and testament, made with full knowledge and of my own free will.

Place and date: {place}, {date}

Signature: ________________________
           {fullName}`
  }

  return templates[jurisdiction]
}

async function populateTemplate(template: string, willData: Partial<WillData>): Promise<string> {
  let content = template

  // Replace personal data
  if (willData.personal) {
    content = content.replace(/{fullName}/g, willData.personal.fullName || '[MENO]')
    content = content.replace(/{birthDate}/g, willData.personal.birthDate || '[DÁTUM NARODENIA]')
    content = content.replace(/{birthPlace}/g, willData.personal.birthPlace || '[MIESTO NARODENIA]')
    content = content.replace(/{nationality}/g, willData.personal.nationality || '[NÁRODNOSŤ]')
    content = content.replace(/{address}/g, willData.personal.address || '[ADRESA]')
    content = content.replace(/{idNumber}/g, willData.personal.idNumber || '[RODNÉ ČÍSLO]')
  }

  // Generate beneficiaries section
  const beneficiariesSection = generateBeneficiariesSection(willData.beneficiaries || [])
  content = content.replace(/{beneficiariesSection}/g, beneficiariesSection)

  // Generate executors section
  const executorsSection = generateExecutorsSection(willData.executors || [])
  content = content.replace(/{executorsSection}/g, executorsSection)

  // Generate guardians section
  const guardiansSection = generateGuardiansSection(willData.guardians || [])
  content = content.replace(/{guardiansSection}/g, guardiansSection)

  // Generate special instructions
  const specialInstructionsSection = generateSpecialInstructionsSection(willData.specialInstructions)
  content = content.replace(/{specialInstructionsSection}/g, specialInstructionsSection)

  // Replace date and place
  content = content.replace(/{date}/g, new Date().toLocaleDateString('sk-SK'))
  content = content.replace(/{place}/g, '[MIESTO]')

  return content
}

function generateBeneficiariesSection(beneficiaries: any[]): string {
  if (beneficiaries.length === 0) return '[DEDIČIA NEUVIEDENÍ]'

  return beneficiaries
    .map((ben, index) => {
      return `${index + 1}. ${ben.name} (${ben.relationship}) - ${ben.allocation}% z celkového majetku`
    })
    .join('\n')
}

function generateExecutorsSection(executors: any[]): string {
  if (executors.length === 0) return '[VYKONÁVATELIA NEUVIEDENÍ]'

  const primary = executors.find(ex => ex.isPrimary)
  const backup = executors.filter(ex => !ex.isPrimary)

  let section = ''
  if (primary) {
    section += `Hlavný vykonávateľ: ${primary.name}, ${primary.address}`
  }

  if (backup.length > 0) {
    section += '\nNáhradní vykonávatelia:\n' + backup
      .map((ex, index) => `${index + 1}. ${ex.name}, ${ex.address}`)
      .join('\n')
  }

  return section
}

function generateGuardiansSection(guardians: any[]): string {
  if (guardians.length === 0) return ''

  const section = guardians
    .map((guardian, index) => {
      return `${index + 1}. ${guardian.name}, ${guardian.address}`
    })
    .join('\n')

  return `\n4. OPATROVNÍCI PRE MALOLETÝCH\n${section}`
}

function generateSpecialInstructionsSection(instructions?: any): string {
  if (!instructions) return ''

  let section = '\n5. ŠPECIÁLNE POKYNY\n'
  let hasInstructions = false

  if (instructions.burial) {
    section += `Pohreb: ${instructions.burial}\n`
    hasInstructions = true
  }

  if (instructions.digitalAssets) {
    section += `Digitálny majetok: ${instructions.digitalAssets}\n`
    hasInstructions = true
  }

  if (instructions.charityDonations) {
    section += `Charity: ${instructions.charityDonations}\n`
    hasInstructions = true
  }

  if (instructions.petCare) {
    section += `Starostlivosť o zvieratá: ${instructions.petCare}\n`
    hasInstructions = true
  }

  if (instructions.other) {
    section += `Ostatné: ${instructions.other}\n`
    hasInstructions = true
  }

  return hasInstructions ? section : ''
}