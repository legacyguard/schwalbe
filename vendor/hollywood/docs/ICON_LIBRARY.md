# Icon Library Documentation

## Overview

The Icon Library provides a consistent way to use Lucide React icons throughout the LegacyGuard application. It ensures visual consistency and makes icon management easier.

## Usage

### Basic Usage

```tsx
import { Icon } from "@/components/ui/icon-library";

// Simple icon usage
<Icon name="dashboard" className="w-5 h-5" />

// With custom size
<Icon name="vault" size={32} className="text-primary" />
```

### Direct Icon Import

```tsx
import { LayoutDashboard, Vault } from "@/components/ui/icon-library";

// Use icons directly (for complex cases)
<LayoutDashboard className="w-5 h-5" />
<Vault size={24} />
```

## Available Icons

### Navigation Icons

- `dashboard` - Main dashboard
- `vault` - Document vault
- `documents` - Document management
- `guardians` - Family guardians
- `legacy` - Legacy planning
- `timeline` - Timeline view
- `wishes` - Personal wishes
- `protection` - Family protection
- `settings` - Application settings

### Action Icons

- `add` - Add new item
- `edit` - Edit existing item
- `delete` - Delete item
- `copy` - Copy item
- `share` - Share item
- `download` - Download file
- `upload` - Upload file
- `search` - Search functionality
- `filter` - Filter options

### Status Icons

- `success` - Success state
- `warning` - Warning state
- `info` - Information
- `help` - Help content
- `locked` - Locked state
- `unlocked` - Unlocked state

### UI Elements

- `close` - Close button
- `check` - Checkmark
- `circle` - Circle indicator
- `dot` - Dot indicator
- `arrowRight` - Right arrow
- `chevronDown` - Down chevron
- `chevronUp` - Up chevron
- `chevronLeft` - Left chevron
- `chevronRight` - Right chevron
- `more` - More options

### Legacy Specific

- `infinity` - Forever/legacy
- `star` - Favorite/important
- `home` - Home navigation
- `eye` - View/visible
- `eyeOff` - Hide/invisible
- `grip` - Drag handle
- `panelLeft` - Left panel toggle

## Icon Sizes

Predefined sizes are available:

```tsx
import { IconSizes } from "@/components/ui/icon-library";

// Available sizes: xs(16), sm(20), md(24), lg(32), xl(48)
<Icon name="dashboard" size={IconSizes.lg} />
```

## Best Practices

### 1. Use Semantic Names

```tsx
// ✅ Good - semantic meaning
<Icon name="vault" />

// ❌ Avoid - generic names
<Icon name="box" />
```

### 2. Consistent Sizing

```tsx
// ✅ Good - consistent sizing
<Icon name="dashboard" className="w-5 h-5" />
<Icon name="vault" className="w-5 h-5" />

// ❌ Avoid - inconsistent sizing
<Icon name="dashboard" className="w-4 h-4" />
<Icon name="vault" className="w-6 h-6" />
```

### 3. Use Icon Library for Common Icons

```tsx
// ✅ Good - use Icon component
<Icon name="add" className="w-5 h-5" />

// ❌ Avoid - direct import for common cases
import { Plus } from "lucide-react";
<Plus className="w-5 h-5" />
```

### 4. Direct Import for Complex Cases

```tsx
// ✅ Good - direct import for complex animations
import { Heart } from "@/components/ui/icon-library";
<Heart className="w-5 h-5 animate-pulse" />

// ❌ Avoid - Icon component for complex cases
<Icon name="heart" className="w-5 h-5 animate-pulse" />
```

## Adding New Icons

To add a new icon:

1. **Import the icon** in `src/components/ui/icon-library.tsx`
2. **Add to exports** for direct usage
3. **Add to IconMap** with a semantic name
4. **Update this documentation**

```tsx
// In icon-library.tsx
import { NewIcon } from "lucide-react";

export { NewIcon };

export const IconMap = {
  // ... existing icons
  newFeature: NewIcon,
} as const;
```

## Migration from Direct Imports

If you have existing code using direct Lucide imports:

```tsx
// Before
import { Plus, Vault } from "lucide-react";
<Plus className="w-5 h-5" />
<Vault className="w-5 h-5" />

// After
import { Icon } from "@/components/ui/icon-library";
<Icon name="add" className="w-5 h-5" />
<Icon name="vault" className="w-5 h-5" />
```

## Performance Notes

- The Icon component is lightweight and optimized
- Icons are tree-shakeable
- No performance impact from using Icon vs direct import
- Consider using direct imports for frequently used icons in performance-critical components

## Accessibility

All icons inherit accessibility features from Lucide React:

- Proper ARIA labels when used with `aria-label`
- Screen reader support
- Keyboard navigation support
- High contrast mode support
