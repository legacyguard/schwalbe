import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LegalTemplate, TemplatePlaceholder, LegalRequirement } from '../components/legal/TemplateManager'

interface TemplateStore {
  // State
  templates: LegalTemplate[]
  selectedTemplate: LegalTemplate | null
  isLoading: boolean
  searchTerm: string
  filters: {
    jurisdiction: string
    type: string
    category: string
  }
  validationResults: Record<string, ValidationResult>

  // Actions
  loadTemplates: () => Promise<void>
  selectTemplate: (templateId: string) => void
  updateTemplate: (templateId: string, updates: Partial<LegalTemplate>) => void
  validateTemplate: (templateId: string) => Promise<boolean>
  exportTemplate: (templateId: string, format: 'pdf' | 'docx' | 'txt') => Promise<void>
  searchTemplates: (term: string) => void
  setFilters: (filters: Partial<TemplateStore['filters']>) => void
  duplicateTemplate: (templateId: string, newName: string) => Promise<string>
  createTemplate: (template: Omit<LegalTemplate, 'id' | 'lastUpdated'>) => Promise<string>
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  score: number
}

interface ValidationError {
  type: 'syntax' | 'legal' | 'format' | 'placeholder'
  message: string
  line?: number
  column?: number
  severity: 'error' | 'warning'
}

interface ValidationWarning {
  type: 'suggestion' | 'compatibility' | 'optimization'
  message: string
  recommendation: string
}

// Initial template data
const initialTemplates: LegalTemplate[] = [
  {
    id: 'will-basic-sk',
    name: 'Základný testament',
    type: 'will',
    jurisdiction: 'SK',
    version: '1.0.0',
    lastUpdated: new Date('2024-01-15'),
    content: `TESTAMENT

Ja, {fullName}, narodený/á {birthDate} v {birthPlace}, {nationality}, bytom {address}, rodné číslo {idNumber}, tým týmto vyhlasujem:

1. ZRUŠENIE PREDCHÁDZAJÚCICH TESTAMENTOV
Týmto zrušujem všetky predchádzajúce testamenty a kodicily.

2. DEDIČSTVO
{beneficiariesSection}

3. VYKONÁVATELIA TESTAMENTU
{executorsSection}

{guardiansSection}

{specialInstructionsSection}

Toto je môj posledný testament, ktorý som napísal pri plnom vedomí a z vlastnej vôle.

Miesto a dátum: {place}, {date}

Podpis: ________________________
        {fullName}

OVERENIE
Svedkovia:
1. Meno: _________________ Podpis: _________________
2. Meno: _________________ Podpis: _________________`,
    placeholders: [
      {
        id: 'fullName',
        name: 'fullName',
        type: 'text',
        label: 'Celé meno',
        description: 'Celé meno poručiteľa podľa dokladu totožnosti',
        required: true,
        validation: { min: 2, max: 100 }
      },
      {
        id: 'birthDate',
        name: 'birthDate',
        type: 'date',
        label: 'Dátum narodenia',
        description: 'Dátum narodenia poručiteľa',
        required: true
      },
      {
        id: 'birthPlace',
        name: 'birthPlace',
        type: 'text',
        label: 'Miesto narodenia',
        description: 'Miesto narodenia poručiteľa',
        required: true
      },
      {
        id: 'nationality',
        name: 'nationality',
        type: 'select',
        label: 'Národnosť',
        description: 'Národnosť poručiteľa',
        required: true,
        validation: {
          options: ['slovenská', 'česká', 'iná']
        }
      },
      {
        id: 'address',
        name: 'address',
        type: 'textarea',
        label: 'Adresa bydliska',
        description: 'Úplná adresa trvalého bydliska',
        required: true
      },
      {
        id: 'idNumber',
        name: 'idNumber',
        type: 'text',
        label: 'Rodné číslo',
        description: 'Rodné číslo vo formáte XXXXXX/XXXX',
        required: true,
        validation: {
          pattern: '^\\d{6}/\\d{4}$'
        }
      }
    ],
    requiredFields: ['fullName', 'birthDate', 'address', 'idNumber', 'beneficiariesSection', 'executorsSection'],
    optionalFields: ['birthPlace', 'nationality', 'guardiansSection', 'specialInstructionsSection'],
    legalRequirements: [
      {
        id: 'witness-requirement',
        type: 'witness',
        description: 'Testament musí byť podpísaný v prítomnosti dvoch svedkov',
        jurisdiction: ['SK'],
        mandatory: true,
        alternativeOptions: ['Notárske overenie']
      },
      {
        id: 'signature-requirement',
        type: 'signature',
        description: 'Testament musí byť podpísaný vlastnoručne',
        jurisdiction: ['SK'],
        mandatory: true
      },
      {
        id: 'date-requirement',
        type: 'date',
        description: 'Testament musí obsahovať dátum a miesto napísania',
        jurisdiction: ['SK'],
        mandatory: true
      }
    ],
    category: 'basic',
    description: 'Základná šablóna testamentu pre slovenské právo. Vhodná pre jednoduché prípady s jasným dedičstvom.',
    isActive: true
  },
  {
    id: 'will-advanced-sk',
    name: 'Pokročilý testament',
    type: 'will',
    jurisdiction: 'SK',
    version: '1.2.0',
    lastUpdated: new Date('2024-02-01'),
    content: `TESTAMENT

Ja, {fullName}, narodený/á {birthDate} v {birthPlace}, štátny občan {nationality}, bytom {address}, rodné číslo {idNumber}, passport č. {passportNumber}, tým týmto vyhlasujem:

1. ZRUŠENIE PREDCHÁDZAJÚCICH TESTAMENTOV
Týmto zrušujem všetky predchádzajúce testamenty, kodicily a iné dispozície pre prípad smrti.

2. MAJETOK A DEDIČSTVO
{assetsSection}

{beneficiariesSection}

3. ŠPECIFICKÉ ODKAZY
{specificBequestsSection}

4. VYKONÁVATELIA TESTAMENTU
{executorsSection}

5. OPATROVNÍCI MALOLETÝCH DETÍ
{guardiansSection}

6. FOND PRE VZDELANIE DETÍ
{educationFundSection}

7. CHARITA A DARY
{charitySection}

8. PODNIKATEĽSKÁ ČINNOSŤ
{businessSuccessionSection}

9. DIGITÁLNY MAJETOK
{digitalAssetsSection}

10. POHREBNÉ POKYNY
{burialInstructionsSection}

11. STAROSTLIVOSŤ O ZVIERATÁ
{petCareSection}

12. OSTATNÉ POKYNY
{additionalInstructionsSection}

13. PODMIENKY A OBMEDZENIA
{conditionsSection}

Toto je môj posledný testament napísaný pri plnom vedomí, bez nátlaku a z vlastnej vôle. Všetky dispozície sú konečné a záväzné.

V prípade nejasností alebo sporov rozhoduje {primaryExecutor} v súlade s týmto testamentom a platným právom.

Miesto a dátum: {place}, {date}

Podpis: ________________________
        {fullName}

OVERENIE
Prítomní svedkovia (minimálne 2):
1. Meno: _________________ Podpis: _________________ Dátum: _________
2. Meno: _________________ Podpis: _________________ Dátum: _________
3. Meno: _________________ Podpis: _________________ Dátum: _________

{notarySection}`,
    placeholders: [
      // Všetky základné polia plus dodatočné
      {
        id: 'passportNumber',
        name: 'passportNumber',
        type: 'text',
        label: 'Číslo pasu',
        description: 'Číslo platného cestovného pasu (voliteľné)',
        required: false
      },
      {
        id: 'assetsSection',
        name: 'assetsSection',
        type: 'textarea',
        label: 'Detailný zoznam majetku',
        description: 'Podrobný zoznam všetkého majetku s hodnotami',
        required: true
      },
      {
        id: 'specificBequestsSection',
        name: 'specificBequestsSection',
        type: 'textarea',
        label: 'Špecifické odkazy',
        description: 'Konkrétne predmety pre konkrétnych ľudí',
        required: false
      },
      {
        id: 'educationFundSection',
        name: 'educationFundSection',
        type: 'textarea',
        label: 'Vzdelávací fond',
        description: 'Ustanovenia pre vzdelanie detí',
        required: false
      },
      {
        id: 'charitySection',
        name: 'charitySection',
        type: 'textarea',
        label: 'Charita a dary',
        description: 'Charitívne dary a organizácie',
        required: false
      },
      {
        id: 'businessSuccessionSection',
        name: 'businessSuccessionSection',
        type: 'textarea',
        label: 'Podnikateľská sukcesia',
        description: 'Pokyny pre podnikateľskú činnosť',
        required: false
      }
    ],
    requiredFields: ['fullName', 'birthDate', 'address', 'idNumber', 'assetsSection', 'beneficiariesSection', 'executorsSection'],
    optionalFields: ['passportNumber', 'specificBequestsSection', 'educationFundSection', 'charitySection', 'businessSuccessionSection', 'digitalAssetsSection', 'burialInstructionsSection', 'petCareSection'],
    legalRequirements: [
      {
        id: 'witness-requirement-advanced',
        type: 'witness',
        description: 'Testament musí byť podpísaný v prítomnosti dvoch svedkov (odporúčané 3)',
        jurisdiction: ['SK'],
        mandatory: true
      },
      {
        id: 'notarization-recommended',
        type: 'notarization',
        description: 'Notárske overenie je odporúčané pre zložitejšie testamenty',
        jurisdiction: ['SK'],
        mandatory: false
      },
      {
        id: 'asset-valuation',
        type: 'format',
        description: 'Majetok by mal byť ocenený kvalifikovaným odhadcom',
        jurisdiction: ['SK'],
        mandatory: false
      }
    ],
    category: 'advanced',
    description: 'Pokročilá šablóna testamentu s rozšírenými možnosťami pre komplexné majetkové situácie, podnikateľov a rodiny s deťmi.',
    isActive: true
  },
  {
    id: 'power-of-attorney-basic-sk',
    name: 'Základná plná moc',
    type: 'power_of_attorney',
    jurisdiction: 'SK',
    version: '1.0.0',
    lastUpdated: new Date('2024-01-20'),
    content: `PLNÁ MOC

Ja, {grantor}, narodený/á {grantorBirthDate}, bytom {grantorAddress}, rodné číslo {grantorIdNumber},

týmto udeľujem plnú moc

{attorney}, narodenej/ému {attorneyBirthDate}, bytom {attorneyAddress}, rodné číslo {attorneyIdNumber},

na vykonávanie nasledovných úkonov v mojom mene a na môj účet:

{powersGranted}

Rozsah plnej moci:
{scopeOfPowers}

Časové obmedzenie:
{timeRestrictions}

Osobitné pokyny:
{specialInstructions}

Táto plná moc je platná od {effectiveDate} {expirationClause}.

{revocationClause}

Miesto a dátum: {place}, {date}

Podpis splnomocniteľa: ________________________
                       {grantor}

{witnessSection}

{notarySection}`,
    placeholders: [
      {
        id: 'grantor',
        name: 'grantor',
        type: 'text',
        label: 'Splnomocniteľ (udeľujúci moc)',
        description: 'Celé meno osoby, ktorá udeľuje plnú moc',
        required: true
      },
      {
        id: 'attorney',
        name: 'attorney',
        type: 'text',
        label: 'Splnomocnenec (oprávnený)',
        description: 'Celé meno osoby, ktorá dostáva plnú moc',
        required: true
      },
      {
        id: 'powersGranted',
        name: 'powersGranted',
        type: 'textarea',
        label: 'Udelené právomoci',
        description: 'Zoznam konkrétnych úkonov, ktoré môže splnomocnenec vykonávať',
        required: true
      },
      {
        id: 'scopeOfPowers',
        name: 'scopeOfPowers',
        type: 'select',
        label: 'Rozsah plnej moci',
        description: 'Všeobecný alebo obmedzený rozsah',
        required: true,
        validation: {
          options: ['Všeobecná plná moc', 'Obmedzená plná moc', 'Špeciálna plná moc']
        }
      },
      {
        id: 'timeRestrictions',
        name: 'timeRestrictions',
        type: 'text',
        label: 'Časové obmedzenie',
        description: 'Doba platnosti plnej moci',
        required: false,
        defaultValue: 'Bez časového obmedzenia'
      }
    ],
    requiredFields: ['grantor', 'attorney', 'powersGranted', 'scopeOfPowers'],
    optionalFields: ['timeRestrictions', 'specialInstructions', 'revocationClause'],
    legalRequirements: [
      {
        id: 'notary-power-attorney',
        type: 'notarization',
        description: 'Plná moc musí byť notársky overená',
        jurisdiction: ['SK'],
        mandatory: true
      },
      {
        id: 'signature-power-attorney',
        type: 'signature',
        description: 'Podpis splnomocniteľa musí byť vlastnoručný',
        jurisdiction: ['SK'],
        mandatory: true
      }
    ],
    category: 'basic',
    description: 'Základná šablóna plnej moci pre bežné právne úkony. Vyžaduje notárske overenie.',
    isActive: true
  },
  {
    id: 'living-will-sk',
    name: 'Životná vôľa',
    type: 'living_will',
    jurisdiction: 'SK',
    version: '1.0.0',
    lastUpdated: new Date('2024-01-25'),
    content: `ŽIVOTNÁ VÔĽA
(Advance Healthcare Directive)

Ja, {fullName}, narodený/á {birthDate}, bytom {address}, rodné číslo {idNumber}, týmto vyhlasujem svoju vôľu pre prípad, že sa stanem neschopný/á rozhodovať o svojej zdravotnej starostlivosti:

1. VŠEOBECNÉ ZÁSADY
{generalPrinciples}

2. ŽIVOT ZACHRAŇUJÚCA LIEČBA
{lifeSustainingSreatment}

3. LIEČBA BOLESTI
{painManagement}

4. UMELÁ VÝŽIVA A HYDRATÁCIA
{artificialNutrition}

5. RESUSCITÁCIA
{resuscitation}

6. DAROVANIE ORGÁNOV
{organDonation}

7. SPLNOMOCNENÉ OSOBY PRE ZDRAVOTNÉ ROZHODNUTIA
{healthcareProxy}

8. ALTERNATÍVNI ROZHODCOVIA
{alternateDecisionMakers}

9. ŠPECIFICKÉ POKYNY
{specificInstructions}

10. DUCHOVNÁ STAROSTLIVOSŤ
{spiritualCare}

Toto vyhlásenie reprezentuje moje premyslené rozhodnutie a želania. Prosím, aby boli rešpektované.

{effectiveClause}

Miesto a dátum: {place}, {date}

Podpis: ________________________
        {fullName}

SVEDKOVIA:
1. Meno: _________________ Podpis: _________________ Dátum: _________
2. Meno: _________________ Podpis: _________________ Dátum: _________

{notarySection}`,
    placeholders: [
      {
        id: 'generalPrinciples',
        name: 'generalPrinciples',
        type: 'textarea',
        label: 'Všeobecné zásady',
        description: 'Vaše celkové hodnoty a prístupy k zdravotnej starostlivosti',
        required: true
      },
      {
        id: 'lifeSustainingSreatment',
        name: 'lifeSustainingSreatment',
        type: 'select',
        label: 'Život zachraňujúca liečba',
        description: 'Vaše želania ohľadom život zachraňujúcich zákrokov',
        required: true,
        validation: {
          options: [
            'Chcem všetku možnú život zachraňujúcu liečbu',
            'Chcem život zachraňujúcu liečbu len ak existuje nádej na zmysluplné zotavenie',
            'Nechcem život zachraňujúcu liečbu ak budem v vegetatívnom stave',
            'Nechcem žiadnu život zachraňujúcu liečbu'
          ]
        }
      },
      {
        id: 'organDonation',
        name: 'organDonation',
        type: 'select',
        label: 'Darovanie orgánov',
        description: 'Vaše rozhodnutie o darovaní orgánov',
        required: true,
        validation: {
          options: [
            'Chcem darovať všetky použiteľné orgány a tkanivá',
            'Chcem darovať len špecifické orgány (špecifikovať v pokynoch)',
            'Nechcem darovať žiadne orgány',
            'Nechávam rozhodnutie na rodine'
          ]
        }
      }
    ],
    requiredFields: ['fullName', 'birthDate', 'address', 'generalPrinciples', 'lifeSustainingSreatment', 'organDonation'],
    optionalFields: ['painManagement', 'artificialNutrition', 'resuscitation', 'specificInstructions', 'spiritualCare'],
    legalRequirements: [
      {
        id: 'witness-living-will',
        type: 'witness',
        description: 'Životná vôľa musí byť podpísaná v prítomnosti dvoch svedkov',
        jurisdiction: ['SK'],
        mandatory: true
      },
      {
        id: 'medical-consultation',
        type: 'format',
        description: 'Odporúča sa konzultácia s lekárom pred podpísaním',
        jurisdiction: ['SK'],
        mandatory: false
      }
    ],
    category: 'basic',
    description: 'Šablóna životnej vôle pre vyjadrenie želaní ohľadom zdravotnej starostlivosti v prípade neschopnosti rozhodovať.',
    isActive: true
  }
]

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      // Initial state
      templates: initialTemplates,
      selectedTemplate: null,
      isLoading: false,
      searchTerm: '',
      filters: {
        jurisdiction: 'all',
        type: 'all',
        category: 'all'
      },
      validationResults: {},

      // Actions
      loadTemplates: async () => {
        set({ isLoading: true })

        try {
          // TODO: Load from API/database
          // For now, use initial templates
          await new Promise(resolve => setTimeout(resolve, 500)) // Simulate loading

          set({
            templates: initialTemplates,
            isLoading: false
          })
        } catch (error) {
          console.error('Error loading templates:', error)
          set({ isLoading: false })
        }
      },

      selectTemplate: (templateId) => {
        const template = get().templates.find(t => t.id === templateId)
        set({ selectedTemplate: template || null })
      },

      updateTemplate: (templateId, updates) => {
        set((state) => ({
          templates: state.templates.map(template =>
            template.id === templateId
              ? { ...template, ...updates, lastUpdated: new Date() }
              : template
          ),
          selectedTemplate: state.selectedTemplate?.id === templateId
            ? { ...state.selectedTemplate, ...updates, lastUpdated: new Date() }
            : state.selectedTemplate
        }))
      },

      validateTemplate: async (templateId) => {
        const template = get().templates.find(t => t.id === templateId)
        if (!template) return false

        const errors: ValidationError[] = []
        const warnings: ValidationWarning[] = []

        // Validate template content
        if (!template.content.trim()) {
          errors.push({
            type: 'format',
            message: 'Šablóna nemôže byť prázdna',
            severity: 'error'
          })
        }

        // Check for required placeholders
        template.placeholders.filter(p => p.required).forEach(placeholder => {
          if (!template.content.includes(`{${placeholder.name}}`)) {
            errors.push({
              type: 'placeholder',
              message: `Chýba povinný placeholder: {${placeholder.name}}`,
              severity: 'error'
            })
          }
        })

        // Check for orphaned placeholders
        const placeholderPattern = /\{([^}]+)\}/g
        const matches = template.content.matchAll(placeholderPattern)
        for (const match of matches) {
          const placeholderName = match[1]
          if (!template.placeholders.find(p => p.name === placeholderName)) {
            warnings.push({
              type: 'suggestion',
              message: `Nedefinovaný placeholder: {${placeholderName}}`,
              recommendation: 'Pridaj definíciu placeholder alebo ho odstráň zo šablóny'
            })
          }
        }

        // Validate legal requirements based on jurisdiction
        if (template.jurisdiction === 'SK') {
          if (template.type === 'will' && !template.legalRequirements.find(r => r.type === 'witness')) {
            warnings.push({
              type: 'compatibility',
              message: 'Testament na Slovensku zvyčajne vyžaduje svedkov',
              recommendation: 'Pridaj požiadavku na svedkov alebo notárske overenie'
            })
          }
        }

        // Calculate validation score
        const totalChecks = 10
        const errorPenalty = errors.filter(e => e.severity === 'error').length * 2
        const warningPenalty = warnings.length * 0.5
        const score = Math.max(0, Math.min(100, ((totalChecks - errorPenalty - warningPenalty) / totalChecks) * 100))

        const result: ValidationResult = {
          isValid: errors.filter(e => e.severity === 'error').length === 0,
          errors,
          warnings,
          score: Math.round(score)
        }

        set((state) => ({
          validationResults: {
            ...state.validationResults,
            [templateId]: result
          }
        }))

        return result.isValid
      },

      exportTemplate: async (templateId, format) => {
        const template = get().templates.find(t => t.id === templateId)
        if (!template) throw new Error('Template not found')

        // TODO: Implement export functionality
        console.log(`Exporting template ${template.name} as ${format}`)
      },

      searchTemplates: (term) => {
        set({ searchTerm: term })
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }))
      },

      duplicateTemplate: async (templateId, newName) => {
        const template = get().templates.find(t => t.id === templateId)
        if (!template) throw new Error('Template not found')

        const newTemplate: LegalTemplate = {
          ...template,
          id: `${templateId}-copy-${Date.now()}`,
          name: newName,
          version: '1.0.0',
          lastUpdated: new Date()
        }

        set((state) => ({
          templates: [...state.templates, newTemplate]
        }))

        return newTemplate.id
      },

      createTemplate: async (templateData) => {
        const newTemplate: LegalTemplate = {
          ...templateData,
          id: `template-${Date.now()}`,
          lastUpdated: new Date()
        }

        set((state) => ({
          templates: [...state.templates, newTemplate]
        }))

        return newTemplate.id
      }
    }),
    {
      name: 'template-store',
      partialize: (state) => ({
        templates: state.templates,
        filters: state.filters,
        searchTerm: state.searchTerm
      })
    }
  )
)