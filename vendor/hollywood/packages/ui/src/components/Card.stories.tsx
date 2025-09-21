import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'tamagui';
import { Button } from './Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';

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
      options: ['default', 'elevated', 'filled', 'premium', 'success', 'danger', 'ghost'],
    },
    padding: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large', 'xlarge'],
    },
    clickable: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>This is a default card with basic styling</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>This is the main content of the card. It can contain any text or components.</Text>
        </CardContent>
        <CardFooter>
          <Button variant="primary">Action</Button>
        </CardFooter>
      </>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <>
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
          <CardDescription>This card has elevated styling with shadow</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>Elevated cards provide visual depth and are great for highlighting important content.</Text>
        </CardContent>
      </>
    ),
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    children: (
      <>
        <CardHeader>
          <CardTitle>Filled Card</CardTitle>
          <CardDescription>Card with filled background</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>Filled cards use a subtle background color to distinguish content areas.</Text>
        </CardContent>
      </>
    ),
  },
};

export const Premium: Story = {
  args: {
    variant: 'premium',
    children: (
      <>
        <CardHeader>
          <CardTitle>Premium Card</CardTitle>
          <CardDescription>Exclusive premium styling</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>Premium cards use gold accents to indicate premium or exclusive content.</Text>
        </CardContent>
      </>
    ),
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: (
      <>
        <CardHeader>
          <CardTitle>Success Card</CardTitle>
          <CardDescription>Success state styling</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>Success cards use green styling to indicate positive outcomes or successful operations.</Text>
        </CardContent>
      </>
    ),
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: (
      <>
        <CardHeader>
          <CardTitle>Danger Card</CardTitle>
          <CardDescription>Warning or error state</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>Danger cards use red styling to indicate warnings, errors, or destructive actions.</Text>
        </CardContent>
      </>
    ),
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: (
      <>
        <CardHeader>
          <CardTitle>Ghost Card</CardTitle>
          <CardDescription>Transparent background styling</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>Ghost cards have transparent backgrounds and are useful for subtle content separation.</Text>
        </CardContent>
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <View gap={16}>
      <Card variant="default">
        <CardHeader>
          <CardTitle>Default</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>Default variant</Text>
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>Elevated variant</Text>
        </CardContent>
      </Card>
      <Card variant="filled">
        <CardHeader>
          <CardTitle>Filled</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>Filled variant</Text>
        </CardContent>
      </Card>
      <Card variant="ghost">
        <CardHeader>
          <CardTitle>Ghost</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>Ghost variant</Text>
        </CardContent>
      </Card>
    </View>
  ),
};
