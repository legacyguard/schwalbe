
import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { AlertCircle, FileText, Settings, Trash2, Users } from 'lucide-react';

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Dialog component provides a modal overlay for important interactions and confirmations.
It's built on Radix UI Dialog primitive and follows accessibility best practices.

## Components
- **Dialog**: The root component
- **DialogTrigger**: The element that triggers the dialog
- **DialogContent**: The modal content container
- **DialogHeader**: Contains title and description
- **DialogTitle**: The dialog heading
- **DialogDescription**: Supporting text
- **DialogFooter**: Actions area
- **DialogClose**: Close button component

## Features
- Accessible (ARIA compliant)
- Focus management
- Keyboard navigation (ESC to close)
- Smooth animations
- Backdrop overlay
- Customizable sizes
- Dark mode support

## Usage

\`\`\`tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description or instructions
      </DialogDescription>
    </DialogHeader>
    <div>Main content</div>
    <DialogFooter>
      <Button>Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
\`\`\`

## Best Practices
- Use dialogs for important user decisions
- Keep content concise and focused
- Provide clear action buttons
- Include a way to dismiss (X button or Cancel)
- Use appropriate dialog sizes
- Avoid nested dialogs
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Dialog
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to LegacyGuard</DialogTitle>
          <DialogDescription>
            Secure your family's future with our comprehensive legacy planning
            platform.
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <p className='text-sm text-muted-foreground'>
            Get started by creating your first document or inviting family
            members.
          </p>
        </div>
        <DialogFooter>
          <Button type='submit'>Get Started</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Confirmation Dialog
export const ConfirmationDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='destructive'>
          <Trash2 className='mr-2 h-4 w-4' />
          Delete Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-destructive' />
            <DialogTitle>Delete Document</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete "Last Will & Testament"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2 sm:gap-0'>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button variant='destructive'>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Form Dialog
export const FormDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Users className='mr-2 h-4 w-4' />
          Add Family Member
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
          <DialogDescription>
            Invite a family member to access your legacy documents.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Name
            </Label>
            <Input id='name' placeholder='John Doe' className='col-span-3' />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='email' className='text-right'>
              Email
            </Label>
            <Input
              id='email'
              type='email'
              placeholder='john@example.com'
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='relationship' className='text-right'>
              Relationship
            </Label>
            <select
              id='relationship'
              className='col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
            >
              <option>Spouse</option>
              <option>Child</option>
              <option>Parent</option>
              <option>Sibling</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button type='submit'>Send Invitation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Information Dialog
export const InformationDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <FileText className='mr-2 h-4 w-4' />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[550px]'>
        <DialogHeader>
          <DialogTitle>Document Details</DialogTitle>
          <DialogDescription>
            Last Will & Testament - Version 2.1
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='rounded-lg border p-4'>
            <h4 className='text-sm font-medium mb-2'>Document Information</h4>
            <dl className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>Created:</dt>
                <dd className='font-medium'>March 15, 2024</dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>Last Modified:</dt>
                <dd className='font-medium'>March 20, 2024</dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>Status:</dt>
                <dd className='font-medium text-green-600'>Notarized</dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>Witnesses:</dt>
                <dd className='font-medium'>2 confirmed</dd>
              </div>
            </dl>
          </div>

          <div className='rounded-lg border p-4'>
            <h4 className='text-sm font-medium mb-2'>Beneficiaries</h4>
            <ul className='space-y-2 text-sm'>
              <li className='flex justify-between'>
                <span>Jane Doe (Spouse)</span>
                <span className='text-muted-foreground'>50%</span>
              </li>
              <li className='flex justify-between'>
                <span>John Jr. (Child)</span>
                <span className='text-muted-foreground'>25%</span>
              </li>
              <li className='flex justify-between'>
                <span>Sarah Doe (Child)</span>
                <span className='text-muted-foreground'>25%</span>
              </li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline'>Download PDF</Button>
          <Button>Edit Document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Settings Dialog
export const SettingsDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='ghost' size='icon'>
          <Settings className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Document Settings</DialogTitle>
          <DialogDescription>
            Configure access and notification preferences
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>Public Access</Label>
              <p className='text-sm text-muted-foreground'>
                Allow family members to view this document
              </p>
            </div>
            <Button variant='outline' size='sm'>
              Configure
            </Button>
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>Email Notifications</Label>
              <p className='text-sm text-muted-foreground'>
                Receive updates when document is accessed
              </p>
            </div>
            <Button variant='outline' size='sm'>
              Configure
            </Button>
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>Version History</Label>
              <p className='text-sm text-muted-foreground'>
                Keep track of all document changes
              </p>
            </div>
            <Button variant='outline' size='sm'>
              View
            </Button>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Close</Button>
          </DialogClose>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Large Content Dialog
export const LargeDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Large Dialog</Button>
      </DialogTrigger>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Please read our terms carefully before proceeding
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <section>
            <h3 className='font-medium mb-2'>1. Introduction</h3>
            <p className='text-sm text-muted-foreground'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </section>

          <section>
            <h3 className='font-medium mb-2'>2. User Responsibilities</h3>
            <p className='text-sm text-muted-foreground'>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
          </section>

          <section>
            <h3 className='font-medium mb-2'>3. Privacy Policy</h3>
            <p className='text-sm text-muted-foreground'>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo.
            </p>
          </section>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Decline</Button>
          </DialogClose>
          <Button>Accept Terms</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
