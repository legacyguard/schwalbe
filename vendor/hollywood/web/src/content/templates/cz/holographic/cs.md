# ZÁVĚŤ
## (Holografická závěť podle českého práva)

---

**Já, {{testatorName}}**, narozený dne {{birthDate}} v {{birthPlace}}, s rodným číslem {{personalId}}, bytem {{address}}, občan {{citizenship}}, jsem při plném vědomí a z vlastní svobodné vůle, bez jakéhokoli nátlaku či nepatřičného ovlivnění třetí osoby, učinil tuto závěť, kterou odvolávám všechny své dříve učiněné závěti a kodiciily.

---

### ČLÁNEK I - PROHLÁŠENÍ A ODVOLÁNÍ

Prohlašuji, že je mi {{age}} let a jsem duševně způsobilý. Činím tuto závěť dobrovolně a nejednám pod nátlakem, podvodem nebo nepatřičným vlivem jakékoli osoby.

Tímto odvolávám všechny dříve učiněné závěti a kodiciily.

**Tato holografická závěť** je napsána celá mou rukou a podepsána mnou, jak povoluje § 1540 občanského zákoníku.

---

### ČLÁNEK II - RODINNÝ STAV

{{#if spouse}}
Jsem {{maritalStatus}} s {{spouseName}}.
{{/if}}

{{#if children}}
Mám tyto děti:
{{#each children}}
- {{name}}, narozen {{birthDate}}{{#if isMinor}} (nezletilý){{/if}}
{{/each}}
{{else}}
Nemám žádné děti.
{{/if}}

---

### ČLÁNEK III - MAJETEK A VLASTNICTVÍ

Vlastním následující majetek:

{{#if realEstate}}
**Nemovitý majetek:**
{{#each realEstate}}
- {{type}} nacházející se na adrese {{address}}, číslo LV {{cadastralNumber}}, můj podíl vlastnictví: {{ownership}}, odhadovaná hodnota: {{estimatedValue}} Kč
{{/each}}
{{/if}}

{{#if bankAccounts}}
**Bankovní účty:**
{{#each bankAccounts}}
- {{accountType}} účet u {{bank}}, číslo účtu končící {{accountNumber}}, přibližný zůstatek: {{approximateBalance}} Kč
{{/each}}
{{/if}}

{{#if vehicles}}
**Vozidla:**
{{#each vehicles}}
- {{year}} {{make}} {{model}}, SPZ {{licensePlate}}, odhadovaná hodnota: {{estimatedValue}} Kč
{{/each}}
{{/if}}

{{#if personalProperty}}
**Movitý majetek:**
{{#each personalProperty}}
- {{description}}, v současnosti umístěno na {{location}}, odhadovaná hodnota: {{estimatedValue}} Kč
{{/each}}
{{/if}}

---

### ČLÁNEK IV - ODKAZY A ROZDĚLENÍ

{{#if forcedHeirsNotice}}
**UPOZORNĚNÍ TÝKAJÍCÍ SE NUTNÝCH DĚDICŮ:**
Podle českého práva mají následující osoby nárok na dědický podíl:
{{#if spouse}}
- Můj manžel/manželka {{spouseName}} má nárok na nejméně 1/4 mého pozůstalého majetku
{{/if}}
{{#if minorChildren}}
- Mé nezletilé děti mají nárok na nejméně 1/2 jejich zákonného dědického podílu
{{/if}}
{{#if adultChildren}}
- Mé dospělé děti mají nárok na nejméně 1/4 jejich zákonného dědického podílu
{{/if}}

Níže uvedené rozdělení respektuje tato povinná ustanovení.
{{/if}}

Odkazuji svůj majetek takto:

{{#each beneficiaries}}
**{{name}}** ({{relationship}}), bytem {{address}}, RČ/datum narození: {{personalId}}:
{{#if percentage}}
- {{percentage}}% celého mého majetku
{{/if}}
{{#if specificAssets}}
- Následující konkrétní majetek: {{specificAssets}}
{{/if}}
{{#if amount}}
- Peněžní částku {{amount}} Kč
{{/if}}
{{#if conditions}}
- Za podmínek: {{conditions}}
{{/if}}

{{/each}}

{{#if charitableBequests}}
**CHARITATIVNÍ ODKAZY:**
{{#each charitableBequests}}
- Organizaci {{organization}}: {{amount}} Kč na účel {{purpose}}
{{/each}}
{{/if}}

**UNIVERZÁLNÍ SUCCESSION:**
Veškerý zbytek mého majetku, movitého i nemovitého, jakéhokoli druhu a kdekoli se nacházející, odkazuji {{residuaryBeneficiary}} ve stejných podílech, nebo jejich potomkům podle práva zastoupení.

---

### ČLÁNEK V - VYKONAVATEL ZÁVĚTI

{{#if hasExecutor}}
Jmenuji a ustanovujem **{{executorName}}**, bytem {{executorAddress}}, vykonavatelem této závěti.

{{#if backupExecutor}}
Pokud {{executorName}} nemůže nebo nechce funkci vykonávat, jmenuji **{{backupExecutor}}** jako náhradního vykonavatele.
{{/if}}

Můj vykonavatel nebude povinen složit kauci za řádné vykonávání svých povinností.

Můj vykonavatel bude mít všechny pravomoci udělené českým právem, včetně ale neomezeně na:
- Prodej, převod a nakládání s jakýmkoli majetkem
- Placení všech dluhů, daní a nákladů správy
- Rozdělování majetku dědicům
- Zastupování pozůstalosti v právních řízeních

{{else}}
Nejmenuji žádného vykonavatele závěti. Správa pozůstalosti bude probíhat podle českého práva.
{{/if}}

---

{{#if hasMinorChildren}}
### ČLÁNEK VI - OPATROVNICTVÍ

{{#if primaryGuardian}}
Jmenuji **{{primaryGuardian.name}}**, bytem {{primaryGuardian.address}}, opatrovníkem osoby i majetku mých nezletilých dětí.

{{#if backupGuardian}}
Pokud {{primaryGuardian.name}} nemůže nebo nechce funkci vykonávat, jmenujem **{{backupGuardian.name}}**, bytem {{backupGuardian.address}}, jako náhradního opatrovníka.
{{/if}}

{{#if guardianshipInstructions}}
**Pokyny pro opatrovníky:**
{{guardianshipInstructions}}
{{/if}}
{{/if}}

---
{{/if}}

### ČLÁNEK VII - ZVLÁŠTNÍ PŘÁNÍ A POKYNY

{{#if funeralWishes}}
**Pohřební pokyny:**
{{funeralWishes}}
{{/if}}

{{#if organDonation}}
**Darování orgánů:**
{{#if organDonation.yes}}
Přeji si darovat své orgány k transplantaci a lékařskému výzkumu.
{{/if}}
{{#if organDonation.no}}
Nepřeji si darovat své orgány.
{{/if}}
{{#if organDonation.family_decides}}
Rozhodnutí o darování orgánů přenechávám své rodině.
{{/if}}
{{/if}}

{{#if digitalAssets}}
**Digitální majetek a účty:**
{{digitalAssets}}
{{/if}}

{{#if personalMessages}}
**Osobní vzkazy:**
{{#each personalMessages}}
Pro {{recipient}}: {{message}}

{{/each}}
{{/if}}

---

### ČLÁNEK VIII - ZÁVĚREČNÁ USTANOVENÍ

Tato závěť se řídí zákony České republiky.

Pokud by jakékoli ustanovení této závěti bylo považováno za neplatné nebo nevymahatelné, ostatní ustanovení zůstávají v plné platnosti.

Pečlivě jsem si tuto závěť přečetl a správně odráží má přání a záměry.

---

### PODPIS

**PODPIS HOLOGRAFICKÉ ZÁVĚTI:**
Celá tato závěť je napsána mou rukou a podepsána mnou dne {{currentDate}}.

**DŮLEŽITÉ POKYNY PRO VÁS:**
Aby byla tato závěť právně platná podle českého práva, musíte:
1. Celý tento text přepsat vlastní rukou na papír
2. Podepsat svým plným podpisem
3. Datovat v den podpisu
4. Uložit na bezpečném místě a informovat vykonavatele nebo důvěryhodného člena rodiny o jeho umístění

Podpis: ________________________
{{testatorName}}

Datum: ____________________________

---

*Tato závěť byla vygenerována pomocí inteligentního systému tvorby závětí LegacyGuard. Ačkoli tato šablona je v souladu s českými právními požadavky, doporučujeme nechat ji zkontrolovat kvalifikovaným českým právníkem, aby zajistil, že vyhovuje vašim specifickým potřebám a okolnostem.*

**Právní upozornění:** Tento dokument je generován na základě současného českého práva. Zákony se mohou změnit a individuální okolnosti mohou vyžadovat specifické právní poradenství. Pro personalizované právní poradenství se obraťte na kvalifikovaného českého právníka.