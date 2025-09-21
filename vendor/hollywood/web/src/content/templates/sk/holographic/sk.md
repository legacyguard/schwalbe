# ZÁVET

## (Holografný závet podľa slovenského práva)

---

**Ja, {{testatorName}}**, narodený/á dňa {{birthDate}} v {{birthPlace}}, s rodným číslom {{personalId}}, s trvalým pobytom {{address}}, občan {{citizenship}}, vyhlasujem, že som plne spôsobilý/á na právne úkony a tento závet robím s rozvahou, vážne a bez donútenia, z vlastnej slobodnej vôle, bez akéhokoľvek nátlaku či nepatričného ovplyvnenia tretej osoby, a týmto odvolávam všetky svoje doteraz urobené závety a kodiciily.

---

### ČLÁNOK I - VYHLÁSENIE A ODVOLANIE

Prehlasujem, že mám {{age}} rokov a som duševne spôsobilý/á. Robím tento závet dobrovoľne a nekonám pod nátlakom, podvodom alebo nepatričným vplyvom akejkoľvek osoby.

Týmto odvolávam všetky doteraz urobené závety a kodiciily.

**Tento holografný závet** je napísaný celý mojou rukou a podpísaný mnou, ako povoľuje § 476a Občianskeho zákonníka.

---

### ČLÁNOK II - RODINNÝ STAV

{{#if spouse}}
Som {{maritalStatus}} s {{spouseName}}.
{{/if}}

{{#if children}}
Mám tieto deti:
{{#each children}}

- {{name}}, narodený/á {{birthDate}}{{#if isMinor}} (maloletý/á){{/if}}
  {{/each}}
  {{else}}
  Nemám žiadne deti.
  {{/if}}

---

### ČLÁNOK III - MAJETOK A VLASTNÍCTVO

Vlastním nasledujúci majetok:

{{#if realEstate}}
**Nehnuteľný majetok:**
{{#each realEstate}}

- {{type}} nachádzajúci sa na adrese {{address}}, číslo LV {{cadastralNumber}}, môj podiel vlastníctva: {{ownership}}, odhadovaná hodnota: {{estimatedValue}} €
  {{/each}}
  {{/if}}

{{#if bankAccounts}}
**Bankové účty:**
{{#each bankAccounts}}

- {{accountType}} účet u {{bank}}, číslo účtu končiace {{accountNumber}}, približný zostatok: {{approximateBalance}} €
  {{/each}}
  {{/if}}

{{#if vehicles}}
**Vozidlá:**
{{#each vehicles}}

- {{year}} {{make}} {{model}}, EČV {{licensePlate}}, odhadovaná hodnota: {{estimatedValue}} €
  {{/each}}
  {{/if}}

{{#if personalProperty}}
**Hnuteľný majetok:**
{{#each personalProperty}}

- {{description}}, v súčasnosti umiestnené na {{location}}, odhadovaná hodnota: {{estimatedValue}} €
  {{/each}}
  {{/if}}

---

### ČLÁNOK IV - ODKAZY A ROZDELENIE

{{#if forcedHeirsNotice}}
**UPOZORNENIE TÝKAJÚCE SA NEOPOMENUTEĽNÝCH DEDIČOV:**
Podľa slovenského práva majú nasledujúce osoby nárok na dedičský podiel:
{{#if spouse}}

- Môj manžel/manželka {{spouseName}} má nárok na najmenej 1/4 môjho pozostalého majetku
  {{/if}}
  {{#if minorChildren}}
- Moje maloleté deti majú nárok na najmenej 1/2 ich zákonného dedičského podielu
  {{/if}}
  {{#if adultChildren}}
- Moje dospelé deti majú nárok na najmenej 1/2 ich zákonného dedičského podielu
  {{/if}}

Nižšie uvedené rozdelenie rešpektuje tieto povinné ustanovenia.
{{/if}}

Odkazujem môj majetok takto:

{{#each beneficiaries}}
**{{name}}** ({{relationship}}), bytom {{address}}, RČ/dátum narodenia: {{personalId}}:
{{#if percentage}}

- {{percentage}}% celého môjho majetku
  {{/if}}
  {{#if specificAssets}}
- Nasledujúci konkrétny majetok: {{specificAssets}}
  {{/if}}
  {{#if amount}}
- Peňažnú čiastku {{amount}} €
  {{/if}}
  {{#if conditions}}
- Za podmienok: {{conditions}}
  {{/if}}

{{/each}}

{{#if charitableBequests}}
**CHARITATÍVNE ODKAZY:**
{{#each charitableBequests}}

- Organizácii {{organization}}: {{amount}} € na účel {{purpose}}
  {{/each}}
  {{/if}}

**UNIVERZÁLNA SUKCESIA:**
Všetok zvyšok môjho majetku, hnuteľného i nehnuteľného, akéhokoľvek druhu a kdekoľvek sa nachádzajúceho, odkazujem {{residuaryBeneficiary}} v rovnakých podieloch, alebo ich potomkom podľa práva zastúpenia.

---

### ČLÁNOK V - VYKONÁVATEĽ ZÁVETU

{{#if hasExecutor}}
Menujem a ustanovujem **{{executorName}}**, s trvalým pobytom {{executorAddress}}, vykonávateľom tohto závetu.

{{#if backupExecutor}}
Ak {{executorName}} nemôže alebo nechce funkciu vykonávať, menujem **{{backupExecutor}}** ako náhradného vykonávateľa.
{{/if}}

Môj vykonávateľ nebude povinný zložiť kauciu za riadne vykonávanie svojich povinností.

Môj vykonávateľ bude mať všetky právomoci udelené slovenským právom, vrátane ale neobmedzene na:

- Predaj, prevod a nakladanie s akýmkoľvek majetkom
- Platenie všetkých dlhov, daní a nákladov správy
- Rozdeľovanie majetku dedičom
- Zastupovanie pozostalosti v právnych konaniach

{{else}}
Nemenujem žiadneho vykonávateľa závetu. Správa pozostalosti bude prebiehať podľa slovenského práva.
{{/if}}

---

{{#if hasMinorChildren}}

### ČLÁNOK VI - OPATROVNÍCTVO

{{#if primaryGuardian}}
Menujem **{{primaryGuardian.name}}**, s trvalým pobytom {{primaryGuardian.address}}, opatrovníkom osoby i majetku mojich maloletých detí.

{{#if backupGuardian}}
Ak {{primaryGuardian.name}} nemôže alebo nechce funkciu vykonávať, menujem **{{backupGuardian.name}}**, s trvalým pobytom {{backupGuardian.address}}, ako náhradného opatrovníka.
{{/if}}

{{#if guardianshipInstructions}}
**Pokyny pre opatrovníkov:**
{{guardianshipInstructions}}
{{/if}}
{{/if}}

---

{{/if}}

### ČLÁNOK VII - ZVLÁŠTNE PRIANIA A POKYNY

{{#if funeralWishes}}
**Pohrebné pokyny:**
{{funeralWishes}}
{{/if}}

{{#if organDonation}}
**Darovanie orgánov:**
{{#if organDonation.yes}}
Prajem si darovať svoje orgány na transplantáciu a lekársky výskum.
{{/if}}
{{#if organDonation.no}}
Neprajem si darovať svoje orgány.
{{/if}}
{{#if organDonation.family_decides}}
Rozhodnutie o darovaní orgánov prenechávam svojej rodine.
{{/if}}
{{/if}}

{{#if digitalAssets}}
**Digitálny majetok a účty:**
{{digitalAssets}}
{{/if}}

{{#if personalMessages}}
**Osobné odkazy:**
{{#each personalMessages}}
Pre {{recipient}}: {{message}}

{{/each}}
{{/if}}

---

### ČLÁNOK VIII - ZÁVEREČNÉ USTANOVENIA

Tento závet sa riadi zákonmi Slovenskej republiky.

Ak by akékoľvek ustanovenie tohto závetu bolo považované za neplatné alebo nevymáhateľné, ostatné ustanovenia zostávajú v plnej platnosti.

Prehlasujem, že nemám žiadnych neopomenuteľných dedičov v zmysle § 479 Občianskeho zákonníka.

Toto je moja posledná vôľa, pokiaľ sa dedičia nedohodnú inak.

Starostlivo som si tento závet prečítal/a a správne odráža moje priania a zámery.

---

### PODPIS

**PODPIS HOLOGRAFNÉHO ZÁVETU:**
Celý tento závet je napísaný mojou rukou a podpísaný mnou dňa {{currentDate}}.

**DÔLEŽITÉ POKYNY PRE VÁS:**
Aby bol tento závet právne platný podľa slovenského práva, musíte:

1. Celý tento text prepísať vlastnou rukou na papier
2. Podpísať svojim plným podpisom
3. Datovať v deň podpisu (deň, mesiac a rok musia byť uvedené, inak je závet neplatný – § 476 ods. 2 OZ)
4. Uložiť na bezpečnom mieste a informovať vykonávateľa alebo dôveryhodného člena rodiny o jeho umiestnení

Podpis: **********\_\_\_\_**********
{{testatorName}}

Miesto: {{executionCity}}

Dátum: ************\_\_\_\_************

---

_Tento závet bol vygenerovaný pomocou inteligentného systému tvorby závetov LegacyGuard. Hoci táto šablóna je v súlade so slovenskými právnymi požiadavkami, odporúčame nechať ju skontrolovať kvalifikovaným slovenským právnikom, aby zabezpečil, že vyhovuje vašim špecifickým potrebám a okolnostiam._

**Právne upozornenie:** Tento dokument je generovaný na základe súčasného slovenského práva. Zákony sa môžu zmeniť a individuálne okolnosti môžu vyžadovať špecifické právne poradenstvo. Pre personalizované právne poradenstvo sa obráťte na kvalifikovaného slovenského právnika.
