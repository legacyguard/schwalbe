#!/bin/bash

# LegacyGuard Mobile Testing Script
# Tento skript automatizuje testovanie mobilnej aplikácie

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 LegacyGuard Mobile Testing Script"
echo "====================================="
echo ""

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Nie si v správnom adresári. Spusti skript z root adresára projektu."
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Krok 1: Inštalujem závislosti..."
npm install --legacy-peer-deps
print_success "Závislosti nainštalované"
echo ""

# Step 2: Check for iOS Simulator
echo "📱 Krok 2: Kontrolujem iOS Simulator..."
if command -v xcrun &> /dev/null; then
    print_success "Xcode je nainštalovaný"
    
    # List available simulators
    echo "Dostupné iOS simulátory:"
    xcrun simctl list devices available | grep -E "iPhone|iPad" | head -5
else
    print_warning "Xcode nie je nainštalovaný. iOS testovanie nebude dostupné."
fi
echo ""

# Step 3: Start Metro bundler in background
echo "🔧 Krok 3: Štartujem Metro bundler..."
cd mobile

# Kill any existing Metro processes
pkill -f "metro" || true
pkill -f "expo start" || true

# Create a log file for Metro
METRO_LOG="/tmp/metro-bundler.log"

# Start Metro in background
npx expo start --clear > "$METRO_LOG" 2>&1 &
METRO_PID=$!

print_success "Metro bundler beží (PID: $METRO_PID)"
echo "Log súbor: $METRO_LOG"
echo ""

# Wait for Metro to start
echo "⏳ Čakám na štart Metro bundlera..."
sleep 5

# Step 4: Provide testing options
echo "📋 Možnosti testovania:"
echo "======================"
echo ""
echo "1️⃣  iOS Simulator (vyžaduje Mac s Xcode)"
echo "   Stlač 'i' v Metro bundleri"
echo ""
echo "2️⃣  Android Emulator (vyžaduje Android Studio)"
echo "   Stlač 'a' v Metro bundleri"
echo ""
echo "3️⃣  Expo Go na fyzickom zariadení"
echo "   - Nainštaluj 'Expo Go' z App Store/Google Play"
echo "   - Naskenuj QR kód z terminálu"
echo ""
echo "4️⃣  Web browser (pre rýchle testovanie)"
echo "   Stlač 'w' v Metro bundleri"
echo ""

# Step 5: Interactive menu
echo "Čo chceš spraviť?"
echo "1) Otvoriť iOS Simulator"
echo "2) Otvoriť Android Emulator"
echo "3) Zobraziť QR kód pre Expo Go"
echo "4) Otvoriť v prehliadači"
echo "5) Ukončiť"
echo ""
read -p "Vyber možnosť (1-5): " choice

case $choice in
    1)
        echo "📱 Otváram iOS Simulator..."
        npx expo run:ios
        ;;
    2)
        echo "🤖 Otváram Android Emulator..."
        npx expo run:android
        ;;
    3)
        echo "📷 QR kód sa zobrazí v termináli"
        echo "Naskenuj ho pomocou Expo Go aplikácie"
        tail -f "$METRO_LOG"
        ;;
    4)
        echo "🌐 Otváram v prehliadači..."
        npx expo start --web
        ;;
    5)
        echo "👋 Ukončujem..."
        kill $METRO_PID 2>/dev/null || true
        exit 0
        ;;
    *)
        print_error "Neplatná voľba"
        kill $METRO_PID 2>/dev/null || true
        exit 1
        ;;
esac

# Cleanup on exit
trap "kill $METRO_PID 2>/dev/null || true" EXIT

# Keep script running
echo ""
echo "Metro bundler beží. Stlač Ctrl+C pre ukončenie."
wait $METRO_PID
