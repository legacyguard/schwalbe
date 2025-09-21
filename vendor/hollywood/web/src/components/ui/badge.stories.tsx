
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';
import {
  AlertCircle,
  Check,
  Clock,
  Info,
  Shield,
  Star,
  TrendingUp,
  X,
} from 'lucide-react';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Badge component is used to highlight and display small pieces of information such as status indicators,
counts, or labels. It's commonly used in lists, tables, and cards throughout the LegacyGuard application.

## Features
- Multiple variants for different contexts
- Icon support
- Compact and readable design
- Accessible color schemes
- Hover states for interactive badges

## Usage

\`\`\`tsx
import { Badge } from '@/components/ui/badge';

// Basic usage
<Badge>New</Badge>

// With variant
<Badge variant="destructive">Urgent</Badge>

// With icon
<Badge>
  <Check className="mr-1 h-3 w-3" />
  Verified
</Badge>
\`\`\`

## Best Practices
- Use appropriate variants for context (success, warning, error)
- Keep badge text concise
- Use icons to reinforce meaning
- Ensure sufficient color contrast
- Consider badge placement for optimal visibility
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'The visual style variant of the badge',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    children: {
      control: 'text',
      description: 'Badge content',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Variants
export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

// Status Badges
export const Success: Story = {
  render: () => (
    <Badge className='bg-green-100 text-green-800 hover:bg-green-200'>
      <Check className='mr-1 h-3 w-3' />
      Success
    </Badge>
  ),
};

export const Warning: Story = {
  render: () => (
    <Badge className='bg-yellow-100 text-yellow-800 hover:bg-yellow-200'>
      <AlertCircle className='mr-1 h-3 w-3' />
      Warning
    </Badge>
  ),
};

export const Error: Story = {
  render: () => (
    <Badge variant='destructive'>
      <X className='mr-1 h-3 w-3' />
      Error
    </Badge>
  ),
};

export const InfoBadge: Story = {
  render: () => (
    <Badge variant='secondary'>
      <Info className='mr-1 h-3 w-3' />
      Info
    </Badge>
  ),
};

// Document Status Badges
export const DocumentStatuses: Story = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <Badge variant='outline'>Draft</Badge>
      <Badge variant='secondary'>In Review</Badge>
      <Badge className='bg-blue-100 text-blue-800'>Notarized</Badge>
      <Badge className='bg-green-100 text-green-800'>
        <Check className='mr-1 h-3 w-3' />
        Completed
      </Badge>
      <Badge variant='destructive'>Expired</Badge>
    </div>
  ),
};

// Family Member Badges
export const FamilyRoles: Story = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <Badge>
        <Star className='mr-1 h-3 w-3' />
        Primary
      </Badge>
      <Badge variant='secondary'>Spouse</Badge>
      <Badge variant='secondary'>Child</Badge>
      <Badge variant='secondary'>Guardian</Badge>
      <Badge variant='outline'>Beneficiary</Badge>
    </div>
  ),
};

// Notification Badges
export const NotificationCount: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <div className='relative'>
        <span>Messages</span>
        <Badge className='absolute -top-2 -right-2 h-5 min-w-[20px] rounded-full px-1'>
          3
        </Badge>
      </div>
      <div className='relative'>
        <span>Alerts</span>
        <Badge
          variant='destructive'
          className='absolute -top-2 -right-2 h-5 min-w-[20px] rounded-full px-1'
        >
          1
        </Badge>
      </div>
    </div>
  ),
};

// Feature Badges
export const Features: Story = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <Badge>
        <Shield className='mr-1 h-3 w-3' />
        Encrypted
      </Badge>
      <Badge>
        <Clock className='mr-1 h-3 w-3' />
        Auto-save
      </Badge>
      <Badge>
        <TrendingUp className='mr-1 h-3 w-3' />
        Premium
      </Badge>
    </div>
  ),
};

// Size Variations
export const Sizes: Story = {
  render: () => (
    <div className='flex items-center gap-2'>
      <Badge className='text-xs py-0 px-2 h-5'>Extra Small</Badge>
      <Badge className='text-sm'>Small</Badge>
      <Badge>Default</Badge>
      <Badge className='text-base px-3 py-1'>Large</Badge>
    </div>
  ),
};

// Interactive Badge
export const Interactive: Story = {
  render: () => (
    <div className='flex gap-2'>
      <Badge className='cursor-pointer hover:bg-primary/80'>Clickable</Badge>
      <Badge variant='outline' className='cursor-pointer hover:bg-secondary'>
        Hoverable
      </Badge>
    </div>
  ),
};

// Badge List Example
export const BadgeList: Story = {
  render: () => (
    <div className='space-y-4'>
      <div className='flex items-center justify-between p-4 border rounded-lg'>
        <div>
          <h3 className='font-medium'>Last Will & Testament</h3>
          <p className='text-sm text-muted-foreground'>Updated 2 days ago</p>
        </div>
        <div className='flex gap-2'>
          <Badge variant='secondary'>Draft</Badge>
          <Badge>
            <Shield className='mr-1 h-3 w-3' />
            Secure
          </Badge>
        </div>
      </div>

      <div className='flex items-center justify-between p-4 border rounded-lg'>
        <div>
          <h3 className='font-medium'>Power of Attorney</h3>
          <p className='text-sm text-muted-foreground'>Completed last month</p>
        </div>
        <div className='flex gap-2'>
          <Badge className='bg-green-100 text-green-800'>
            <Check className='mr-1 h-3 w-3' />
            Notarized
          </Badge>
          <Badge>
            <Shield className='mr-1 h-3 w-3' />
            Secure
          </Badge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
