# LegacyGuard – Komplexný plán refaktoringu všetkých hardcoded textov

*Posledná aktualizácia: 2025-09-02*

---

## 🧭 ÚČEL TOHTO DOKUMENTU

Tento dokument slúži ako centrálna evidencia a algoritmus pre systematický refaktoring všetkých užívateľských textov (web + mobil) podľa pravidiel vášho i18n systému. Slúži na plánovanie, rozdelenie práce, sledovanie pokroku a kontrolu správnej segmentácie prekladových súborov.

## 1. DEFINOVANÉ PRAVIDLÁ – VÝŤAH Z ARCHITEKTÚRY
- **Všetky texty musia byť v ENGLISH (default).**
- Každý hardcoded užívateľský string = vlastný lokalizačný kľúč
- Všetky texty sa ukladajú do modularizovaných JSON súborov podľa `/locales/README.md`, `/locales/EXPANSION_COMPLETED.md`
- **Každý prekladový súbor** musí mať >200 riadkov a <700 riadkov
- Pri rozsiahlom UI je povolené a žiadané ďalšie delenie segmentov podľa domén, features, sekcií...
- **Spoločné kľúče (buttony, errors, alerts...)** patria do common/segmentu, nevytvárať duplicity.

## 2. STRATEGICKÝ POSTUP: DOKUMENTOVANÝ PIPELINE

### 2.1. PRIESKUM A ANALÝZA
- [x] Sken všetkých web/mobil UI komponentov – súpis v [MASTER_SCREEN_COMPONENTS_LIST.csv](MASTER_SCREEN_COMPONENTS_LIST.csv)
- [x] Checklist: každý súbor má byť aspoň raz analyzovaný a zaradený do segmentu


### 2.2. MODULÁRNE DELENIE (podľa počtu kľúčov/riadkov)
- Každý segment JSON začať napĺňať EN verziou
- Od 200 do 700 riadkov (využívať split automaticky podľa guidelines)
- Priebežne (pri naplnení segmentu): označiť v tabuľke a pokračovať do ďalšieho segmentu podľa template
- Segmentácia podľa feature/domeny:
  - `/locales/ui/dashboard.en.json` (web dashboard UI)
  - `/locales/ui/profile.en.json` (user profile)
  - `/locales/ui/common.en.json` (všeobecné tlačidlá, errors, alerts...)
  - `/locales/content/wills/en_SK.json` (obsahové texty pre wills wizard)
  - `/locales/content/family-shield/en_CZ.json`, atď.
  - podľa potreby: `/locales/ui/dashboard-2.en.json`, `/locales/content/wills/en_SK.2.json`


### 2.3. REFAKTORINGOVÝ CHECKLIST PRE KAŽDÝ SÚBOR:
- [ ] Prejsť súbor po súbore
  - [ ] **Identifikovať každý string pre užívateľa**
  - [ ] **Navrhnúť logický kľúč** (podľa domény)
  - [ ] **Nahradiť v kóde za `t('key')` alebo `t('key', { ns: ... })`**
  - [ ] **Zapísať EN preklad do správneho segmentu**
  - [ ] **Rozdeliť segment, ak riadky prekročia 700**
  - [ ] **Označiť v tomto dokumente, že je hotový**


---

## 3. INTERAKTÍVNY MASTER CHECKLIST (doplniť podľa konkrétnych komponentov/reálneho stavu)

### UI komponenty – web:
- [ ] DashboardContent.tsx  ✔️
- [ ] EmergencyDashboard.tsx
- [ ] MonitoringPage.tsx
- [ ] TimeCapsule.tsx
- [ ] Settings.tsx
- [ ] Profile.tsx etc.

### Mobilné screeny:
- [ ] DashboardScreen.tsx
- [ ] DashboardScreenV2.tsx
- [ ] WillGeneratorWizard.tsx
- [ ] DocumentsScreen.tsx
- [ ] ProfileScreen.tsx, etc.

### Šablóny / ostatné:
- [ ] E-mail template-y
- [ ] Ostatné system validácie, alerts

*(Tento zoznam sa rozširuje podľa skutočnej štruktúry projektu a vzniká ako priložený .csv alebo .md checklist paralelne s refaktoringom!)*


---

## 4. ALGORITMUS DELENIA PREKLADOVÝCH SEGMENTOV

### Delenie a rozširovanie súborov:
#### Ak JSON segment prekročí 700 riadkov:
- [ ] Ukončiť segment, založiť ďalší podľa vzoru (`ui/dashboard-2.en.json` alebo `wills/en_SK.2.json`)
- [ ] Nové prekladové kľúče pokračujú v ďalšom segmente
#### Ak segment nemá ešte 200 riadkov:
- [ ] Dopĺňať do existujúceho segmentu, až kým kritérium neprekročí 200

#### Kontrola a validácia segmentácie:
- [ ] Pred commitom/testom vždy spustiť CLI tool na kontrolu veľkostí a coverage:
  - `npm run i18n:validate`
  - `npm run i18n:check-size`
  - `npm run i18n:check-missing`

---

## 5. NÁSTROJE NA KONTROLU & MAINTENANCE
- CLI skener kľúčov: `npx i18n-scan src/**/*.tsx`
- Skript na delenie: `npx i18n-split locales/ui/en.json --max-size=700 --min-size=200`
- Validátor pokrytia: `npm run i18n:coverage`


---

## 6. ÚDRŽBA, ROZŠÍRENIE A KOORDINÁCIA
- Pri rozšírení na ďalší jazyk kopírovať EN segmenty a napĺňať podľa potreby.
- Každý nový feature PR = aktualizácia/označenie v tomto checklist-dokumente!

---

## 7. VZOR (TEMPLATE) PRE NOVÝ SEGMENT (napíš vždy EN as default):
```json
// example file: locales/ui/dashboard-2.en.json
{
  "metrics": { ... },
  "notifications": { ... },
  ...
}
```

**POZNÁMKA:** Tento dokument slúži na sledovanie a audit hotových/blokovaných oblastí a je aktuálnou CESTOVNOU MAPOU refaktoringu i18n naprieč celým projektom.

---

*Plán bol zostavený a synchronizovaný podľa: `/locales/README.md`, `/locales/EXPANSION_COMPLETED.md`, stratégie v I18N_MODULAR_STRATEGY.md (docs), CI kontroly.*

