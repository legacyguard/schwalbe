#!/bin/bash

# LegacyGuard Mobile Deployment Script
# Automatizovaný deployment pre iOS a Android

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 LegacyGuard Mobile Deployment${NC}"
echo "=================================="
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}⚠️  EAS CLI nie je nainštalované${NC}"
    echo "Inštalujem EAS CLI..."
    npm install -g eas-cli
fi

# Check if logged in to EAS
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nie si prihlásený do EAS${NC}"
    echo "Prihlás sa do svojho Expo účtu:"
    eas login
fi

cd mobile

# Main menu
show_menu() {
    echo "Čo chceš urobiť?"
    echo ""
    echo "📱 ${GREEN}iOS${NC}"
    echo "  1) Build pre iOS"
    echo "  2) Submit do TestFlight"
    echo ""
    echo "🤖 ${GREEN}Android${NC}"
    echo "  3) Build pre Android"  
    echo "  4) Submit do Google Play"
    echo ""
    echo "🚀 ${GREEN}Kompletné${NC}"
    echo "  5) Build pre oba systémy"
    echo "  6) Kompletný deployment (build + submit)"
    echo ""
    echo "🔧 ${GREEN}Konfigurácia${NC}"
    echo "  7) Konfigurovať projekt (prvé spustenie)"
    echo "  8) Skontrolovať/upraviť credentials"
    echo "  9) Vytvoriť produkčné .env"
    echo ""
    echo "0) Ukončiť"
    echo ""
}

# Configure project for first time
configure_project() {
    echo -e "${BLUE}🔧 Konfigurácia projektu...${NC}"
    
    # Configure EAS
    if [ ! -f "eas.json" ]; then
        echo "Vytváram eas.json..."
        eas build:configure
    else
        echo -e "${GREEN}✓ eas.json už existuje${NC}"
    fi
    
    # Check app.json
    echo ""
    echo "Kontrolujem app.json..."
    
    # Extract bundle ID
    BUNDLE_ID=$(grep -o '"bundleIdentifier": "[^"]*' app.json | cut -d'"' -f4)
    PACKAGE_NAME=$(grep -o '"package": "[^"]*' app.json | cut -d'"' -f4)
    
    echo "iOS Bundle ID: ${BUNDLE_ID}"
    echo "Android Package: ${PACKAGE_NAME}"
    echo ""
    
    read -p "Chceš zmeniť Bundle ID/Package name? (y/n): " change
    if [ "$change" = "y" ]; then
        read -p "Zadaj nový identifier (napr. com.tvojafirma.legacyguard): " new_id
        
        # Update app.json
        sed -i '' "s/\"bundleIdentifier\": \"[^\"]*\"/\"bundleIdentifier\": \"$new_id\"/" app.json
        sed -i '' "s/\"package\": \"[^\"]*\"/\"package\": \"$new_id\"/" app.json
        
        echo -e "${GREEN}✓ Identifikátory aktualizované${NC}"
    fi
}

# Create production env file
create_production_env() {
    echo -e "${BLUE}🔐 Vytváram produkčné environment variables...${NC}"
    
    cat > .env.production << 'EOF'
# Production Environment Variables
# IMPORTANT: Vyplň všetky hodnoty pred deploymentom!

# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# API URLs
EXPO_PUBLIC_API_URL=https://api.legacyguard.app

# Sentry (pre error tracking)
SENTRY_DSN=https://your-sentry-dsn

# Revenue Cat (pre in-app purchases)
REVENUECAT_API_KEY=your-key-here
EOF
    
    echo -e "${GREEN}✓ .env.production vytvorený${NC}"
    echo -e "${YELLOW}⚠️  Nezabudni vyplniť všetky hodnoty!${NC}"
    echo ""
    read -p "Chceš otvoriť súbor na editovanie? (y/n): " edit
    if [ "$edit" = "y" ]; then
        ${EDITOR:-nano} .env.production
    fi
}

# Build for iOS
build_ios() {
    echo -e "${BLUE}📱 Building pre iOS...${NC}"
    
    # Check if production env exists
    if [ ! -f ".env.production" ]; then
        echo -e "${RED}✗ .env.production neexistuje${NC}"
        create_production_env
    fi
    
    # Copy production env
    cp .env.production .env.local
    
    # Run build
    eas build --platform ios --profile production
    
    echo -e "${GREEN}✓ iOS build odoslaný${NC}"
    echo "Počkaj na email s linkom na stiahnutie"
}

# Build for Android
build_android() {
    echo -e "${BLUE}🤖 Building pre Android...${NC}"
    
    # Check if production env exists
    if [ ! -f ".env.production" ]; then
        echo -e "${RED}✗ .env.production neexistuje${NC}"
        create_production_env
    fi
    
    # Copy production env
    cp .env.production .env.local
    
    # Run build
    eas build --platform android --profile production
    
    echo -e "${GREEN}✓ Android build odoslaný${NC}"
    echo "Počkaj na email s linkom na stiahnutie"
}

# Submit to TestFlight
submit_ios() {
    echo -e "${BLUE}📱 Submitting do TestFlight...${NC}"
    
    echo "Máš dve možnosti:"
    echo "1) Submit najnovší build"
    echo "2) Submit konkrétny build"
    read -p "Vyber (1-2): " submit_choice
    
    if [ "$submit_choice" = "1" ]; then
        eas submit -p ios --latest
    else
        eas submit -p ios
    fi
    
    echo -e "${GREEN}✓ Aplikácia odoslaná do TestFlight${NC}"
    echo "Teraz:"
    echo "1. Choď na App Store Connect"
    echo "2. Pridaj testerov v TestFlight sekcii"
    echo "3. Pošli im pozvánky"
}

# Submit to Google Play
submit_android() {
    echo -e "${BLUE}🤖 Submitting do Google Play...${NC}"
    
    echo "Máš dve možnosti:"
    echo "1) Submit najnovší build"
    echo "2) Submit konkrétny build"
    read -p "Vyber (1-2): " submit_choice
    
    if [ "$submit_choice" = "1" ]; then
        eas submit -p android --latest
    else
        eas submit -p android
    fi
    
    echo -e "${GREEN}✓ Aplikácia odoslaná do Google Play${NC}"
    echo "Teraz:"
    echo "1. Choď na Google Play Console"
    echo "2. Vytvor Internal Testing release"
    echo "3. Pridaj testerov"
}

# Main loop
while true; do
    show_menu
    read -p "Vyber možnosť (0-9): " choice
    echo ""
    
    case $choice in
        0)
            echo "👋 Dovidenia!"
            exit 0
            ;;
        1)
            build_ios
            ;;
        2)
            submit_ios
            ;;
        3)
            build_android
            ;;
        4)
            submit_android
            ;;
        5)
            echo -e "${BLUE}🚀 Building pre oba systémy...${NC}"
            eas build --platform all --profile production
            ;;
        6)
            echo -e "${BLUE}🚀 Kompletný deployment...${NC}"
            eas build --platform all --profile production --auto-submit
            ;;
        7)
            configure_project
            ;;
        8)
            echo -e "${BLUE}🔑 Správa credentials...${NC}"
            eas credentials
            ;;
        9)
            create_production_env
            ;;
        *)
            echo -e "${RED}Neplatná voľba${NC}"
            ;;
    esac
    
    echo ""
    read -p "Stlač Enter pre pokračovanie..."
    echo ""
done
