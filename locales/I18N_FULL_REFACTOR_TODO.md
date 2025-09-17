# I18n Hardcoded Texts Refaktoring: Granulárny To-Do List (Web + Mobil)

_Účel: Kompletný zoznam úloh a kroky refaktoringu všetkých užívateľských textov – sleduj podľa tohto checklistu, aby nič neuniklo a všetko bolo v správnych segmentoch prekladov._

---

## 1. Príprava a systémová evidencia
- [x] Zmapovať adresárovú štruktúru celej codebase (web i mobil) na všetky .tsx/.ts/.js/.jsx súbory.
- [x] Spustiť globálny grep/scan na všetky potenciálne hardcoded texty pre užívateľa (okrem importov, typov a systémového configu).
- [x] Vytvoriť základ MASTER CHECKLIST všetkých UI/feature/templátových súborov ([locales/MASTER_SCREEN_COMPONENTS_LIST.csv](MASTER_SCREEN_COMPONENTS_LIST.csv)) (viz REFAC_TRANSLATION_PLAN.md)

---

## 2. Systematická práca SÚBOR po SÚBORE (granulárne pre každý súbor/oblasť)
_Pri každom konkrétnom súbore vykonaj postup:_

- [ ] 1. **Identifikuj všetky hardcoded texty určené pre užívateľa** (aj interpolované, viacjazyčné, hidden/aria popisky, systémové hlášky)
- [ ] 2. **Navrhni jednoznačný a zrozumiteľný kľúč** (viz doména, sekcia, funkcia)
- [ ] 3. **Zaraď kľúč do správneho segmentového/namespace JSON** (podľa pravidiel: >=200, <700 riadkov; delenie feature, UI, content sekcie)
- [ ] 4. **Nahrad v kóde t() alebo t() + namespace** (podľa komponentu/obsahu)
- [ ] 5. **Označ, že tento konkrétny string/kľúč je presunutý a riadne preložený** IBA v EN na úvod.
- [ ] 6. **Pri naplnení segmentu riadkami (>680) – založ nový segment** podľa štruktúry (dashboard-2, willWizard.2 en.json, atď.)
- [ ] 7. **Skontroluj, že segment nikde nemá <200 riadkov (dočasný buffer povolený len pri priebežnom splite).**
- [ ] 8. **Po každom refaktoringu pripraviť mini PR/commit a update checklistu.**

---

## 3. Modulárny blokový checklist podľa DOMÉN/priečinkov
_(príklad – edituj pri rozšírení projektu)_

### 3.1 Web aplikácia: src/pages, src/components, src/templates
- [ ] DashboardContent.tsx
- [ ] EmergencyDashboard.tsx
- [ ] MonitoringPage.tsx
- [ ] TimeCapsule.tsx
- [ ] Settings.tsx
- [ ] Profile.tsx
- [ ] LegacyOverviewSection.tsx
- [ ] ActivityFeed.tsx
- [ ] All remaining web screens, layouts, modal dialogs...

### 3.2 Web Wizards/Features
- [ ] WillGeneratorWizard.tsx
- [ ] FamilyShieldFeature.tsx
- [ ] VaultFeature.tsx
- [ ] ...

### 3.3 Mobilná aplikácia: mobile/src/screens, mobile/src/components
- [ ] DashboardScreen.tsx
- [ ] DashboardScreenV2.tsx
- [ ] WillGeneratorWizard.tsx (mobile variant)
- [ ] DocumentsScreen.tsx
- [ ] ProfileScreen.tsx
- [ ] PeopleScreen.tsx
- [ ] ScannerScreen.tsx
- [ ] All authentication/intro screens...
- [ ] Všetky moda dialogs & popups v mobile...

### 3.4 Šablóny, business/notifikačná vrstva
- [ ] E-mail templates (notifikácie, alerts)
- [ ] Systemové validácie (chybové správy z backendu)
- [ ] Notification alerts, toast/error popups

---

## 4. Delenie a segmentácia prekladových súborov – vždy pri plnení podľa guideline
- [ ] Skontrolovať počet riadkov v každom JSON segmente po zaplnení (wc -l, workflow script, i18n:check-size)
- [ ] Pri naplnení zakladať ďalší segment podľa domény a pokračovať

---

## 5. Súhrnná evidencia & dokumentácia
- [ ] Po každej väčšej oblasti aktualizovať `REFAC_TRANSLATION_PLAN.md`
- [ ] Po každom bloku aktualizovať interaktívny checklist
- [ ] Kontrolovať duplicity a spoločné (common) kľúče v common segmente
- [ ] Udržiavať prehľadnú štruktúru podľa `/locales/EXPANSION_COMPLETED.md`
- [ ] Na záver preveriť stav proti CLI toolom (i18n-scan, i18n:validate, i18n:coverage...)

---

## 6. Príprava na ďalšie jazykové/multijazykové rozšírenie (po EN refaktoringu)
- [ ] Skopírovať každý segment do ďalšieho jazyka (sk, de, cs...)
- [ ] Koordinovať ďalšie refaktoringy len do už segmentovaných a EN naplnených JSON
- [ ] Pred každým ďalším PR kontrolovať veľkostné a typové limity (CI checks)

---

Týmto todo-listom nevznikne v produkcii žiadny "zabudnutý" string a všetky nové feature budú systematicky segmentované, testované a pripravené na ďalšie preklady.

---
