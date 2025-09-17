# Hollywood Demo App

A demonstration application showcasing the Hollywood monorepo's package integration.

## Overview

This demo app is a simple React application built with Vite, TypeScript, and Tailwind CSS that demonstrates how to use the different packages within the Hollywood monorepo:

- **@legacyguard/logic** - Business logic and utilities
- **@legacyguard/ui** - UI components library (Tamagui-based)
- **@hollywood/shared** - Shared services and types

## Features

The demo app includes:

- **Date Formatting** - Using utilities from `@legacyguard/logic`
- **Progress Bar** - Interactive component demonstration
- **Email Validation** - Form validation example
- **Package Overview** - Visual representation of the monorepo structure

## Development

### Prerequisites

Make sure you have installed dependencies from the root of the monorepo:

```bash
# From the monorepo root
npm install --legacy-peer-deps
```

### Running the Demo

From the monorepo root:

```bash
# Start the development server
npm run dev:demo

# Or from this directory
npm run dev
```

The app will be available at `http://localhost:5174`

### Building

```bash
# From the monorepo root
npm run build:demo

# Or from this directory
npm run build
```

## Project Structure

```
apps/demo/
├── src/
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # React entry point
│   └── main.css          # Tailwind CSS imports and custom styles
├── index.html            # HTML entry point
├── package.json          # Package dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── postcss.config.js     # PostCSS configuration
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing

## Dependencies

The demo app depends on the following monorepo packages:

- `@legacyguard/logic` - For date formatting and other utilities
- `@legacyguard/ui` - For UI components (simplified usage in this demo)
- `@hollywood/shared` - For shared services and types

## Notes

This is a simplified demo that showcases basic integration with the monorepo packages. The actual LegacyGuard application uses more complex features including:

- Tamagui components with theme support
- Supabase integration for backend services
- Clerk authentication
- i18n for multiple languages
- Complex state management

## License

Part of the Hollywood monorepo project.
