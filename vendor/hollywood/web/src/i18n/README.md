# English-Only Translation System

This directory contains the English-only internationalization system for LegacyGuard Web, implementing the project rule to have all code in English and translate + refactor every statement to `/src/i18n/locale`.

## Structure

```
src/i18n/
├── locale/
│   └── en.json          # English translations
├── useTranslation.ts    # Translation hook
└── README.md           # This file
```

## Implementation

### Translation Hook

The `useTranslation.ts` file provides a React hook that mimics the react-i18next API but only supports English:

```typescript
import { useTranslation } from '@/i18n/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.labels.title')}</h1>
      <button>{t('common.buttons.save')}</button>
    </div>
  );
}
```

### Translation Keys

All translations are organized hierarchically in `locale/en.json`:

- `common.*` - Common UI elements, buttons, labels, messages
- `accessibility.*` - Screen reader labels and accessibility text
- `navigation.*` - Navigation menu items
- `forms.*` - Form validation and placeholder text
- `documents.*` - Document management interface
- `family.*` - Family management interface
- `will.*` - Will creation interface
- `security.*` - Security-related text

### Interpolation Support

The system supports parameter interpolation using `{{param}}` syntax:

```typescript
// In en.json
"pageOf": "Page {{current}} of {{total}}"

// In component
t('accessibility.screenReader.pageOf', { current: '1', total: '10' })
// Result: "Page 1 of 10"
```

## Usage Patterns

### 1. Basic Translation

```typescript
const { t } = useTranslation();
const text = t('common.buttons.save'); // "Save"
```

### 2. With Parameters

```typescript
const message = t('forms.validation.minLength', { min: '8' });
// "Must be at least 8 characters"
```

### 3. Outside React Components

```typescript
import { translate } from '@/i18n/useTranslation';
const text = translate('common.messages.error');
```

### 4. Higher-Order Component

```typescript
import { withTranslation } from '@/i18n/useTranslation';

class ClassComponent extends React.Component {
  render() {
    return <div>{this.props.t('common.labels.name')}</div>;
  }
}

export default withTranslation(ClassComponent);
```

## Migration from Hardcoded Strings

### Before
```typescript
export const MyComponent = () => {
  return (
    <div>
      <h1>Documents</h1>
      <button>Upload Document</button>
      <p>Please select a file to upload.</p>
    </div>
  );
};
```

### After
```typescript
import { useTranslation } from '@/i18n/useTranslation';

export const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('documents.title')}</h1>
      <button>{t('documents.upload')}</button>
      <p>{t('documents.uploader.selectFilePrompt')}</p>
    </div>
  );
};
```

## Adding New Translations

1. Add the English text to `locale/en.json` in the appropriate category
2. Use the translation key in your component with `t('category.subcategory.key')`
3. Test that the translation appears correctly

### Example: Adding Error Messages

```json
// In locale/en.json
{
  "errors": {
    "network": "Network connection failed",
    "validation": "Please check your input",
    "fileUpload": "File upload failed: {{reason}}"
  }
}
```

```typescript
// In component
const { t } = useTranslation();
toast.error(t('errors.network'));
toast.error(t('errors.fileUpload', { reason: 'File too large' }));
```

## Development Features

### Missing Translation Detection

In development mode, missing translations are logged to the console:

```
Missing translation for key: nonexistent.key
```

### Fallback Behavior

When a translation key is not found, the key itself is returned:

```typescript
t('missing.key') // Returns: "missing.key"
```

## Component Examples

### SkipLinks Component (Refactored)

**Before:**
```typescript
const defaultLinks = [
  { id: 'main-content', label: 'Skip to main content', href: '#main-content' },
  { id: 'navigation', label: 'Skip to navigation', href: '#navigation' },
];
```

**After:**
```typescript
const getDefaultLinks = (t: (key: string) => string) => [
  { id: 'main-content', label: t('accessibility.skipLinks.mainContent'), href: '#main-content' },
  { id: 'navigation', label: t('accessibility.skipLinks.navigation'), href: '#navigation' },
];
```

### DocumentUploader Component (Refactored)

**Before:**
```typescript
toast.error('File size must be less than 10MB');
toast.error('Please select a file to upload.');
```

**After:**
```typescript
const { t } = useTranslation();
toast.error(t('documents.uploader.fileSizeLimit'));
toast.error(t('documents.uploader.selectFilePrompt'));
```

## Translation Categories

### Common Elements
- `common.buttons.*` - All button labels
- `common.labels.*` - Form labels and general labels
- `common.messages.*` - Success, error, warning messages
- `common.states.*` - Status indicators
- `common.time.*` - Time-related text

### Accessibility
- `accessibility.skipLinks.*` - Skip navigation links
- `accessibility.screenReader.*` - Screen reader announcements

### Forms
- `forms.validation.*` - Form validation messages
- `forms.placeholders.*` - Input placeholder text

### Domain-Specific
- `documents.*` - Document management
- `family.*` - Family member management
- `will.*` - Will creation and management
- `security.*` - Security features

## Performance Considerations

- Translations are loaded synchronously (no async loading needed)
- English translations are bundled with the application
- No network requests for translation files
- Minimal runtime overhead due to simple key lookup

## Future Extensibility

While currently English-only, the system is designed to be easily extensible:

1. The hook API matches react-i18next for future compatibility
2. Translation keys are structured hierarchically
3. Interpolation system supports complex formatting
4. Component patterns are established for easy migration

## Testing

Use the `TranslationTest` component to verify translations:

```typescript
import { TranslationTest } from '@/components/examples/TranslationTest';

// Render in development to test translations
<TranslationTest />
```

## Best Practices

1. **Hierarchical Keys**: Use dot notation for nested categories
2. **Descriptive Names**: Make key names self-documenting
3. **Consistent Naming**: Follow established patterns
4. **Parameterization**: Use interpolation for dynamic content
5. **Context Grouping**: Group related translations together
6. **Fallback Safety**: Always handle missing keys gracefully

## Integration with Existing i18n

This system coexists with the existing complex i18n setup:

- **Existing system**: `/src/lib/i18n/` - Multi-language, jurisdiction-aware
- **New system**: `/src/i18n/` - English-only, simplified
- **Migration strategy**: Gradually move components to the new system
- **Compatibility**: Both systems can be used simultaneously
