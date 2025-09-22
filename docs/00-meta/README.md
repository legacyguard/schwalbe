# LegacyGuard Documentation

## Overview

Welcome to the comprehensive documentation for the LegacyGuard platform - a secure document management and family protection system built with modern technologies and best practices.

## Documentation Inventory

- **Directory taxonomy:** core material belongs in `00-meta`, `10-strategy`, `20-roadmaps`, `30-product`, `40-platform`, `50-ops`, `60-status`, `90-archive`. Existing folders stay in place for now; the catalog records the intended category and highlights mismatches during audits.
- **Catalog file:** `docs/_catalog.csv` tracks every document with columns `path,title,category,lifecycle,review_date,tags,notes`. Update this file via the tooling below instead of manual edits.
- **Automation script:** run `python3 scripts/doc_inventory.py scan|update|audit|markdown-index` to manage the catalog. Example workflow: `update` after adding docs, `audit` during quarterly review, `markdown-index` to refresh `docs/INDEX.md`.
- **Classification rules:** adjust `docs/.rules.json` to tune category/tag suggestions. Each rule uses simple substring checks on path/name/directories.
- **Status hygiene:** documents with `lifecycle=status` receive an automatic review date. The audit command warns when they age past 90 days so they can move to archive or long-term sections.
- **Index:** `docs/INDEX.md` is generated from the catalog and gives a category-ordered table view. Regenerate it after notable additions with `python3 scripts/doc_inventory.py markdown-index`.

## Quick Start

### For Developers

```bash
# Clone and setup
git clone <repository-url>
cd schwalbe
npm install

# Start development environment
npm run dev

# Run quality checks
npm run qa:all
```

### For Operations

```bash
# Check system health
npm run observability:dashboard

# Monitor salt systems
npm run salt:monitor

# Rotate encryption salts (with dry-run)
npm run salt:rotate:dry-run
```

## Documentation Structure

### 🏗️ Architecture

- **[Implementation Summary](architecture/monorepo-implementation-summary.md)** - Complete implementation overview
- **[Overview](architecture/overview.md)** - System architecture and design principles
- **Technology Stack** - Detailed technology choices and rationale

### 🔧 Development

- **[Getting Started](development/getting-started.md)** - Setup and development workflow
- **[Contributing Guidelines](development/contributing-guidelines.md)** - Code standards and contribution process
- **Package Scripts** - Available NPM scripts and their usage

### 🚀 Deployment

- **[Environment Setup](deployment/environment-setup.md)** - Production deployment guide
- **[CI/CD Pipeline](deployment/cicd.md)** - Automated deployment process
- **Configuration Management** - Environment variables and secrets

### 📊 Observability

- **[Enhanced Observability Guide](observability/enhanced-observability-guide.md)** - Comprehensive monitoring system
- **Alert Management** - Rate limiting, escalation, and notification setup
- **Metrics Collection** - System and business metrics
- **Dashboard Usage** - Real-time monitoring and health checks

### 🔒 Security

- **[Security Checklist](security/security-checklist.md)** - Security validation and compliance
- **[Auth Migration Playbook](security/auth-migration-playbook.md)** - Authentication system migration
- **Salt Rotation** - Encryption key rotation procedures

### 🛠️ Operations

- **[Release Playbook](qa/release-playbook.md)** - Step-by-step release procedures
- **[Salt Rotation Runbook](runbooks/salt-rotation-reindex.md)** - Encryption maintenance
- **System Maintenance** - Regular operational tasks

### 🌍 Internationalization

- **Language Matrix** - 34 supported languages and validation
- **Translation Management** - Adding and maintaining translations
- **CI Integration** - Automated language compliance checks

### 📱 Applications

#### Web Application

- **Current Web App** (`apps/web`) - Production React application
- **Next.js Migration** (`apps/web-next`) - Modern App Router implementation
- **Shared Components** - UI package usage and patterns

#### Mobile Application

- **Mobile MVP** (`apps/mobile`) - Expo React Native application
- **Authentication** - Biometric and password-based auth
- **Navigation** - Tab-based navigation with 4 main screens

### 🗄️ Database

- **Schema Documentation** - Database structure and relationships
- **Migration Guide** - Database update procedures
- **RLS Policies** - Row Level Security implementation

## Key Features

### 🛡️ Security & Privacy

- **End-to-End Security**: Comprehensive security measures from authentication to data storage
- **GDPR Compliance**: Data export, deletion, and privacy protection
- **Row Level Security**: Database-level access control
- **Audit Trails**: Complete access logging for sensitive operations

### 🔍 Observability & Monitoring

- **Sophisticated Rate Limiting**: Prevents alert fatigue while maintaining visibility
- **Multi-Channel Notifications**: Email, Slack, PagerDuty integration
- **Real-time Dashboard**: System health monitoring and metrics visualization
- **Automated Maintenance**: Self-managing data lifecycle and cleanup

### 🌐 Internationalization

- **34 Languages Supported**: Comprehensive global reach
- **Automated Validation**: CI-enforced translation compliance
- **Quality Assurance**: Consistent terminology and cultural adaptation

### 📊 Quality Assurance

- **3-Gate QA System**: Automated accessibility, security, and observability validation
- **Comprehensive Testing**: Database smoke tests and application validation
- **CI Integration**: Quality gates prevent regressions

## Technology Stack

### Frontend

- **Web**: React + Vite + React i18next
- **Next.js**: App Router + next-intl
- **Mobile**: Expo React Native + Tamagui

### Backend

- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth + RLS
- **Functions**: Deno Edge Functions
- **Storage**: Supabase Storage + RLS

### DevOps & Monitoring

- **CI/CD**: GitHub Actions
- **Monitoring**: Custom observability system
- **Alerting**: Multi-channel with rate limiting
- **Security**: Automated secret scanning

## Quick Reference

### Development Commands

```bash
# Development
npm run dev                    # Start all apps
npm run dev:web               # Web only
npm run dev:mobile            # Mobile only

# Quality & Testing
npm run qa:all                # All QA gates
npm run test                  # Run tests
npm run typecheck            # TypeScript validation
npm run lint                 # Code quality

# Observability
npm run observability:dashboard     # System health
npm run salt:monitor               # Salt health
npm run observability:dashboard:prod  # Production metrics

# Build & Deploy
npm run build                 # Build all
npm run build:web            # Web build
npm run build:mobile         # Mobile build
```

### Monitoring & Operations

```bash
# Health Checks
npm run salt:monitor:alerts          # Salt system alerts
npm run observability:dashboard:json # JSON output for automation

# Maintenance
npm run salt:rotate:dry-run         # Test salt rotation
npm run reindex:search              # Reindex search data

# QA Gates
npm run qa:accessibility            # Gate 1: Accessibility & i18n
npm run qa:security                 # Gate 2: Privacy & Security  
npm run qa:alerts                   # Gate 3: Alerts & Observability
```

## Support & Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version (>=20.19.1) and npm (>=10.0.0)
2. **Type Errors**: Run `npm run typecheck` to identify TypeScript issues
3. **i18n Failures**: Use `npm run i18n:generate-stubs` to fix missing translations
4. **QA Gate Failures**: Check individual gate outputs for specific issues

### Getting Help

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check relevant sections in this documentation
- **Team Communication**: Contact the development team for urgent issues

### Performance Monitoring

- **Dashboard**: `npm run observability:dashboard` for real-time metrics
- **Logs**: Check Edge Function logs in Supabase dashboard
- **Alerts**: Monitor email/Slack for system alerts

## Contributing

1. **Read Guidelines**: Check [Contributing Guidelines](../CONTRIBUTING.md)
2. **Follow Standards**: Use ESLint, Prettier, and TypeScript
3. **Run QA Gates**: Ensure all quality gates pass before submitting
4. **Test Thoroughly**: Include tests for new features
5. **Document Changes**: Update relevant documentation

## System Status

**Implementation Status**: ✅ **COMPLETE** (All 12 phases implemented)

- Phase 0-11: Fully implemented and production-ready
- Phase 12: Documentation complete and aligned

**Quality Assurance**: ✅ **VALIDATED**

- 3-Gate QA system operational
- Comprehensive smoke tests passing
- CI/CD pipeline active

**Production Readiness**: ✅ **READY**

- Monitoring and observability complete
- Security measures implemented
- Operations runbooks available

---

**Last Updated**: September 2025  
**Version**: 1.0  
**Status**: Production Ready

For the most current information, check the [Implementation Summary](architecture/monorepo-implementation-summary.md) which provides detailed status of all system components.
