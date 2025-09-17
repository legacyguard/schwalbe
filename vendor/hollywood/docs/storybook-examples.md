# Storybook Príklady - Kompletné ukážky

## Button Component Stories

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Heart, Star } from '@tamagui/lucide-icons';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'ghost', 'outline'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large', 'xlarge'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Variants
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: 'Success Button',
    variant: 'success',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

// Sizes
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'small',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'medium',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'large',
  },
};

export const ExtraLarge: Story = {
  args: {
    children: 'Extra Large Button',
    size: 'xlarge',
  },
};

// States
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
};

// With Icons
export const WithIcon: Story = {
  args: {
    children: 'With Icon',
    icon: <Heart size={16} />,
  },
};

// Full Width
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
};

// Interactive Controls Demo
export const Interactive: Story = {
  args: {
    children: 'Interactive Button',
    variant: 'primary',
    size: 'medium',
  },
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="success">Success</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};
```

## Card Component Stories

```typescript
// Card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined', 'ghost'],
    },
    padding: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Card Content',
    variant: 'default',
  },
};

export const Elevated: Story = {
  args: {
    children: 'Elevated Card Content',
    variant: 'elevated',
  },
};

export const Outlined: Story = {
  args: {
    children: 'Outlined Card Content',
    variant: 'outlined',
  },
};

export const WithHeader: Story = {
  args: {
    children: (
      <>
        <Card.Header>
          <h3>Card Title</h3>
          <p>Card subtitle</p>
        </Card.Header>
        <Card.Content>
          <p>This is the card content area.</p>
        </Card.Content>
        <Card.Footer>
          <button>Action</button>
        </Card.Footer>
      </>
    ),
  },
};
```

## Input Component Stories

```typescript
// Input.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Pre-filled value',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Error state',
    error: true,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
  },
};
```

## Form Component Stories

```typescript
// Form.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './forms/FormField';
import { FormSection } from './forms/FormSection';

const meta: Meta<typeof FormField> = {
  title: 'Components/Forms/FormField',
  component: FormField,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TextField: Story = {
  args: {
    label: 'Meno',
    placeholder: 'Zadajte vaše meno',
    type: 'text',
  },
};

export const EmailField: Story = {
  args: {
    label: 'Email',
    placeholder: 'vas@email.sk',
    type: 'email',
  },
};

export const PasswordField: Story = {
  args: {
    label: 'Heslo',
    type: 'password',
  },
};

export const FormSectionExample: Story = {
  render: () => (
    <FormSection title="Osobné údaje">
      <FormField label="Meno" placeholder="Zadajte meno" />
      <FormField label="Email" type="email" placeholder="email@priklad.sk" />
      <FormField label="Telefón" type="tel" placeholder="+421 900 000 000" />
    </FormSection>
  ),
};
```

## Layout Component Stories

```typescript
// Layout.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Layout } from './Layout';

const meta: Meta<typeof Layout> = {
  title: 'Components/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = React.ComponentProps<typeof Layout>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '200px' }}>
        <h2>Layout Content</h2>
        <p>This is the main content area.</p>
      </div>
    ),
  },
};

export const WithSidebar: Story = {
  args: {
    children: (
      <div style={{ display: 'flex', gap: '20px' }}>
        <aside style={{ width: '200px', background: '#e0e0e0', padding: '20px' }}>
          <h3>Sidebar</h3>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </aside>
        <main style={{ flex: 1, padding: '20px' }}>
          <h2>Main Content</h2>
          <p>Content goes here...</p>
        </main>
      </div>
    ),
  },
};
```

## Best Practices for Stories

### 1. Naming Convention

- **Title**: `Category/ComponentName`
- **Story names**: PascalCase (Primary, Secondary, WithIcon)

### 2. Args vs Render

```typescript
// Prefer args for simple stories
export const Simple = { args: { variant: 'primary' } };

// Use render for complex layouts
export const Complex = {
  render: () => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  ),
};
```

### 3. Controls Configuration

```typescript
argTypes: {
  onClick: { action: 'clicked' }, // Pre event handlers
  children: { control: 'text' },  // Pre text content
  icon: { control: 'object' },    // Pre komplexné objekty
}
```

### 4. Documentation

```typescript
parameters: {
  docs: {
    description: {
      component: 'Toto je hlavný popis komponentu',
    },
  },
}
```

## Testing Stories

```typescript
// Interakčné testy
export const Clickable = {
  args: { onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};
```

## Deployment

```bash
# Build statických súborov
npm run build-storybook

# Výsledok bude v: storybook-static/
# Môžete ho nasadiť na GitHub Pages, Netlify, Vercel, atď.
