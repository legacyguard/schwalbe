# 📱 LegacyGuard Mobile - Kompletný návod na testovanie a publikovanie

## 🎯 Prehľad procesu

Tento návod ťa prevedie celým procesom od testovania až po publikovanie aplikácie v App Store a Google Play.

## 📋 Obsah

1. [Testovanie lokálne](#1-testovanie-lokálne)
2. [Príprava na produkciu](#2-príprava-na-produkciu)
3. [Apple Developer Account](#3-apple-developer-account)
4. [Google Play Developer Account](#4-google-play-developer-account)
5. [Produkčné buildy](#5-produkčné-buildy)
6. [Testovanie na zariadeniach](#6-testovanie-na-zariadeniach)
7. [Publikovanie](#7-publikovanie)

---

## 1. Testovanie lokálne

### 🚀 Rýchly štart

```bash
# Spusti testovací skript
cd /Users/luborfedak/Documents/Github/hollywood
./scripts/test-mobile.sh
```

### 📱 Možnosti testovania

#### A) Expo Go (Najjednoduchšie)
1. Nainštaluj **Expo Go** na svoj telefón:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Spusti aplikáciu:
   ```bash
   cd mobile
   npx expo start
   ```

3. Naskenuj QR kód z terminálu

#### B) iOS Simulator (Mac only)
```bash
cd mobile
npx expo run:ios
```

#### C) Android Emulator
1. Nainštaluj [Android Studio](https://developer.android.com/studio)
2. Vytvor virtual device (AVD)
3. Spusti:
   ```bash
   cd mobile
   npx expo run:android
   ```

### ✅ Čo testovať

- [ ] **Prihlásenie/Registrácia** - funguje Clerk autentifikácia?
- [ ] **Dark mode** - prepínanie medzi svetlým/tmavým režimom
- [ ] **Navigácia** - všetky obrazovky sú dostupné
- [ ] **Skenovanie dokumentov** - kamera funguje správne
- [ ] **Offline režim** - aplikácia funguje bez internetu
- [ ] **Responzívny dizajn** - vyzerá dobre na rôznych veľkostiach

---

## 2. Príprava na produkciu

### 📦 Konfigurácia aplikácie

Uprav `mobile/app.json`:

```json
{
  "expo": {
    "name": "LegacyGuard",
    "slug": "legacyguard",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1e40af"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.legacyguard.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "LegacyGuard potrebuje prístup ku kamere na skenovanie dokumentov.",
        "NSPhotoLibraryUsageDescription": "LegacyGuard potrebuje prístup k fotogalérii na výber dokumentov."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1e40af"
      },
      "package": "com.legacyguard.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### 🎨 Vytvorenie ikon a splash screen

```bash
# Nainštaluj nástroj na generovanie ikon
npm install -g sharp-cli

# Vytvor ikony (potrebuješ 1024x1024 PNG)
# Ulož originál ako mobile/assets/icon-original.png
```

Vytvorím skript na automatické generovanie:

```bash
#!/bin/bash
# scripts/generate-assets.sh

# Generuj ikony pre iOS a Android
npx expo-optimize
```

---

## 3. Apple Developer Account

### 💰 Vytvorenie účtu ($99/rok)

1. Choď na [developer.apple.com](https://developer.apple.com)
2. Klikni na **Account** → **Enroll**
3. Vyber **Individual** (pre jednotlivca) alebo **Organization** (pre firmu)
4. Zaplať $99 ročný poplatok

### 🔐 Nastavenie v Expo

```bash
# Prihlás sa do EAS
npx eas login

# Nastav projekt
cd mobile
npx eas build:configure
```

### 📝 App Store Connect

1. Prihlás sa na [App Store Connect](https://appstoreconnect.apple.com)
2. Klikni **My Apps** → **+** → **New App**
3. Vyplň:
   - **Platform**: iOS
   - **Name**: LegacyGuard
   - **Primary Language**: Slovak
   - **Bundle ID**: com.legacyguard.app
   - **SKU**: LEGACYGUARD001

---

## 4. Google Play Developer Account

### 💰 Vytvorenie účtu ($25 jednorazovo)

1. Choď na [Play Console](https://play.google.com/console)
2. Zaplať $25 registračný poplatok
3. Vyplň informácie o vývojárovi

### 📱 Vytvorenie aplikácie

1. V Play Console klikni **Create app**
2. Vyplň:
   - **App name**: LegacyGuard
   - **Default language**: Slovak
   - **App or game**: App
   - **Free or paid**: Free

---

## 5. Produkčné buildy

### 🏗️ EAS Build Setup

```bash
# Nainštaluj EAS CLI ak nemáš
npm install -g eas-cli

# Prihlás sa
eas login

# Konfiguruj build
cd mobile
eas build:configure
```

### 📱 iOS Build

```bash
# Vytvor produkčný build pre iOS
eas build --platform ios --profile production

# EAS automaticky:
# - Vytvorí certifikáty
# - Vytvorí provisioning profile
# - Podpíše aplikáciu
# - Vygeneruje .ipa súbor
```

### 🤖 Android Build

```bash
# Vytvor produkčný build pre Android
eas build --platform android --profile production

# EAS automaticky:
# - Vytvorí keystore
# - Podpíše aplikáciu
# - Vygeneruje .aab súbor
```

### ⏱️ Čakanie na build

Buildy trvajú približne 15-30 minút. Dostaneš email keď budú hotové.

---

## 6. Testovanie na zariadeniach

### 🍎 TestFlight (iOS)

1. Po dokončení iOS buildu:
   ```bash
   # Nahraj do TestFlight
   eas submit -p ios --latest
   ```

2. V App Store Connect:
   - Choď do **TestFlight** tabu
   - Pridaj interných testerov (max 100)
   - Pošli pozvánky

3. Testeri:
   - Nainštalujú TestFlight z App Store
   - Prijmú pozvánku
   - Nainštalujú aplikáciu

### 🤖 Internal Testing (Android)

1. Po dokončení Android buildu:
   ```bash
   # Nahraj do Google Play
   eas submit -p android --latest
   ```

2. V Play Console:
   - Choď do **Internal testing**
   - Vytvor release
   - Pridaj testerov (max 100)
   - Pošli link na testovanie

---

## 7. Publikovanie

### 📝 Príprava metadát

#### Pre oba obchody potrebuješ:

1. **Screenshoty** (min. 2-6):
   - iPhone 6.7" (1290 × 2796)
   - iPhone 5.5" (1242 × 2208)
   - iPad 12.9" (2048 × 2732)
   - Android Phone (1080 × 1920)
   - Android Tablet (1200 × 1920)

2. **Texty**:
   ```
   Krátky popis (80 znakov):
   "Ochráňte digitálny odkaz vašej rodiny"
   
   Dlhý popis (4000 znakov):
   "LegacyGuard je vaším digitálnym trezorom pre všetky 
   dôležité dokumenty a spomienky vašej rodiny..."
   ```

3. **Kategória**: Finance / Productivity
4. **Vekové hodnotenie**: 4+
5. **Privacy Policy URL**: https://legacyguard.app/privacy
6. **Terms of Service URL**: https://legacyguard.app/terms

### 🍎 App Store Submission

1. V App Store Connect:
   - Vyplň všetky metadata
   - Nahraj screenshoty
   - Vyber build z TestFlight
   - **Submit for Review**

2. Review proces:
   - Trvá 24-48 hodín
   - Môžu požiadať o dodatočné info
   - Po schválení → automaticky publikované

### 🤖 Google Play Submission

1. V Play Console:
   - Vyplň store listing
   - Nahraj screenshoty
   - Vyplň content rating questionnaire
   - Nastav pricing & distribution
   - **Submit for Review**

2. Review proces:
   - Trvá 2-3 hodiny
   - Menej prísny ako Apple
   - Po schválení → automaticky publikované

---

## 🚀 Automatizačný skript

Vytvoril som ti kompletný skript na deployment:

```bash
#!/bin/bash
# scripts/deploy-mobile.sh

echo "🚀 LegacyGuard Mobile Deployment"
echo "================================"
echo ""
echo "Čo chceš urobiť?"
echo "1) Build pre iOS"
echo "2) Build pre Android"
echo "3) Build pre oba"
echo "4) Submit iOS do TestFlight"
echo "5) Submit Android do Internal Testing"
echo "6) Kompletný deployment (build + submit)"

read -p "Vyber možnosť (1-6): " choice

case $choice in
    1)
        eas build --platform ios --profile production
        ;;
    2)
        eas build --platform android --profile production
        ;;
    3)
        eas build --platform all --profile production
        ;;
    4)
        eas submit -p ios --latest
        ;;
    5)
        eas submit -p android --latest
        ;;
    6)
        eas build --platform all --profile production --auto-submit
        ;;
esac
```

---

## 📊 Monitoring po publikovaní

### Nástroje na sledovanie

1. **App Store Connect**:
   - Sales and Trends
   - App Analytics
   - Crash Reports

2. **Google Play Console**:
   - Statistics
   - Android Vitals
   - Crash Reports

3. **Externé nástroje**:
   - Firebase Analytics
   - Sentry (error tracking)
   - RevenueCat (pre in-app purchases)

---

## 🆘 Časté problémy a riešenia

### Problem: "Bundle identifier already exists"
**Riešenie**: Zmeň bundle ID v app.json na unikátny

### Problem: "iOS build fails - missing provisioning profile"
**Riešenie**: Nechaj EAS vytvoriť automaticky: `eas credentials`

### Problem: "Android build fails - keystore issues"
**Riešenie**: Vymaž existujúci keystore: `eas credentials` → Reset

### Problem: "App rejected by Apple"
**Najčastejšie dôvody**:
- Chýbajúca privacy policy
- Nedostatočný popis funkcií
- Crashes pri review
- Nedodržanie Human Interface Guidelines

---

## 📞 Podpora

Ak máš problémy:

1. **Expo Discord**: https://chat.expo.dev
2. **Stack Overflow**: Tag `expo`
3. **GitHub Issues**: https://github.com/expo/expo

---

## ✅ Checklist pred publikovaním

- [ ] Všetky funkcie otestované
- [ ] Dark mode funguje
- [ ] Žiadne crashe
- [ ] Privacy policy vytvorená
- [ ] Terms of service vytvorené
- [ ] Screenshoty pripravené
- [ ] Popisy v slovenčine/angličtine
- [ ] Ikony vo vysokom rozlíšení
- [ ] Bundle ID/Package name finálne
- [ ] Verzia nastavená (1.0.0)
- [ ] Environment variables pre produkciu
- [ ] Analytics nastavené
- [ ] Error reporting nastavené

---

Máš všetko čo potrebuješ! 🎉
