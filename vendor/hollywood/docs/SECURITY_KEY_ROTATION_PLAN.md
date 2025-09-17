# 🔴 KRITICKÝ BEZPEČNOSTNÝ INCIDENT - PLÁN ROTÁCIE KĽÚČOV

**Dátum: 28.08.2025**
**Status: URGENT - .env súbor je v Git histórii**

## FÁZA 0: OKAMŽITÉ ZASTAVENIE ŠKÔD (Urob HNEĎ)

### 1. Zastav všetky automatické deploye

```bash
# Vercel - zastav auto-deploy
vercel project hollywood --build-command="echo 'DEPLOYMENT PAUSED FOR SECURITY'"

# GitHub Actions - deaktivuj workflows
gh workflow disable --all
```

### 2. Audit kompromitovaných kľúčov

Skontroluj .env súbor a identifikuj VŠETKY exponované kľúče:

## KOMPROMITOVANÉ SLUŽBY A KĽÚČE

### 1. **Supabase**

- `VITE_SUPABASE_URL` - verejný, OK
- `VITE_SUPABASE_ANON_KEY` - verejný, OK  
- `SUPABASE_SERVICE_ROLE_KEY` - **KRITICKÝ, MUSÍ BYŤ ROTOVANÝ**

### 2. **Clerk**

- `VITE_CLERK_PUBLISHABLE_KEY` - verejný, OK
- `CLERK_SECRET_KEY` - **KRITICKÝ, MUSÍ BYŤ ROTOVANÝ**
- `CLERK_WEBHOOK_SECRET` - **KRITICKÝ, MUSÍ BYŤ ROTOVANÝ**

### 3. **OpenAI**

- `OPENAI_API_KEY` - **KRITICKÝ, MUSÍ BYŤ ROTOVANÝ**

### 4. **Google APIs**

- `GOOGLE_CLIENT_ID` - čiastočne citlivý
- `GOOGLE_CLIENT_SECRET` - **KRITICKÝ, MUSÍ BYŤ ROTOVANÝ**
- `GOOGLE_REDIRECT_URI` - verejný, OK

### 5. **Resend**

- `RESEND_API_KEY` - **KRITICKÝ, MUSÍ BYŤ ROTOVANÝ**

### 6. **Stripe (pripravované)**

- `STRIPE_PUBLISHABLE_KEY` - verejný, OK
- `STRIPE_SECRET_KEY` - **KRITICKÝ, MUSÍ BYŤ ROTOVANÝ**
- `STRIPE_WEBHOOK_SECRET` - **KRITICKÝ, MUSÍ BYŤ ROTOVANÝ**

## FÁZA 1: PRÍPRAVA INFRAŠTRUKTÚRY

### 1.1 Vytvor .env.template

```bash
cat > .env.template << 'EOF'
# === PUBLIC KEYS (Safe to expose) ===
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# === CRITICAL SECRETS (Never commit!) ===
# Supabase
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# OpenAI
OPENAI_API_KEY_ACTIVE=
OPENAI_API_KEY_NEXT=

# Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET_ACTIVE=
GOOGLE_CLIENT_SECRET_NEXT=
GOOGLE_REDIRECT_URI=

# Resend
RESEND_API_KEY_ACTIVE=
RESEND_API_KEY_NEXT=

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY_ACTIVE=
STRIPE_SECRET_KEY_NEXT=
STRIPE_WEBHOOK_SECRET=

# Encryption
VITE_MASTER_KEY_SALT=
EOF
```

### 1.2 Implementuj dvojfázovú rotáciu (ACTIVE/NEXT pattern)

## FÁZA 2: ROTAČNÉ SKRIPTY

### 2.1 Hlavný rotačný skript

```bash
cat > scripts/rotate-keys.sh << 'EOF'
#!/bin/bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROVIDERS=("SUPABASE" "CLERK" "OPENAI" "GOOGLE" "RESEND" "STRIPE")
ENV_FILE=".env.local"

log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Phase 1: Upload new keys as _NEXT
phase1_upload_next() {
    local provider=$1
    local new_value=$2
    local key_name="${provider}_API_KEY_NEXT"
    
    log "Uploading ${key_name}..."
    
    # Vercel
    echo "$new_value" | vercel env add "$key_name" preview --force
    echo "$new_value" | vercel env add "$key_name" production --force
    
    # GitHub Secrets
    echo "$new_value" | gh secret set "$key_name"
    
    # Local env
    if grep -q "^${key_name}=" "$ENV_FILE" 2>/dev/null; then
        sed -i.bak "s|^${key_name}=.*|${key_name}=${new_value}|" "$ENV_FILE"
    else
        echo "${key_name}=${new_value}" >> "$ENV_FILE"
    fi
    
    log "✓ Uploaded ${key_name}"
}

# Phase 2: Switch ACTIVE to NEXT value
phase2_switch_active() {
    local provider=$1
    local key_active="${provider}_API_KEY_ACTIVE"
    local key_next="${provider}_API_KEY_NEXT"
    
    log "Switching ${key_active} to NEXT value..."
    
    # Get NEXT value from local env
    local next_value=$(grep "^${key_next}=" "$ENV_FILE" | cut -d'=' -f2-)
    
    if [[ -z "$next_value" ]]; then
        error "NEXT value not found for ${provider}"
    fi
    
    # Update ACTIVE everywhere
    echo "$next_value" | vercel env add "$key_active" preview --force
    echo "$next_value" | vercel env add "$key_active" production --force
    echo "$next_value" | gh secret set "$key_active"
    
    # Update local
    if grep -q "^${key_active}=" "$ENV_FILE" 2>/dev/null; then
        sed -i.bak "s|^${key_active}=.*|${key_active}=${next_value}|" "$ENV_FILE"
    else
        echo "${key_active}=${next_value}" >> "$ENV_FILE"
    fi
    
    log "✓ Switched ${key_active}"
    
    # Trigger redeploy
    vercel --prod --yes || warn "Manual redeploy needed"
}

# Phase 3: Cleanup old keys
phase3_cleanup() {
    local provider=$1
    local key_next="${provider}_API_KEY_NEXT"
    
    log "Cleaning up ${key_next}..."
    
    # Remove from Vercel
    vercel env rm "$key_next" preview --yes 2>/dev/null || true
    vercel env rm "$key_next" production --yes 2>/dev/null || true
    
    # Remove from GitHub
    gh secret delete "$key_next" 2>/dev/null || true
    
    # Remove from local
    sed -i.bak "/^${key_next}=/d" "$ENV_FILE"
    
    log "✓ Cleaned up ${key_next}"
}

# Main rotation workflow
main() {
    echo -e "${GREEN}=== KEY ROTATION MANAGER ===${NC}"
    
    PS3="Select action: "
    options=("Upload NEW keys" "Switch to NEW keys" "Cleanup OLD keys" "Full rotation" "Exit")
    
    select opt in "${options[@]}"; do
        case $REPLY in
            1) # Upload NEW
                read -p "Provider (SUPABASE/CLERK/OPENAI/GOOGLE/RESEND/STRIPE): " provider
                read -s -p "New key value: " new_value
                echo
                phase1_upload_next "$provider" "$new_value"
                ;;
            2) # Switch ACTIVE
                read -p "Provider: " provider
                phase2_switch_active "$provider"
                ;;
            3) # Cleanup
                read -p "Provider: " provider
                warn "Have you revoked the old key in the provider dashboard? (y/n)"
                read -r confirm
                [[ "$confirm" == "y" ]] && phase3_cleanup "$provider"
                ;;
            4) # Full rotation
                for provider in "${PROVIDERS[@]}"; do
                    log "Rotating ${provider}..."
                    # This would need manual input for each key
                done
                ;;
            5) exit 0 ;;
            *) echo "Invalid option" ;;
        esac
    done
}

main "$@"
EOF

chmod +x scripts/rotate-keys.sh
```

## FÁZA 3: AUTOMATIZÁCIA ROTÁCIE PER PROVIDER

### 3.1 Supabase Rotácia

```bash
cat > scripts/rotate-supabase.sh << 'EOF'
#!/bin/bash
# Supabase vyžaduje manuálnu rotáciu cez dashboard
echo "1. Otvor https://app.supabase.com/project/[project-id]/settings/api"
echo "2. Vygeneruj nový Service Role Key"
echo "3. Vlož nový kľúč:"
read -s new_key
./scripts/rotate-keys.sh upload SUPABASE_SERVICE_ROLE "$new_key"
EOF
```

### 3.2 Clerk Rotácia

```bash
cat > scripts/rotate-clerk.sh << 'EOF'
#!/bin/bash
# Clerk API rotácia
echo "1. Otvor https://dashboard.clerk.com/apps/[app-id]/instances/[instance-id]/api-keys"
echo "2. Vytvor nový Secret Key"
echo "3. Vlož nový kľúč:"
read -s new_key
./scripts/rotate-keys.sh upload CLERK_SECRET "$new_key"
EOF
```

### 3.3 OpenAI Rotácia

```bash
cat > scripts/rotate-openai.sh << 'EOF'
#!/bin/bash
# OpenAI automatická rotácia cez API
OPENAI_ORG_ID="org-xxx"  # nastav tvoje org ID

# Vytvor nový kľúč
response=$(curl -s https://api.openai.com/v1/organizations/$OPENAI_ORG_ID/api-keys \
  -H "Authorization: Bearer $OPENAI_API_KEY_ACTIVE" \
  -H "Content-Type: application/json" \
  -d '{"name": "legacyguard-'$(date +%Y%m%d)'"}')

new_key=$(echo $response | jq -r '.api_key')
./scripts/rotate-keys.sh upload OPENAI "$new_key"
EOF
```

## FÁZA 4: MONITORING A ALERTING

### 4.1 Key Health Check

```bash
cat > scripts/check-key-health.sh << 'EOF'
#!/bin/bash
# Kontroluj platnosť všetkých kľúčov

check_openai() {
    curl -s https://api.openai.com/v1/models \
      -H "Authorization: Bearer $OPENAI_API_KEY_ACTIVE" \
      -o /dev/null -w "%{http_code}"
}

check_clerk() {
    curl -s https://api.clerk.com/v1/users \
      -H "Authorization: Bearer $CLERK_SECRET_KEY" \
      -o /dev/null -w "%{http_code}"
}

check_resend() {
    curl -s https://api.resend.com/emails \
      -H "Authorization: Bearer $RESEND_API_KEY_ACTIVE" \
      -o /dev/null -w "%{http_code}"
}

# Spusti kontroly
[[ $(check_openai) == "200" ]] && echo "✓ OpenAI OK" || echo "✗ OpenAI FAILED"
[[ $(check_clerk) == "200" ]] && echo "✓ Clerk OK" || echo "✗ Clerk FAILED"
[[ $(check_resend) == "200" ]] && echo "✓ Resend OK" || echo "✗ Resend FAILED"
EOF
```

## FÁZA 5: ČISTENIE GIT HISTÓRIE

```bash
# 1. Záloha pred čistením
git clone --mirror https://github.com/legacyguard/hollywood.git hollywood-backup

# 2. Vyčisti históriu
cd hollywood
git filter-repo --path .env --path-glob "*.tsbuildinfo" --path-glob "*.backup.*" --invert-paths

# 3. Force push (POZOR: prepíše históriu!)
git push --force-with-lease origin main

# 4. Informuj tím
echo "Git história bola prečistená. Všetci musia urobiť fresh clone:
git clone https://github.com/legacyguard/hollywood.git hollywood-clean"
```

## FÁZA 6: PRAVIDELNÁ ROTÁCIA (Cron/GitHub Actions)

### 6.1 GitHub Action pre mesačnú rotáciu

```yaml
# .github/workflows/rotate-keys.yml
name: Monthly Key Rotation Reminder

on:
  schedule:
    - cron: '0 9 1 * *'  # 1. deň v mesiaci o 9:00
  workflow_dispatch:

jobs:
  rotate-reminder:
    runs-on: ubuntu-latest
    steps:
      - name: Send rotation reminder
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text": "🔐 Monthly key rotation due! Run: npm run rotate:all"}'
```

### 6.2 Package.json skripty

```json
{
  "scripts": {
    "rotate:check": "./scripts/check-key-health.sh",
    "rotate:openai": "./scripts/rotate-openai.sh",
    "rotate:clerk": "./scripts/rotate-clerk.sh",
    "rotate:all": "./scripts/rotate-keys.sh"
  }
}
```

## HARMONOGRAM ROTÁCIE

| Služba | Frekvencia | Automatizácia | Priorita |
|--------|------------|---------------|----------|
| OpenAI API | 30 dní | Áno - API | KRITICKÁ |
| Clerk Secret | 60 dní | Čiastočná | KRITICKÁ |
| Supabase Service | 90 dní | Manuálna | KRITICKÁ |
| Google OAuth | 90 dní | Manuálna | STREDNÁ |
| Resend API | 60 dní | Áno - API | STREDNÁ |
| Stripe Secret | 30 dní | Čiastočná | KRITICKÁ |

## OKAMŽITÉ AKCIE - CHECKLIST

- [ ] Zastav auto-deploye na Vercel
- [ ] Vypni GitHub Actions workflows  
- [ ] Vygeneruj VŠETKY nové kľúče u providerov
- [ ] Nahraj nové kľúče ako _NEXT verzie
- [ ] Testuj aplikáciu s novými kľúčmi
- [ ] Prepni na nové kľúče (ACTIVE = NEXT)
- [ ] Revokuj staré kľúče u providerov
- [ ] Vyčisti Git históriu od .env
- [ ] Force push čistú históriu
- [ ] Informuj tím o nutnosti fresh clone
- [ ] Nastav monitoring kľúčov
- [ ] Naplánuj pravidelnú rotáciu

## KONTAKTY PRE NÚDZOVÉ SITUÁCIE

- Supabase Support: <support@supabase.com>
- Clerk Support: <support@clerk.com>
- OpenAI: Cez dashboard - no direct support
- Google Cloud: cloud.google.com/support
- Resend: <support@resend.com>
- Stripe: support.stripe.com

---
**DÔLEŽITÉ**: Tento dokument obsahuje citlivé bezpečnostné informácie.
Nikdy ho necommituj s vyplnenými hodnotami kľúčov!
