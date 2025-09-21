# Modulárna i18n Stratégia pre LegacyGuard

## 🎯 Hlavné princípy

### 1. Domain-Driven Translation Structure

Rozdelenie prekladov podľa funkčných domén aplikácie, nie podľa technických komponentov.

### 2. Optimálna veľkosť súborov

- **Target: 100-500 riadkov** na JSON súbor
- Maximálne 800 riadkov pre komplexné moduly
- Minimálne 50 riadkov pre samostatné moduly

### 3. Hierarchická organizácia

Trojúrovňová štruktúra: `domain.feature.element`

## 📁 Navrhovaná štruktúra súborov

```text
public/locales/
├── {lang}/                         # Jazyk (en, cs, sk, de, ...)
│   ├── common/                     # Zdieľané preklady
│   │   ├── actions.json            # 50-100 riadkov
│   │   ├── validation.json         # 50-100 riadkov
│   │   ├── status.json             # 50 riadkov
│   │   ├── time.json               # 50 riadkov
│   │   └── formats.json            # 30 riadkov
│   │
│   ├── auth/                       # Autentifikačná doména
│   │   ├── signin.json             # 80 riadkov
│   │   ├── signup.json             # 100 riadkov
│   │   ├── reset.json              # 60 riadkov
│   │   └── errors.json             # 50 riadkov
│   │
│   ├── dashboard/                  # Dashboard doména
│   │   ├── main.json               # 150 riadkov
│   │   ├── widgets.json            # 200 riadkov
│   │   ├── stats.json              # 100 riadkov
│   │   └── alerts.json             # 80 riadkov
│   │
│   ├── documents/                  # Dokumenty doména
│   │   ├── list.json               # 150 riadkov
│   │   ├── upload.json             # 200 riadkov
│   │   ├── categories.json         # 100 riadkov
│   │   ├── metadata.json           # 150 riadkov
│   │   └── ocr.json                # 100 riadkov
│   │
│   ├── family/                     # Rodina doména
│   │   ├── members.json            # 150 riadkov
│   │   ├── guardians.json          # 200 riadkov
│   │   ├── beneficiaries.json      # 150 riadkov
│   │   └── relationships.json      # 100 riadkov
│   │
│   ├── will/                       # Testament doména
│   │   ├── wizard.json             # 300 riadkov
│   │   ├── personal.json           # 150 riadkov
│   │   ├── assets.json             # 200 riadkov
│   │   ├── distribution.json       # 200 riadkov
│   │   └── review.json             # 100 riadkov
│   │
│   ├── vault/                      # Trezor doména
│   │   ├── overview.json           # 150 riadkov
│   │   ├── security.json           # 100 riadkov
│   │   ├── sharing.json            # 150 riadkov
│   │   └── encryption.json         # 100 riadkov
│   │
│   ├── legal/                      # Právne texty
│   │   ├── terms.json              # 500 riadkov
│   │   ├── privacy.json            # 400 riadkov
│   │   ├── disclaimers.json        # 200 riadkov
│   │   └── help.json               # 300 riadkov
│   │
│   ├── notifications/              # Notifikácie
│   │   ├── email.json              # 200 riadkov
│   │   ├── push.json               # 100 riadkov
│   │   ├── inapp.json              # 150 riadkov
│   │   └── templates.json          # 300 riadkov
│   │
│   ├── onboarding/                 # Onboarding
│   │   ├── welcome.json            # 100 riadkov
│   │   ├── scenes.json             # 400 riadkov
│   │   ├── questions.json          # 200 riadkov
│   │   └── tips.json               # 150 riadkov
│   │
│   └── settings/                   # Nastavenia
│       ├── profile.json            # 150 riadkov
│       ├── security.json           # 200 riadkov
│       ├── preferences.json        # 150 riadkov
│       └── billing.json            # 100 riadkov
│
└── {jurisdiction}/                 # Jurisdikčné špecifiká
    └── {lang}/
        ├── legal-terms.json        # 500-800 riadkov
        ├── tax-terms.json          # 200 riadkov
        ├── notary-terms.json       # 150 riadkov
        └── procedures.json         # 300 riadkov
```

## 🔧 Implementačná stratégia

### 1. Translation Key Naming Convention

```typescript
// Pattern: domain.feature.element.state
// Príklady:
"documents.upload.button.label"
"documents.upload.error.size_too_large"
"documents.list.empty.title"
"family.member.form.field.name"
```

### 2. Namespace Loading Strategy

```typescript
// Pre stránku Dokumenty
const namespaces = [
  'common/actions',      // Zdieľané akcie
  'common/validation',   // Validácie
  'documents/list',      // Hlavný namespace
  'documents/upload',    // Pri otvorení upload modalu
  'documents/categories' // Lazy load pri filtrovaní
];
```

### 3. Automatická organizácia pomocou skriptov

```typescript
// scripts/organize-translations.ts
interface TranslationModule {
  namespace: string;
  keys: Record<string, any>;
  lineCount: number;
  dependencies: string[];
}

class TranslationOrganizer {
  private modules: Map<string, TranslationModule> = new Map();
  private readonly MAX_LINES = 500;
  private readonly MIN_LINES = 50;
  
  analyzeCurrentStructure() {
    // Analyzuje existujúce preklady
  }
  
  suggestOptimalSplit() {
    // Navrhne optimálne rozdelenie
  }
  
  autoSplit(namespace: string) {
    // Automaticky rozdelí veľké súbory
  }
  
  mergeSimilar() {
    // Zlúči malé podobné moduly
  }
  
  generateReport() {
    // Vygeneruje report o štruktúre
  }
}
```

## 📊 Metriky a pravidlá

### Kedy rozdeliť súbor

1. **Viac ako 500 riadkov**
2. **Viac ako 3 úrovne vnorenia**
3. **Nezávislé funkčné celky**
4. **Rôzne loading stratégie**

### Kedy zlúčiť súbory

1. **Menej ako 50 riadkov**
2. **Silná funkčná súvislosť**
3. **Vždy sa loadujú spolu**
4. **Zdieľajú kontext**

## 🚀 Migračný plán

### Fáza 1: Analýza (1-2 dni)

```bash
# Skript na analýzu existujúcich textov
npm run i18n:analyze

# Output:
# - Počet hardcoded textov: 2,847
# - Odhadovaný počet kľúčov: 1,423
# - Navrhovaných modulov: 42
# - Priemerná veľkosť modulu: 150 riadkov
```

### Fáza 2: Extrahovanie (3-5 dní)

```bash
# Automatické extrahovanie textov
npm run i18n:extract --domain=dashboard
npm run i18n:extract --domain=documents
# ...

# Manuálna revízia a úprava
npm run i18n:review
```

### Fáza 3: Optimalizácia (2-3 dni)

```bash
# Automatická reorganizácia
npm run i18n:optimize

# Validácia štruktúry
npm run i18n:validate
```

### Fáza 4: Implementácia (5-7 dní)

```typescript
// Postupná náhrada v komponentoch
// Before:
<Button>Save Document</Button>

// After:
<Button>{t('documents.actions.save')}</Button>
```

## 🛠️ Utility funkcie

### 1. Smart Namespace Loader

```typescript
import { useSmartTranslation } from '@/lib/i18n/smart';

function DocumentsPage() {
  // Automaticky načíta potrebné namespaces
  // podľa route a komponentov
  const { t } = useSmartTranslation({
    page: 'documents',
    features: ['list', 'upload'],
    lazy: ['ocr', 'metadata']
  });
}
```

### 2. Translation Scanner

```typescript
// CLI nástroj na skenovanie chýbajúcich prekladov
npx i18n-scan src/**/*.tsx

// Output:
// ⚠️  Missing: documents.upload.error.network
// ⚠️  Unused: common.legacy.old_button
// ✓  Coverage: 98.3%
```

### 3. Auto-splitter

```typescript
// Automatické rozdelenie veľkých súborov
npx i18n-split public/locales/en/documents.json --max-size=500

// Creates:
// - documents/list.json (243 lines)
// - documents/upload.json (187 lines)
// - documents/metadata.json (156 lines)
```

## 📈 Monitoring a údržba

### 1. Translation Coverage Dashboard

```typescript
// Webový dashboard pre monitoring
interface TranslationStats {
  language: string;
  coverage: number;
  missingKeys: string[];
  outdatedKeys: string[];
  lastUpdated: Date;
}
```

### 2. Automated Tests

```typescript
describe('Translation Consistency', () => {
  it('should have same keys in all languages', () => {
    const languages = ['en', 'cs', 'sk', 'de'];
    const namespaces = getAllNamespaces();
    
    for (const ns of namespaces) {
      const keys = languages.map(lang => 
        Object.keys(loadTranslation(lang, ns))
      );
      
      expect(keys[0]).toEqual(keys[1]);
      expect(keys[0]).toEqual(keys[2]);
      expect(keys[0]).toEqual(keys[3]);
    }
  });
  
  it('should not exceed size limits', () => {
    const files = getAllTranslationFiles();
    
    for (const file of files) {
      const lineCount = countLines(file);
      expect(lineCount).toBeLessThan(800);
      
      if (lineCount < 50) {
        console.warn(`Consider merging: ${file}`);
      }
    }
  });
});
```

### 3. Version Control Strategy

```json
// translations-version.json
{
  "version": "1.0.0",
  "lastUpdate": "2024-08-25",
  "languages": {
    "en": { "version": "1.0.0", "complete": true },
    "cs": { "version": "1.0.0", "complete": true },
    "sk": { "version": "0.9.5", "complete": false },
    "de": { "version": "0.8.0", "complete": false }
  },
  "changes": [
    {
      "version": "1.0.0",
      "date": "2024-08-25",
      "added": ["documents.ocr"],
      "modified": ["family.guardians"],
      "removed": ["legacy.old_feature"]
    }
  ]
}
```

## 🔄 CI/CD Pipeline

```yaml
# .github/workflows/i18n-check.yml
name: i18n Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Check translation files
        run: npm run i18n:validate
      
      - name: Check for missing keys
        run: npm run i18n:check-missing
      
      - name: Check size limits
        run: npm run i18n:check-size
      
      - name: Generate coverage report
        run: npm run i18n:coverage
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: i18n-report
          path: i18n-coverage.html
```

## 🎯 Best Practices

1. **Konzistentné pomenovanie**: Používať rovnakú konvenciu všade
2. **Kontextové preklady**: Zahrnúť kontext v kľúči (button vs. title)
3. **Pluralizácia**: Používať i18next plurálne pravidlá
4. **Parametre**: Používať interpoláciu, nie konkatenáciu
5. **Fallbacky**: Vždy mať fallback hodnoty
6. **Lazy Loading**: Načítať len potrebné namespaces
7. **Validácia**: Automatická validácia pri builde
8. **Dokumentácia**: Komentáre pre komplexné preklady

## 📚 Príklady použitia

### Komponent s viacerými namespacami

```typescript
function DocumentUpload() {
  const { t } = useTranslation([
    'documents/upload',
    'common/validation',
    'common/actions'
  ]);
  
  return (
    <Dialog>
      <DialogTitle>{t('documents:upload.title')}</DialogTitle>
      <Form>
        <Input 
          label={t('documents:upload.field.name')}
          error={t('validation:required')}
        />
        <Button>{t('actions:save')}</Button>
      </Form>
    </Dialog>
  );
}
```

### Dynamické načítanie

```typescript
function DocumentViewer({ type }: { type: string }) {
  const { t, loadNamespace } = useTranslation('documents/viewer');
  
  useEffect(() => {
    if (type === 'legal') {
      loadNamespace('documents/legal-viewer');
    }
  }, [type]);
  
  return <div>{t(`viewer.${type}.title`)}</div>;
}
```

Táto stratégia zabezpečí:

- **Optimálnu veľkosť súborov** (100-500 riadkov)
- **Logickú organizáciu** podľa domén
- **Efektívne načítanie** (lazy loading)
- **Jednoduchú údržbu** (automatizované nástroje)
- **Škálovateľnosť** pre 34+ jazykov
