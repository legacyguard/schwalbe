# Internationalization (i18n) Governance

## Overview

This document establishes the governance framework for managing translations across the Schwalbe application, ensuring consistent, high-quality internationalization support for our Czech and Slovak markets.

## Translation Architecture

### File Organization

```
apps/web/public/locales/
├── common/                 # Shared UI elements
│   ├── navigation.[lang].json
│   ├── buttons.[lang].json
│   └── errors.[lang].json
├── features/              # Feature-specific translations
│   ├── will/
│   │   ├── wizard.[lang].json
│   │   └── validation.[lang].json
│   ├── subscriptions/
│   │   ├── dashboard.[lang].json
│   │   └── billing.[lang].json
│   └── documents/
│       ├── upload.[lang].json
│       └── sharing.[lang].json
├── pages/                 # Page-specific content
│   ├── landing.[lang].json
│   ├── pricing.[lang].json
│   └── onboarding.[lang].json
└── legal/                 # Legal content
    ├── terms.[lang].json
    ├── privacy.[lang].json
    └── cookies.[lang].json
```

### Supported Languages

- **English (en)** - Primary language, source of truth
- **Czech (cs)** - Primary target market
- **Slovak (sk)** - Primary target market

### Translation Key Naming Convention

```typescript
// Pattern: [category].[component].[element].[variant?]
"common.buttons.save"
"common.buttons.cancel"
"features.will.wizard.labels.jurisdiction"
"features.subscriptions.dashboard.title"
"pages.landing.hero.title"
"pages.landing.hero.subtitle"
"legal.terms.lastUpdated"
```

## Development Workflow

### 1. Adding New Translatable Content

When adding user-facing strings:

```typescript
// ❌ Wrong - Hardcoded strings
<button>Save Document</button>
<p>Your document has been saved successfully.</p>

// ✅ Correct - Using translation keys
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('common/buttons');
<button>{t('save')}</button>

const { t: tMessages } = useTranslation('features/documents');
<p>{tMessages('saveSuccess')}</p>
```

### 2. Translation File Updates

1. **Add to English first** (`*.en.json`)
2. **Create corresponding keys** in Czech (`*.cs.json`) and Slovak (`*.sk.json`)
3. **Provide context** for translators in comments or separate context files

### 3. Quality Assurance

#### Automated Checks
```bash
# Validate translation consistency
npm run i18n:validate

# Check for missing translations
npm run i18n:coverage

# Test with different languages
npm run dev:cs
npm run dev:sk
```

#### Manual Review Checklist
- [ ] All user-facing text uses translation keys
- [ ] Context provided for ambiguous terms
- [ ] Cultural appropriateness verified
- [ ] Legal terminology accuracy confirmed
- [ ] UI layout tested with longer/shorter translations

## Translation Standards

### Language-Specific Guidelines

#### Czech (cs)
- **Formal address** (vykání) for legal content
- **Informal address** (tykání) for onboarding and help
- **Gendered forms** handled through context keys
- **Legal terms** use established Czech legal terminology

#### Slovak (sk)
- **Formal address** (vykanie) for legal content
- **Informal address** (tykanie) for onboarding and help
- **Gendered forms** handled through context keys
- **Legal terms** use established Slovak legal terminology

### Content Types

#### Legal Content
- Must be reviewed by native-speaking legal professionals
- Requires formal language register
- Technical terms must use official translations
- Include disclaimers about legal validity

#### UI Content
- Keep concise for layout constraints
- Use familiar, everyday language
- Maintain consistent terminology across the app
- Test with various text lengths

#### Marketing Content
- Adapt cultural references appropriately
- Maintain brand voice and tone
- Consider local market preferences
- A/B test messaging effectiveness

## Translation Management Process

### 1. Content Creation
1. **English content** created by product team
2. **Translation keys** defined following naming convention
3. **Context provided** for translators
4. **Technical review** for implementation

### 2. Translation Process
1. **Professional translators** for initial translation
2. **Native speaker review** for accuracy and naturalness
3. **Legal review** for legal content
4. **Technical review** for UI integration

### 3. Quality Control
1. **Automated validation** runs in CI/CD
2. **Manual testing** across different devices
3. **User testing** with native speakers
4. **Continuous monitoring** for user feedback

### 4. Maintenance
1. **Regular audits** for consistency
2. **Updates** for legal changes
3. **Improvements** based on user feedback
4. **New feature** translation coordination

## Technical Implementation

### Configuration

```typescript
// i18n configuration
export const i18nConfig = {
  defaultNS: 'common/navigation',
  fallbackLng: 'en',
  supportedLngs: ['en', 'cs', 'sk'],
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage']
  }
};
```

### Component Usage

```typescript
import { useTranslation } from 'react-i18next';

function WillWizard() {
  const { t } = useTranslation('features/will/wizard');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('hints.startInfo')}</p>
      <button>{t('actions.next')}</button>
    </div>
  );
}
```

### Dynamic Content

```typescript
// For dynamic content with variables
t('subscriptions.trialRemaining', { days: remainingDays })

// For pluralization
t('documents.count', { count: documentCount })

// For gendered content
t('welcome.message', { context: userGender })
```

## Performance Considerations

### Lazy Loading
- Load translations on demand by namespace
- Preload critical namespaces (navigation, buttons)
- Cache translations in localStorage

### Bundle Optimization
- Split translations by feature
- Use tree-shaking for unused translations
- Compress translation files

### Fallback Strategy
```typescript
// Fallback hierarchy
1. Requested language + namespace
2. Requested language + default namespace
3. English + requested namespace
4. English + default namespace
5. Hardcoded fallback
```

## Compliance & Legal

### Data Protection
- Translation keys logged for debugging (development only)
- User language preference stored locally
- No personal data in translation strings

### Legal Requirements
- Czech: Comply with Czech legal terminology standards
- Slovak: Comply with Slovak legal terminology standards
- EU: GDPR compliance for language preference storage

### Accessibility
- Screen reader compatibility in all languages
- Proper RTL support preparation for future languages
- Cultural color and symbol considerations

## Metrics & Monitoring

### Translation Coverage
```bash
# Current coverage targets
Czech (cs): 95% minimum
Slovak (sk): 95% minimum

# Critical paths: 100% required
- Will creation wizard
- Subscription management
- Legal consent flows
```

### Performance Metrics
- Translation loading time < 200ms
- Cache hit rate > 90%
- Bundle size impact < 5% per language

### User Experience
- Language switching success rate
- User retention by language
- Support ticket language distribution

## Emergency Procedures

### Critical Translation Issues
1. **Immediate**: Rollback to English for affected feature
2. **Short-term**: Apply hotfix translation
3. **Long-term**: Root cause analysis and process improvement

### Legal Compliance Issues
1. **Immediate**: Disable affected feature in specific market
2. **Urgent**: Engage legal counsel for proper translation
3. **Follow-up**: Review and update governance procedures

## Contact & Responsibilities

### Translation Team
- **Translation Manager**: Overall coordination and quality
- **Czech Translator**: Native Czech speaker, legal background preferred
- **Slovak Translator**: Native Slovak speaker, legal background preferred
- **Technical Lead**: i18n implementation and tooling

### Review Process
- **First Review**: Native speaker translator
- **Second Review**: Legal professional (for legal content)
- **Final Review**: Technical implementation verification

### Escalation Path
1. Translation Team → Product Manager
2. Product Manager → Engineering Lead
3. Engineering Lead → CTO
4. Legal issues → Legal Counsel

---

*This governance document is reviewed quarterly and updated as needed to reflect changing requirements and best practices.*