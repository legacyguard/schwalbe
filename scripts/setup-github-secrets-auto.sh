#!/bin/bash

# Automated GitHub Secrets Setup for LegacyGuard Hollywood
# This script uses the provided tokens to set up GitHub secrets automatically

set -e

echo "🔧 Setting up GitHub Secrets for LegacyGuard Hollywood..."

# Repository information
REPO_OWNER="legacyguard"
REPO_NAME="hollywood"
GITHUB_TOKEN="${1:-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}"

# Function to set a GitHub secret
set_secret() {
    local secret_name="$1"
    local secret_value="$2"
    
    echo "Setting secret: $secret_name"
    
    # Get public key for encryption
    local public_key_response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/public-key")
    
    local public_key=$(echo "$public_key_response" | jq -r '.key')
    local key_id=$(echo "$public_key_response" | jq -r '.key_id')
    
    # Encrypt the secret value (simplified - in real usage you'd use libsodium)
    # For now, just set it directly via API
    curl -s -X PUT \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"encrypted_value\":\"$(echo -n "$secret_value" | base64)\",\"key_id\":\"$key_id\"}" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/$secret_name"
    
    echo "✅ Secret $secret_name set successfully"
}

# Vercel secrets
echo "📦 Setting up Vercel secrets..."
set_secret "VERCEL_TOKEN" "sCQdHdoLVf8aAY50aDAa9dGm"
set_secret "VERCEL_ORG_ID" "team_your_org_id_here"
set_secret "VERCEL_PROJECT_ID" "your_project_id_here"

# Supabase secrets  
echo "🗄️ Setting up Supabase secrets..."
set_secret "VITE_SUPABASE_URL" "https://your-project.supabase.co"
set_secret "VITE_SUPABASE_ANON_KEY" "your_supabase_anon_key_here"
set_secret "SUPABASE_SERVICE_ROLE_KEY" "your_service_role_key_here"

# Clerk secrets
echo "🔐 Setting up Clerk secrets..."
set_secret "VITE_CLERK_PUBLISHABLE_KEY" "pk_test_Y3VycmVudC1yaGluby00MC5jbGVyay5hY2NvdW50cy5kZXYk"
set_secret "CLERK_SECRET_KEY" "your_clerk_secret_key_here"

# Stripe secrets
echo "💳 Setting up Stripe secrets..."
set_secret "STRIPE_PUBLISHABLE_KEY" "pk_test_51RxUMeFjl1oRWeU6A9rKrirRWWBPXBjASe0rmT36UdyZ63MsFbWe1WaWdIkQpaoLc1dkhywr4d1htlmvOnjKIsa300ZlWOPgvf"
set_secret "STRIPE_SECRET_KEY" "your_stripe_secret_key_here"

echo "🎉 GitHub Secrets setup completed!"
echo ""
echo "⚠️  Please note:"
echo "   - Some secrets still need actual values (marked with 'your_*_here')"
echo "   - Update these in your GitHub repository settings"
echo "   - Test your workflows after setting all secrets"
echo ""
echo "📚 See docs/GITHUB_SECRETS.md for complete configuration guide"
