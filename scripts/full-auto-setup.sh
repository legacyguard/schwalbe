#!/bin/bash

# Plne automatizovaný setup GitHub Secrets
set -e

echo "🤖 Plne automatizované nastavenie GitHub Secrets"
echo "================================================"
echo ""

# Hodnoty z projektu
VERCEL_ORG_ID="team_pkFaK5rvMWyVGarA11B68SKK"
VERCEL_PROJECT_ID="prj_yRuLLenAfpMIj9cPxB3jDfFZ6X7R"

# Pokúsime sa získať Vercel token z rôznych miest
echo "🔍 Hľadám existujúci Vercel token..."

# Možnosť 1: Z environment variable
if [ ! -z "$VERCEL_TOKEN" ]; then
    echo "✅ Našiel som VERCEL_TOKEN v environment"
    TOKEN="$VERCEL_TOKEN"
else
    # Možnosť 2: Vytvoríme nový pomocou Vercel CLI
    echo "📝 Vytváram nový Vercel token..."
    
    # Otvoríme prehliadač na vytvorenie tokenu
    echo ""
    echo "🌐 Otváram Vercel dashboard..."
    echo "   Prosím vytvorte token s názvom 'GitHub Actions'"
    echo ""
    
    # Otvoríme URL v prehliadači
    if command -v open &> /dev/null; then
        open "https://vercel.com/account/tokens"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://vercel.com/account/tokens"
    else
        echo "👉 Otvorte manuálne: https://vercel.com/account/tokens"
    fi
    
    echo ""
    echo "📋 Inštrukcie:"
    echo "1. Kliknite 'Create Token'"
    echo "2. Nazvite ho 'GitHub Actions'" 
    echo "3. Kliknite 'Create'"
    echo "4. Skopírujte token"
    echo ""
    
    read -sp "🔑 Vložte token sem (nebude zobrazený): " TOKEN
    echo ""
    echo ""
fi

if [ -z "$TOKEN" ]; then
    echo "❌ Token je povinný!"
    exit 1
fi

echo "✅ Mám všetky potrebné hodnoty"
echo ""

# Nastavenie GitHub Secrets
echo "🚀 Nastavujem GitHub Secrets..."
echo ""

# Použijeme GitHub CLI
echo "$TOKEN" | gh secret set VERCEL_TOKEN && echo "✅ VERCEL_TOKEN nastavený"
echo "$VERCEL_ORG_ID" | gh secret set VERCEL_ORG_ID && echo "✅ VERCEL_ORG_ID nastavený"
echo "$VERCEL_PROJECT_ID" | gh secret set VERCEL_PROJECT_ID && echo "✅ VERCEL_PROJECT_ID nastavený"

echo ""
echo "🎉 Úspešne dokončené!"
echo ""
echo "📌 GitHub Secrets boli nastavené pre repozitár"
echo "   Môžete ich skontrolovať na GitHub.com v Settings > Secrets"
echo ""
echo "🚀 Ďalšie kroky:"
echo "   1. git add ."
echo "   2. git commit -m 'feat: Setup Vercel deployment'"
echo "   3. git push origin main"
echo ""
echo "   Deployment sa spustí automaticky po push!"
