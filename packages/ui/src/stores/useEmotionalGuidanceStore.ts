import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WritingPrompt, EmotionalTemplate } from '../components/timecapsule/EmotionalGuidance'

interface GuidanceSession {
  id: string
  messageId: string
  promptUsed?: string
  templateUsed?: string
  sessionType: 'prompt_selection' | 'template_application' | 'personalized_suggestion'
  timestamp: Date
  userFeedback?: 'helpful' | 'neutral' | 'not_helpful'
}

interface EmotionalGuidanceStore {
  // State
  prompts: WritingPrompt[]
  templates: EmotionalTemplate[]
  guidanceHistory: GuidanceSession[]
  isLoading: boolean

  // Actions
  loadPrompts: () => Promise<void>
  getPromptsForContext: (context: {
    category: string
    emotionalTone: string
    recipientCount: number
    hasMedia: boolean
  }) => WritingPrompt[]
  generatePersonalizedPrompt: (context: {
    currentContent: string
    emotionalTone: string
    category: string
    recipientRelationships: string[]
    userHistory: GuidanceSession[]
  }) => Promise<string>
  saveGuidanceSession: (session: Omit<GuidanceSession, 'id'>) => Promise<void>
  provideFeedback: (sessionId: string, feedback: 'helpful' | 'neutral' | 'not_helpful') => void
}

// Pre-defined writing prompts
const defaultPrompts: WritingPrompt[] = [
  {
    id: 'loving-family-memories',
    category: 'family',
    emotionalTone: 'loving',
    title: 'Vzácne rodinné spomienky',
    prompt: 'Napíš o konkrétnom momente, keď si sa cítil/a najšťastnejší/šia so svojou rodinou. Opíš, čo sa stalo, ako si sa cítil/a a prečo ti táto chvíľa zostala v srdci.',
    followUpQuestions: [
      'Kde sa to stalo a kedy?',
      'Kto všetko tam bol?',
      'Čo robilo túto chvíľu výnimočnou?',
      'Ako sa zmenil tvoj život vďaka tejto rodine?'
    ],
    examples: [
      'Pamätám si, ako sme sedeli všetci okolo vianočného stromčeka...',
      'Najkrajší moment bol, keď som videl/a tvoju tvár, keď...'
    ],
    tips: [
      'Buď konkrétny - spomienky žijú v detailoch',
      'Opíš nielen čo sa stalo, ale aj ako si sa cítil/a',
      'Vyjadrí vďačnosť za spoločné chvíle'
    ],
    targetLength: 'medium',
    difficulty: 'beginner'
  },
  {
    id: 'encouraging-children-future',
    category: 'children',
    emotionalTone: 'encouraging',
    title: 'Povzbudenie pre budúcnosť',
    prompt: 'Napíš svojmu dieťaťu, aké vlastnosti v ňom/nej obdivuješ a ako veríš, že sa s nimi vyrovná s budúcimi výzvami. Zdieľaj svoju vieru v jeho/jej schopnosti.',
    followUpQuestions: [
      'Aké sú jeho/jej najsilnejšie stránky?',
      'V čom je výnimočný/á?',
      'Aké sny má pre svoju budúcnosť?',
      'Čo by si mu/jej chcel/a odovzdať do života?'
    ],
    examples: [
      'Viem, že v tebe je obrovská sila a múdrosť...',
      'Keď sa na teba pozerám, vidím niekoho, kto dokáže...'
    ],
    tips: [
      'Zameraj sa na jeho/jej jedinečné dary',
      'Spomeň konkrétne situácie, kde preukázal/a silu',
      'Vyjadri bezpodmienečnú lásku a podporu'
    ],
    targetLength: 'medium',
    difficulty: 'beginner'
  },
  {
    id: 'celebratory-achievement',
    category: 'personal',
    emotionalTone: 'celebratory',
    title: 'Oslavujeme úspech',
    prompt: 'Opíš moment, keď si dosiahol/la niečo dôležité. Oslav svoj úspech a povzbuď seba budúceho, aby pokračoval/a v nasledovaní svojich snov.',
    followUpQuestions: [
      'Aký bol tvoj najväčší úspech?',
      'Čo ti pomohlo ho dosiahnuť?',
      'Ako si sa cítil/a v tom momente?',
      'Čo by si odkázal/a svojej budúcej verzii?'
    ],
    examples: [
      'Keď som dosiahol/la tento cieľ, uvedomil/a som si...',
      'Chcem, aby si vedel/a, aký/á si úžasný/á...'
    ],
    tips: [
      'Neskromne oslav svoje úspechy',
      'Spomeň ľudí, ktorí ti pomohli',
      'Vyjadrí vďačnosť za túto príležitosť'
    ],
    targetLength: 'short',
    difficulty: 'beginner'
  },
  {
    id: 'reflective-life-wisdom',
    category: 'personal',
    emotionalTone: 'reflective',
    title: 'Životná múdrosť',
    prompt: 'Zamysli sa nad najdôležitejšími lekciami, ktoré si sa naučil/a v živote. Zdieľaj túto múdrosť s niekým, komu na tom záleží.',
    followUpQuestions: [
      'Aké boli tvoje najväčšie životné lekcie?',
      'Čo by si robil/a inak, keby si mohl/a?',
      'Aké rady by si dal/a svojmu mladšiemu ja?',
      'Čo je v živote skutočne dôležité?'
    ],
    examples: [
      'Naučil/a som sa, že najdôležitejšie v živote je...',
      'Keby som mohol/a hovoriť so svojím mladším ja, povedal/a by som...'
    ],
    tips: [
      'Buď úprimný/á o svojich chybách aj úspechoch',
      'Zdieľaj praktické rady',
      'Hovor z vlastnej skúsenosti'
    ],
    targetLength: 'long',
    difficulty: 'intermediate'
  },
  {
    id: 'instructional-important-values',
    category: 'family',
    emotionalTone: 'instructional',
    title: 'Dôležité hodnoty',
    prompt: 'Opíš hodnoty a princípy, ktoré sú pre teba najdôležitejšie. Vysvetli, prečo sú podstatné a ako ich môže druhý človek aplikovať vo svojom živote.',
    followUpQuestions: [
      'Aké sú tvoje základné životné hodnoty?',
      'Odkiaľ sa u teba vzali tieto presvedčenia?',
      'Ako tieto hodnoty ovplyvnili tvoje rozhodnutia?',
      'Prečo sú dôležité pre budúce generácie?'
    ],
    examples: [
      'Jedna z najdôležitejších hodnôt pre mňa je...',
      'Naučil/a som sa, že úprimnosť znamená...'
    ],
    tips: [
      'Používaj konkrétne príklady',
      'Vysvetli "prečo", nie len "čo"',
      'Spomeň, ako sa tieto hodnoty prejavili v tvojom živote'
    ],
    targetLength: 'long',
    difficulty: 'intermediate'
  },
  {
    id: 'loving-spouse-appreciation',
    category: 'spouse',
    emotionalTone: 'loving',
    title: 'Vyznanie lásky',
    prompt: 'Napíš svojmu partnerovi/partnerk o tom, čo na ňom/nej miluješ najviac. Opíš, ako obohatil/a tvoj život a ako spolu budujete svoju budúcnosť.',
    followUpQuestions: [
      'Čo ťa na ňom/nej prvýkrát zaujalo?',
      'Aké sú jeho/jej najkrajšie vlastnosti?',
      'Aké spoločné sny máte?',
      'Ako ti zmenil/a pohľad na svet?'
    ],
    examples: [
      'Milujem ťa pre tvoju...',
      'Každý deň s tebou je...'
    ],
    tips: [
      'Buď konkrétny v komplimentoch',
      'Spomeň malé každodenné veci, ktoré oceňuješ',
      'Vyjadri vďačnosť za váš spoločný život'
    ],
    targetLength: 'medium',
    difficulty: 'beginner'
  }
]

// Pre-defined emotional templates
const defaultTemplates: EmotionalTemplate[] = [
  {
    id: 'loving-letter-template',
    name: 'Láskavý list',
    description: 'Štruktúrovaná šablóna pre vyjadrenie lásky a vďačnosti',
    structure: [
      {
        id: 'opening',
        title: 'Úvod',
        description: 'Osobný pozdrav a dôvod písania',
        placeholder: 'Môj drahý/Moja drahá...\nPíšem ti tento list, pretože...',
        required: true,
        examples: ['Môj najdrahší syn/dcéra...', 'Milovaná manželka/manžel...']
      },
      {
        id: 'memory',
        title: 'Spoločná spomienka',
        description: 'Konkrétny moment, ktorý si ceníš',
        placeholder: 'Pamätám si, ako...\nTáto chvíľa bola pre mňa výnimočná, pretože...',
        required: true,
        examples: ['Nikdy nezabudnem na ten deň, keď...', 'Jedna z mojich najkrajších spomienok je...']
      },
      {
        id: 'appreciation',
        title: 'Ocenenie',
        description: 'Čo oceňuješ na tejto osobe',
        placeholder: 'Obdivujem ťa za...\nTvoja schopnosť... ma vždy ohromuje.',
        required: true,
        examples: ['Tvoja dobrota a láskavosť...', 'Spôsob, akým sa staráš o druhých...']
      },
      {
        id: 'wishes',
        title: 'Želania do budúcnosti',
        description: 'Čo by si mu/jej prial/a do života',
        placeholder: 'Želám ti...\nNech tvoj život...',
        required: false,
        examples: ['Želám ti veľa šťastia a zdravia...', 'Nech sa ti splnia všetky sny...']
      },
      {
        id: 'closing',
        title: 'Záver',
        description: 'Záverečné slová lásky',
        placeholder: 'S láskou,\n[Tvoje meno]',
        required: true,
        examples: ['Navždy tvoja mama', 'S nekonečnou láskou, tvoj otec']
      }
    ],
    emotionalElements: ['spomienky', 'vďačnosť', 'láska', 'hrdosť', 'nádej'],
    suggestedLength: 400,
    category: 'family'
  },
  {
    id: 'encouragement-template',
    name: 'Povzbudzujúca správa',
    description: 'Šablóna pre motivujúce a podporné správy',
    structure: [
      {
        id: 'recognition',
        title: 'Uznanie',
        description: 'Uzná jeho/jej úspechy a silné stránky',
        placeholder: 'Chcem, aby si vedel/a, aký/á si...\nTvoje schopnosti v...',
        required: true,
        examples: ['Si neuveriteľne talentovaný/á...', 'Vždy som obdivoval/a tvoju...']
      },
      {
        id: 'challenges',
        title: 'Výzvy',
        description: 'Povzbudenie pri výzvach',
        placeholder: 'Viem, že niekedy môže byť ťažké...\nAle ver mi, že máš v sebe silu...',
        required: true,
        examples: ['Keď sa cítiš neisto...', 'V ťažkých chvíľach si spomeň...']
      },
      {
        id: 'belief',
        title: 'Viera v neho/ňu',
        description: 'Vyjadrenie viery v jeho/jej schopnosti',
        placeholder: 'Verím, že dokážeš...\nTvoja budúcnosť je...',
        required: true,
        examples: ['Nemám žiadne pochybnosti o tom, že...', 'Viem, že dokážeš všetko, čo si zadumáš...']
      },
      {
        id: 'support',
        title: 'Podpora',
        description: 'Uistenie o tvojej podpore',
        placeholder: 'Vždy budem tu pre teba...\nNikdy nie si sám/sama...',
        required: false,
        examples: ['Bez ohľadu na to, čo sa stane...', 'Vždy môžeš počítať s mojou podporou...']
      }
    ],
    emotionalElements: ['podpora', 'motivácia', 'sebavedomie', 'sila', 'budúcnosť'],
    suggestedLength: 300,
    category: 'children'
  },
  {
    id: 'wisdom-sharing-template',
    name: 'Zdieľanie múdrosti',
    description: 'Šablóna pre odovzdanie životných lekcií a rád',
    structure: [
      {
        id: 'context',
        title: 'Kontext',
        description: 'Prečo zdieľaš túto múdrosť',
        placeholder: 'Po rokoch života som sa naučil/a...\nChcem sa s tebou podeliť o...',
        required: true,
        examples: ['Nadobudol/a som nejaké skúsenosti, ktoré...', 'Život ma naučil...']
      },
      {
        id: 'lesson',
        title: 'Hlavná lekcia',
        description: 'Najdôležitejšia lekcia alebo rada',
        placeholder: 'Najdôležitejšie, čo som sa naučil/a je...\nTáto lekcia zmenila môj pohľad na...',
        required: true,
        examples: ['Zistil/a som, že v živote je najpodstatnejšie...', 'Jedna vec, ktorú by si mal/a vedieť...']
      },
      {
        id: 'application',
        title: 'Praktické použitie',
        description: 'Ako túto múdrosť aplikovať',
        placeholder: 'Môžeš to použiť tak, že...\nKeď sa ocitnešs v situácii...',
        required: true,
        examples: ['V praxi to znamená...', 'Konkrétne ti odporúčam...']
      },
      {
        id: 'legacy',
        title: 'Odkaz',
        description: 'Čo chceš, aby si pamätali',
        placeholder: 'Chcem, aby si si zapamätal/a...\nMoj odkaz pre teba je...',
        required: false,
        examples: ['Nikdy nezabudni na to, že...', 'Naj ťa sprevádza myšlienka, že...']
      }
    ],
    emotionalElements: ['múdrosť', 'skúsenosť', 'rady', 'dedičstvo', 'vedenie'],
    suggestedLength: 500,
    category: 'personal'
  }
]

export const useEmotionalGuidanceStore = create<EmotionalGuidanceStore>()(
  persist(
    (set, get) => ({
      // Initial state
      prompts: defaultPrompts,
      templates: defaultTemplates,
      guidanceHistory: [],
      isLoading: false,

      // Actions
      loadPrompts: async () => {
        set({ isLoading: true })

        try {
          // TODO: Load from API/database
          // For now, use default prompts
          await new Promise(resolve => setTimeout(resolve, 500))

          set({
            prompts: defaultPrompts,
            templates: defaultTemplates,
            isLoading: false
          })
        } catch (error) {
          console.error('Error loading prompts:', error)
          set({ isLoading: false })
        }
      },

      getPromptsForContext: (context) => {
        const { prompts } = get()

        return prompts.filter(prompt => {
          // Match category
          if (prompt.category !== context.category && prompt.category !== 'personal') {
            return false
          }

          // Match emotional tone
          if (prompt.emotionalTone !== context.emotionalTone) {
            return false
          }

          // Additional filtering based on context
          if (context.recipientCount > 1 && prompt.category === 'spouse') {
            return false // Don't suggest spouse-specific prompts for multiple recipients
          }

          return true
        }).sort((a, b) => {
          // Prioritize beginner prompts for new users
          if (a.difficulty === 'beginner' && b.difficulty !== 'beginner') return -1
          if (b.difficulty === 'beginner' && a.difficulty !== 'beginner') return 1
          return 0
        })
      },

      generatePersonalizedPrompt: async (context) => {
        try {
          // Analyze user's writing style and history
          const { guidanceHistory } = get()

          // Simple AI-like prompt generation based on context
          let personalizedPrompt = ''

          if (context.currentContent.length < 50) {
            personalizedPrompt = 'Vidím, že ešte len začínaš písať. '
          } else if (context.currentContent.length > 300) {
            personalizedPrompt = 'Krásne ti to ide! Máš už solídny základ. '
          } else {
            personalizedPrompt = 'Dobre sa rozbiehaš! '
          }

          // Add tone-specific guidance
          switch (context.emotionalTone) {
            case 'loving':
              personalizedPrompt += 'Pre láskavý tón skús pridať konkrétne spomienky na spoločné chvíle a vyjadruj vďačnosť za to, čo táto osoba pre teba znamená.'
              break
            case 'encouraging':
              personalizedPrompt += 'Pri povzbudzovaní zameraj sa na konkrétne silné stránky tej osoby a spomeni situácie, kde preukázala odvahu či talent.'
              break
            case 'celebratory':
              personalizedPrompt += 'Pri oslavovaní nešetri chválou! Opíš, aký úspech dosiahla a ako si na ňu/neho hrdý/á.'
              break
            case 'reflective':
              personalizedPrompt += 'Pri zamýšľaní sa zdieľaj životné lekcie a múdrosť z vlastnej skúsenosti. Buď úprimný/á o svojich pochybnostiach aj istotách.'
              break
            case 'instructional':
              personalizedPrompt += 'Pri poučovaní používaj konkrétne príklady a praktické rady. Vysvetli nielen "čo", ale aj "prečo" a "ako".'
              break
          }

          // Add relationship-specific advice
          if (context.recipientRelationships.includes('syn') || context.recipientRelationships.includes('dcéra')) {
            personalizedPrompt += ' Nezabudni spomenúť, aký/á je výnimočný/á a ako veríš v jeho/jej budúcnosť.'
          }

          if (context.recipientRelationships.includes('manžel') || context.recipientRelationships.includes('manželka')) {
            personalizedPrompt += ' Vyjadrí vďačnosť za spoločný život a pripomeň si najkrajšie momenty vášho vzťahu.'
          }

          // Add tips based on history
          const recentSessions = guidanceHistory.slice(-5)
          if (recentSessions.length > 0) {
            const mostUsedCategory = getMostFrequentCategory(recentSessions)
            if (mostUsedCategory !== context.category) {
              personalizedPrompt += ` Vidím, že zvyčajne píšeš pre ${mostUsedCategory}, ale teraz sa zameraváš na ${context.category}. To je skvelé rozšírenie!`
            }
          }

          return personalizedPrompt
        } catch (error) {
          console.error('Error generating personalized prompt:', error)
          return 'Píš z lásky a úprimnosti. Každé slovo z tvojho srdca bude pre príjemcu vzácne. ✨'
        }
      },

      saveGuidanceSession: async (sessionData) => {
        const newSession: GuidanceSession = {
          ...sessionData,
          id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }

        set((state) => ({
          guidanceHistory: [...state.guidanceHistory, newSession]
        }))
      },

      provideFeedback: (sessionId, feedback) => {
        set((state) => ({
          guidanceHistory: state.guidanceHistory.map(session =>
            session.id === sessionId
              ? { ...session, userFeedback: feedback }
              : session
          )
        }))
      }
    }),
    {
      name: 'emotional-guidance-store',
      partialize: (state) => ({
        guidanceHistory: state.guidanceHistory
      })
    }
  )
)

// Helper functions
function getMostFrequentCategory(sessions: GuidanceSession[]): string {
  const categoryCount: Record<string, number> = {}

  sessions.forEach(session => {
    // TODO: Extract category from prompt/template used
    // For now, return a default
  })

  const mostFrequent = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]
  return mostFrequent?.[0] || 'family'
}