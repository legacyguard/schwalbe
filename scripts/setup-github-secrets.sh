#!/bin/bash

# Script na bezpečné nastavenie GitHub Secrets pre Vercel deployment
# Tento script používa GitHub CLI (gh) na nastavenie secrets

set -e

echo "🔐 Nastavenie GitHub Secrets pre Vercel deployment"
echo "=================================================="
echo ""

# Kontrola či je nainštalovaný GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) nie je nainštalovaný."
    echo "Prosím nainštalujte ho pomocou: brew install gh"
    exit 1
fi

# Kontrola či je užívateľ prihlásený do GitHub CLI
if ! gh auth status &> /dev/null; then
    echo "❌ Nie ste prihlásený do GitHub CLI."
    echo "Prosím prihláste sa pomocou: gh auth login"
    exit 1
fi

# Získanie informácií o repozitári
REPO_OWNER=$(gh repo view --json owner -q '.owner.login')
REPO_NAME=$(gh repo view --json name -q '.name')

echo "📦 Repozitár: $REPO_OWNER/$REPO_NAME"
echo ""

# Vercel hodnoty z .vercel/project.json
VERCEL_ORG_ID="team_pkFaK5rvMWyVGarA11B68SKK"
VERCEL_PROJECT_ID="prj_yRuLLenAfpMIj9cPxB3jDfFZ6X7R"

echo "🔍 Získané Vercel hodnoty:"
echo "   VERCEL_ORG_ID: $VERCEL_ORG_ID"
echo "   VERCEL_PROJECT_ID: $VERCEL_PROJECT_ID"
echo ""

# Získanie Vercel tokenu
echo "📝 Pre získanie Vercel tokenu:"
echo "   1. Navštívte: https://vercel.com/account/tokens"
echo "   2. Kliknite na 'Create Token'"
echo "   3. Pomenujte ho 'GitHub Actions' alebo podobne"
echo "   4. Skopírujte vygenerovaný token"
echo ""
read -sp "🔑 Vložte váš Vercel token (nebude zobrazený): " VERCEL_TOKEN
echo ""
echo ""

# Validácia tokenu
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Token nemôže byť prázdny!"
    exit 1
fi

# Potvrdenie pred nastavením
echo "⚠️  Chystáte sa nastaviť nasledujúce GitHub Secrets:"
echo "   - VERCEL_TOKEN"
echo "   - VERCEL_ORG_ID"
echo "   - VERCEL_PROJECT_ID"
echo ""
read -p "Pokračovať? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Zrušené užívateľom"
    exit 1
fi

# Nastavenie GitHub Secrets
echo ""
echo "🚀 Nastavujem GitHub Secrets..."

# VERCEL_TOKEN
echo -n "   Setting VERCEL_TOKEN... "
echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN --repo="$REPO_OWNER/$REPO_NAME"
echo "✅"

# VERCEL_ORG_ID
echo -n "   Setting VERCEL_ORG_ID... "
echo "$VERCEL_ORG_ID" | gh secret set VERCEL_ORG_ID --repo="$REPO_OWNER/$REPO_NAME"
echo "✅"

# VERCEL_PROJECT_ID
echo -n "   Setting VERCEL_PROJECT_ID... "
echo "$VERCEL_PROJECT_ID" | gh secret set VERCEL_PROJECT_ID --repo="$REPO_OWNER/$REPO_NAME"
echo "✅"

echo ""
echo "✅ GitHub Secrets boli úspešne nastavené!"
echo ""
echo "📌 Môžete ich skontrolovať na:"
echo "   https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
echo ""
echo "🎉 Hotovo! Vaše GitHub Actions workflows sú teraz pripravené na deployment."
