# 💳 Stripe Testing Guide - Document Safe

## 📋 Obsah
1. [Prehľad](#prehľad)
2. [Testovacie prostredie](#testovacie-prostredie)
3. [Testovacie karty](#testovacie-karty)
4. [Testovanie platobných scenárov](#testovanie-platobných-scenárov)
5. [Testovanie webhookov](#testovanie-webhookov)
6. [Debugovanie a riešenie problémov](#debugovanie-a-riešenie-problémov)

---

## 🎯 Prehľad

Tento dokument obsahuje kompletnú príručku pre testovanie Stripe integrácie v Document Safe aplikácii. Všetky platby v testovacom režime sú simulované a žiadne skutočné peniaze sa neprenášajú.

### Dôležité URL adresy
- **Stripe Dashboard (Test Mode)**: https://dashboard.stripe.com/test/dashboard
- **Webhook Endpoint**: `https://lolnkpeipxwhhiukqboo.supabase.co/functions/v1/stripe-webhook`
- **Aplikácia**: http://localhost:3000/pricing (alebo váš deployment URL)

---

## 🔧 Testovacie prostredie

### API Kľúče (Test Mode)
```
Publishable Key: pk_test_51RxUMeFjl1oRWeU65Io8N2kBHb5qWCz8kOTRKhHQk5Sx1M6vJVGqBi7lxVdQGLUJvNXLJfqNvtjdKuqz3N2XVb0v00hvbhKTlP
Secret Key: sk_test_51RxUMeFjl1oRWeU6boLX0xTnSSIzYdt9jcUQWUJx6FKsNX5uCqH55cqgjpYn0zayR5Y07T0XpePIM9N39CR7llo500XBtXellm
Webhook Secret: whsec_Di7yonYndLu8uCSfQIb5t4on0oobbzQZ
```

### Produkty a ceny (Test Mode)
| Plán | Mesačne | Ročne | Price ID (Mesačne) | Price ID (Ročne) |
|------|---------|-------|-------------------|------------------|
| **Essential** | $9.99 | $99.99 | `price_1S2AU9Fjl1oRWeU60ajoUhTz` | `price_1S2AU9Fjl1oRWeU6Crewzj5D` |
| **Family** | $19.99 | $199.99 | `price_1S2AUAFjl1oRWeU6RGjCZX6S` | `price_1S2AUAFjl1oRWeU63cvXIf9o` |
| **Premium** | $39.99 | $399.99 | `price_1S2AUAFjl1oRWeU64RKuOu7B` | `price_1S2AUBFjl1oRWeU6587z8bLh` |

---

## 💳 Testovacie karty

### Základné testovacie karty

#### ✅ Úspešné platby

| Scenár | Číslo karty | CVC | Dátum expirácie | PSČ |
|--------|-------------|-----|-----------------|-----|
| **Štandardná úspešná platba** | `4242 4242 4242 4242` | Ľubovoľné 3 číslice | Ľubovoľný budúci dátum | Ľubovoľné |
| **Visa úspešná** | `4000 0566 5566 5556` | Ľubovoľné 3 číslice | Ľubovoľný budúci dátum | Ľubovoľné |
| **Mastercard úspešná** | `5555 5555 5555 4444` | Ľubovoľné 3 číslice | Ľubovoľný budúci dátum | Ľubovoľné |
| **American Express** | `3782 822463 10005` | Ľubovoľné 4 číslice | Ľubovoľný budúci dátum | Ľubovoľné |

#### 🔐 3D Secure autentifikácia

| Scenár | Číslo karty | Výsledok |
|--------|-------------|----------|
| **Vyžaduje autentifikáciu** | `4000 0025 0000 3155` | Zobrazí 3D Secure výzvu, potom úspech |
| **Vždy vyžaduje autentifikáciu** | `4000 0027 6000 3184` | Vždy vyžaduje 3D Secure |
| **Autentifikácia zlyhá** | `4000 0082 6000 3178` | 3D Secure zlyhá |

#### ❌ Zamietnuté karty

| Scenár | Číslo karty | Dôvod zamietnutia |
|--------|-------------|-------------------|
| **Všeobecné zamietnutie** | `4000 0000 0000 0002` | Karta zamietnutá |
| **Nedostatočné prostriedky** | `4000 0000 0000 9995` | Nedostatok prostriedkov |
| **Stratená karta** | `4000 0000 0000 9987` | Karta nahlásená ako stratená |
| **Ukradnutá karta** | `4000 0000 0000 9979` | Karta nahlásená ako ukradnutá |
| **Expirovaná karta** | `4000 0000 0000 0069` | Karta expirovala |
| **Nesprávne CVC** | `4000 0000 0000 0127` | CVC kontrola zlyhala |
| **Nesprávne PSČ** | `4000 0000 0000 0036` | PSČ kontrola zlyhala |
| **Vysoké riziko** | `4000 0000 0000 6975` | Platba označená ako riziková |

### Špecifické testovacie scenáre

#### 🔄 Predplatné scenáre

1. **Úspešné vytvorenie predplatného**
   - Karta: `4242 4242 4242 4242`
   - Kroky:
     1. Choď na `/pricing`
     2. Vyber plán (Essential/Family/Premium)
     3. Vyber fakturačný cyklus (mesačný/ročný)
     4. Klikni na "Upgrade to [plan]"
     5. Zadaj testovaciu kartu
     6. Potvrď platbu

2. **Predplatné s 3D Secure**
   - Karta: `4000 0025 0000 3155`
   - Rovnaké kroky ako vyššie, ale bude vyžadovaná dodatočná autentifikácia

3. **Zlyhanie prvej platby**
   - Karta: `4000 0000 0000 0341`
   - Prvá platba zlyhá, ale karta sa uloží pre budúce pokusy

#### 💸 Obnovenie predplatného

| Scenár | Karta pre test | Simulácia |
|--------|---------------|-----------|
| **Úspešné obnovenie** | `4242 4242 4242 4242` | Automatické obnovenie prebehne úspešne |
| **Zlyhanie obnovenia** | `4000 0000 0000 0341` | Obnovenie zlyhá, predplatné prejde do `past_due` |
| **Retry úspešný** | `4000 0000 0000 0119` | Prvý pokus zlyhá, druhý úspešný |

---

## 🧪 Testovanie platobných scenárov

### 1. Nová registrácia s predplatným

```bash
# Krok 1: Registrácia používateľa
1. Vytvor nový účet na /signup
2. Potvrď email (ak je vyžadovaný)
3. Prihlás sa

# Krok 2: Výber plánu
4. Naviguj na /pricing
5. Vyber želaný plán
6. Klikni na "Upgrade to [plan]"

# Krok 3: Platba
7. Zadaj testovaciu kartu: 4242 4242 4242 4242
8. Expirácia: 12/34
9. CVC: 123
10. PSČ: 12345
11. Klikni "Subscribe"

# Očakávaný výsledok:
- Redirect na success page
- Predplatné aktívne v databáze
- Webhook spracovaný
```

### 2. Upgrade existujúceho plánu

```bash
# Pre používateľa s Essential plánom
1. Prihlás sa ako používateľ s Essential
2. Choď na /pricing
3. Vyber Family alebo Premium
4. Dokončí checkout proces

# Očakávaný výsledok:
- Plán sa okamžite upgraduje
- Prorate sa vypočíta automaticky
- Nové limity sú okamžite dostupné
```

### 3. Testovanie limitov (Freemium)

```javascript
// Test script pre overenie limitov
const testLimits = async () => {
  // 1. Free užívateľ
  const canAddDocument = await subscriptionService.checkUsageLimit('documents');
  console.log('Free user can add document:', canAddDocument);
  
  // 2. Pridanie dokumentu
  const added = await subscriptionService.incrementUsage('documents', 1);
  console.log('Document added:', added);
  
  // 3. Kontrola využitia
  const usage = await subscriptionService.getUsagePercentage('documents');
  console.log('Usage percentage:', usage + '%');
};
```

### 4. Zrušenie predplatného

```bash
# Cez Customer Portal
1. Prihlás sa ako platený používateľ
2. Choď na /account/billing
3. Klikni "Manage Subscription"
4. Vyber "Cancel Subscription"

# Očakávaný výsledok:
- Predplatné zostáva aktívne do konca obdobia
- Status sa zmení na 'cancelled'
- Po expirácii sa vráti na Free plán
```

---

## 🔔 Testovanie webhookov

### Manuálne testovanie webhookov

1. **Stripe CLI** (odporúčané)
```bash
# Inštalácia Stripe CLI
brew install stripe/stripe-cli/stripe

# Prihlásenie
stripe login

# Forward webhooks lokálne
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test webhook
stripe trigger checkout.session.completed
```

2. **Cez Stripe Dashboard**
- Choď na https://dashboard.stripe.com/test/webhooks
- Vyber tvoj webhook endpoint
- Klikni "Send test webhook"
- Vyber event type
- Odošli

### Webhook Events pre testovanie

| Event | Trigger | Očakávaný výsledok |
|-------|---------|-------------------|
| `checkout.session.completed` | Úspešné dokončenie checkout | Vytvorí sa záznam predplatného |
| `customer.subscription.updated` | Zmena plánu | Aktualizuje sa plán v DB |
| `customer.subscription.deleted` | Zrušenie predplatného | Používateľ sa vráti na Free |
| `invoice.payment_succeeded` | Úspešná platba | Status = active |
| `invoice.payment_failed` | Zlyhanie platby | Status = past_due |

### Overenie webhook logu

```sql
-- Supabase SQL Editor
-- Kontrola posledných webhook spracovaní
SELECT * FROM user_subscriptions 
ORDER BY updated_at DESC 
LIMIT 10;

-- Kontrola používateľského využitia
SELECT * FROM user_usage 
WHERE user_id = '[user_id]';
```

---

## 🐛 Debugovanie a riešenie problémov

### Časté problémy a riešenia

#### 1. "No such price" error
```bash
# Problém: Price ID neexistuje
# Riešenie: Spusti setup script
node scripts/setup-stripe-products.js
```

#### 2. Webhook signature verification failed
```bash
# Problém: Nesprávny webhook secret
# Riešenie: Aktualizuj secret v Supabase
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
npx supabase functions deploy stripe-webhook
```

#### 3. Subscription not updating
```sql
-- Skontroluj či existuje používateľ
SELECT * FROM user_subscriptions WHERE user_id = '[user_id]';

-- Skontroluj webhook logy v Stripe Dashboard
-- https://dashboard.stripe.com/test/webhooks/[webhook_id]/attempts
```

### Debug nástroje

#### 1. Test integrácie script
```bash
node scripts/test-stripe-integration.js
```

#### 2. Stripe Dashboard nástroje
- **Events & Logs**: https://dashboard.stripe.com/test/events
- **Webhook attempts**: https://dashboard.stripe.com/test/webhooks
- **Customer list**: https://dashboard.stripe.com/test/customers
- **Subscription list**: https://dashboard.stripe.com/test/subscriptions

#### 3. Supabase Dashboard
- **Table Editor**: Kontrola `user_subscriptions` a `user_usage`
- **Functions Logs**: Kontrola Edge Function logov
- **SQL Editor**: Custom queries pre debugging

### Logging a monitoring

```javascript
// Pridaj logging do kódu pre debugging
console.log('Creating checkout session for user:', userId);
console.log('Price ID:', priceId);
console.log('Metadata:', { user_id: userId });

// V Edge Functions
console.log('Webhook received:', event.type);
console.log('Processing for user:', userId);
```

---

## 📊 Testovacia matica

| Funkcia | Free | Essential | Family | Premium | Testovaná |
|---------|------|-----------|--------|---------|-----------|
| Max dokumentov | 100 | 1,000 | 5,000 | ∞ | ⬜ |
| Max úložisko | 500 MB | 5 GB | 20 GB | ∞ | ⬜ |
| Time Capsules | 1 | 5 | 20 | ∞ | ⬜ |
| Skeny/mesiac | 10 | 100 | 500 | ∞ | ⬜ |
| Rodinní členovia | 1 | 1 | 5 | 10 | ⬜ |
| Offline prístup | ❌ | ✅ | ✅ | ✅ | ⬜ |
| AI funkcie | ❌ | ❌ | ✅ | ✅ | ⬜ |
| Pokročilé vyhľadávanie | ❌ | ✅ | ✅ | ✅ | ⬜ |
| Prioritná podpora | ❌ | ❌ | ❌ | ✅ | ⬜ |

---

## 📝 Testovací checklist

### Pre každý release:
- [ ] Test nového predplatného (všetky plány)
- [ ] Test upgrade plánu
- [ ] Test downgrade plánu
- [ ] Test zrušenia predplatného
- [ ] Test 3D Secure autentifikácie
- [ ] Test zlyhaných platieb
- [ ] Test webhook spracovania
- [ ] Test limitov pre každý plán
- [ ] Test Customer Portal prístupu
- [ ] Test obnovenia predplatného

---

## 🔗 Užitočné odkazy

- [Stripe Testing Documentation](https://stripe.com/docs/testing)
- [Stripe Test Cards Reference](https://stripe.com/docs/testing#cards)
- [Stripe Webhook Events](https://stripe.com/docs/webhooks/stripe-events)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 📞 Kontakt pre podporu

Ak narazíš na problémy s testovaním:
1. Skontroluj túto dokumentáciu
2. Pozri sa do Stripe Dashboard logov
3. Skontroluj Supabase Function logy
4. Použij debug scripty v `/scripts`

---

*Posledná aktualizácia: 31.8.2025*
