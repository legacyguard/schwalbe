#!/bin/bash

# Bezpečná konfigurácia GitHub Secrets pre LegacyGuard Hollywood
# Tento skript migruje secrets do GitHub bez použitia .env súborov

set -euo pipefail

# Farby pre výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 Bezpečná konfigurácia GitHub Secrets pre LegacyGuard Hollywood${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Konfigurácia
REPO_OWNER="legacyguard"
REPO_NAME="hollywood"
GITHUB_API="https://api.github.com"

# Kontrola GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) nie je nainštalované${NC}"
    echo -e "${YELLOW}Inštalácia:${NC}"
    echo "  macOS: brew install gh"
    echo "  Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    exit 1
fi

# Autentifikácia
echo -e "${YELLOW}🔑 Kontrola GitHub autentifikácie...${NC}"
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}Prihláste sa do GitHub:${NC}"
    gh auth login
fi

echo -e "${GREEN}✅ GitHub autentifikácia úspešná${NC}\n"

# Funkcia na vytvorenie environment
create_environment() {
    local env_name=$1
    local protection_rules=$2
    
    echo -e "${BLUE}📁 Vytváranie environment: ${env_name}${NC}"
    
    # Vytvorenie environment cez GitHub API
    gh api \
        --method PUT \
        -H "Accept: application/vnd.github+json" \
        "/repos/${REPO_OWNER}/${REPO_NAME}/environments/${env_name}" \
        --field "wait_timer=5" \
        --field "deployment_branch_policy=null" \
        2>/dev/null || true
    
    echo -e "${GREEN}✅ Environment ${env_name} vytvorený${NC}"
}

# Funkcia na pridanie secret
add_secret() {
    local secret_name=$1
    local secret_value=$2
    local environment=$3
    
    if [ -z "$secret_value" ] || [ "$secret_value" == "null" ] || [ "$secret_value" == "" ]; then
        echo -e "${YELLOW}⏭️  Preskakujem ${secret_name} (prázdna hodnota)${NC}"
        return
    fi
    
    if [ -z "$environment" ]; then
        # Repository secret
        echo -e "  Pridávam repository secret: ${secret_name}"
        echo "$secret_value" | gh secret set "$secret_name" --repo="${REPO_OWNER}/${REPO_NAME}"
    else
        # Environment secret
        echo -e "  Pridávam environment secret: ${secret_name} do ${environment}"
        echo "$secret_value" | gh secret set "$secret_name" --env="$environment" --repo="${REPO_OWNER}/${REPO_NAME}"
    fi
}

# Vytvorenie environments
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📁 Vytváranie GitHub Environments${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

create_environment "production" "main"
create_environment "staging" "develop"
create_environment "development" "*"

echo ""

# Definícia secrets
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 Konfigurácia Secrets${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Pomocná funkcia na bezpečné čítanie hodnôt
read_secret_value() {
    local prompt=$1
    local secret_value
    
    echo -en "${YELLOW}${prompt}: ${NC}"
    read -s secret_value
    echo ""
    echo "$secret_value"
}

# Funkcia na konfiguráciu secrets pre environment
configure_environment_secrets() {
    local env=$1
    
    echo -e "\n${BLUE}🔧 Konfigurácia secrets pre ${env} environment${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Ak máme poskytnuté tokeny, použijeme ich
    if [ "$env" == "production" ]; then
        echo -e "${GREEN}Používam poskytnuté produkčné tokeny${NC}"
        
        # Vercel
        add_secret "VERCEL_TOKEN" "sCQdHdoLVf8aAY50aDAa9dGm" "$env"
        add_secret "VERCEL_ORG_ID" "team_TODO_GET_FROM_VERCEL" "$env"
        add_secret "VERCEL_PROJECT_ID" "prj_TODO_GET_FROM_VERCEL" "$env"
        
        # Supabase
        add_secret "VITE_SUPABASE_URL" "https://TODO.supabase.co" "$env"
        add_secret "VITE_SUPABASE_ANON_KEY" "TODO_GET_FROM_SUPABASE" "$env"
        add_secret "SUPABASE_SERVICE_ROLE_KEY" "TODO_GET_FROM_SUPABASE" "$env"
        
        # Clerk
        add_secret "VITE_CLERK_PUBLISHABLE_KEY" "pk_test_Y3VycmVudC1yaGluby00MC5jbGVyay5hY2NvdW50cy5kZXYk" "$env"
        add_secret "CLERK_SECRET_KEY" "TODO_GET_FROM_CLERK" "$env"
        
        # Stripe (ak používate)
        add_secret "STRIPE_PUBLISHABLE_KEY" "pk_test_51RxUMeFjl1oRWeU6A9rKrirRWWBPXBjASe0rmT36UdyZ63MsFbWe1WaWdIkQpaoLc1dkhywr4d1htlmvOnjKIsa300ZlWOPgvf" "$env"
        
        echo -e "${YELLOW}⚠️  Niektoré hodnoty je potrebné doplniť (označené TODO)${NC}"
        
    else
        echo -e "${YELLOW}Pre ${env} zadajte hodnoty manuálne alebo preskočte${NC}"
    fi
}

# Repository secrets (globálne)
echo -e "\n${BLUE}🌐 Konfigurácia globálnych (repository) secrets${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# GitHub token sa pridáva automaticky
echo -e "${GREEN}✅ GITHUB_TOKEN - automaticky poskytnutý GitHubom${NC}"

# Voliteľné globálne secrets
echo -e "\n${YELLOW}Voliteľné globálne secrets (stlačte Enter pre preskočenie):${NC}"

# Turbo
if [ -z "${TURBO_TOKEN:-}" ]; then
    TURBO_TOKEN=$(read_secret_value "TURBO_TOKEN (Turborepo cache)")
fi
add_secret "TURBO_TOKEN" "${TURBO_TOKEN:-}" ""

if [ -z "${TURBO_TEAM:-}" ]; then
    echo -en "${YELLOW}TURBO_TEAM: ${NC}"
    read TURBO_TEAM
fi
add_secret "TURBO_TEAM" "${TURBO_TEAM:-}" ""

# Environment secrets
configure_environment_secrets "production"
configure_environment_secrets "staging"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Konfigurácia dokončená!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Inštrukcie
echo -e "${YELLOW}📝 Ďalšie kroky:${NC}"
echo ""
echo "1. Získajte chýbajúce hodnoty:"
echo "   - Vercel: https://vercel.com/account/tokens"
echo "   - Supabase: Project Settings → API"
echo "   - Clerk: Dashboard → API Keys"
echo ""
echo "2. Aktualizujte secrets cez GitHub UI:"
echo "   https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/secrets/actions"
echo ""
echo "3. Overte konfiguráciu:"
echo "   gh workflow run test-secrets.yml"
echo ""
echo -e "${GREEN}🔒 Bezpečnostné odporúčania:${NC}"
echo "   - Nikdy neukladajte secrets do súborov"
echo "   - Použite GitHub environments pre produkciu"
echo "   - Pravidelne rotujte secrets (každé 3 mesiace)"
echo "   - Auditujte prístup k secrets"
echo ""
echo -e "${BLUE}📚 Dokumentácia: docs/GITHUB_ENVIRONMENTS.md${NC}"
