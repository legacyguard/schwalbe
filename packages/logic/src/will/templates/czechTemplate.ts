/**
 * Czech Republic Will Template
 * Comprehensive template for Czech legal requirements
 */

import type { TemplateContext } from './index';

export function renderCzechWill(ctx: TemplateContext): string {
  const today = new Date().toLocaleDateString('cs-CZ');

  const template = `
# ZÁVĚŤ

**Osobní údaje zůstavitele:**
Jméno: {{testator}}
Adresa: {{address}}
Datum narození: {{birthDate}}

**Prohlášení:**
Já, {{testator}}, občan České republiky, bytem {{address}}, jsem starší osmnácti let, svéprávný a při zdravém rozumu. Tímto činím svoji závěť podle § 1491 a následujících občanského zákoníku.

**Zrušení předchozích závětí:**
Tímto zruším všechny své předchozí závěti a kodicily, pokud nějaké existují.

## Ustanovení dědiců

{{beneficiariesSection}}

## Ustanovení vykonavatele závěti

{{executorSection}}

{{guardianshipSection}}

## Zvláštní ustanovení

{{specialInstructions}}

**Právní poznámky:**
- Tato závěť je učinjena v souladu se zákonem č. 89/2012 Sb., občanský zákoník
- Zůstavitel prohlašuje, že při pořizování této závěti byl při zdravém rozumu
- Závěť byla pořízena vlastní vůlí bez jakéhokoli donucení nebo ovlivnění

**Datum a místo:**
Pořízeno dne {{date}} v {{place}}

**Podpis zůstavitele:**
_________________________
{{testator}}

{{witnessSection}}

---
*Tato závěť byla vygenerována systémem LegacyGuard a slouží jako návrhový dokument. Pro právní platnost je nutné dodržet všechny zákonné požadavky včetně formy a případného ověření.*
`;

  const data = {
    testator: ctx.testator,
    address: ctx.address,
    birthDate: ctx.testatorBirthDate || 'neuvedeno',
    date: today,
    place: ctx.testatorCity || 'České republice',
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
    return 'Svým univerzálním dědicem ustanovuji stát (pokud nejsou ustanoveni jiní dědici).';
  }

  let section = 'Svojimi dědici ustanovuji:\n\n';

  ctx.beneficiaries.forEach((beneficiary, index) => {
    const relationship = beneficiary.relationship ? ` (${translateRelationship(beneficiary.relationship)})` : '';
    section += `${index + 1}. **${beneficiary.name}**${relationship}\n`;

    if (beneficiary.share) {
      if (beneficiary.share.type === 'percentage') {
        section += `   - Podíl na dědictví: ${beneficiary.share.value}%\n`;
      } else if (beneficiary.share.type === 'amount') {
        section += `   - Odkaz ve výši: ${beneficiary.share.value} Kč\n`;
      } else if (beneficiary.share.type === 'specific_asset') {
        section += `   - Konkrétní majetek: ${beneficiary.share.description}\n`;
      }
    }

    if (beneficiary.conditions) {
      section += `   - Podmínka: ${beneficiary.conditions}\n`;
    }

    section += '\n';
  });

  return section;
}

function renderExecutor(ctx: TemplateContext): string {
  if (!ctx.executorName) {
    return 'Vykonavatele závěti neustanovuji.';
  }

  return `Vykonavatelem závěti ustanovuji **${ctx.executorName}**.

Vykonavatel je oprávněn zejména k:
- Převzetí pozůstalosti a jejímu spravování
- Vypořádání dluhů zůstavitele
- Rozdělení dědictví mezi dědice
- Zastupování pozůstalosti v právních vztazích
- Plnění všech povinností vyplývajících z této závěti

Vykonavatel má nárok na přiměřenou odměnu podle § 1538 občanského zákoníku.`;
}

function renderGuardianship(ctx: TemplateContext): string {
  if (!ctx.guardianship || !ctx.guardianship.length) {
    return '';
  }

  let section = '\n## Ustanovení poručníka nezletilých dětí\n\n';

  ctx.guardianship.forEach((guardian, index) => {
    if (guardian.primaryGuardian) {
      section += `**Poručník pro dítě ${guardian.childName || `dítě ${index + 1}`}:**\n`;
      section += `Hlavní poručník: ${guardian.primaryGuardian.name}\n`;

      if (guardian.alternateGuardian) {
        section += `Náhradní poručník: ${guardian.alternateGuardian.name}\n`;
      }

      if (guardian.specialInstructions) {
        section += `Zvláštní pokyny: ${guardian.specialInstructions}\n`;
      }

      section += '\n';
    }
  });

  return section;
}

function renderSpecialInstructions(ctx: TemplateContext): string {
  let section = '';

  if (ctx.funeralWishes) {
    section += `**Pohřební přání:**\n${ctx.funeralWishes}\n\n`;
  }

  if (ctx.organDonation) {
    section += `**Darování orgánů:** Souhlasím s darováním svých orgánů pro transplantace.\n\n`;
  }

  if (ctx.petCare) {
    section += `**Péče o domácí zvířata:** ${ctx.petCare}\n\n`;
  }

  if (ctx.digitalAssets) {
    section += `**Digitální majetek:** ${ctx.digitalAssets}\n\n`;
  }

  if (!section) {
    section = 'Žádná zvláštní ustanovení.';
  }

  return section;
}

function renderWitnessSection(ctx: TemplateContext): string {
  if (ctx.form === 'holographic') {
    return `
**Holografní závěť:**
Tato závěť je psána vlastní rukou zůstavitele a je vlastnoručně podepsána. Podle § 1496 občanského zákoníku není nutné ověření svědky.`;
  }

  return `
**Svědci:**
Tato závěť byla učinjena za přítomnosti dvou svědků, kteří současně připojí své podpisy.

1. Svědek: _________________________
   Jméno: {{witness1}}
   Datum narození: _______________
   Podpis: _______________________

2. Svědek: _________________________
   Jméno: {{witness2}}
   Datum narození: _______________
   Podpis: _______________________

Svědci potvrzují, že:
- Zůstavitel podepsal závěť za jejich přítomnosti
- Zůstavitel jim sdělil, že jde o jeho závěť
- Zůstavitel byl při zdravém rozumu a jednal z vlastní vůle
- Svědci podepsali závěť za přítomnosti zůstavitele a navzájem za své přítomnosti`;
}

function translateRelationship(relationship: string): string {
  const translations: Record<string, string> = {
    'spouse': 'manžel/manželka',
    'child': 'dítě',
    'parent': 'rodič',
    'sibling': 'sourozenec',
    'grandchild': 'vnuk/vnučka',
    'friend': 'přítel',
    'charity': 'charita',
    'other': 'ostatní'
  };

  return translations[relationship] || relationship;
}

function interpolate(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || `{{${key}}}`);
}