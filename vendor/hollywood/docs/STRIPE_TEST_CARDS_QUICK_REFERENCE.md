# 💳 Stripe Test Cards - Quick Reference

## 🚀 Najčastejšie používané karty

### ✅ ÚSPEŠNÁ PLATBA
```
Číslo: 4242 4242 4242 4242
CVC: Ľubovoľné 3 číslice (napr. 123)
Dátum: Ľubovoľný budúci (napr. 12/34)
PSČ: Ľubovoľné (napr. 12345)
```

### 🔐 3D SECURE (Vyžaduje potvrdenie)
```
Číslo: 4000 0025 0000 3155
CVC: Ľubovoľné 3 číslice (napr. 123)
Dátum: Ľubovoľný budúci (napr. 12/34)
PSČ: Ľubovoľné (napr. 12345)
```

### ❌ ZAMIETNUTÁ KARTA
```
Číslo: 4000 0000 0000 0002
CVC: Ľubovoľné 3 číslice (napr. 123)
Dátum: Ľubovoľný budúci (napr. 12/34)
PSČ: Ľubovoľné (napr. 12345)
```

---

## 📱 Ako použiť testovacie karty

### Krok 1: Choď na Pricing stránku
```
http://localhost:3000/pricing
```

### Krok 2: Vyber plán
- **Essential** - $9.99/mesiac
- **Family** - $19.99/mesiac  
- **Premium** - $39.99/mesiac

### Krok 3: V Stripe Checkout zadaj
1. Email: tvoj testovací email
2. Číslo karty: `4242 4242 4242 4242`
3. Expirácia: `12/34`
4. CVC: `123`
5. Meno: ľubovoľné
6. PSČ: `12345`

### Krok 4: Klikni "Subscribe"

---

## 🧪 Testovanie rôznych scenárov

### 📗 Úspešný scenár
```
Karta: 4242 4242 4242 4242
Výsledok: ✅ Platba prejde okamžite
```

### 📙 Scenár s autentifikáciou
```
Karta: 4000 0025 0000 3155
Výsledok: 🔐 Zobrazí sa 3D Secure okno → Potvrď → Úspech
```

### 📕 Neúspešný scenár
```
Karta: 4000 0000 0000 0002
Výsledok: ❌ Platba bude zamietnutá
```

### 📘 Nedostatok prostriedkov
```
Karta: 4000 0000 0000 9995
Výsledok: ❌ "Insufficient funds"
```

---

## 🎯 Rýchle tipy

### ✨ Pre úspešné testovanie:
- Vždy používaj budúci dátum expirácie
- CVC môže byť ľubovoľné 3-ciferné číslo
- PSČ môže byť ľubovoľné 5-ciferné číslo
- Email nemusí byť skutočný

### ⚠️ Pamätaj:
- Toto sú **testovacie** karty - nefungujú v produkcii
- Žiadne skutočné peniaze sa neúčtujú
- Môžeš testovať koľkokrát chceš

---

## 🔍 Overenie úspešnej platby

### V aplikácii:
- Zobrazí sa success stránka
- Plán sa zmení v profile
- Limity sa aktualizujú

### V Stripe Dashboard:
```
https://dashboard.stripe.com/test/payments
```
- Uvidíš novú platbu
- Status: Succeeded ✅

### V databáze (Supabase):
```sql
SELECT * FROM user_subscriptions 
WHERE user_id = 'tvoj-user-id';
```

---

## 🆘 Potrebuješ pomoc?

1. **Kompletná dokumentácia**: [`STRIPE_TESTING_GUIDE.md`](./STRIPE_TESTING_GUIDE.md)
2. **Test script**: `node scripts/test-stripe-integration.js`
3. **Stripe Dashboard**: https://dashboard.stripe.com/test/dashboard

---

*Vytlač si túto stránku pre rýchlu referenciu pri testovaní! 🖨️*
