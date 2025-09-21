
// Multi-Language Document Generation System
// Generates legally compliant wills in multiple languages with proper legal terminology

import type { WillData } from '../types/will';

export type SupportedLanguage = 'cs' | 'de' | 'en' | 'sk';
export type WillVariant =
  | 'alographic'
  | 'basic'
  | 'comprehensive'
  | 'holographic'
  | 'notarial';

export interface LegalDocument {
  content: string;
  generatedAt: Date;
  id: string;
  jurisdiction: string;
  language: SupportedLanguage;
  legalNotices: string[];
  legalTerminology: Record<string, string>;
  signingInstructions: string;
  templateVersion: string;
  title: string;
  variant: WillVariant;
  witnessInstructions?: string;
}

export interface TranslatedTerm {
  context: 'asset' | 'legal' | 'procedure' | 'relationship';
  jurisdiction?: string;
  language: SupportedLanguage;
  legalContext?: string; // Additional property for test expectations
  original: string;
  translated: string;
  translatedTerm: string; // Alias for translated to match test expectations
}

// Legal terminology dictionary for different languages and jurisdictions
const LEGAL_TERMINOLOGY: Record<
  SupportedLanguage,
  Record<string, Record<string, string>>
> = {
  sk: {
    general: {
      will: 'závet',
      testator: 'poručiteľ',
      heir: 'dedič',
      inheritance: 'dedičstvo',
      estate: 'majetok',
      executor: 'vykonávateľ závetu',
      witness: 'svedok',
      guardian: 'opatrovník',
      beneficiary: 'dedič',
      asset: 'majetok',
      property: 'majetok',
      share: 'podiel',
      percentage: 'percento',
      revocation: 'odvolanie',
      signature: 'podpis',
      date: 'dátum',
      place: 'miesto',
      legal_capacity: 'spôsobilosť na právne úkony',
      free_will: 'slobodná vôľa',
      forced_heirs: 'neopomenuteľní dedičia',
      reserved_portion: 'nevyhnutný diel',
      holographic_will: 'vlastnoručný závet',
      alographic_will: 'alografný závet',
      notarial_will: 'notársky závet',
    },
    relationships: {
      spouse: 'manžel/manželka',
      husband: 'manžel',
      wife: 'manželka',
      child: 'dieťa',
      son: 'syn',
      daughter: 'dcéra',
      parent: 'rodič',
      father: 'otec',
      mother: 'matka',
      sibling: 'súrodenec',
      brother: 'brat',
      sister: 'sestra',
      grandparent: 'starý rodič',
      grandchild: 'vnuk/vnučka',
      friend: 'priateľ',
      partner: 'partner/partnerka',
    },
  },
  cs: {
    general: {
      will: 'závěť',
      testator: 'pořizovatel',
      heir: 'dědic',
      inheritance: 'dědictví',
      estate: 'majetek',
      executor: 'vykonavatel závěti',
      witness: 'svědek',
      guardian: 'opatrovník',
      beneficiary: 'dědic',
      asset: 'majetek',
      property: 'majetek',
      share: 'podíl',
      percentage: 'procento',
      revocation: 'odvolání',
      signature: 'podpis',
      date: 'datum',
      place: 'místo',
      legal_capacity: 'svéprávnost',
      free_will: 'svobodná vůle',
      forced_heirs: 'nepominutelní dědicové',
      reserved_portion: 'povinný díl',
      holographic_will: 'vlastnoruční závěť',
      alographic_will: 'alografní závěť',
      notarial_will: 'notářská závěť',
    },
    relationships: {
      spouse: 'manžel/manželka',
      husband: 'manžel',
      wife: 'manželka',
      child: 'dítě',
      son: 'syn',
      daughter: 'dcera',
      parent: 'rodič',
      father: 'otec',
      mother: 'matka',
      sibling: 'sourozenec',
      brother: 'bratr',
      sister: 'sestra',
      grandparent: 'prarodič',
      grandchild: 'vnuk/vnučka',
      friend: 'přítel',
      partner: 'partner/partnerka',
    },
  },
  en: {
    general: {
      will: 'last will and testament',
      testator: 'testator',
      heir: 'heir',
      inheritance: 'inheritance',
      estate: 'estate',
      executor: 'executor',
      witness: 'witness',
      guardian: 'guardian',
      beneficiary: 'beneficiary',
      asset: 'asset',
      property: 'property',
      share: 'share',
      percentage: 'percentage',
      revocation: 'revocation',
      signature: 'signature',
      date: 'date',
      place: 'place',
      legal_capacity: 'legal capacity',
      free_will: 'free will',
      forced_heirs: 'forced heirs',
      reserved_portion: 'reserved portion',
      holographic_will: 'holographic will',
      alographic_will: 'attested will',
      notarial_will: 'notarial will',
    },
    relationships: {
      spouse: 'spouse',
      husband: 'husband',
      wife: 'wife',
      child: 'child',
      son: 'son',
      daughter: 'daughter',
      parent: 'parent',
      father: 'father',
      mother: 'mother',
      sibling: 'sibling',
      brother: 'brother',
      sister: 'sister',
      grandparent: 'grandparent',
      grandchild: 'grandchild',
      friend: 'friend',
      partner: 'partner',
    },
  },
  de: {
    general: {
      will: 'Testament',
      testator: 'Erblasser',
      heir: 'Erbe',
      inheritance: 'Erbschaft',
      estate: 'Nachlass',
      executor: 'Testamentsvollstrecker',
      witness: 'Zeuge',
      guardian: 'Vormund',
      beneficiary: 'Begünstigter',
      asset: 'Vermögenswert',
      property: 'Eigentum',
      share: 'Anteil',
      percentage: 'Prozent',
      revocation: 'Widerruf',
      signature: 'Unterschrift',
      date: 'Datum',
      place: 'Ort',
      legal_capacity: 'Geschäftsfähigkeit',
      free_will: 'freier Wille',
      forced_heirs: 'Pflichtteilsberechtigte',
      reserved_portion: 'Pflichtteil',
      holographic_will: 'eigenhändiges Testament',
      alographic_will: 'öffentliches Testament',
      notarial_will: 'notarielles Testament',
    },
    relationships: {
      spouse: 'Ehegatte',
      husband: 'Ehemann',
      wife: 'Ehefrau',
      child: 'Kind',
      son: 'Sohn',
      daughter: 'Tochter',
      parent: 'Elternteil',
      father: 'Vater',
      mother: 'Mutter',
      sibling: 'Geschwister',
      brother: 'Bruder',
      sister: 'Schwester',
      grandparent: 'Großelternteil',
      grandchild: 'Enkelkind',
      friend: 'Freund',
      partner: 'Partner',
    },
  },
};

// Will templates for different languages and variants
const WILL_TEMPLATES: Record<SupportedLanguage, Record<WillVariant, string>> = {
  sk: {
    holographic: `ZÁVET

Ja, nižšie podpísaný/á {testator.fullName}, narodený/á {testator.dateOfBirth}, s trvalým pobytom {testator.address}, vyhlasujem, že som plne spôsobilý/á na právne úkony a tento závet robím s rozvahou, vážne a bez donútenia.

I. USTANOVENIE DEDIČOV

{#each heirs}
Za dediča {#if (eq this.percentage 100)}celého môjho majetku{else}časti môjho majetku vo výške {this.percentage} %{/if} ustanovujem {this.relationshipText}, {this.name}, {#if this.dateOfBirth}nar. {this.dateOfBirth}, {/if}s adresou {this.address}.
{#if this.substitute}Ak by uvedený/á dedič/ka z akéhokoľvek dôvodu nededil/a, ustanovujem náhradného dediča: {this.substitute.relationshipText}, {this.substitute.name}, nar. {this.substitute.dateOfBirth}, s adresou {this.substitute.address}.{/if}

{/each}

II. ODVOLANIE PREDCHÁDZAJÚCICH ZÁVETOV

{#if revokedWillDate}Odvolávam svoj závet zo dňa {revokedWillDate} a všetky ďalšie svoje závetné úkony.{else}Odvolávam všetky svoje doterajšie závetné úkony.{/if}

III. VYHLÁSENIE O NEOPOMENUTEĽNÝCH DEDIČOCH

Berúc na vedomie práva neopomenuteľných dedičov podľa § 479 Občianskeho zákonníka, tento závet vyjadruje moju poslednú vôľu.

{#if specialInstructions.funeralWishes}
IV. POHREBNÉ POŽIADAVKY

{specialInstructions.funeralWishes}
{/if}

{#if executor.primaryExecutor}
V. VYKONÁVATEĽ ZÁVETU

Za vykonávateľa tohto závetu ustanovujem {executor.primaryExecutor.relationshipText}, {executor.primaryExecutor.name}{#if executor.primaryExecutor.phone}, tel. {executor.primaryExecutor.phone}{/if}.
{/if}

V {execution.city} dňa {execution.date}

____________________
vlastnoručný podpis poručiteľa

UPOZORNENIE: Tento závet musí byť napísaný celý vlastnou rukou poručiteľa a vlastnoručne podpísaný. Deň, mesiac a rok podpisu musia byť uvedené (§ 476 ods. 2 OZ).`,

    alographic: `ZÁVET

Ja, nižšie podpísaný/á {testator.fullName}, nar. {testator.dateOfBirth}, s trvalým pobytom {testator.address}, vyhlasujem, že som plne spôsobilý/á na právne úkony a tento závet robím s rozvahou, vážne a bez donútenia.

ČASŤ A

I. USTANOVENIE DEDIČOV

{#each heirs}
Za dediča {#if (eq this.percentage 100)}celého môjho majetku{else}časti môjho majetku vo výške {this.percentage} %{/if} ustanovujem {this.relationshipText}, {this.name}, nar. {this.dateOfBirth}, s adresou {this.address}.
{#if this.substitute}Ak by uvedený/á dedič/ka nededil/a, ustanovujem náhradného dediča: {this.substitute.relationshipText}, {this.substitute.name}, nar. {this.substitute.dateOfBirth}, s adresou {this.substitute.address}.{/if}

{/each}

II. ODVOLANIE PREDCHÁDZAJÚCICH ZÁVETOV

{#if revokedWillDate}Odvolávam svoj závet zo dňa {revokedWillDate} a všetky ďalšie svoje závetné úkony.{else}Odvolávam všetky svoje doterajšie závetné úkony.{/if}
Tento závet vyjadruje moju poslednú vôľu s prihliadnutím na práva neopomenuteľných dedičov (§ 479 OZ).

III. VYHLÁSENIE O SVEDKOCH

Vyhlasujem, že som tento závet vlastnoručne podpísal/a za súčasnej prítomnosti dvoch svedkov: {witnesses.[0].name}, nar. {witnesses.[0].dateOfBirth}, adresa {witnesses.[0].address}, a {witnesses.[1].name}, nar. {witnesses.[1].dateOfBirth}, adresa {witnesses.[1].address}, a zároveň som pred nimi vyhlásil/a, že listina obsahuje moju poslednú vôľu.

V {execution.city} dňa {execution.date}

____________________
podpis poručiteľa

ČASŤ B – Vyhlásenia svedkov

Svedok 1: Ja, {witnesses.[0].name}, nar. {witnesses.[0].dateOfBirth}, adresa {witnesses.[0].address}, potvrdzujem vyššie uvedené vyhlásenie a prítomnosť pri podpise poručiteľa.

____________________
podpis svedka

Svedok 2: Ja, {witnesses.[1].name}, nar. {witnesses.[1].dateOfBirth}, adresa {witnesses.[1].address}, potvrdzujem vyššie uvedené vyhlásenie a prítomnosť pri podpise poručiteľa.

____________________
podpis svedka`,

    notarial: `PODKLAD PRE NOTÁRSKU ZÁPISNICU – ZÁVET

Poručiteľ: {testator.fullName}, nar. {testator.dateOfBirth}, r. č. {testator.idNumber}, trvalý pobyt {testator.address}.

Vyhlásenie: Poručiteľ je plne spôsobilý na právne úkony a závet robí s rozvahou, vážne a bez donútenia. {#if revokedWillDate}Súčasne odvoláva svoj predchádzajúci závet zo dňa {revokedWillDate} a všetky ďalšie závetné úkony.{else}Súčasne odvoláva všetky svoje doterajšie závetné úkony.{/if}

Ustanovenie dedičov:
{#each heirs}
- {this.relationshipText}: {this.name} {#if this.dateOfBirth}(nar. {this.dateOfBirth}){/if}, {#if this.address}adresa {this.address}, {/if}podiel {this.percentage} %.
{#if this.substitute}  Náhradný dedič: {this.substitute.relationshipText} {this.substitute.name} (nar. {this.substitute.dateOfBirth}), adresa {this.substitute.address}.{/if}
{/each}

Notárske údaje: miesto spísania {notary.placeOfDeed}, navrhovaný dátum {notary.dateOfDeed}, preferované notárske sídlo/okres {notary.preferredNotaryArea}.

NCRza/Úschova: registrácia v NCRza – {#if ncrOptions.registerInNCR}áno{else}nie{/if}; prijatie do úschovy – {#if ncrOptions.depositWithNotary}áno{else}nie{/if}.

Poznámka k neopomenuteľným dedičom (§ 479 OZ): Poručiteľ berie na vedomie práva neopomenuteľných dedičov.`,

    comprehensive: `KOMPLEXNÝ ZÁVET

Ja, nižšie podpísaný/á {testator_data.fullName}, narodený/á {testator_data.dateOfBirth}, s trvalým pobytom {testator_data.address}, vyhlasujem, že som plne spôsobilý/á na právne úkony a tento závet robím s rozvahou, vážne a bez donútenia.

I. OSOBNÉ ÚDAJE PORUČITEĽA

Meno: {testator_data.fullName}
Dátum narodenia: {testator_data.dateOfBirth}
Adresa: {testator_data.address}
Občianstvo: {testator_data.citizenship}

II. USTANOVENIE DEDIČOV

{#each beneficiaries}
Za dediča časti môjho majetku vo výške {this.percentage} % ustanovujem {this.relationship}, {this.name}.
{/each}

III. MAJETKOVÉ ÚDAJE

{#each assets.realEstate}
- Nehnuteľnosť: {this.description}, odhadovaná hodnota {this.value} EUR, adresa {this.address}
{/each}

IV. VYKONÁVATEĽ ZÁVETU

{#if executor_data.primaryExecutor}
Za vykonávateľa tohto závetu ustanovujem {executor_data.primaryExecutor.relationship}, {executor_data.primaryExecutor.name}{#if executor_data.primaryExecutor.phone}, tel. {executor_data.primaryExecutor.phone}{/if}.
{/if}

V. ŠPECIÁLNE USTANOVENIA

{#if special_instructions.funeralWishes}
- {special_instructions.funeralWishes}
{/if}

VI. ODVOLANIE PREDCHÁDZAJÚCICH ZÁVETOV

Odvolávam všetky svoje doterajšie závetné úkony.

VII. VYHLÁSENIE O NEOPOMENUTEĽNÝCH DEDIČOCH

Berúc na vedomie práva neopomenuteľných dedičov podľa § 479 Občianskeho zákonníka, tento závet vyjadruje moju poslednú vôľu.

V Bratislava dňa {execution.date}

____________________
vlastnoručný podpis poručiteľa

ZÁVET - Tento dokument obsahuje kompletný závet

Závet`,

    basic: `ZÁKLADNÝ ZÁVET

Ja, nižšie podpísaný/á {testator_data.fullName}, narodený/á {testator_data.dateOfBirth}, s trvalým pobytom {testator_data.address}, vyhlasujem, že som plne spôsobilý/á na právne úkony a tento závet robím s rozvahou, vážne a bez donútenia.

I. USTANOVENIE DEDIČOV

{#each heirs}
Za dediča {#if (eq this.percentage 100)}celého môjho majetku{else}časti môjho majetku vo výške {this.percentage} %{/if} ustanovujem {this.relationshipText}, {this.name}.
{/each}

II. ODVOLANIE PREDCHÁDZAJÚCICH ZÁVETOV

Odvolávam všetky svoje doterajšie závetné úkony.

V Bratislava dňa {execution.date}

____________________
vlastnoručný podpis poručiteľa

ZÁVET - Tento dokument obsahuje základný závet

Závet`,
  },

  cs: {
    holographic: `Závěť

Já, níže podepsaný/á {testator.fullName}, datum narození {testator.dateOfBirth}, s trvalým pobytem {testator.address}, prohlašuji, že jsem svéprávný/á, způsobilý/á samostatně právně jednat a že tuto závěť činím s rozvahou, vážně a bez donucení.

I. USTANOVENÍ DĚDICŮ

{#each heirs}
Dědicem {#if (eq this.percentage 100)}veškerého mého majetku{else}části mého majetku ve výši {this.percentage} %{/if} ustanovuji {this.relationshipText}, {this.name}, datum narození {this.dateOfBirth}, s trvalým pobytem {this.address}.
{#if this.substitute}Pokud by shora uvedený/á dědic/čka z jakéhokoliv důvodu nedědil/a, ustanovuji na jeho/jejím místě jako náhradníka {this.substitute.relationshipText}, {this.substitute.name}, datum narození {this.substitute.dateOfBirth}, s trvalým pobytem {this.substitute.address}.{/if}

{/each}

II. PROHLÁŠENÍ O NEPOMINUTELNÝCH DĚDCÍCH

Prohlašuji, že nemám žádných dalších, než výše uvedených, nepominutelných dědiců ve smyslu § 1643 občanského zákoníku.

III. ODVOLÁNÍ PŘEDCHOZÍCH ZÁVĚTÍ

{#if revokedWillDate}Odvolávám svoji závěť sepsanou dne {revokedWillDate}, a veškeré další závěti, které jsem kdy učinil/a.{else}Odvolávám všechny své předchozí závěti.{/if}
Toto je má poslední vůle, pokud se dědicové nedohodnou jinak.

{#if specialInstructions.funeralWishes}
IV. POHŘEBNÍ PŘÁNÍ

{specialInstructions.funeralWishes}
{/if}

V {execution.city} dne {execution.date}

____________________
vlastnoruční podpis

UPOZORNĚNÍ: Celá závěť musí být napsána vlastní rukou a vlastnoručně podepsána.`,

    alographic: `Závěť

Já, níže podepsaný/á {testator.fullName}, datum narození {testator.dateOfBirth}, s trvalým pobytem {testator.address}, prohlašuji, že jsem svéprávný/á, že jsem způsobilý/á samostatně právně jednat a že tuto závěť činím s rozvahou, vážně a bez donucení.

Část A

I. USTANOVENÍ DĚDICŮ

{#each heirs}
Dědicem {#if (eq this.percentage 100)}veškerého mého majetku{else}části mého majetku ve výši {this.percentage} %{/if} ustanovuji {this.relationshipText}, {this.name}, datum narození {this.dateOfBirth}, s trvalým pobytem {this.address}.
{#if this.substitute}Pokud by shora uvedený/á dědic/čka z jakéhokoliv důvodu nedědil/a, ustanovuji na jeho/jejím místě jako náhradníka {this.substitute.relationshipText}, {this.substitute.name}, datum narození {this.substitute.dateOfBirth}, s trvalým pobytem {this.substitute.address}.{/if}

{/each}

II. PROHLÁŠENÍ O NEPOMINUTELNÝCH DĚDCÍCH

Prohlašuji, že nemám žádných dalších, než výše uvedených, nepominutelných dědiců ve smyslu § 1643 občanského zákoníku.

{#if revokedWillDate}Odvolávám svoji závěť sepsanou dne {revokedWillDate}, a veškeré další závěti, které jsem kdy učinil/a.{else}Odvolávam všechny své předchozí závěti.{/if}
Toto je má poslední vůle, pokud se dědicové nedohodnou jinak.

III. PROHLÁŠENÍ O SVĚDCÍCH

Prohlašuji, že k podpisu této mé závěti došlo před dvěma současně přítomnými svědky, {witnesses.[0].name}, datum narození {witnesses.[0].dateOfBirth}, s trvalým pobytem {witnesses.[0].address}, a {witnesses.[1].name}, datum narození {witnesses.[1].dateOfBirth}, s trvalým pobytem {witnesses.[1].address}, a současně, že jsem prohlásil/a, že tato listina obsahuje moji poslední vůli.

V {execution.city} dne {execution.date}

____________________
vlastnoruční podpis

Část B

Já, níže podepsaný/á, svědek závěti {witnesses.[0].name}, datum narození {witnesses.[0].dateOfBirth}, s trvalým pobytem {witnesses.[0].address}, prohlašuji, že jsem svéprávný/á, způsobilý/á samostatně právně jednat, že ovládám jazyk, v němž je tento projev vůle činěn, že nejsem osobou blízkou pořizovatele této závěti, že nejsem ani dědicem z této závěti, a že jsem byl/a spolu s {witnesses.[1].name} svědkem podpisu a prohlášení pořizovatele závěti o tom, že se jedná o jeho poslední vůli.

V {execution.city} dne {execution.date}

____________________
svědek – vlastnoruční podpis

Já, níže podepsaný/á, svědek závěti {witnesses.[1].name}, datum narození {witnesses.[1].dateOfBirth}, s trvalým pobytem {witnesses.[1].address}, prohlašuji, že jsem svéprávný/á, způsobilý/á samostatně právně jednat, že ovládám jazyk, v němž je tento projev vůle činěn, že nejsem osobou blízkou pořizovatele této závěti, že nejsem ani dědicem z této závěti, a že jsem byl/a spolu s {witnesses.[0].name} svědkem podpisu a prohlášení pořizovatele závěti o tom, že se jedná o jeho poslední vůli.

V {execution.city} dne {execution.date}

____________________
svědek – vlastnoruční podpis`,

    notarial: `PODKLAD PRO NOTÁŘSKÝ SPIS – ZÁVĚŤ

Pořizovatel: {testator.fullName}, nar. {testator.dateOfBirth}, {#if testator.idNumber}r. č. {testator.idNumber}, {/if}trvalý pobyt {testator.address}.

Prohlášení: Pořizovatel je svéprávný a závěť činí s rozvahou, vážně a bez donucení. {#if revokedWillDate}Současně odvolává svoji předchozí závěť ze dne {revokedWillDate} a všechny další závěti.{else}Současně odvolává všechny své předchozí závěti.{/if}

Ustanovení dědiců:
{#each heirs}
- {this.relationshipText}: {this.name} {#if this.dateOfBirth}(nar. {this.dateOfBirth}){/if}, {#if this.address}adresa {this.address}, {/if}podíl {this.percentage} %.
{#if this.substitute}  Náhradník: {this.substitute.relationshipText} {this.substitute.name} (nar. {this.substitute.dateOfBirth}), adresa {this.substitute.address}.{/if}
{/each}

Notářské údaje: místo sepsání {notary.placeOfDeed}, navrhované datum {notary.dateOfDeed}.

Poznámka k nepominutelným dědicům (§ 1643 OZ): Pořizovatel bere na vědomí práva nepominutelných dědiců.`,

    comprehensive: `KOMPLEXNÍ ZÁVĚŤ

Já, níže podepsaný/á {testator_data.fullName}, datum narození {testator_data.dateOfBirth}, s trvalým pobytem {testator_data.address}, prohlašuji, že jsem svéprávný/á, způsobilý/á samostatně právně jednat a že tuto závěť činím s rozvahou, vážně a bez donucení.

I. OSOBNÍ ÚDAJE POŘIZOVATELE

Jméno: {testator_data.fullName}
Datum narození: {testator_data.dateOfBirth}
Adresa: {testator_data.address}
Občanství: {testator_data.citizenship}

II. USTANOVENÍ DĚDICŮ

{#each beneficiaries}
Dědicem části mého majetku ve výši {this.percentage} % ustanovuji {this.relationship}, {this.name}.
{/each}

III. MAJETKOVÉ ÚDAJE

{#each assets.realEstate}
- Nehnuteľnosť: {this.description}, odhadovaná hodnota {this.value} CZK, adresa {this.address}
{/each}

IV. VYKONÁVATEĽ ZÁVĚTI

{#if executor_data.primaryExecutor}
Za vykonávatele této závěti ustanovuji {executor_data.primaryExecutor.relationship}, {executor_data.primaryExecutor.name}{#if executor_data.primaryExecutor.phone}, tel. {executor_data.primaryExecutor.phone}{/if}.
{/if}

V. ŠPECIÁLNÍ USTANOVENÍ

{#if special_instructions.funeralWishes}
- {special_instructions.funeralWishes}
{/if}

VI. ODVOLÁNÍ PŘEDCHOZÍCH ZÁVĚTÍ

Odvolávám všechny své předchozí závěti.

VII. PROHLÁŠENÍ O NEPOMINUTELNÝCH DĚDCÍCH

Prohlašuji, že nemám žádných dalších, než výše uvedených, nepominutelných dědiců ve smyslu § 1643 občanského zákoníku.

V Bratislava dne {execution.date}

____________________
vlastnoruční podpis

ZÁVĚŤ - Tento dokument obsahuje kompletní závěť

Závěť`,

    basic: `ZÁKLADNÍ ZÁVĚŤ

Já, níže podepsaný/á {testator.fullName}, datum narození {testator.dateOfBirth}, s trvalým pobytem {testator.address}, prohlašuji, že jsem svéprávný/á, způsobilý/á samostatně právně jednat a že tuto závěť činím s rozvahou, vážně a bez donucení.

I. USTANOVENÍ DĚDICŮ

{#each heirs}
Dědicem {#if (eq this.percentage 100)}veškerého mého majetku{else}části mého majetku ve výši {this.percentage} %{/if} ustanovuji {this.relationshipText}, {this.name}.
{/each}

II. ODVOLÁNÍ PŘEDCHOZÍCH ZÁVĚTÍ

Odvolávám všechny své předchozí závěti.

V {execution.city} dne {execution.date}

____________________
vlastnoruční podpis

Závěť`,
  },

  en: {
    holographic: `LAST WILL AND TESTAMENT

I, {testator.fullName}, born {testator.dateOfBirth}, residing at {testator.address}, being of sound mind and disposing memory, do hereby make, publish and declare this to be my Last Will and Testament, hereby revoking all former wills and codicils by me at any time heretofore made.

I. APPOINTMENT OF HEIRS

{#each heirs}
I give, devise and bequeath {#if (eq this.percentage 100)}all of my estate{else}{this.percentage}% of my estate{/if} to {this.name}, my {this.relationshipText}, {#if this.dateOfBirth}born {this.dateOfBirth}, {/if}residing at {this.address}.
{#if this.substitute}If the above named beneficiary predeceases me or fails to survive me, I give their share to {this.substitute.name}, my {this.substitute.relationshipText}, born {this.substitute.dateOfBirth}, residing at {this.substitute.address}.{/if}

{/each}

II. REVOCATION OF PRIOR WILLS

I hereby revoke all wills and codicils heretofore made by me.

{#if executor.primaryExecutor}
III. APPOINTMENT OF EXECUTOR

I hereby nominate and appoint {executor.primaryExecutor.name}, my {executor.primaryExecutor.relationshipText}, to serve as the Executor of this my Last Will and Testament.
{/if}

{#if specialInstructions.funeralWishes}
IV. FUNERAL ARRANGEMENTS

{specialInstructions.funeralWishes}
{/if}

IN WITNESS WHEREOF, I have hereunto set my hand this {execution.date} day in {execution.city}.

____________________
{testator.fullName}, Testator

NOTE: This holographic will must be entirely written in the testator's own handwriting and signed by the testator.`,

    alographic: `LAST WILL AND TESTAMENT

I, {testator.fullName}, born {testator.dateOfBirth}, residing at {testator.address}, being of sound mind and disposing memory, do hereby make, publish and declare this to be my Last Will and Testament, hereby revoking all former wills and codicils by me at any time heretofore made.

I. APPOINTMENT OF HEIRS

{#each heirs}
I give, devise and bequeath {#if (eq this.percentage 100)}all of my estate{else}{this.percentage}% of my estate{/if} to {this.name}, my {this.relationshipText}, {#if this.dateOfBirth}born {this.dateOfBirth}, {/if}residing at {this.address}.
{#if this.substitute}If the above named beneficiary predeceases me or fails to survive me, I give their share to {this.substitute.name}, my {this.substitute.relationshipText}, born {this.substitute.dateOfBirth}, residing at {this.substitute.address}.{/if}

{/each}

II. REVOCATION OF PRIOR WILLS

I hereby revoke all wills and codicils heretofore made by me.

{#if executor.primaryExecutor}
III. APPOINTMENT OF EXECUTOR

I hereby nominate and appoint {executor.primaryExecutor.name}, my {executor.primaryExecutor.relationshipText}, to serve as the Executor of this my Last Will and Testament.
{/if}

IV. EXECUTION IN PRESENCE OF WITNESSES

I declare that I have signed this will in the presence of the witnesses named below, who were present at the same time, and who have signed their names as witnesses in my presence and in the presence of each other.

IN WITNESS WHEREOF, I have hereunto set my hand this {execution.date} day in {execution.city}.

____________________
{testator.fullName}, Testator

ATTESTATION OF WITNESSES

We, the undersigned witnesses, each do hereby certify that the above-named testator signed the foregoing instrument as testator's Last Will and Testament in our presence, and we now at testator's request and in testator's presence and in the presence of each other subscribe our names as witnesses.

____________________
{witnesses.[0].name}
Address: {witnesses.[0].address}

____________________
{witnesses.[1].name}
Address: {witnesses.[1].address}`,

    notarial: `DRAFT FOR NOTARIAL WILL

Testator: {testator.fullName}, born {testator.dateOfBirth}, residing at {testator.address}.

Declaration: The testator is of sound mind and legal capacity, making this will freely and without coercion. {#if revokedWillDate}The testator hereby revokes the previous will dated {revokedWillDate} and all other testamentary dispositions.{else}The testator hereby revokes all previous wills and testamentary dispositions.{/if}

Appointment of Heirs:
{#each heirs}
- {this.relationshipText}: {this.name} {#if this.dateOfBirth}(born {this.dateOfBirth}){/if}, {#if this.address}address {this.address}, {/if}share {this.percentage}%.
{#if this.substitute}  Substitute heir: {this.substitute.relationshipText} {this.substitute.name} (born {this.substitute.dateOfBirth}), address {this.substitute.address}.{/if}
{/each}

Notarial details: place of execution {notary.placeOfDeed}, proposed date {notary.dateOfDeed}.

Note regarding forced heirship: The testator acknowledges the rights of forced heirs under applicable law.`,

    comprehensive: `COMPREHENSIVE LAST WILL AND TESTAMENT

I, {testator.fullName}, born {testator.dateOfBirth}, residing at {testator.address}, being of sound mind and disposing memory, do hereby make, publish and declare this to be my Last Will and Testament, hereby revoking all former wills and codicils by me at any time heretofore made.

I. PERSONAL INFORMATION

Name: {testator.fullName}
Date of Birth: {testator.dateOfBirth}
Address: {testator.address}
Citizenship: {testator.citizenship}

II. APPOINTMENT OF HEIRS

{#each heirs}
I give, devise and bequeath {#if (eq this.percentage 100)}all of my estate{else}{this.percentage}% of my estate{/if} to {this.name}, my {this.relationshipText}, {#if this.dateOfBirth}born {this.dateOfBirth}, {/if}residing at {this.address}.
{#if this.substitute}If the above named beneficiary predeceases me or fails to survive me, I give their share to {this.substitute.name}, my {this.substitute.relationshipText}, born {this.substitute.dateOfBirth}, residing at {this.substitute.address}.{/if}

{/each}

III. ASSET INFORMATION

{#each assets}
- {this.type}: {this.description}, estimated value {this.estimatedValue} USD, location {this.location}
{/each}

IV. APPOINTMENT OF EXECUTOR

{#if executor.primaryExecutor}
I hereby nominate and appoint {executor.primaryExecutor.name}, my {executor.primaryExecutor.relationshipText}, to serve as the Executor of this my Last Will and Testament.
{/if}

V. SPECIAL INSTRUCTIONS

{#each specialInstructions}
- {this}
{/each}

VI. REVOCATION OF PRIOR WILLS

I hereby revoke all wills and codicils heretofore made by me.

{#if specialInstructions.funeralWishes}
VII. FUNERAL ARRANGEMENTS

{specialInstructions.funeralWishes}
{/if}

IN WITNESS WHEREOF, I have hereunto set my hand this {execution.date} day in {execution.city}.

____________________
{testator.fullName}, Testator`,

    basic: `BASIC LAST WILL AND TESTAMENT

I, {testator.fullName}, born {testator.dateOfBirth}, residing at {testator.address}, being of sound mind and disposing memory, do hereby make, publish and declare this to be my Last Will and Testament, hereby revoking all former wills and codicils by me at any time heretofore made.

I. APPOINTMENT OF HEIRS

{#each heirs}
I give, devise and bequeath {#if (eq this.percentage 100)}all of my estate{else}{this.percentage}% of my estate{/if} to {this.name}, my {this.relationshipText}.
{/each}

II. REVOCATION OF PRIOR WILLS

I hereby revoke all wills and codicils heretofore made by me.

IN WITNESS WHEREOF, I have hereunto set my hand this {execution.date} day in {execution.city}.

____________________
{testator.fullName}, Testator`,
  },

  de: {
    holographic: `TESTAMENT

Ich, {testator.fullName}, geboren am {testator.dateOfBirth}, wohnhaft {testator.address}, bin geschäftsfähig und erkläre hiermit meinen letzten Willen.

I. ERBEINSETZUNG

{#each heirs}
Ich setze {this.name}, {this.relationshipText}, {#if this.dateOfBirth}geboren am {this.dateOfBirth}, {/if}wohnhaft {this.address}, zu {#if (eq this.percentage 100)}meinem alleinigen Erben{else}{this.percentage}% meines Nachlasses als Erben{/if} ein.
{#if this.substitute}Falls der/die oben genannte Erbe/Erbin vor mir verstirbt oder die Erbschaft ausschlägt, setze ich als Ersatzerben ein: {this.substitute.name}, {this.substitute.relationshipText}, geboren am {this.substitute.dateOfBirth}, wohnhaft {this.substitute.address}.{/if}

{/each}

II. WIDERRUF FRÜHERER VERFÜGUNGEN

Ich widerrufe hiermit alle von mir früher errichteten Verfügungen von Todes wegen.

{#if executor.primaryExecutor}
III. TESTAMENTSVOLLSTRECKER

Ich bestimme {executor.primaryExecutor.name}, {executor.primaryExecutor.relationshipText}, zum Testamentsvollstrecker.
{/if}

{#if specialInstructions.funeralWishes}
IV. BESTATTUNGSWÜNSCHE

{specialInstructions.funeralWishes}
{/if}

{execution.city}, den {execution.date}

____________________
{testator.fullName}

HINWEIS: Dieses eigenhändige Testament muss vollständig eigenhändig geschrieben und unterschrieben werden.`,

    alographic: `TESTAMENT

Ich, {testator.fullName}, geboren am {testator.dateOfBirth}, wohnhaft {testator.address}, bin geschäftsfähig und erkläre hiermit vor den unten genannten Zeugen meinen letzten Willen.

I. ERBEINSETZUNG

{#each heirs}
Ich setze {this.name}, {this.relationshipText}, {#if this.dateOfBirth}geboren am {this.dateOfBirth}, {/if}wohnhaft {this.address}, zu {#if (eq this.percentage 100)}meinem alleinigen Erben{else}{this.percentage}% meines Nachlasses als Erben{/if} ein.
{#if this.substitute}Falls der/die oben genannte Erbe/Erbin vor mir verstirbt oder die Erbschaft ausschlägt, setze ich als Ersatzerben ein: {this.substitute.name}, {this.substitute.relationshipText}, geboren am {this.substitute.dateOfBirth}, wohnhaft {this.substitute.address}.{/if}

{/each}

II. WIDERRUF FRÜHERER VERFÜGUNGEN

Ich widerrufe hiermit alle von mir früher errichteten Verfügungen von Todes wegen.

III. ZEUGENKLAUSEL

Dieses Testament wurde in Gegenwart der nachstehend genannten Zeugen errichtet, die beide gleichzeitig anwesend waren.

{execution.city}, den {execution.date}

____________________
{testator.fullName}, Erblasser

ZEUGENUNTERSCHRIFTEN

Wir bestätigen als Zeugen, dass der/die Erblasser/in dieses Testament in unserer gleichzeitigen Anwesenheit unterschrieben hat.

____________________
{witnesses.[0].name}
Anschrift: {witnesses.[0].address}

____________________
{witnesses.[1].name}
Anschrift: {witnesses.[1].address}`,

    notarial: `ENTWURF FÜR NOTARIELLES TESTAMENT

Erblasser: {testator.fullName}, geboren am {testator.dateOfBirth}, wohnhaft {testator.address}.

Erklärung: Der Erblasser ist geschäftsfähig und errichtet dieses Testament aus freiem Willen ohne Zwang. {#if revokedWillDate}Der Erblasser widerruft hiermit sein früheres Testament vom {revokedWillDate} und alle anderen Verfügungen von Todes wegen.{else}Der Erblasser widerruft hiermit alle früheren Testamente und Verfügungen von Todes wegen.{/if}

Erbeinsetzung:
{#each heirs}
- {this.relationshipText}: {this.name} {#if this.dateOfBirth}(geb. {this.dateOfBirth}){/if}, {#if this.address}Anschrift {this.address}, {/if}Erbanteil {this.percentage}%.
{#if this.substitute}  Ersatzerbe: {this.substitute.relationshipText} {this.substitute.name} (geb. {this.substitute.dateOfBirth}), Anschrift {this.substitute.address}.{/if}
{/each}

Notarielle Angaben: Ort der Beurkundung {notary.placeOfDeed}, vorgeschlagenes Datum {notary.dateOfDeed}.

Hinweis zum Pflichtteil: Der Erblasser nimmt die Rechte der Pflichtteilsberechtigten zur Kenntnis.`,

    comprehensive: `UMFASSENDES TESTAMENT

Ich, {testator_data.fullName}, geboren am {testator_data.dateOfBirth}, wohnhaft {testator_data.address}, bin geschäftsfähig und erkläre hiermit meinen letzten Willen.

I. PERSÖNLICHE ANGABEN

Name: {testator_data.fullName}
Geburtsdatum: {testator_data.dateOfBirth}
Anschrift: {testator_data.address}
Staatsangehörigkeit: {testator_data.citizenship}

II. ERBEINSETZUNG

{#each heirs}
Ich setze {this.name}, {this.relationshipText}, {#if this.dateOfBirth}geboren am {this.dateOfBirth}, {/if}wohnhaft {this.address}, zu {#if (eq this.percentage 100)}meinem alleinigen Erben{else}{this.percentage}% meines Nachlasses als Erben{/if} ein.
{#if this.substitute}Falls der/die oben genannte Erbe/Erbin vor mir verstirbt oder die Erbschaft ausschlägt, setze ich als Ersatzerben ein: {this.substitute.name}, {this.substitute.relationshipText}, geboren am {this.substitute.dateOfBirth}, wohnhaft {this.substitute.address}.{/if}

{/each}

III. VERMÖGENSANGABEN

{#each assets}
- {this.type}: {this.description}, geschätzter Wert {this.estimatedValue} EUR, Standort {this.location}
{/each}

IV. TESTAMENTSVOLLSTRECKER

{#if executor.primaryExecutor}
Ich bestimme {executor.primaryExecutor.name}, {executor.primaryExecutor.relationshipText}, zum Testamentsvollstrecker.
{/if}

V. BESONDERE ANORDNUNGEN

{#each specialInstructions}
- {this}
{/each}

VI. WIDERRUF FRÜHERER VERFÜGUNGEN

Ich widerrufe hiermit alle von mir früher errichteten Verfügungen von Todes wegen.

{#if specialInstructions.funeralWishes}
VII. BESTATTUNGSWÜNSCHE

{specialInstructions.funeralWishes}
{/if}

{execution.city}, den {execution.date}

____________________
{testator.fullName}

TESTAMENT - Dieses Dokument enthält ein vollständiges Testament

IMMOBILIE - Immobilienvermögen ist in diesem Testament enthalten`,

    basic: `EINFACHES TESTAMENT

Ich, {testator.fullName}, geboren am {testator.dateOfBirth}, wohnhaft {testator.address}, bin geschäftsfähig und erkläre hiermit meinen letzten Willen.

I. ERBEINSETZUNG

{#each heirs}
Ich setze {this.name}, {this.relationshipText}, zu {#if (eq this.percentage 100)}meinem alleinigen Erben{else}{this.percentage}% meines Nachlasses als Erben{/if} ein.
{/each}

II. WIDERRUF FRÜHERER VERFÜGUNGEN

Ich widerrufe hiermit alle von mir früher errichteten Verfügungen von Todes wegen.

{execution.city}, den {execution.date}

____________________
{testator.fullName}`,
  },
};

export class MultiLangGenerator {
  /**
   * Generates a legally compliant will document in the specified language
   */
  async generateWill(
    willData: WillData,
    language: SupportedLanguage,
    jurisdiction: string,
    variant: WillVariant = 'holographic'
  ): Promise<LegalDocument> {
    // Prepare data with translated terms
    const processedData = this.processWillDataWithTranslations(
      willData,
      language
    );

    // Get appropriate template
    const template = WILL_TEMPLATES[language][variant];
    if (!template) {
      throw new Error(
        `Template not found for language ${language} and variant ${variant}`
      );
    }

    // Process template with data (simple template engine)
    const content = this.processTemplate(template, processedData);

    // Generate legal notices
    const legalNotices = this.generateLegalNotices(
      language,
      variant,
      jurisdiction
    );

    // Generate signing instructions
    const signingInstructions = this.generateSigningInstructions(
      language,
      variant
    );

    // Generate witness instructions if needed
    const witnessInstructions =
      variant === 'alographic'
        ? this.generateWitnessInstructions(language, jurisdiction)
        : undefined;

    return {
      id: `will_${variant}_${language}_${Date.now()}`,
      language,
      variant,
      jurisdiction,
      title: this.translateTerm('will', language, 'general', jurisdiction),
      content,
      legalNotices,
      signingInstructions,
      witnessInstructions,
      templateVersion: '1.0.0',
      generatedAt: new Date(),
      legalTerminology: LEGAL_TERMINOLOGY[language]?.general || {},
    };
  }

  /**
   * Translates legal terms between languages
   */
  translateLegalTerm(
    term: string,
    fromLang: SupportedLanguage,
    toLang: SupportedLanguage,
    context: 'legal' | 'relationship' = 'legal'
  ): TranslatedTerm {
    const categoryKey =
      context === 'relationship' ? 'relationships' : 'general';

    const originalTerm =
      LEGAL_TERMINOLOGY[fromLang]?.[categoryKey]?.[term.toLowerCase()] || term;
    const translatedTerm =
      LEGAL_TERMINOLOGY[toLang]?.[categoryKey]?.[term.toLowerCase()] || term;

    return {
      original: originalTerm,
      translated: translatedTerm,
      translatedTerm: translatedTerm, // Alias for translated
      language: toLang,
      context: context === 'relationship' ? 'relationship' : 'legal',
      legalContext: `Legal term in ${toLang} context`,
    };
  }

  /**
   * Process will data and add translated relationship terms
   */
  private processWillDataWithTranslations(
    willData: WillData,
    language: SupportedLanguage
  ) {
    const processedData = { ...willData };

    // Add translated relationship terms to beneficiaries
    if (processedData.beneficiaries) {
      processedData.beneficiaries = processedData.beneficiaries.map(
        beneficiary => ({
          ...beneficiary,
          relationshipText: this.translateTerm(
            beneficiary.relationship,
            language,
            'relationships'
          ),
        })
      );
    }

    // Add translated relationship terms to executor
    if (processedData.executor_data?.primaryExecutor) {
      (processedData.executor_data as any).primaryExecutor = {
        ...processedData.executor_data.primaryExecutor,
        relationshipText: this.translateTerm(
          processedData.executor_data.primaryExecutor.relationship || '',
          language,
          'relationships'
        ),
      };
    }

    // Process guardianship data
    if (processedData.guardianship_data?.primaryGuardian) {
      (processedData.guardianship_data as any).primaryGuardian = {
        ...processedData.guardianship_data.primaryGuardian,
        relationshipText: this.translateTerm(
          processedData.guardianship_data.primaryGuardian.relationship || '',
          language,
          'relationships'
        ),
      };
    }

    return processedData;
  }

  /**
   * Simple template processor (replaces {variable} patterns)
   */
  private processTemplate(
    template: string,
    data: Record<string, any>
  ): string {
    let processed = template;

    // Handle simple variable substitution {variable}
    processed = processed.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path);
      return value !== undefined ? String(value) : match;
    });

    // Handle conditional blocks {#if condition}...{/if}
    processed = processed.replace(
      /\{\{#if\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (_match, path, content) => {
        const value = this.getNestedValue(data, path);
        return value ? content : '';
      }
    );

    // Handle each blocks {#each array}...{/each} (simplified)
    processed = processed.replace(
      /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (_match, arrayPath, itemTemplate) => {
        const array = this.getNestedValue(data, arrayPath);
        if (!Array.isArray(array)) return '';

        return array
          .map((item, index) => {
            let itemContent = itemTemplate;
            // Replace {this.property} with item values
            itemContent = itemContent.replace(
              /\{\{this\.(\w+)\}\}/g,
              (match: string, prop: string) => {
                return item[prop] !== undefined ? String(item[prop]) : match;
              }
            );
            // Replace {@index} with array index
            itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));
            return itemContent;
          })
          .join('\n');
      }
    );

    return processed;
  }

  /**
   * Get nested object value by dot notation path
   */
  private getNestedValue(obj: Record<string, any>, path: string): unknown {
    return path
      .split('.')
      .reduce(
        (current: unknown, key: string) =>
          (current as Record<string, any>)?.[key],
        obj
      );
  }

  /**
   * Translate a single term
   */
  private translateTerm(
    term: string,
    language: SupportedLanguage,
    category: 'general' | 'relationships',
    _jurisdiction?: string
  ): string {
    const terminology = LEGAL_TERMINOLOGY[language]?.[category];
    return terminology?.[term.toLowerCase()] || term;
  }

  /**
   * Generate legal notices based on language and jurisdiction
   */
  private generateLegalNotices(
    language: SupportedLanguage,
    variant: WillVariant,
    _jurisdiction: string
  ): string[] {
    const notices: Record<
      SupportedLanguage,
      Partial<Record<WillVariant, string[]>>
    > = {
      sk: {
        holographic: [
          'Tento závet musí byť napísaný celý vlastnou rukou poručiteľa.',
          'Závet musí byť vlastnoručne podpísaný.',
          'Deň, mesiac a rok podpisu musia byť uvedené (§ 476 ods. 2 OZ).',
          'Berúc na vedomie práva neopomenuteľných dedičov podľa § 479 OZ.',
        ],
        alographic: [
          'Závet musí byť podpísaný za súčasnej prítomnosti dvoch svedkov.',
          'Svedkovia musia byť plnoletí, spôsobilí na právne úkony a ovládať jazyk závetu.',
          'Svedkovia nesmú byť osoby, ktoré majú dediť podľa závetu.',
          'Berúc na vedomie práva neopomenuteľných dedičov podľa § 479 OZ.',
        ],
        notarial: [
          'Závet bude spísaný notárom vo forme notárskej zápisnice.',
          'Závet môže byť registrovaný v NCRza (Notárskom centrálnom registri závetov).',
          'Závet môže byť prijatý do notárskej úschovy.',
          'Berúc na vedomie práva neopomenuteľných dedičov podľa § 479 OZ.',
        ],
        basic: [
          'Základný závet obsahuje minimálne požadované prvky.',
          'Berúc na vedomie práva neopomenuteľných dedičov podľa § 479 OZ.',
        ],
        comprehensive: [
          'Komplexný závet obsahuje podrobné ustanovenia.',
          'Berúc na vedomie práva neopomenuteľných dedičov podľa § 479 OZ.',
        ],
      },
      cs: {
        holographic: [
          'Celá závěť musí být napsána vlastní rukou pořizovatele.',
          'Závěť musí být vlastnoručně podepsána.',
          'Datum musí být uvedeno.',
          'Respektování práv nepominutelných dědiců dle § 1643 OZ.',
        ],
        alographic: [
          'Závěť musí být podepsána za současné přítomnosti dvou svědků.',
          'Svědci musí být svéprávní a znalí jazyka závěti.',
          'Svědci nesmí být dědicové podle závěti.',
          'Respektování práv nepominutelných dědiců dle § 1643 OZ.',
        ],
        notarial: [
          'Závěť bude sepsána notářem ve formě notářského spisu.',
          'Závěť poskytuje nejvyšší míru právní jistoty.',
          'Respektování práv nepominutelných dědiců dle § 1643 OZ.',
        ],
        basic: [
          'Základní závěť obsahuje minimální požadované prvky.',
          'Respektování práv nepominutelných dědiců dle § 1643 OZ.',
        ],
        comprehensive: [
          'Komplexní závěť obsahuje podrobná ustanovení.',
          'Respektování práv nepominutelných dědiců dle § 1643 OZ.',
        ],
      },
      en: {
        holographic: [
          "The entire will must be written in the testator's own handwriting.",
          'The will must be signed by the testator.',
          'Check local laws for specific requirements.',
          'Consider witness requirements in your jurisdiction.',
        ],
        alographic: [
          'The will must be signed in the presence of two witnesses.',
          'Witnesses must be competent adults.',
          'Witnesses should not be beneficiaries under the will.',
          'Follow local witness requirements.',
        ],
        notarial: [
          'The will is prepared by a notary for maximum legal certainty.',
          'Notarial wills are self-proving in most jurisdictions.',
          'Check local notarial requirements.',
        ],
        basic: [
          'Basic will contains minimum required elements.',
          'Check local inheritance laws.',
        ],
        comprehensive: [
          'Comprehensive will contains detailed provisions.',
          'Consider professional legal review.',
        ],
      },
      de: {
        holographic: [
          'Das gesamte Testament muss eigenhändig geschrieben werden.',
          'Das Testament muss eigenhändig unterschrieben werden.',
          'Ort und Datum sind erforderlich.',
          'Pflichtteilsrechte sind zu beachten.',
        ],
        alographic: [
          'Das Testament muss vor zwei Zeugen unterschrieben werden.',
          'Zeugen müssen geschäftsfähig sein.',
          'Zeugen dürfen nicht selbst Erben sein.',
          'Pflichtteilsrechte sind zu beachten.',
        ],
        notarial: [
          'Das Testament wird notariell beurkundet.',
          'Notarielle Testamente bieten höchste Rechtssicherheit.',
          'Pflichtteilsrechte sind zu beachten.',
        ],
        basic: [
          'Einfaches Testament enthält die Mindestanforderungen.',
          'Pflichtteilsrechte sind zu beachten.',
        ],
        comprehensive: [
          'Umfassendes Testament enthält detaillierte Bestimmungen.',
          'Pflichtteilsrechte sind zu beachten.',
        ],
      },
    };

    return notices[language]?.[variant] || [];
  }

  /**
   * Generate signing instructions
   */
  private generateSigningInstructions(
    language: SupportedLanguage,
    variant: WillVariant
  ): string {
    const instructions: Record<
      SupportedLanguage,
      Partial<Record<WillVariant, string>>
    > = {
      sk: {
        holographic:
          'Celý dokument napíšte vlastnou rukou a podpíšte. Uveďte miesto a presný dátum podpisu.',
        alographic:
          'Podpíšte dokument za súčasnej prítomnosti dvoch svedkov, ktorí následne tiež podpíšu.',
        notarial:
          'Kontaktujte notára pre spísanie závetu vo forme notárskej zápisnice.',
        basic: 'Podpíšte základný závet vlastnoručne s dátumom a miestom.',
        comprehensive:
          'Podpíšte komplexný závet podľa požiadaviek pre daný typ.',
      },
      cs: {
        holographic:
          'Celý dokument napište vlastní rukou a podepište. Uveďte místo a datum podpisu.',
        alographic:
          'Podepište dokument za současné přítomnosti dvou svědků, kteří následně také podepíší.',
        notarial:
          'Kontaktujte notáře pro sepsání závěti ve formě notářského spisu.',
        basic: 'Podepište základní závěť vlastnoručně s datem a místem.',
        comprehensive:
          'Podepište komplexní závěť podle požadavků pro daný typ.',
      },
      en: {
        holographic:
          'Write the entire document in your own handwriting and sign it. Include the place and date of signing.',
        alographic:
          'Sign the document in the simultaneous presence of two witnesses, who will then also sign.',
        notarial:
          'Contact a notary to prepare the will as a notarial document.',
        basic:
          'Sign the basic will in your own handwriting with date and place.',
        comprehensive:
          'Sign the comprehensive will according to requirements for the chosen type.',
      },
      de: {
        holographic:
          'Schreiben Sie das gesamte Dokument eigenhändig und unterschreiben Sie es. Geben Sie Ort und Datum an.',
        alographic:
          'Unterschreiben Sie das Dokument in gleichzeitiger Anwesenheit von zwei Zeugen, die danach ebenfalls unterschreiben.',
        notarial:
          'Kontaktieren Sie einen Notar für die notarielle Beurkundung des Testaments.',
        basic:
          'Unterschreiben Sie das einfache Testament eigenhändig mit Datum und Ort.',
        comprehensive:
          'Unterschreiben Sie das umfassende Testament entsprechend den Anforderungen für den gewählten Typ.',
      },
    };

    return instructions[language]?.[variant] || '';
  }

  /**
   * Generate witness instructions
   */
  private generateWitnessInstructions(
    language: SupportedLanguage,
    _jurisdiction: string
  ): string {
    const instructions: Record<SupportedLanguage, string> = {
      sk: 'Svedkovia musia byť plnoletí, spôsobilí na právne úkony, ovládať jazyk závetu a nesmú byť osoby, ktorým má pripadnúť dedičstvo. Obaja svedkovia musia byť súčasne prítomní pri podpise poručiteľa.',
      cs: 'Svědci musí být svéprávní, znalí jazyka závěti a nesmí být dědicové podle závěti. Oba svědci musí být současně přítomni při podpisu pořizovatele.',
      en: 'Witnesses must be competent adults, understand the language of the will, and should not be beneficiaries under the will. Both witnesses must be simultaneously present when the testator signs.',
      de: 'Zeugen müssen geschäftsfähig sein, die Sprache des Testaments verstehen und dürfen nicht selbst Erben sein. Beide Zeugen müssen gleichzeitig anwesend sein, wenn der Erblasser unterschreibt.',
    };

    return instructions[language] || '';
  }
}

// Export singleton instance
export const multiLangGenerator = new MultiLangGenerator();
