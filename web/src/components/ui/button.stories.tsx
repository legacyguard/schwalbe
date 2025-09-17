
import type { Meta, StoryObj } from '@storybook/react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import {
  ChevronRight,
  Download,
  Heart,
  Loader2,
  Mail,
  Plus,
  Settings,
  Trash,
} from 'lucide-react';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Button component is a fundamental UI element used throughout the LegacyGuard application.
It supports multiple variants, sizes, and states to accommodate various use cases.

## Features
- **Multiple variants**: default, destructive, outline, secondary, ghost, link
- **Four sizes**: sm, default, lg, icon
- **Loading state**: Shows a spinner when loading
- **Icon support**: Can include icons before or after text
- **Full width option**: Can expand to fill container width
- **Keyboard accessible**: Fully keyboard navigable
- **Screen reader friendly**: Proper ARIA attributes

## Usage

\`\`\`tsx
import { Button } from '@/components/ui/button';

// Basic usage
<Button>Click me</Button>

// With variant
<Button variant="destructive">Delete</Button>

// With icon
<Button>
  <Mail className="mr-2 h-4 w-4" />
  Send Email
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Processing...
</Button>
\`\`\`

## Best Practices
- Use descriptive labels that clearly indicate the action
- Choose appropriate variants based on the action importance
- Provide loading states for async operations
- Include icons for better visual hierarchy
- Ensure sufficient color contrast for accessibility
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
      description: 'The visual style variant of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element (useful for Next.js Link)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      control: 'text',
      description: 'Button content',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Variants
export const Default: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return <Button>{t('variants.default')}</Button>;
  },
};

export const Destructive: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return <Button variant="destructive">{t('variants.destructive')}</Button>;
  },
};

export const Outline: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return <Button variant="outline">{t('variants.outline')}</Button>;
  },
};

export const Secondary: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return <Button variant="secondary">{t('variants.secondary')}</Button>;
  },
};

export const Ghost: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return <Button variant="ghost">{t('variants.ghost')}</Button>;
  },
};

export const Link: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return <Button variant="link">{t('variants.link')}</Button>;
  },
};

// Sizes
export const Small: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return <Button size="sm">{t('sizes.small')}</Button>;
  },
};

export const Large: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return <Button size="lg">{t('sizes.large')}</Button>;
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: <Settings className='h-4 w-4' />,
  },
};

// With Icons
export const WithLeftIcon: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return (
      <Button>
        <Mail className='mr-2 h-4 w-4' />
        {t('withIcons.sendEmail')}
      </Button>
    );
  },
};

export const WithRightIcon: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return (
      <Button>
        {t('withIcons.continue')}
        <ChevronRight className='ml-2 h-4 w-4' />
      </Button>
    );
  },
};

// States
export const Loading: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return (
      <Button disabled>
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        {t('states.processing')}
      </Button>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return <Button disabled>{t('states.disabled')}</Button>;
  },
};

// Complex Examples
export const DownloadButton: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return (
      <Button variant="outline">
        <Download className='mr-2 h-4 w-4' />
        {t('withIcons.downloadReport')}
      </Button>
    );
  },
};

export const DeleteButton: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return (
      <Button variant="destructive" size="sm">
        <Trash className='mr-2 h-4 w-4' />
        {t('withIcons.delete')}
      </Button>
    );
  },
};

export const FavoriteButton: Story = {
  args: {
    variant: 'ghost',
    size: 'icon',
    children: <Heart className='h-4 w-4' />,
  },
};

export const CreateButton: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return (
      <Button size="lg">
        <Plus className='mr-2 h-5 w-5' />
        {t('withIcons.createDocument')}
      </Button>
    );
  },
};

// Button Group Example
export const ButtonGroup: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return (
      <div className='flex gap-2'>
        <Button variant='outline'>{t('actions.cancel')}</Button>
        <Button>{t('actions.saveChanges')}</Button>
      </div>
    );
  },
};

// Full Width
export const FullWidth: Story = {
  render: () => {
    const { t } = useTranslation('stories/button');
    return <Button className="w-full">{t('actions.fullWidth')}</Button>;
  },
  parameters: {
    layout: 'padded',
  },
};
