
import type { Meta, StoryObj } from '@storybook/react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Calendar, Clock, FileText, Heart, Shield, Users } from 'lucide-react';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Card component is a versatile container used to group related content and actions.
It provides a consistent visual structure for displaying information throughout the LegacyGuard application.

## Components
- **Card**: The main container
- **CardHeader**: Contains title and description
- **CardTitle**: The main heading
- **CardDescription**: Supporting text
- **CardContent**: Main content area
- **CardFooter**: Actions and metadata

## Features
- Clean, modern design with subtle shadows
- Responsive layout
- Composable structure
- Dark mode support
- Customizable spacing

## Usage

\`\`\`tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content of the card</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
\`\`\`

## Best Practices
- Use cards to group related information
- Keep card content concise and scannable
- Use consistent spacing and typography
- Include clear actions when needed
- Consider card elevation for visual hierarchy
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Card
export const Default: Story = {
  render: () => {
    const { t } = useTranslation('stories/card');
    return (
      <Card className='w-[350px]'>
        <CardHeader>
          <CardTitle>{t('examples.default.title')}</CardTitle>
          <CardDescription>{t('examples.default.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{t('examples.default.content')}</p>
        </CardContent>
        <CardFooter>
          <Button className='w-full'>{t('examples.default.action')}</Button>
        </CardFooter>
      </Card>
    );
  },
};

// Document Card
export const DocumentCard: Story = {
  render: () => {
    const { t } = useTranslation('stories/card');
    return (
      <Card className='w-[350px]'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <FileText className='h-5 w-5 text-muted-foreground' />
            <Badge variant='secondary'>{t('examples.document.status')}</Badge>
          </div>
          <CardTitle>{t('examples.document.title')}</CardTitle>
          <CardDescription>{t('examples.document.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              <span>{t('examples.document.created')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              <span>{t('examples.document.modified')}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex gap-2'>
          <Button variant='outline' size='sm' className='flex-1'>
            {t('examples.document.actions.view')}
          </Button>
          <Button size='sm' className='flex-1'>
            {t('examples.document.actions.edit')}
          </Button>
        </CardFooter>
      </Card>
    );
  },
};

// Family Member Card
export const FamilyMemberCard: Story = {
  render: () => (
    <Card className='w-[350px]'>
      <CardHeader>
        <div className='flex items-center gap-4'>
          <Avatar>
            <AvatarImage src='/api/placeholder/40/40' alt='John Doe' />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <CardTitle className='text-lg'>John Doe</CardTitle>
            <CardDescription>Primary Beneficiary</CardDescription>
          </div>
          <Badge variant='outline'>
            <Heart className='mr-1 h-3 w-3' />
            Spouse
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Inheritance</span>
            <span className='font-medium'>50%</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Documents</span>
            <span className='font-medium'>3 shared</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Emergency Access</span>
            <Badge variant='secondary' className='h-5'>
              <Shield className='mr-1 h-3 w-3' />
              Enabled
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant='outline' className='w-full'>
          Manage Access
        </Button>
      </CardFooter>
    </Card>
  ),
};

// Stats Card
export const StatsCard: Story = {
  render: () => (
    <Card>
      <CardHeader className='pb-2'>
        <CardDescription>Total Documents</CardDescription>
        <CardTitle className='text-4xl'>24</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-xs text-muted-foreground'>
          +10% from last month
        </div>
      </CardContent>
    </Card>
  ),
};

// Feature Card
export const FeatureCard: Story = {
  render: () => (
    <Card className='w-[350px]'>
      <CardHeader>
        <Shield className='h-10 w-10 text-primary mb-2' />
        <CardTitle>Bank-Level Security</CardTitle>
        <CardDescription>
          Your documents are protected with enterprise-grade encryption
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className='space-y-2 text-sm'>
          <li className='flex items-center gap-2'>
            <div className='h-1.5 w-1.5 rounded-full bg-primary' />
            256-bit AES encryption
          </li>
          <li className='flex items-center gap-2'>
            <div className='h-1.5 w-1.5 rounded-full bg-primary' />
            Zero-knowledge architecture
          </li>
          <li className='flex items-center gap-2'>
            <div className='h-1.5 w-1.5 rounded-full bg-primary' />
            SOC 2 Type II certified
          </li>
        </ul>
      </CardContent>
    </Card>
  ),
};

// Interactive Card
export const InteractiveCard: Story = {
  render: () => (
    <Card className='w-[350px] cursor-pointer transition-all hover:shadow-lg'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <Users className='h-5 w-5 text-primary' />
          <Badge>New</Badge>
        </div>
        <CardTitle>Family Protection Plan</CardTitle>
        <CardDescription>Secure your family's future</CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-muted-foreground'>
          Complete package including will creation, guardianship setup, and
          emergency access management.
        </p>
      </CardContent>
      <CardFooter>
        <Button className='w-full'>Learn More</Button>
      </CardFooter>
    </Card>
  ),
};

// Minimal Card
export const MinimalCard: Story = {
  render: () => (
    <Card className='w-[350px] border-0 shadow-none'>
      <CardHeader>
        <CardTitle>Minimal Design</CardTitle>
        <CardDescription>No border, no shadow</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Perfect for nested content or subtle grouping.</p>
      </CardContent>
    </Card>
  ),
};

// Card Grid Example
export const CardGrid: Story = {
  render: () => (
    <div className='grid grid-cols-3 gap-4 w-[900px]'>
      <Card>
        <CardHeader className='pb-2'>
          <CardDescription>Documents</CardDescription>
          <CardTitle className='text-2xl'>156</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <CardDescription>Family Members</CardDescription>
          <CardTitle className='text-2xl'>8</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <CardDescription>Completion</CardDescription>
          <CardTitle className='text-2xl'>87%</CardTitle>
        </CardHeader>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
