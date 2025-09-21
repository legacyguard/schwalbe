/**
 * Slovak Republic Will Template
 * Comprehensive template for Slovak legal requirements
 */

import type { TemplateContext } from './index';

export function renderSlovakWill(ctx: TemplateContext): string {
  const today = new Date().toLocaleDateString('sk-SK');

  const template = `
# TESTAMENT

**Osobné údaje poručiteľa:**
Meno: {{testator}}
Adresa: {{address}}
Dátum narodenia: {{birthDate}}

**Vyhlásenie:**
Ja, {{testator}}, občan Slovenskej republiky, bytom {{address}}, som starší osemnásť rokov, spôsobilý na právne úkony a pri zdravom rozume. Týmto činím svoj testament podľa § 476 a nasledujúcich občianskeho zákonníka.

**Zrušenie predchádzajúcich testamentov:**
Týmto ruším všetky svoje predchádzajúce testamenty a kodicily, pokiaľ nejaké existujú.

## Ustanovenie dedičov

{{beneficiariesSection}}

## Ustanovenie vykonávateľa testamentu

{{executorSection}}

{{guardianshipSection}}

## Zvláštne ustanovenia

{{specialInstructions}}

**Právne poznámky:**
- Tento testament je učinený v súlade so zákonom č. 40/1964 Zb., občiansky zákonník
- Poručiteľ vyhlasuje, že pri spísaní tohto testamentu bol pri zdravom rozume
- Testament bol spísaný z vlastnej vôle bez akéhokoľvek nútenia alebo ovplyvnenia

**Dátum a miesto:**
Spísané dňa {{date}} v {{place}}

**Podpis poručiteľa:**
_________________________
{{testator}}

{{witnessSection}}

---
*Tento testament bol vygenerovaný systémom LegacyGuard a slúži ako návrhový dokument. Pre právnu platnosť je nutné dodržať všetky zákonné požiadavky vrátane formy a prípadného overenia.*
`;

  const data = {
    testator: ctx.testator,
    address: ctx.address,
    birthDate: ctx.testatorBirthDate || 'neuvedené',
    date: today,
    place: ctx.testatorCity || 'Slovenskej republike',
    beneficiariesSection: renderBeneficiaries(ctx),
    executorSection: renderExecutor(ctx),
    guardianshipSection: renderGuardianship(ctx),
    specialInstructions: renderSpecialInstructions(ctx),
    witnessSection: renderWitnessSection(ctx)
  };

  return interpolate(template, data);
}

function renderBeneficiaries(ctx: TemplateContext): string {
  if (!ctx.beneficiaries.length) {
    return 'Svojím univerzálnym dedičom ustanovujem štát (pokiaľ nie sú ustanovení iní dedičia).';
  }

  let section = 'Svojimi dedičmi ustanovujem:\n\n';

  ctx.beneficiaries.forEach((beneficiary, index) => {
    const relationship = beneficiary.relationship ? ` (${translateRelationship(beneficiary.relationship)})` : '';
    section += `${index + 1}. **${beneficiary.name}**${relationship}\n`;

    if (beneficiary.share) {
      if (beneficiary.share.type === 'percentage') {
        section += `   - Podiel na dedičstve: ${beneficiary.share.value}%\n`;
      } else if (beneficiary.share.type === 'amount') {
        section += `   - Odkaz vo výške: ${beneficiary.share.value} €\n`;
      } else if (beneficiary.share.type === 'specific_asset') {
        section += `   - Konkrétny majetok: ${beneficiary.share.description}\n`;
      }
    }

    if (beneficiary.conditions) {
      section += `   - Podmienka: ${beneficiary.conditions}\n`;
    }

    section += '\n';
  });

  return section;
}

function renderExecutor(ctx: TemplateContext): string {
  if (!ctx.executorName) {
    return 'Vykonávateľa testamentu neustanovujem.';
  }

  return `Vykonávateľom testamentu ustanovujem **${ctx.executorName}**.

Vykonávateľ je oprávnený najmä k:
- Prevzatiu pozostalosti a jej spravovaniu
- Vypořiadaniu dlhov poručiteľa
- Rozdeleniu dedičstva medzi dedičov
- Zastupovaniu pozostalosti v právnych vzťahoch
- Plneniu všetkých povinností vyplývajúcich z tohto testamentu

Vykonávateľ má nárok na primeranú odmenu podľa § 486 občianskeho zákonníka.`;
}

function renderGuardianship(ctx: TemplateContext): string {
  if (!ctx.guardianship || !ctx.guardianship.length) {
    return '';
  }

  let section = '\n## Ustanovenie poručníka maloletých detí\n\n';

  ctx.guardianship.forEach((guardian, index) => {
    if (guardian.primaryGuardian) {
      section += `**Poručník pre dieťa ${guardian.childName || `dieťa ${index + 1}`}:**\n`;
      section += `Hlavný poručník: ${guardian.primaryGuardian.name}\n`;

      if (guardian.alternateGuardian) {
        section += `Náhradný poručník: ${guardian.alternateGuardian.name}\n`;
      }

      if (guardian.specialInstructions) {
        section += `Zvláštne pokyny: ${guardian.specialInstructions}\n`;
      }

      section += '\n';
    }
  });

  return section;
}

function renderSpecialInstructions(ctx: TemplateContext): string {
  let section = '';

  if (ctx.funeralWishes) {
    section += `**Pohrebné priania:**\n${ctx.funeralWishes}\n\n`;
  }

  if (ctx.organDonation) {
    section += `**Darovanie orgánov:** Súhlasím s darovaním svojich orgánov pre transplantácie.\n\n`;
  }

  if (ctx.petCare) {
    section += `**Starostlivosť o domáce zvieratá:** ${ctx.petCare}\n\n`;
  }

  if (ctx.digitalAssets) {
    section += `**Digitálny majetok:** ${ctx.digitalAssets}\n\n`;
  }

  if (!section) {
    section = 'Žiadne zvláštne ustanovenia.';
  }

  return section;
}

function renderWitnessSection(ctx: TemplateContext): string {
  if (ctx.form === 'holographic') {
    return `
**Holografický testament:**
Tento testament je písaný vlastnou rukou poručiteľa a je vlastnoručne podpísaný. Podľa § 477 občianskeho zákonníka nie je nutné overenie svedkami.`;
  }

  return `
**Svedkovia:**
Tento testament bol učinený za prítomnosti dvoch svedkov, ktorí súčasne pripoja svoje podpisy.

1. Svedok: _________________________
   Meno: {{witness1}}
   Dátum narodenia: _______________
   Podpis: _______________________

2. Svedok: _________________________
   Meno: {{witness2}}
   Dátum narodenia: _______________
   Podpis: _______________________

Svedkovia potvrdzujú, že:
- Poručiteľ podpísal testament za ich prítomnosti
- Poručiteľ im oznámil, že ide o jeho testament
- Poručiteľ bol pri zdravom rozume a konal z vlastnej vôle
- Svedkovia podpísali testament za prítomnosti poručiteľa a navzájom za svojej prítomnosti`;
}

function translateRelationship(relationship: string): string {
  const translations: Record<string, string> = {
    'spouse': 'manžel/manželka',
    'child': 'dieťa',
    'parent': 'rodič',
    'sibling': 'súrodenec',
    'grandchild': 'vnuk/vnučka',
    'friend': 'priateľ',
    'charity': 'charita',
    'other': 'ostatné'
  };

  return translations[relationship] || relationship;
}

function interpolate(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || `{{${key}}}`);
}