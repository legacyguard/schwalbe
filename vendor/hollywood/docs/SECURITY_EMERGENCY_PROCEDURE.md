# 🚨 KRITICKÁ BEZPEČNOSTNÁ SITUÁCIA - KOMPLETNÝ POSTUP

**Vytvorené:** 28.08.2025  
**Problém:** .env súbor bol commitnutý do Git histórie  
**Závažnosť:** KRITICKÁ - všetky tajné kľúče sú kompromitované

## 📋 OBSAH

1. [Okamžité kroky](#okamžité-kroky)
2. [Analýza kompromitovaných kľúčov](#analýza-kompromitovaných-kľúčov)
3. [Príprava infraštruktúry](#príprava-infraštruktúry)
4. [Rotačné skripty](#rotačné-skripty)
5. [Rotácia po provideroch](#rotácia-po-provideroch)
6. [Čistenie Git histórie](#čistenie-git-histórie)
7. [Automatizácia a monitoring](#automatizácia-a-monitoring)
8. [Harmonogram pravidelnej rotácie](#harmonogram-pravidelnej-rotácie)

---

## OKAMŽITÉ KROKY

### 1️⃣ Zastav všetky deploymenty (HNEĎ!)

```bash
# Zastav Vercel auto-deploy
vercel env pull
vercel project hollywood --build-command="echo 'DEPLOYMENT PAUSED FOR SECURITY INCIDENT'"

# Vypni GitHub Actions
gh workflow disable --all

# Oznámenie (ak máš Slack/Discord)
echo "⚠️ SECURITY: Deployments paused for key rotation" | your-notification-command
```

### 2️⃣ Prihlás sa do nástrojov

```bash
# Vercel
vercel login
vercel link

# GitHub CLI
gh auth login
gh auth status

# Overiť prístupy
echo "✓ Vercel: $(vercel whoami)"
echo "✓ GitHub: $(gh api user -q .login)"
```

### 3️⃣ Zálohuj repozitár

```bash
# Kompletná záloha pred čistením
git clone --mirror https://github.com/legacyguard/hollywood.git ~/hollywood-backup-$(date +%Y%m%d-%H%M%S)
echo "✓ Backup created at ~/hollywood-backup-$(date +%Y%m%d-%H%M%S)"
```

---

## ANALÝZA KOMPROMITOVANÝCH KĽÚČOV

### 🔴 KRITICKÉ (rotuj OKAMŽITE)

| Kľúč | Provider | Dashboard |
|------|----------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | [Settings → API](https://app.supabase.com/project/YOUR_PROJECT/settings/api) |
| `CLERK_SECRET_KEY` | Clerk | [API Keys](https://dashboard.clerk.com/apps/YOUR_APP/instances/YOUR_INSTANCE/api-keys) |
| `CLERK_WEBHOOK_SECRET` | Clerk | [Webhooks](https://dashboard.clerk.com/apps/YOUR_APP/instances/YOUR_INSTANCE/webhooks) |
| `OPENAI_API_KEY` | OpenAI | [API Keys](https://platform.openai.com/api-keys) |
| `GOOGLE_CLIENT_SECRET` | Google | [GCP Console](https://console.cloud.google.com/apis/credentials) |
| `RESEND_API_KEY` | Resend | [API Keys](https://resend.com/api-keys) |
| `STRIPE_SECRET_KEY` | Stripe | [API Keys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Stripe | [Webhooks](https://dashboard.stripe.com/webhooks) |

### 🟢 VEREJNÉ (OK)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `STRIPE_PUBLISHABLE_KEY`

---

## PRÍPRAVA INFRAŠTRUKTÚRY

### Vytvor .env.template

```bash
cat > .env.template << 'EOF'
# ============================================
# LegacyGuard Environment Variables Template
# ============================================
# NEVER commit actual values! Use .env.local
# ============================================

# === PUBLIC KEYS (Safe to expose) ===
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# === CRITICAL SECRETS (Never commit!) ===
# Use ACTIVE/NEXT pattern for rotation

# Supabase
SUPABASE_SERVICE_ROLE_KEY_ACTIVE=
SUPABASE_SERVICE_ROLE_KEY_NEXT=

# Clerk  
CLERK_SECRET_KEY_ACTIVE=
CLERK_SECRET_KEY_NEXT=
CLERK_WEBHOOK_SECRET=

# OpenAI
OPENAI_API_KEY_ACTIVE=
OPENAI_API_KEY_NEXT=

# Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET_ACTIVE=
GOOGLE_CLIENT_SECRET_NEXT=
GOOGLE_REDIRECT_URI=http://localhost:5173/api/auth/callback/google

# Resend
RESEND_API_KEY_ACTIVE=
RESEND_API_KEY_NEXT=

# Stripe
STRIPE_SECRET_KEY_ACTIVE=
STRIPE_SECRET_KEY_NEXT=
STRIPE_WEBHOOK_SECRET=

# Encryption
VITE_MASTER_KEY_SALT=
EOF

echo "✓ Created .env.template"
```

### Vytvor lokálny .env.local (ignorovaný gitom)

```bash
cp .env.template .env.local
echo "✓ Created .env.local - ADD YOUR KEYS HERE"
```

---

## ROTAČNÉ SKRIPTY

### Hlavný rotačný skript

```bash
mkdir -p scripts
cat > scripts/rotate-keys.sh << 'EOF'
#!/bin/bash
set -euo pipefail

# ==================================================
# Key Rotation Manager for LegacyGuard
# ==================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env.local"
PROVIDERS=("SUPABASE" "CLERK" "OPENAI" "GOOGLE" "RESEND" "STRIPE")

# Logging functions
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

# Check prerequisites
check_requirements() {
    command -v vercel >/dev/null 2>&1 || error "vercel CLI not installed"
    command -v gh >/dev/null 2>&1 || error "GitHub CLI not installed"
    [[ -f "$ENV_FILE" ]] || error "$ENV_FILE not found"
    
    # Check auth status
    vercel whoami >/dev/null 2>&1 || error "Not logged into Vercel. Run: vercel login"
    gh auth status >/dev/null 2>&1 || error "Not logged into GitHub. Run: gh auth login"
}

# Phase 1: Upload new key as NEXT
phase1_upload_next() {
    local provider=$1
    local key_suffix=$2
    local new_value=$3
    local key_name="${provider}_${key_suffix}_NEXT"
    
    log "📤 Uploading ${key_name}..."
    
    # Update Vercel
    info "  → Vercel (preview)"
    echo "$new_value" | vercel env add "$key_name" preview --force
    info "  → Vercel (production)"
    echo "$new_value" | vercel env add "$key_name" production --force
    
    # Update GitHub Secrets
    info "  → GitHub Secrets"
    echo "$new_value" | gh secret set "$key_name"
    
    # Update local env
    info "  → Local .env.local"
    if grep -q "^${key_name}=" "$ENV_FILE" 2>/dev/null; then
        sed -i.bak "s|^${key_name}=.*|${key_name}=${new_value}|" "$ENV_FILE"
    else
        echo "${key_name}=${new_value}" >> "$ENV_FILE"
    fi
    
    log "✅ Uploaded ${key_name}"
}

# Phase 2: Switch ACTIVE to NEXT value
phase2_switch_active() {
    local provider=$1
    local key_suffix=$2
    local key_active="${provider}_${key_suffix}_ACTIVE"
    local key_next="${provider}_${key_suffix}_NEXT"
    
    log "🔄 Switching ${key_active} to NEXT value..."
    
    # Get NEXT value from local env
    local next_value=$(grep "^${key_next}=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2-)
    
    if [[ -z "$next_value" ]]; then
        error "NEXT value not found for ${provider}_${key_suffix}"
    fi
    
    # Update ACTIVE everywhere
    info "  → Vercel (preview)"
    echo "$next_value" | vercel env add "$key_active" preview --force
    info "  → Vercel (production)"
    echo "$next_value" | vercel env add "$key_active" production --force
    
    info "  → GitHub Secrets"
    echo "$next_value" | gh secret set "$key_active"
    
    info "  → Local .env.local"
    if grep -q "^${key_active}=" "$ENV_FILE" 2>/dev/null; then
        sed -i.bak "s|^${key_active}=.*|${key_active}=${next_value}|" "$ENV_FILE"
    else
        echo "${key_active}=${next_value}" >> "$ENV_FILE"
    fi
    
    log "✅ Switched ${key_active}"
    
    # Trigger redeploy
    read -p "🚀 Redeploy to Vercel now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel --prod --yes || warn "Deployment failed - manual redeploy needed"
    fi
}

# Phase 3: Cleanup old NEXT keys
phase3_cleanup() {
    local provider=$1
    local key_suffix=$2
    local key_next="${provider}_${key_suffix}_NEXT"
    
    log "🧹 Cleaning up ${key_next}..."
    
    warn "Have you revoked the old key in ${provider} dashboard?"
    read -p "Confirm old key revoked (y/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        warn "Skipping cleanup - revoke old key first"
        return
    fi
    
    # Remove from Vercel
    info "  → Removing from Vercel"
    vercel env rm "$key_next" preview --yes 2>/dev/null || true
    vercel env rm "$key_next" production --yes 2>/dev/null || true
    
    # Remove from GitHub
    info "  → Removing from GitHub"
    gh secret delete "$key_next" 2>/dev/null || true
    
    # Remove from local
    info "  → Removing from local"
    sed -i.bak "/^${key_next}=/d" "$ENV_FILE"
    
    log "✅ Cleaned up ${key_next}"
}

# Interactive menu
show_menu() {
    clear
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}     LegacyGuard Key Rotation Manager${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo
    echo "Select provider and action:"
    echo
    echo "1) Supabase - SERVICE_ROLE_KEY"
    echo "2) Clerk - SECRET_KEY"
    echo "3) Clerk - WEBHOOK_SECRET"
    echo "4) OpenAI - API_KEY"
    echo "5) Google - CLIENT_SECRET"
    echo "6) Resend - API_KEY"
    echo "7) Stripe - SECRET_KEY"
    echo "8) Stripe - WEBHOOK_SECRET"
    echo
    echo "A) Run ALL rotations (interactive)"
    echo "H) Health check all keys"
    echo "Q) Quit"
    echo
    read -p "Choice: " choice
    
    case $choice in
        1) rotate_key "SUPABASE" "SERVICE_ROLE_KEY" ;;
        2) rotate_key "CLERK" "SECRET_KEY" ;;
        3) rotate_key "CLERK" "WEBHOOK_SECRET" ;;
        4) rotate_key "OPENAI" "API_KEY" ;;
        5) rotate_key "GOOGLE" "CLIENT_SECRET" ;;
        6) rotate_key "RESEND" "API_KEY" ;;
        7) rotate_key "STRIPE" "SECRET_KEY" ;;
        8) rotate_key "STRIPE" "WEBHOOK_SECRET" ;;
        A|a) rotate_all ;;
        H|h) health_check ;;
        Q|q) exit 0 ;;
        *) warn "Invalid choice"; sleep 2; show_menu ;;
    esac
}

# Rotate single key workflow
rotate_key() {
    local provider=$1
    local key_suffix=$2
    
    clear
    echo -e "${BLUE}Rotating: ${provider}_${key_suffix}${NC}"
    echo "================================"
    echo
    echo "Select phase:"
    echo "1) Phase 1: Upload NEW key"
    echo "2) Phase 2: Switch ACTIVE to NEW"
    echo "3) Phase 3: Cleanup (after revoking old)"
    echo "4) Full rotation (all phases)"
    echo "B) Back to menu"
    echo
    read -p "Phase: " phase
    
    case $phase in
        1)
            read -s -p "Enter new ${provider} ${key_suffix} value: " new_value
            echo
            phase1_upload_next "$provider" "$key_suffix" "$new_value"
            ;;
        2)
            phase2_switch_active "$provider" "$key_suffix"
            ;;
        3)
            phase3_cleanup "$provider" "$key_suffix"
            ;;
        4)
            read -s -p "Enter new ${provider} ${key_suffix} value: " new_value
            echo
            phase1_upload_next "$provider" "$key_suffix" "$new_value"
            
            read -p "Ready to switch ACTIVE? (y/n): " -n 1 -r
            echo
            [[ $REPLY =~ ^[Yy]$ ]] && phase2_switch_active "$provider" "$key_suffix"
            
            warn "Now revoke the old key in ${provider} dashboard"
            read -p "Press enter when old key is revoked..."
            phase3_cleanup "$provider" "$key_suffix"
            ;;
        B|b)
            show_menu
            ;;
        *)
            warn "Invalid choice"
            sleep 2
            rotate_key "$provider" "$key_suffix"
            ;;
    esac
    
    echo
    read -p "Press enter to continue..."
    show_menu
}

# Rotate all keys
rotate_all() {
    clear
    warn "This will rotate ALL keys. Make sure you have new keys ready!"
    read -p "Continue? (y/n): " -n 1 -r
    echo
    
    [[ ! $REPLY =~ ^[Yy]$ ]] && show_menu
    
    # List of all keys to rotate
    local keys=(
        "SUPABASE:SERVICE_ROLE_KEY"
        "CLERK:SECRET_KEY"
        "CLERK:WEBHOOK_SECRET"
        "OPENAI:API_KEY"
        "GOOGLE:CLIENT_SECRET"
        "RESEND:API_KEY"
        "STRIPE:SECRET_KEY"
        "STRIPE:WEBHOOK_SECRET"
    )
    
    for key in "${keys[@]}"; do
        IFS=':' read -r provider suffix <<< "$key"
        echo
        log "Rotating ${provider}_${suffix}..."
        read -s -p "Enter new value (or press enter to skip): " new_value
        echo
        
        if [[ -n "$new_value" ]]; then
            phase1_upload_next "$provider" "$suffix" "$new_value"
        else
            warn "Skipped ${provider}_${suffix}"
        fi
    done
    
    echo
    log "All NEXT keys uploaded. Ready to switch?"
    read -p "Switch all to ACTIVE? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for key in "${keys[@]}"; do
            IFS=':' read -r provider suffix <<< "$key"
            phase2_switch_active "$provider" "$suffix"
        done
    fi
    
    echo
    warn "Remember to revoke all old keys in provider dashboards!"
    read -p "Press enter to continue..."
    show_menu
}

# Health check
health_check() {
    clear
    log "🏥 Running health checks..."
    echo
    
    # Check OpenAI
    if [[ -n "${OPENAI_API_KEY_ACTIVE:-}" ]]; then
        if curl -s https://api.openai.com/v1/models \
           -H "Authorization: Bearer $OPENAI_API_KEY_ACTIVE" \
           -o /dev/null -w "%{http_code}" | grep -q "200"; then
            echo -e "${GREEN}✅ OpenAI API: OK${NC}"
        else
            echo -e "${RED}❌ OpenAI API: FAILED${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  OpenAI API: Not configured${NC}"
    fi
    
    # Check Clerk
    if [[ -n "${CLERK_SECRET_KEY_ACTIVE:-}" ]]; then
        if curl -s https://api.clerk.com/v1/users?limit=1 \
           -H "Authorization: Bearer $CLERK_SECRET_KEY_ACTIVE" \
           -o /dev/null -w "%{http_code}" | grep -q "200"; then
            echo -e "${GREEN}✅ Clerk API: OK${NC}"
        else
            echo -e "${RED}❌ Clerk API: FAILED${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Clerk API: Not configured${NC}"
    fi
    
    # Check Resend
    if [[ -n "${RESEND_API_KEY_ACTIVE:-}" ]]; then
        if curl -s https://api.resend.com/emails \
           -H "Authorization: Bearer $RESEND_API_KEY_ACTIVE" \
           -o /dev/null -w "%{http_code}" | grep -q "200"; then
            echo -e "${GREEN}✅ Resend API: OK${NC}"
        else
            echo -e "${RED}❌ Resend API: FAILED${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Resend API: Not configured${NC}"
    fi
    
    echo
    read -p "Press enter to continue..."
    show_menu
}

# Main
main() {
    check_requirements
    
    # Load env vars
    if [[ -f "$ENV_FILE" ]]; then
        export $(grep -v '^#' "$ENV_FILE" | xargs)
    fi
    
    show_menu
}

main "$@"
EOF

chmod +x scripts/rotate-keys.sh
echo "✓ Created scripts/rotate-keys.sh"
```

---

## ROTÁCIA PO PROVIDEROCH

### 🔑 SUPABASE

```bash
# 1. Otvor: https://app.supabase.com/project/YOUR_PROJECT/settings/api
# 2. Generate new Service Role Key
# 3. Ulož ako SUPABASE_SERVICE_ROLE_KEY_NEXT
# 4. Switch ACTIVE = NEXT
# 5. Revoke starý key v dashboarde
./scripts/rotate-keys.sh
# Vyber: 1 → 4 (Full rotation)
```

### 🔑 CLERK

```bash
# 1. Otvor: https://dashboard.clerk.com
# 2. Apps → Your App → API Keys → Create new secret key
# 3. Webhooks → Endpoint → Regenerate signing secret
./scripts/rotate-keys.sh
# Vyber: 2 (SECRET_KEY) → 4 (Full rotation)
# Vyber: 3 (WEBHOOK_SECRET) → 4 (Full rotation)
```

### 🔑 OPENAI

```bash
# 1. Otvor: https://platform.openai.com/api-keys
# 2. Create new secret key
./scripts/rotate-keys.sh
# Vyber: 4 → 4 (Full rotation)
```

### 🔑 GOOGLE

```bash
# 1. Otvor: https://console.cloud.google.com/apis/credentials
# 2. OAuth 2.0 Client IDs → Your Client → Create new secret
./scripts/rotate-keys.sh
# Vyber: 5 → 4 (Full rotation)
```

### 🔑 RESEND

```bash
# 1. Otvor: https://resend.com/api-keys
# 2. Create API Key
./scripts/rotate-keys.sh
# Vyber: 6 → 4 (Full rotation)
```

### 🔑 STRIPE

```bash
# 1. Otvor: https://dashboard.stripe.com/apikeys
# 2. Create secret key / Roll key
# 3. Webhooks → Your endpoint → Roll signing secret
./scripts/rotate-keys.sh
# Vyber: 7 (SECRET_KEY) → 4 (Full rotation)
# Vyber: 8 (WEBHOOK_SECRET) → 4 (Full rotation)
```

---

## ČISTENIE GIT HISTÓRIE

### ⚠️ POZOR: Toto prepíše históriu

```bash
# 1. Inštaluj git-filter-repo
pip3 install git-filter-repo
# alebo
brew install git-filter-repo

# 2. Vyčisti históriu
cd ~/Documents/Github/hollywood
git filter-repo \
  --path .env \
  --path-glob "*.tsbuildinfo" \
  --path-glob "*.backup.*" \
  --path-glob "*~" \
  --invert-paths

# 3. Force push (POZOR!)
git push --force-with-lease origin main

# 4. Informuj tím
cat << 'EOF'
⚠️ DÔLEŽITÉ: Git história bola prečistená z bezpečnostných dôvodov.

Všetci členovia tímu musia:
1. Zálohovať lokálne zmeny
2. Zmazať starý klon
3. Naklónovať repo znovu:

rm -rf hollywood
git clone https://github.com/legacyguard/hollywood.git
cd hollywood
cp ~/.env.local.backup .env.local  # restore local env
EOF
```

---

## AUTOMATIZÁCIA A MONITORING

### GitHub Action pre pripomienky

```yaml
# .github/workflows/key-rotation-reminder.yml
name: Key Rotation Reminder

on:
  schedule:
    # Každý 1. deň v mesiaci o 9:00 UTC
    - cron: '0 9 1 * *'
  workflow_dispatch:

jobs:
  rotation-reminder:
    runs-on: ubuntu-latest
    steps:
      - name: Check rotation schedule
        run: |
          echo "🔐 Monthly Key Rotation Reminder"
          echo "================================"
          echo "OpenAI, Stripe: Rotate NOW (30 days)"
          echo "Clerk, Resend: Check age (60 days)"
          echo "Supabase, Google: Check age (90 days)"
          
      - name: Create issue
        uses: actions/github-script@v7
        with:
          script: |
            const title = '🔐 Monthly Key Rotation Due';
            const body = `
            ## Key Rotation Checklist
            
            ### 30-day rotation (CRITICAL)
            - [ ] OpenAI API Key
            - [ ] Stripe Secret Key
            
            ### 60-day rotation (if due)
            - [ ] Clerk Secret Key
            - [ ] Resend API Key
            
            ### 90-day rotation (if due)
            - [ ] Supabase Service Role Key
            - [ ] Google Client Secret
            
            ### Steps:
            1. Run: \`npm run rotate:start\`
            2. Follow interactive prompts
            3. Test all integrations
            4. Close this issue when complete
            `;
            
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: title,
              body: body,
              labels: ['security', 'maintenance']
            });
```

### Package.json skripty

```json
{
  "scripts": {
    "rotate:start": "./scripts/rotate-keys.sh",
    "rotate:check": "./scripts/rotate-keys.sh health",
    "security:audit": "npm audit && ./scripts/check-exposed-keys.sh",
    "security:clean-history": "./scripts/clean-git-history.sh"
  }
}
```

### Warp Workflows (.warp/workflows.yaml)

```yaml
workflows:
  - name: security:rotate-key
    description: "Interaktívna rotácia kľúčov"
    command: "./scripts/rotate-keys.sh"
    
  - name: security:check-keys
    description: "Kontrola platnosti kľúčov"
    command: |
      source .env.local
      curl -s -o /dev/null -w "OpenAI: %{http_code}\n" \
        -H "Authorization: Bearer $OPENAI_API_KEY_ACTIVE" \
        https://api.openai.com/v1/models
      curl -s -o /dev/null -w "Clerk: %{http_code}\n" \
        -H "Authorization: Bearer $CLERK_SECRET_KEY_ACTIVE" \
        https://api.clerk.com/v1/users?limit=1
      curl -s -o /dev/null -w "Resend: %{http_code}\n" \
        -H "Authorization: Bearer $RESEND_API_KEY_ACTIVE" \
        https://api.resend.com/emails
        
  - name: security:emergency-lockdown
    description: "Núdzové zablokovanie - zastav všetky deploye"
    command: |
      echo "🚨 EMERGENCY LOCKDOWN"
      vercel env pull
      vercel project hollywood --build-command="echo 'SECURITY LOCKDOWN'"
      gh workflow disable --all
      echo "✓ Deployments stopped"
      echo "✓ Workflows disabled"
      echo "Now rotate all keys immediately!"
```

---

## HARMONOGRAM PRAVIDELNEJ ROTÁCIE

| Služba | Interval | Automatizácia | Priorita | Dashboard |
|--------|----------|---------------|----------|-----------|
| **OpenAI** | 30 dní | Čiastočná (API) | KRITICKÁ | [platform.openai.com](https://platform.openai.com/api-keys) |
| **Stripe** | 30 dní | Čiastočná | KRITICKÁ | [dashboard.stripe.com](https://dashboard.stripe.com/apikeys) |
| **Clerk** | 60 dní | Manuálna | KRITICKÁ | [dashboard.clerk.com](https://dashboard.clerk.com) |
| **Resend** | 60 dní | API možná | STREDNÁ | [resend.com](https://resend.com/api-keys) |
| **Supabase** | 90 dní | Manuálna | KRITICKÁ | [app.supabase.com](https://app.supabase.com) |
| **Google** | 90 dní | Manuálna | STREDNÁ | [console.cloud.google.com](https://console.cloud.google.com) |

### 📅 Rotačný kalendár

- **1. každého mesiaca**: OpenAI, Stripe
- **1. každého druhého mesiaca**: + Clerk, Resend
- **1. každého tretieho mesiaca**: + Supabase, Google

---

## CHECKLIST PRE OKAMŽITÚ AKCIU

### Fáza 1: Zastavenie škôd (0-15 min)

- [ ] Zastav Vercel deploye
- [ ] Vypni GitHub Actions
- [ ] Zálohuj repo
- [ ] Vytvor .env.template a .env.local

### Fáza 2: Rotácia kľúčov (15-60 min)

- [ ] OpenAI - nový API key → NEXT → ACTIVE
- [ ] Stripe - nový Secret key → NEXT → ACTIVE
- [ ] Clerk - nový Secret + Webhook → NEXT → ACTIVE
- [ ] Resend - nový API key → NEXT → ACTIVE
- [ ] Supabase - nový Service Role → NEXT → ACTIVE
- [ ] Google - nový Client Secret → NEXT → ACTIVE

### Fáza 3: Deploy a test (60-90 min)

- [ ] Sync do Vercel (preview + production)
- [ ] Sync do GitHub Secrets
- [ ] Redeploy aplikácie
- [ ] Test všetkých integrácií
- [ ] Revoke staré kľúče

### Fáza 4: Čistenie (90-120 min)

- [ ] Vyčisti Git históriu
- [ ] Force push
- [ ] Informuj tím
- [ ] Nastav monitoring
- [ ] Vytvor GitHub Action pre pripomienky

---

## V PRÍPADE PROBLÉMOV

### Rollback kľúčov

```bash
# Ak nové kľúče nefungujú, vráť sa na NEXT
./scripts/rotate-keys.sh
# Vyber provider → Phase 2 (ale opačne - NEXT → ACTIVE)
```

### Kontakty na podporu

- **Supabase**: <support@supabase.com>
- **Clerk**: <support@clerk.com> / [Discord](https://discord.com/invite/b5rXHjAg7A)
- **OpenAI**: [help.openai.com](https://help.openai.com)
- **Stripe**: [support.stripe.com](https://support.stripe.com)
- **Resend**: <support@resend.com>
- **Google Cloud**: [cloud.google.com/support](https://cloud.google.com/support)

### Audit log

Po každej rotácii vytvor záznam:

```bash
cat >> SECURITY_AUDIT.log << EOF
$(date): Rotated keys for [PROVIDER]
- Old key ID: [first-4-chars]****
- New key ID: [first-4-chars]****
- Performed by: $(git config user.name)
- Verified working: YES/NO
EOF
```

---

## DÔLEŽITÉ POZNÁMKY

1. **NIKDY** necommituj skutočné hodnoty kľúčov
2. **VŽDY** používaj .env.local pre lokálny vývoj
3. **VŽDY** testuj po rotácii
4. **NIKDY** neloguj hodnoty kľúčov
5. **VŽDY** revokuj staré kľúče po úspešnej rotácii

---

**Posledná aktualizácia:** 28.08.2025
**Status:** ACTIVE SECURITY INCIDENT - ROTATION IN PROGRESS
