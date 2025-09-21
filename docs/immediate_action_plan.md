# OKAMŽITÝ AKČNÝ PLÁN - Schwalbe Monorepo

## 🚨 KRITICKÝ STAV - VYŽADUJE OKAMŽITÉ RIEŠENIE

### Aktuálny stav (17. september 2025):
- ✅ **Packages**: Všetky sa buildujú úspešne
- ❌ **Web App**: Build zlyháva kvôli cookie konfliktu
- ❌ **Web-Next**: Build zlyháva kvôli React context chybám  
- ❌ **Mobile**: 166 TypeScript chýb
- ⚠️ **React verzie**: Stále nekonzistentné (18.3.1 vs 19.1.1)

## 🎯 TOP 3 KRITICKÉ PROBLÉMY NA OKAMŽITÉ RIEŠENIE

### 1. COOKIE KONFLIKT (Blokuje web build)
**Problém**: `"parse" is not exported by cookie/dist/index.js`
**Riešenie**: Aktualizovať cookie package

### 2. REACT VERZIE KONFLIKT 
**Problém**: Nekonzistentné verzie React (18.3.1 vs 19.1.1)
**Riešenie**: Zjednotiť na jednu verziu

### 3. TYPESCRIPT CHYBY V MOBILE
**Problém**: 166 TypeScript chýb blokujú mobile build
**Riešenie**: Opraviť kompatibilitu s React verziou

## 🔧 OKAMŽITÉ KROKY (Vykonať TERAZ)

### KROK 1: Oprava Cookie Konfliktu (5 minút)
```bash
# Odstrániť cookie override z root package.json
# Aktualizovať na najnovšiu verziu
npm install cookie@latest
```

### KROK 2: Zjednotenie React Verzií (10 minút)
```bash
# Zjednotiť všetky na React 18.3.1 (stabilnejšia verzia)
# Upraviť package.json súbory
```

### KROK 3: Preinštalovanie Závislostí (5 minút)
```bash
rm -rf node_modules package-lock.json
npm install
```

### KROK 4: Testovanie Build (5 minút)
```bash
npm run build:packages
npm run build:web
```

## 📋 DETAILNÉ INŠTRUKCIE

### A. Oprava Cookie Konfliktu

1. **Upraviť root package.json**:
   - Odstrániť `"cookie": "0.6.0"` z `overrides`
   - Alebo aktualizovať na `"cookie": "^0.7.0"`

2. **Aktualizovať závislosti**:
   ```bash
   npm audit fix --force
   ```

### B. Zjednotenie React Verzií

**Cieľová verzia: React 18.3.1** (stabilnejšia pre všetky komponenty)

1. **apps/demo/package.json**: `"react": "18.3.1"`
2. **apps/web/package.json**: `"react": "18.3.1"`  
3. **packages/shared/package.json**: `"react": "18.3.1"`

### C. Pridanie Overrides do Root Package.json
```json
"overrides": {
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "cookie": "^0.7.0"
}
```

## ⚡ RÝCHLE RIEŠENIE ZA 15 MINÚT

Ak chcete **okamžite** opraviť build, vykonajte tieto príkazy:

```bash
# 1. Oprava cookie
sed -i 's/"cookie": "0.6.0"/"cookie": "^0.7.0"/' package.json

# 2. Zjednotenie React verzií
sed -i 's/"react": "\^19\.1\.1"/"react": "18.3.1"/g' apps/*/package.json packages/*/package.json

# 3. Preinštalovanie
rm -rf node_modules package-lock.json
npm install

# 4. Test build
npm run build:web
```

## 🎯 OČAKÁVANÉ VÝSLEDKY

Po vykonaní týchto krokov:
- ✅ Web app build by mal fungovať
- ✅ Packages budú stále fungovať  
- ⚠️ Mobile app bude stále mať TypeScript chyby (riešiť v ďalšej fáze)
- ✅ Konzistentné verzie závislostí

## 🚨 VAROVANIE

**PRED** vykonaním týchto zmien:
1. Commitnite aktuálny stav: `git add . && git commit -m "backup before fixes"`
2. Vytvorte backup branch: `git checkout -b backup-before-fixes`
3. Vráťte sa na main: `git checkout main`

## 📞 ĎALŠIE KROKY

Po oprave kritických problémov:
1. Oprava TypeScript chýb v mobile app
2. Konsolidácia web vs web-next aplikácií  
3. Zavedenie testov
4. Audit bezpečnosti

