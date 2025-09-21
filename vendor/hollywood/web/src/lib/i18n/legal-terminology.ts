
/**
 * Legal Terminology System for LegacyGuard
 * Handles jurisdiction-specific legal terms and translations
 */

// import { JURISDICTION_CONFIG } from './jurisdictions';

// Legal term categories
export enum LegalTermCategory {
  DOCUMENTS = 'documents',
  PROCEDURES = 'procedures',
  TAX = 'tax',
  NOTARY = 'notary',
  INHERITANCE = 'inheritance',
  CAPACITY = 'capacity',
  FAMILY = 'family',
  PROPERTY = 'property',
}

// Legal term interface
export interface LegalTerm {
  category: LegalTermCategory;
  jurisdictions: {
    [jurisdictionCode: string]: {
      definition?: string;
      legalReference?: string;
      relatedTerms?: string[];
      term: string;
    };
  };
  key: string;
}

// Core legal terms database
export const LEGAL_TERMS_DATABASE: LegalTerm[] = [
  // Document types
  {
    key: 'will',
    category: LegalTermCategory.DOCUMENTS,
    jurisdictions: {
      CZ: {
        term: 'závěť',
        definition: 'Právní dokument vyjadřující poslední vůli zůstavitele',
        legalReference: 'Občanský zákoník § 1494',
      },
      SK: {
        term: 'závet',
        definition: 'Právny dokument vyjadrujúci poslednú vôľu poručiteľa',
        legalReference: 'Občiansky zákonník § 1621',
      },
      DE: {
        term: 'Testament',
        definition: 'Letztwillige Verfügung einer Person',
        legalReference: 'BGB § 1937',
      },
      FR: {
        term: 'testament',
        definition: 'Acte par lequel une personne dispose de ses biens',
        legalReference: 'Code civil Article 895',
      },
      PL: {
        term: 'testament',
        definition: 'Dokument wyrażający ostatnią wolę spadkodawcy',
        legalReference: 'Kodeks cywilny Art. 941',
      },
      // Add more jurisdictions...
    },
  },
  {
    key: 'power_of_attorney',
    category: LegalTermCategory.DOCUMENTS,
    jurisdictions: {
      CZ: {
        term: 'plná moc',
        definition: 'Zmocnění k zastupování',
        relatedTerms: ['zmocněnec', 'zmocnitel'],
      },
      SK: {
        term: 'splnomocnenie',
        definition: 'Oprávnenie na zastupovanie',
        relatedTerms: ['splnomocnenec', 'splnomocniteľ'],
      },
      DE: {
        term: 'Vollmacht',
        definition: 'Bevollmächtigung zur Vertretung',
        relatedTerms: ['Bevollmächtigter', 'Vollmachtgeber'],
      },
      FR: {
        term: 'procuration',
        definition: 'Mandat de représentation',
        relatedTerms: ['mandataire', 'mandant'],
      },
      PL: {
        term: 'pełnomocnictwo',
        definition: 'Upoważnienie do reprezentowania',
        relatedTerms: ['pełnomocnik', 'mocodawca'],
      },
    },
  },
  {
    key: 'advance_directive',
    category: LegalTermCategory.DOCUMENTS,
    jurisdictions: {
      CZ: {
        term: 'dříve vyslovené přání',
        definition: 'Prohlášení o zdravotní péči pro případ nezpůsobilosti',
      },
      SK: {
        term: 'predchádzajúce súhlasy',
        definition: 'Vyhlásenie o zdravotnej starostlivosti',
      },
      DE: {
        term: 'Patientenverfügung',
        definition: 'Vorausverfügung für medizinische Behandlung',
      },
      FR: {
        term: 'directives anticipées',
        definition: 'Volontés concernant les soins médicaux',
      },
      PL: {
        term: 'oświadczenie woli dotyczące leczenia',
        definition: 'Deklaracja dotycząca leczenia medycznego',
      },
    },
  },

  // Tax terms
  {
    key: 'inheritance_tax',
    category: LegalTermCategory.TAX,
    jurisdictions: {
      CZ: {
        term: 'daň z nabytí nemovitých věcí',
        definition: 'Daň při převodu nemovitosti děděním',
        legalReference: 'Zákonné opatření Senátu č. 340/2013 Sb.',
      },
      SK: {
        term: 'daň z dedičstva',
        definition: 'Daň pri nadobudnutí majetku dedením',
      },
      DE: {
        term: 'Erbschaftsteuer',
        definition: 'Steuer auf ererbtes Vermögen',
        legalReference: 'ErbStG',
      },
      FR: {
        term: 'droits de succession',
        definition: 'Impôt sur les biens transmis par succession',
        legalReference: 'CGI Article 777',
      },
      PL: {
        term: 'podatek od spadków i darowizn',
        definition: 'Podatek od nabytego majątku',
        legalReference: 'Ustawa o podatku od spadków i darowizn',
      },
    },
  },

  // Inheritance terms
  {
    key: 'heir',
    category: LegalTermCategory.INHERITANCE,
    jurisdictions: {
      CZ: {
        term: 'dědic',
        definition: 'Osoba dědící majetek po zůstaviteli',
        relatedTerms: ['zákonný dědic', 'závětní dědic'],
      },
      SK: {
        term: 'dedič',
        definition: 'Osoba dediaca majetok po poručiteľovi',
        relatedTerms: ['zákonný dedič', 'závetný dedič'],
      },
      DE: {
        term: 'Erbe',
        definition: 'Person, die das Vermögen erbt',
        relatedTerms: ['gesetzlicher Erbe', 'testamentarischer Erbe'],
      },
      FR: {
        term: 'héritier',
        definition: 'Personne qui hérite des biens',
        relatedTerms: ['héritier légal', 'légataire'],
      },
      PL: {
        term: 'spadkobierca',
        definition: 'Osoba dziedzicząca majątek',
        relatedTerms: ['spadkobierca ustawowy', 'spadkobierca testamentowy'],
      },
    },
  },
  {
    key: 'testator',
    category: LegalTermCategory.INHERITANCE,
    jurisdictions: {
      CZ: {
        term: 'zůstavitel',
        definition: 'Osoba zanechávající dědictví',
      },
      SK: {
        term: 'poručiteľ',
        definition: 'Osoba zanechávajúca dedičstvo',
      },
      DE: {
        term: 'Erblasser',
        definition: 'Person, die eine Erbschaft hinterlässt',
      },
      FR: {
        term: 'testateur',
        definition: 'Personne qui fait un testament',
      },
      PL: {
        term: 'spadkodawca',
        definition: 'Osoba pozostawiająca spadek',
      },
    },
  },
  {
    key: 'executor',
    category: LegalTermCategory.INHERITANCE,
    jurisdictions: {
      CZ: {
        term: 'vykonavatel závěti',
        definition: 'Osoba pověřená vykonáním závěti',
      },
      SK: {
        term: 'vykonávateľ závetu',
        definition: 'Osoba poverená vykonaním závetu',
      },
      DE: {
        term: 'Testamentsvollstrecker',
        definition: 'Person zur Durchführung des Testaments',
      },
      FR: {
        term: 'exécuteur testamentaire',
        definition: "Personne chargée d'exécuter le testament",
      },
      PL: {
        term: 'wykonawca testamentu',
        definition: 'Osoba wykonująca testament',
      },
    },
  },

  // Notary terms
  {
    key: 'notary',
    category: LegalTermCategory.NOTARY,
    jurisdictions: {
      CZ: {
        term: 'notář',
        definition: 'Osoba oprávněná sepisovat veřejné listiny',
        legalReference: 'Notářský řád',
      },
      SK: {
        term: 'notár',
        definition: 'Osoba oprávnená spísať verejné listiny',
        legalReference: 'Notársky poriadok',
      },
      DE: {
        term: 'Notar',
        definition: 'Öffentlicher Urkundsperson',
        legalReference: 'BNotO',
      },
      FR: {
        term: 'notaire',
        definition: 'Officier public',
        legalReference: 'Ordonnance du 2 novembre 1945',
      },
      PL: {
        term: 'notariusz',
        definition: 'Osoba sporządzająca akty notarialne',
        legalReference: 'Prawo o notariacie',
      },
    },
  },
  {
    key: 'notarial_deed',
    category: LegalTermCategory.NOTARY,
    jurisdictions: {
      CZ: {
        term: 'notářský zápis',
        definition: 'Veřejná listina sepsaná notářem',
      },
      SK: {
        term: 'notárska zápisnica',
        definition: 'Verejná listina spísaná notárom',
      },
      DE: {
        term: 'notarielle Urkunde',
        definition: 'Vom Notar errichtete Urkunde',
      },
      FR: {
        term: 'acte notarié',
        definition: 'Acte authentique établi par un notaire',
      },
      PL: {
        term: 'akt notarialny',
        definition: 'Dokument sporządzony przez notariusza',
      },
    },
  },

  // Family law terms
  {
    key: 'guardian',
    category: LegalTermCategory.FAMILY,
    jurisdictions: {
      CZ: {
        term: 'opatrovník',
        definition: 'Osoba pečující o nezletilé nebo nesvéprávné',
      },
      SK: {
        term: 'opatrovník',
        definition: 'Osoba starajúca sa o maloletých alebo nespôsobilých',
      },
      DE: {
        term: 'Vormund',
        definition: 'Gesetzlicher Vertreter',
      },
      FR: {
        term: 'tuteur',
        definition: 'Représentant légal',
      },
      PL: {
        term: 'opiekun',
        definition: 'Przedstawiciel ustawowy',
      },
    },
  },

  // Property terms
  {
    key: 'real_estate',
    category: LegalTermCategory.PROPERTY,
    jurisdictions: {
      CZ: {
        term: 'nemovitost',
        definition: 'Pozemky a stavby spojené se zemí pevným základem',
      },
      SK: {
        term: 'nehnuteľnosť',
        definition: 'Pozemky a stavby spojené so zemou pevným základom',
      },
      DE: {
        term: 'Immobilie',
        definition: 'Grundstücke und Gebäude',
      },
      FR: {
        term: 'bien immobilier',
        definition: 'Terrains et bâtiments',
      },
      PL: {
        term: 'nieruchomość',
        definition: 'Grunty i budynki',
      },
    },
  },
];

// Function to get legal term in specific jurisdiction and language
export const getLegalTerm = (
  termKey: string,
  jurisdictionCode: string,
  _languageCode?: string
): string => {
  const term = LEGAL_TERMS_DATABASE.find(t => t.key === termKey);
  if (!term) return termKey;

  const jurisdictionTerm = term.jurisdictions[jurisdictionCode];
  if (!jurisdictionTerm) {
    // Fallback to English or first available
    return term.jurisdictions['EN']?.term || termKey;
  }

  // TODO: Handle language-specific translations within jurisdiction
  return jurisdictionTerm.term;
};

// Function to get legal definition
export const getLegalDefinition = (
  termKey: string,
  jurisdictionCode: string
): string | undefined => {
  const term = LEGAL_TERMS_DATABASE.find(t => t.key === termKey);
  if (!term) return undefined;

  return term.jurisdictions[jurisdictionCode]?.definition;
};

// Function to get legal reference
export const getLegalReference = (
  termKey: string,
  jurisdictionCode: string
): string | undefined => {
  const term = LEGAL_TERMS_DATABASE.find(t => t.key === termKey);
  if (!term) return undefined;

  return term.jurisdictions[jurisdictionCode]?.legalReference;
};

// Function to get related terms
export const getRelatedLegalTerms = (
  termKey: string,
  jurisdictionCode: string
): string[] => {
  const term = LEGAL_TERMS_DATABASE.find(t => t.key === termKey);
  if (!term) return [];

  return term.jurisdictions[jurisdictionCode]?.relatedTerms || [];
};

// Function to search legal terms
export const searchLegalTerms = (
  query: string,
  jurisdictionCode: string,
  category?: LegalTermCategory
): LegalTerm[] => {
  return LEGAL_TERMS_DATABASE.filter(term => {
    // Filter by category if provided
    if (category && term.category !== category) return false;

    // Search in jurisdiction-specific terms
    const jurisdictionTerm = term.jurisdictions[jurisdictionCode];
    if (!jurisdictionTerm) return false;

    const searchString = query.toLowerCase();
    return (
      term.key.toLowerCase().includes(searchString) ||
      jurisdictionTerm.term.toLowerCase().includes(searchString) ||
      jurisdictionTerm.definition?.toLowerCase().includes(searchString) ||
      jurisdictionTerm.relatedTerms?.some(rt =>
        rt.toLowerCase().includes(searchString)
      )
    );
  });
};

// Export category helper
export const getLegalTermsByCategory = (
  category: LegalTermCategory,
  jurisdictionCode: string
): Array<{ definition?: string; key: string; term: string }> => {
  return LEGAL_TERMS_DATABASE.filter(
    t => t.category === category && t.jurisdictions[jurisdictionCode]
  ).map(t => ({
    key: t.key,
    term: t.jurisdictions[jurisdictionCode].term,
    definition: t.jurisdictions[jurisdictionCode].definition,
  }));
};
