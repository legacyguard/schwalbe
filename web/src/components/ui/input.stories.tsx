
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from './label';
import { CreditCard, Lock, Mail, Phone, Search, User } from 'lucide-react';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Input component is a fundamental form control used throughout the LegacyGuard application.
It provides a consistent and accessible text input experience with support for various types and states.

## Features
- Multiple input types (text, email, password, number, etc.)
- Icon support (left and right positions)
- Disabled and readonly states
- Error states with visual feedback
- Full keyboard navigation
- Screen reader accessible
- Auto-complete support

## Usage

\`\`\`tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Basic usage
<Input type="email" placeholder="Email" />

// With label
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>

// With icon
<div className="relative">
  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
  <Input className="pl-8" placeholder="Search..." />
</div>
\`\`\`

## Best Practices
- Always provide labels for accessibility
- Use appropriate input types for better UX
- Include helpful placeholder text
- Provide clear error messages
- Use icons to enhance visual context
- Consider input masks for formatted data
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: [
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'date',
        'time',
        'search',
      ],
      description: 'The type of input',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'text' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
      table: {
        type: { summary: 'string' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is readonly',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    value: {
      control: 'text',
      description: 'The input value',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'john@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
    min: 0,
    max: 100,
  },
};

export const Date: Story = {
  args: {
    type: 'date',
  },
};

// With Labels
export const WithLabel: Story = {
  render: () => (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      <Label htmlFor='name'>Full Name</Label>
      <Input type='text' id='name' placeholder='John Doe' />
    </div>
  ),
};

export const RequiredField: Story = {
  render: () => (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      <Label htmlFor='required'>
        Email <span className='text-destructive'>*</span>
      </Label>
      <Input type='email' id='required' placeholder='Required field' required />
    </div>
  ),
};

// With Icons
export const SearchInput: Story = {
  render: () => (
    <div className='relative w-full max-w-sm'>
      <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
      <Input className='pl-8' type='search' placeholder='Search documents...' />
    </div>
  ),
};

export const EmailWithIcon: Story = {
  render: () => (
    <div className='relative w-full max-w-sm'>
      <Mail className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
      <Input className='pl-8' type='email' placeholder='Enter email address' />
    </div>
  ),
};

export const PasswordWithIcon: Story = {
  render: () => (
    <div className='relative w-full max-w-sm'>
      <Lock className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
      <Input className='pl-8' type='password' placeholder='Enter password' />
    </div>
  ),
};

// States
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    value: 'Read-only value',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Pre-filled value',
  },
};

// Error State
export const ErrorState: Story = {
  render: () => (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      <Label htmlFor='error'>Email</Label>
      <Input
        type='email'
        id='error'
        placeholder='john@example.com'
        className='border-destructive focus-visible:ring-destructive'
        aria-invalid='true'
        aria-describedby='error-message'
      />
      <p id='error-message' className='text-sm text-destructive'>
        Please enter a valid email address
      </p>
    </div>
  ),
};

// Complex Form Example
export const FormExample: Story = {
  render: () => (
    <div className='w-full max-w-md space-y-4'>
      <div className='grid gap-1.5'>
        <Label htmlFor='form-name'>Full Name</Label>
        <div className='relative'>
          <User className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input id='form-name' className='pl-8' placeholder='John Doe' />
        </div>
      </div>

      <div className='grid gap-1.5'>
        <Label htmlFor='form-email'>Email</Label>
        <div className='relative'>
          <Mail className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            id='form-email'
            className='pl-8'
            type='email'
            placeholder='john@example.com'
          />
        </div>
      </div>

      <div className='grid gap-1.5'>
        <Label htmlFor='form-phone'>Phone</Label>
        <div className='relative'>
          <Phone className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            id='form-phone'
            className='pl-8'
            type='tel'
            placeholder='+1 (555) 000-0000'
          />
        </div>
      </div>

      <div className='grid gap-1.5'>
        <Label htmlFor='form-card'>Card Number</Label>
        <div className='relative'>
          <CreditCard className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            id='form-card'
            className='pl-8'
            placeholder='4242 4242 4242 4242'
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Sizes
export const SmallInput: Story = {
  args: {
    className: 'h-8 text-sm',
    placeholder: 'Small input',
  },
};

export const LargeInput: Story = {
  args: {
    className: 'h-12 text-lg',
    placeholder: 'Large input',
  },
};

// File Input
export const FileInput: Story = {
  render: () => (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      <Label htmlFor='file'>Upload Document</Label>
      <Input id='file' type='file' accept='.pdf,.doc,.docx' />
      <p className='text-sm text-muted-foreground'>
        PDF, DOC, or DOCX (max 10MB)
      </p>
    </div>
  ),
};
