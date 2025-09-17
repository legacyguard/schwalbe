# 🌍 Internacionalizácia (i18n) - LegacyGuard

Dokumentácia pre novú architektúru internacionalizácie v projekte LegacyGuard.

## 📋 Obsah

- [Prehľad](#prehľad)
- [Štruktúra priečinkov](#štruktúra-priečinkov)
- [Podporované jazyky](#podporované-jazyky)
- [Jurisdikcie](#jurisdikcie)
- [Použitie](#použitie)
- [Namespaces](#namespaces)
- [Konfigurácia](#konfigurácia)
- [Pridávanie prekladov](#pridávanie-prekladov)
- [Najlepšie postupy](#najlepšie-postupy)

## Prehľad

Náš systém internacionalizácie je postavený na:

- **i18next** - Základný i18n framework
- **react-i18next** - Integrácia pre React
- **Modulárna štruktúra** - Optimalizované pre rozsiahle aplikácie
- **TypeScript podpora** - Plná typová bezpečnosť
- **Lazy loading** - Optimalizované pre výkon
- **Namespace systém** - Rozdelenie UI a obsahových textov
- **Jurisdikčná podpora** - Rôzne texty pre rôzne krajiny

### Podporované jazyky

- 🇬🇧 **en** - Angličtina (predvolený jazyk)
- 🇸🇰 **sk** - Slovenčina
- 🇨🇿 **cs** - Čeština
- 🇩🇪 **de** - Nemčina

### Jurisdikcie

- 🇸🇰 **SK** - Slovenská republika
- 🇨🇿 **CZ** - Česká republika

## Štruktúra priečinkov

```text
locales/
├── ui/                     # UI texty (tlačidlá, menu, formuláre)
│   ├── en.json            # Angličtina
│   ├── sk.json            # Slovenčina  
│   ├── cz.json            # Čeština
│   └── de.json            # Nemčina
├── content/               # Komplexné a právne texty
│   ├── wills/            # Texty pre závety
│   │   ├── sk_SK.json    # Slovensky pre SK jurisdikciu
│   │   ├── en_SK.json    # Anglicky pre SK jurisdikciu
│   │   ├── cz_SK.json    # Česky pre SK jurisdikciu
│   │   ├── de_SK.json    # Nemecky pre SK jurisdikciu
│   │   ├── cz_CS.json    # Česky pre CZ jurisdikciu
│   │   ├── en_CS.json    # Anglicky pre CZ jurisdikciu
│   │   ├── sk_CS.json    # Slovensky pre CZ jurisdikciu
│   │   └── de_CS.json    # Nemecky pre CZ jurisdikciu
│   └── family-shield/    # Texty pre Rodinný Štít
│       ├── sk_SK.json
│       ├── cs_SK.json
│       ├── en_SK.json
│       ├── de_SK.json
│       ├── sk_CZ.json
│       ├── cs_CZ.json
│       ├── en_CZ.json
│       └── de_CZ.json
└── README.md             # Táto dokumentácia
```

Jurisdikciya určuje, aké právne texty a formulácie sa použijú pre závety a iné právne dokumenty.

## Použitie

### Základné použitie UI textov

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  // Načíta UI namespace (predvolený)
  const { t } = useTranslation();
  
  return (
    <div>
      <button>{t('common.save')}</button>
      <h1>{t('navigation.wills')}</h1>
    </div>
  );
}
```

### Načítanie obsahových textov

```tsx
import { useTranslation } from 'react-i18next';
import { NamespaceLoader } from '@/lib/i18n/config';
import { useEffect } from 'react';

function WillsComponent() {
  const { t, ready } = useTranslation();
  
  useEffect(() => {
    // Načíta texty pre závety v slovenčine pre SK jurisdikciu
    NamespaceLoader.loadWills('sk', 'SK');
  }, []);
  
  if (!ready) return <div>Načítava...</div>;
  
  return (
    <div>
      {/* UI text */}
      <h1>{t('navigation.wills')}</h1>
      
      {/* Obsah pre závety */}
      <h2>{t('types.holographic', { ns: 'wills_sk_SK' })}</h2>
      <p>{t('sections.opening.declaration', { 
        ns: 'wills_sk_SK',
        testatorName: 'Ján Novák',
        birthDate: '1.1.1980',
        address: 'Bratislava'
      })}</p>
    </div>
  );
}
```

### Interpolácia

```tsx
const { t } = useTranslation();

// V prekladovom súbore:
// "welcome": "Vitaj, {{name}}!"
// "itemCount": "Máš {{count}} položku",
// "itemCount_other": "Máš {{count}} položiek"

t('welcome', { name: 'Ján' }); // Vitaj, Ján!
t('itemCount', { count: 1 });  // Máš 1 položku
t('itemCount', { count: 5 });  // Máš 5 položiek
```

## Namespaces

### UI Namespace (predvolený)

- **Názov**: `ui`
- **Účel**: Všetky UI elementy (tlačidlá, menu, formuláre, chybové správy)
- **Načítanie**: Automaticky pri štarte aplikácie
- **Súbory**: `/locales/ui/{jazyk}.json`

### Obsahové Namespaces

#### Wills Namespace

- **Názov**: `wills_{jazyk}_{jurisdikcia}`
- **Účel**: Texty pre závety a právne dokumenty
- **Načítanie**: Na požiadanie
- **Súbory**: `/locales/content/wills/{jazyk}_{jurisdikcia}.json`

#### Family Shield Namespace

- **Názov**: `family-shield_{jazyk}_{jurisdikcia}`
- **Účel**: Texty pre Rodinný Štít
- **Načítanie**: Na požiadanie
- **Súbory**: `/locales/content/family-shield/{jazyk}_{jurisdikcia}.json`

## Konfigurácia

### Načítanie obsahového namespace

```tsx
import { NamespaceLoader, getContentNamespace } from '@/lib/i18n/config';

// Pomocou pomocnej funkcie
await NamespaceLoader.loadWills('sk', 'SK');
await NamespaceLoader.loadFamilyShield('cs', 'CZ');

// Alebo všeobecne
await NamespaceLoader.loadContent('wills', 'en', 'SK');

// Získanie názvu namespace
const namespace = getContentNamespace('wills', 'sk', 'SK'); // "wills_sk_SK"
```

## Pridávanie prekladov

### Krok 1: Pridanie do anglického súboru (predvolený)

```json
// locales/ui/en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}
```

### Krok 2: Pridanie do ostatných jazykov

```json
// locales/ui/sk.json
{
  "newFeature": {
    "title": "Nová funkcia",
    "description": "Toto je nová funkcia"
  }
}
```

### Krok 3: Pre obsahové texty s jurisdikciou

```json
// locales/content/wills/sk_SK.json
{
  "newClause": {
    "title": "Nová klauzula",
    "text": "Text klauzuly podľa slovenského práva"
  }
}

// locales/content/wills/sk_CZ.json
{
  "newClause": {
    "title": "Nová klauzula", 
    "text": "Text klauzuly podľa českého práva"
  }
}
```

## Najlepšie postupy

### ✅ Odporúčané

1. **Používaj semantické názvy kľúčov**

   ```json
   {
     "form.validation.required": "Toto pole je povinné",
     "button.save.document": "Uložiť dokument"
   }
   ```

2. **Hierarchická štruktúra**

   ```json
   {
     "auth": {
       "signIn": "Prihlásiť sa",
       "signOut": "Odhlásiť sa"
     }
   }
   ```

3. **Používaj interpoláciu pre dynamický obsah**

   ```json
   {
     "greeting": "Vitaj, {{userName}}!",
     "itemCount": "Máš {{count}} položku",
     "itemCount_other": "Máš {{count}} položiek"
   }
   ```

4. **Načítavaj obsah lazy**

   ```tsx
   // Načítaj len keď potrebuješ
   useEffect(() => {
     if (showWills) {
       NamespaceLoader.loadWills(language, jurisdiction);
     }
   }, [showWills, language, jurisdiction]);
   ```

### ❌ Neodporúčané

1. **Nepoužívaj všeobecné kľúče**

   ```json
   // Zlé
   { "message": "Správa" }
   
   // Dobré  
   { "auth.success.message": "Úspešné prihlásenie" }
   ```

2. **Nehárdkóduj texty v komponentoch**

   ```tsx
   // Zlé
   <button>Uložiť</button>
   
   // Dobré
   <button>{t('common.save')}</button>
   ```

3. **Nemiešaj jazyky v jednom súbore**

   ```json
   // Zlé
   {
     "title": "Title",
     "popis": "Popis"  // Slovak v anglickom súbore
   }
   ```

## Použitie s jurisdikciami

### Príklad: Načítanie právnych textov

```tsx
function LegalDocumentComponent({ jurisdiction }: { jurisdiction: 'SK' | 'CZ' }) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguageCode;
  
  useEffect(() => {
    // Načítaj texty pre aktuálny jazyk a jurisdikciu
    NamespaceLoader.loadWills(currentLanguage, jurisdiction);
  }, [currentLanguage, jurisdiction]);
  
  const willsNamespace = getContentNamespace('wills', currentLanguage, jurisdiction);
  
  return (
    <div>
      <h1>{t('types.holographic', { ns: willsNamespace })}</h1>
      <p>{t('legal.requirements.holographic', { ns: willsNamespace })}</p>
    </div>
  );
}
```

## Vývojové nástroje

### Kontrola načítania namespace

```tsx
import { NamespaceLoader } from '@/lib/i18n/config';

// Skontroluj, či je namespace načítaný
const isLoaded = NamespaceLoader.isLoaded('wills_sk_SK');

// Získaj všetky načítané namespaces
const loaded = NamespaceLoader.getLoadedNamespaces();
console.log('Načítané:', loaded);
```

### Reset cache

```tsx
// Vymaž cache (užitočné pri testovaní)
NamespaceLoader.reset();
```

## Riešenie problémov

### Chýbajúce preklady

1. Skontroluj, či je správne načítaný namespace
2. Overeď existenciu kľúča v súbore
3. Skontroluj názov súboru a cestu

### Výkonnostné problémy

1. Používaj lazy loading pre obsahové namespaces
2. Nenačítavaj všetky jurisdikcie naraz
3. Cache namespaces pre opakované použitie

### Jurisdikčné problémy

1. Uisti sa, že máš správnu kombináciu jazyk_jurisdikcia
2. Skontroluj, či existuje súbor pre danú kombináciu
3. Používaj fallback na angličtinu ak je potrebné

## Budúce rozšírenia

- Pridanie ďalších jazykov (poľština, maďarčina)
- Rozšírenie jurisdikcií (Rakúsko, Nemecko)
- Automatické generovanie typov z JSON súborov
- CLI nástroje pre správu prekladov

---

*Posledná aktualizácia: 2024*  
*Verzia: 2.0.0*
