# Billing (Stripe Integration) - Comprehensive Analysis for 022-billing-stripe

## Overview

Stripe billing integration je kritická súčasť LegacyGuard systému - zabezpečuje bezpečnú a spoľahlivú správu platieb, predplatného a finančných transakcií. Systém kombinuje Stripe API s vlastnými obchodnými logikami pre správu predplatného, sledovanie používania a bezpečnú spracovanie platieb.

## Core Components Analysis

### 1. Stripe Service (`stripe.service.ts`)

**Kľúčové funkcie:**

- `StripeService` class s singleton pattern pre centralizovanú správu
- `createCheckoutSession()` - vytvorenie Stripe checkout relácie
- `createCustomer()` - správa Stripe zákazníkov
- `handleWebhook()` - spracovanie webhook udalostí

**Architektúra:**

- Client-side integrácia s Stripe.js
- Server-side API volania cez Supabase Edge Functions
- Bezpečná správa API kľúčov a secrets
- Error handling s fallback mechanizmami

**Migrácia do Schwalbe:**

- Zachovať core Stripe integráciu
- Aktualizovať na nové Supabase endpoint URLs
- Rozšíriť error handling pre lepšie UX

### 2. Subscription Service (`subscription.service.ts`)

**SubscriptionService class:**

- Automatické sledovanie stavu predplatného
- Usage tracking a limit enforcement
- Plan management s upgrade/downgrade funkciami
- Integration s RLS policies

**Kľúčové funkcie:**

- `getCurrentSubscription()` - získanie aktuálneho predplatného
- `checkUsageLimit()` - kontrola limitov používania
- `incrementUsage()` - inkrementácia počítadiel
- `hasFeatureAccess()` - kontrola prístupu k features

**Migrácia do Schwalbe:**

- Zachovať subscription management logiku
- Aktualizovať na nové database schémy
- Rozšíriť o nové plan typy ak potrebné

### 3. Webhook Handler (`stripe-webhook/index.ts`)

**Automatické spracovanie udalostí:**

- HMAC signature validation pre bezpečnosť
- Event deduplication pre spoľahlivosť
- State machine pre subscription lifecycle
- Audit logging všetkých billing operácií

**Event handling:**

- `checkout.session.completed` - dokončenie platby
- `customer.subscription.updated` - zmeny predplatného
- `invoice.payment_failed` - neúspešné platby
- `customer.subscription.deleted` - zrušenie predplatného

**Migrácia do Schwalbe:**

- Aktualizovať na nové database schémy
- Rozšíriť o nové event typy ak potrebné
- Zachovať security measures

### 4. Database Schema (subscription tables)

#### user_subscriptions table

**Core subscription data:**

- Stripe customer a subscription IDs
- Plan type a billing cycle
- Status transitions (active, past_due, cancelled)
- Usage limits a feature flags

#### user_usage table

**Usage tracking:**

- Document, storage, time capsule counts
- Monthly scan limits
- Last reset dates pre recurring limits
- Real-time limit checking

#### subscription_limits table

**Plan definitions:**

- Feature access flags (AI, offline, priority support)
- Usage limits per plan
- Family member limits
- Billing cycle information

**Migrácia do Schwalbe:**

- Zachovať existujúce migration files
- Aktualizovať RLS policies pre Clerk
- Rozšíriť o nové fields ak potrebné

### 5. Checkout Flow Components

#### CheckoutButton (`CheckoutButton.tsx`)

**Payment initiation:**

- Stripe.js integration
- Session creation a redirect
- Error handling a loading states
- Success/cancel URL handling

#### Pricing Components

**Plan display:**

- Feature comparison
- Price display s billing cycles
- Popular plan highlighting
- Upgrade prompts

**Migrácia do Schwalbe:**

- Zachovať checkout flow logiku
- Aktualizovať na nové UI design systém
- Rozšíriť o nové payment methods

## Integration Points

### 1. Supabase Edge Functions

- `create-checkout-session` - checkout relácie
- `stripe-webhook` - webhook spracovanie
- Database functions pre usage tracking

### 2. UI Components

- Pricing cards a comparison
- Subscription management dashboard
- Usage limit warnings
- Payment success/failure pages

### 3. State Management

- Subscription context provider
- Usage tracking store
- Payment flow state management

## Migration Strategy for Schwalbe

### Phase 1: Core Billing Infrastructure

1. Migrácia `stripe.service.ts` s aktualizáciou API endpoints
2. Migrácia `subscription.service.ts` s novými database schémami
3. Migrácia webhook handler s rozšírením event processing

### Phase 2: Database & Security

1. Migrácia subscription tables s Clerk RLS policies
2. Implementácia usage tracking systémov
3. Nastavenie webhook security (signatures, validation)

### Phase 3: Frontend Integration

1. Migrácia checkout komponentov s novým UI systémom
2. Implementácia subscription management dashboard
3. Pridanie usage limit UI feedback

### Phase 4: Testing & Monitoring

1. End-to-end testing checkout flow
2. Webhook processing validation
3. Performance monitoring a alerting

## Technical Requirements

### Dependencies

- Stripe.js (frontend integration)
- @stripe/stripe-js (React hooks)
- Supabase (backend integration)
- TypeScript (type safety)

### Performance Considerations

- Webhook processing latency (<5s)
- Database query optimization
- Caching pre frequently accessed data
- Rate limiting pre API calls

### Security

- PCI DSS compliance
- Webhook signature validation
- API key rotation
- Audit logging

## Success Metrics

### Business Metrics

- Checkout conversion rates
- Subscription retention rates
- Payment failure rates
- Customer lifetime value

### Technical Metrics

- Webhook processing success rate (>99.9%)
- API response times (<2s)
- Database query performance
- Error rates (<0.1%)

### User Experience

- Checkout completion rates
- Subscription management ease
- Usage limit communication clarity
- Payment error recovery

## Risk Assessment

### High Risk Areas

1. **Payment Security**: Webhook validation, PCI compliance
2. **Data Consistency**: Subscription state synchronization
3. **Stripe API Changes**: Version compatibility, breaking changes
4. **Usage Limit Enforcement**: Real-time validation, edge cases

### Mitigation Strategies

- Comprehensive testing s Stripe test mode
- Database transactions pre state changes
- Monitoring a alerting pre failures
- Gradual rollout s rollback capability

## Future Enhancements

### Advanced Features

- Multi-currency support
- Subscription analytics dashboard
- Advanced dunning management
- Usage-based billing

### Integration Improvements

- Enhanced error recovery
- Real-time usage monitoring
- Automated plan recommendations
- Payment method optimization

### Security Enhancements

- Advanced fraud detection
- Enhanced audit logging
- Compliance automation
- Security monitoring

## Dependencies on Other Specifications

### Core Dependencies

- **[001-reboot-foundation](../001-reboot-foundation/)**: Base infrastructure a environment setup
- **[002-hollywood-migration](../002-hollywood-migration/)**: Migration framework a data porting
- **[020-auth-rls-baseline](../020-auth-rls-baseline/)**: Clerk authentication a RLS policies
- **[021-database-types](../021-database-types/)**: TypeScript types pre database schema

### Related Specifications

- **[005-sofia-ai-system](../005-sofia-ai-system/)**: AI features access control
- **[006-document-vault](../006-document-vault/)**: Storage limits enforcement
- **[007-will-creation-system](../007-will-creation-system/)**: Premium features access
- **[008-family-collaboration](../008-family-collaboration/)**: Family member limits
- **[009-professional-network](../009-professional-network/)**: Professional features access
- **[010-emergency-access](../010-emergency-access/)**: Emergency features availability
- **[011-mobile-app](../011-mobile-app/)**: Mobile billing considerations
- **[013-time-capsule-legacy](../013-time-capsule-legacy/)**: Time capsule limits
- **[014-pricing-conversion](../014-pricing-conversion/)**: Pricing strategy optimization

## Conclusion

Stripe billing systém je dobre navrhnutý a testovaný systém, ktorý poskytuje spoľahlivé a bezpečné spracovanie platieb. Pre migráciu do Schwalbe je potrebné zachovať core funkcionalitu, aktualizovať integrácie a rozšíriť o nové features. Systém je pripravený na migráciu s minimálnymi zmenami v core logike a maximálnym zameraním na bezpečnosť a spoľahlivosť.
