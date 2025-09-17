# GitHub Environments Setup Guide

## Bezpečná konfigurácia GitHub Environments

Tento dokument popisuje, ako správne nastaviť GitHub Environments pre bezpečné uloženie secrets bez použitia .env súborov.

## 1. Vytvorenie GitHub Environments

### Production Environment

1. Choďte do **Settings** → **Environments** vo vašom GitHub repozitári
2. Kliknite na **New environment**
3. Pomenujte ho: `production`
4. Nastavte **Environment protection rules**:
   - ✅ Required reviewers (aspoň 1 osoba)
   - ✅ Wait timer: 5 minút
   - ✅ Deployment branches: Len `main` branch

### Staging Environment

1. Vytvorte nový environment: `staging`
2. Nastavte protection rules:
   - ✅ Deployment branches: `develop` a `staging`
   - Optional: Required reviewers

### Development Environment (voliteľné)

1. Vytvorte environment: `development`
2. Bez protection rules
3. Pre feature branches a testovanie

## 2. Konfigurácia Secrets

### Repository Secrets (globálne)

Tieto secrets sú dostupné vo všetkých workflows:

```yaml
# Základné CI/CD secrets
GITHUB_TOKEN         # Automaticky poskytnuté GitHubom
NODE_AUTH_TOKEN      # Pre npm publikovanie (ak potrebné)

# Monitoring a Analytics (voliteľné)
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
```

### Environment Secrets

#### Production Secrets

```yaml
# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Supabase
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Clerk Auth
VITE_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY

# Stripe (ak používate)
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# Cloudflare (voliteľné)
CLOUDFLARE_ZONE_ID
CLOUDFLARE_API_TOKEN

# Monitoring (voliteľné)
SLACK_WEBHOOK
```

#### Staging Secrets

Rovnaké ako production, ale s staging hodnotami.

## 3. Použitie v Workflows

### Správny spôsob referencovania secrets

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Špecifikujte environment
    
    steps:
      - name: Build with secrets
        env:
          # Secrets sú dostupné cez environment
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build
```

### Podmienené použitie secrets

```yaml
- name: Optional service
  if: ${{ secrets.OPTIONAL_TOKEN != '' }}
  env:
    TOKEN: ${{ secrets.OPTIONAL_TOKEN }}
  run: echo "Service is configured"
```

## 4. Bezpečnostné Best Practices

### ✅ DO:

1. **Používajte environments** pre produkčné secrets
2. **Rotujte secrets** pravidelne (každé 3 mesiace)
3. **Používajte najmenšie privilégiá** - len potrebné práva
4. **Auditujte prístup** k secrets pravidelne
5. **Používajte branch protection** pre produkčné branches

### ❌ DON'T:

1. **Nikdy necommitujte secrets** do repozitára
2. **Nepoužívajte .env súbory** v CI/CD
3. **Nezdieľajte secrets** medzi projektami
4. **Nelogujte secrets** vo workflow výstupoch
5. **Nepoužívajte hardcoded hodnoty** v kóde

## 5. Migrácia z .env súborov

### Krok 1: Identifikujte všetky environment variables

```bash
# Nájdite všetky .env súbory
find . -name ".env*" -type f

# Extrahujte všetky premenné
grep -h "^[A-Z]" .env* | cut -d'=' -f1 | sort -u
```

### Krok 2: Kategorizujte secrets

- **Build-time secrets**: Potrebné počas buildu (VITE_*)
- **Runtime secrets**: Potrebné počas behu (SERVER_*)
- **CI/CD secrets**: Potrebné pre deployment (VERCEL_*)

### Krok 3: Pridajte do GitHub

Použite priložený skript alebo manuálne cez GitHub UI.

## 6. Verifikácia

### Test workflow

```yaml
name: Test Secrets
on: workflow_dispatch

jobs:
  test:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Verify secrets
        run: |
          echo "Testing secret availability..."
          [ -n "${{ secrets.VITE_SUPABASE_URL }}" ] && echo "✅ Supabase URL"
          [ -n "${{ secrets.VITE_CLERK_PUBLISHABLE_KEY }}" ] && echo "✅ Clerk Key"
          [ -n "${{ secrets.VERCEL_TOKEN }}" ] && echo "✅ Vercel Token"
```

## 7. Troubleshooting

### Secret nie je dostupný

1. Skontrolujte, či je secret v správnom environment
2. Overte, že workflow špecifikuje `environment: name`
3. Skontrolujte branch protection rules

### Build zlyhá kvôli chýbajúcim variables

1. Pridajte všetky VITE_* premenné do secrets
2. Overte, že sú správne referencované v workflow
3. Skontrolujte typo v názvoch

### Permission denied

1. Overte GITHUB_TOKEN permissions
2. Skontrolujte environment protection rules
3. Overte, že máte správne práva v repozitári

## 8. Automatizácia

Použite priložený skript `setup-github-secrets-secure.sh` pre automatickú konfiguráciu.
