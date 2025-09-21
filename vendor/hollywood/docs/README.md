# 🏰 Document Safe - Monorepo

[![CI/CD](https://github.com/legacyguard/hollywood/actions/workflows/ci.yml/badge.svg)](https://github.com/legacyguard/hollywood/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

## 📱 Complete Document Management Ecosystem

Document Safe (formerly LegacyGuard) is a comprehensive document management platform with web and mobile applications, featuring end-to-end encryption, AI-powered document processing, and real-time synchronization.

## 🏗️ Monorepo Structure

```text
hollywood/
├── hollywood/          # 🌐 Web application (Vite + React)
├── mobile/            # 📱 Mobile application (React Native + Expo)
├── packages/          # 📦 Shared packages
│   └── shared/       # Shared services and utilities
├── supabase/         # 🔧 Backend and Edge Functions
├── docs/             # 📚 Documentation
├── scripts/          # 🛠️ Utility scripts
└── turbo.json        # ⚡ Turborepo configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- iOS Simulator (for mobile iOS development)
- Android Studio (for mobile Android development)
- Supabase CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/legacyguard/hollywood.git
cd hollywood

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Development

```bash
# Run all applications
npm run dev

# Run specific applications
npm run web:dev      # Web only
npm run mobile:dev   # Mobile only
```

## 🎯 Features

### Web Application

- 🔐 End-to-end encryption
- 📸 Document scanning with OCR
- 🤖 AI-powered categorization
- ⏰ Time Capsule feature
- 👨‍👩‍👧‍👦 Family sharing
- 💳 Stripe payments
- 📊 Analytics dashboard

### Mobile Application

- 📱 Native performance
- 📸 Advanced camera scanning
- 🔄 Offline-first architecture
- 🔑 Biometric authentication
- 📍 Location-based organization
- 🔔 Push notifications

## 💳 Subscription Plans

| Feature | Free | Essential ($9.99) | Family ($19.99) | Premium ($39.99) |
|---------|------|------------------|-----------------|------------------|
| Documents | 100 | 1,000 | 5,000 | Unlimited |
| Storage | 500 MB | 5 GB | 20 GB | Unlimited |
| Offline | ❌ | ✅ | ✅ | ✅ |
| AI Features | ❌ | ❌ | ✅ | ✅ |

## 🧪 Testing

Test cards for Stripe (test mode):

- Success: `4242 4242 4242 4242`
- 3D Secure: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 0002`

## 📚 Documentation

- [Stripe Testing Guide](docs/STRIPE_TESTING_GUIDE.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the Document Safe team
