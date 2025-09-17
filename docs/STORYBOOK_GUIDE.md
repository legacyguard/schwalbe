# LegacyGuard Storybook Documentation

## Overview

LegacyGuard's component library is fully documented in Storybook, providing an interactive development environment for UI components. This guide covers how to use, develop, and maintain our Storybook documentation.

## 🚀 Getting Started

### Running Storybook

```bash
# Install dependencies
npm install

# Start Storybook development server
npm run storybook

# Build static Storybook
npm run build-storybook
```

Storybook will be available at `http://localhost:6006`

## 📚 Component Categories

### Core UI Components

#### Buttons & Actions

- **Button** - Primary action component with multiple variants
- **EnhancedButton** - Advanced button with loading states and animations
- **IconButton** - Icon-only button variations

#### Form Controls

- **Input** - Text input with validation states
- **EnhancedInput** - Input with advanced features (masks, formatting)
- **Select** - Dropdown selection component
- **Checkbox** - Binary choice component
- **RadioGroup** - Single choice from multiple options
- **Switch** - Toggle switch component
- **Slider** - Range selection component
- **Calendar** - Date picker component
- **Form** - Complete form management with validation

#### Layout & Containers

- **Card** - Content container with header/footer
- **EnhancedCard** - Card with animations and interactions
- **Dialog** - Modal overlay component
- **Sheet** - Slide-out panel
- **Drawer** - Navigation drawer
- **Accordion** - Collapsible content sections
- **Tabs** - Tabbed content navigation
- **Separator** - Visual divider

#### Data Display

- **Table** - Data table with sorting/filtering
- **Badge** - Status indicators and labels
- **Avatar** - User profile images
- **Progress** - Progress indicators
- **KPICard** - Key performance indicator displays
- **Chart** - Data visualization components

#### Navigation

- **NavigationMenu** - Main navigation component
- **Breadcrumb** - Navigation path display
- **Pagination** - Page navigation controls
- **Sidebar** - Side navigation panel
- **CommandMenu** - Command palette

#### Feedback & Overlays

- **Alert** - Inline notifications
- **AlertDialog** - Confirmation dialogs
- **Toast** (Sonner) - Temporary notifications
- **Tooltip** - Contextual help text
- **Popover** - Floating content panel
- **HoverCard** - Hover-triggered information

### Application Components

#### Authentication

- **SignIn** - Login form component
- **SignUp** - Registration form component
- **ProtectedRoute** - Route protection wrapper

#### Dashboard

- **DashboardLayout** - Main application layout
- **PillarCard** - Feature showcase cards
- **AttentionSection** - Important notifications area
- **ProgressBar** - Completion progress display

#### Family Management

- **FamilyShield** - Family member management
- **GuardianSetup** - Guardian configuration
- **FamilyProtectionHeader** - Family section header

#### Document Management

- **DocumentCard** - Document display card
- **IntelligentOrganizer** - AI-powered document organizer
- **VaultPage** - Secure document storage

#### Legacy Features

- **LegacyGarden** - Visual legacy representation
- **TimeCapsule** - Future message system
- **MilestoneAnimations** - Achievement animations

#### AI Assistant

- **SofiaSystem** - AI assistant interface
- **SofiaFirefly** - Assistant animation component

## 🎨 Design System

### Theme Variables

```css
--primary: Main brand color
--secondary: Secondary brand color
--destructive: Error/danger color
--muted: Subdued text/backgrounds
--accent: Accent color for highlights
```

### Typography Scale

- **text-xs**: 0.75rem
- **text-sm**: 0.875rem
- **text-base**: 1rem
- **text-lg**: 1.125rem
- **text-xl**: 1.25rem
- **text-2xl**: 1.5rem
- **text-3xl**: 1.875rem
- **text-4xl**: 2.25rem

### Spacing System

- **space-1**: 0.25rem
- **space-2**: 0.5rem
- **space-3**: 0.75rem
- **space-4**: 1rem
- **space-6**: 1.5rem
- **space-8**: 2rem
- **space-12**: 3rem
- **space-16**: 4rem

## 📝 Writing Stories

### Basic Story Structure

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Component } from './component';

const meta = {
  title: 'Category/ComponentName',
  component: Component,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Component description here',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Define controls here
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

### Best Practices

1. **Comprehensive Examples**: Include all component variants
2. **Real-World Scenarios**: Show components in context
3. **Interactive Controls**: Enable args for all customizable props
4. **Documentation**: Include usage examples and best practices
5. **Accessibility**: Test with keyboard navigation and screen readers
6. **Dark Mode**: Ensure all components work in both themes

## 🧪 Testing in Storybook

### Visual Testing

- Use Chromatic for visual regression testing
- Capture all component states
- Test responsive breakpoints
- Verify dark mode appearance

### Interaction Testing

```tsx
export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.getByRole('button');
    await userEvent.click(button);
    // Add assertions
  },
};
```

### Accessibility Testing

- Run a11y addon checks
- Verify ARIA attributes
- Test keyboard navigation
- Check color contrast

## 🔧 Storybook Addons

### Installed Addons

- **@storybook/addon-essentials** - Core addons bundle
- **@storybook/addon-a11y** - Accessibility testing
- **@storybook/addon-themes** - Theme switching
- **@storybook/addon-viewport** - Responsive testing
- **@storybook/addon-docs** - Documentation pages

### Using Addons

#### Theme Switcher

Toggle between light and dark themes using the toolbar

#### Viewport

Test responsive behavior across devices:

- Mobile (320px)
- Tablet (768px)
- Desktop (1024px)
- Wide (1440px)

#### Controls

Modify component props in real-time

#### Actions

Monitor component events and callbacks

## 📦 Building & Deployment

### Local Build

```bash
npm run build-storybook
```

### Deployment

Storybook is automatically deployed to Vercel on push to main branch.

Production URL: `https://storybook.legacyguard.com`

### CI/CD Integration

```yaml
# .github/workflows/storybook.yml
- name: Build Storybook
  run: npm run build-storybook
  
- name: Deploy to Vercel
  uses: vercel/action@v1
```

## 🎯 Component Guidelines

### New Component Checklist

- [ ] Create component file
- [ ] Write TypeScript types
- [ ] Add JSDoc comments
- [ ] Create story file
- [ ] Document all props
- [ ] Add usage examples
- [ ] Include accessibility notes
- [ ] Test in dark mode
- [ ] Add to component index
- [ ] Update this guide

### Component Documentation Template

```tsx
/**
 * Component description
 * 
 * @example
 * ```tsx
 * <Component prop="value" />
 * ```
 * 
 * @param props - Component props
 * @param props.prop - Prop description
 */
```

## 🔍 Finding Components

### Search

Use the search bar to find components by name

### Categories

Browse components by category in the sidebar:

- UI (Core components)
- Forms (Input components)
- Layout (Structure components)
- Features (Application-specific)

### Tags

Filter components by tags:

- `form` - Form-related components
- `navigation` - Navigation components
- `feedback` - User feedback components
- `data` - Data display components

## 🤝 Contributing

### Adding Stories

1. Create story file next to component
2. Follow naming convention: `Component.stories.tsx`
3. Include all component variants
4. Add interactive examples
5. Document props and usage

### Updating Documentation

1. Keep stories in sync with component changes
2. Update examples when API changes
3. Add new variants as they're created
4. Document breaking changes

## 📚 Resources

### Internal

- [Component Development Guide](./COMPONENT_GUIDE.md)
- [Design System](./DESIGN_SYSTEM.md)
- [Testing Guide](./TESTING_GUIDE.md)

### External

- [Storybook Documentation](https://storybook.js.org/docs)
- [React Component Patterns](https://reactpatterns.com)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🆘 Troubleshooting

### Common Issues

#### Storybook won't start

```bash
# Clear cache and reinstall
rm -rf node_modules .storybook-cache
npm install
npm run storybook
```

#### Story not appearing

- Check story export name
- Verify meta configuration
- Ensure component is exported

#### Controls not working

- Verify argTypes configuration
- Check prop types match
- Ensure component uses props

## 📈 Metrics

### Coverage Goals

- **Component Coverage**: 100% of exported components
- **Variant Coverage**: All component states documented
- **Interaction Coverage**: Key user flows demonstrated
- **Documentation Coverage**: All props documented

### Quality Metrics

- **Load Time**: < 3s for initial load
- **Build Size**: < 10MB for production build
- **Accessibility Score**: 100% WCAG AA compliance
- **Browser Support**: Chrome, Firefox, Safari, Edge
