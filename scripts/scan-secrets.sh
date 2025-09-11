#!/usr/bin/env bash
set -euo pipefail

# Simple repo secret scan (lightweight alternative to gitleaks). Reads tracked files only.
# Exits non‑zero if suspicious patterns are found.

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

MAPFILE -t FILES < <(git ls-files | grep -Ev '^(node_modules/|.turbo/|.next/|dist/|build/|.git/|.spec-kit/|spec-kit/.*/(dist|build|generated|out)/)')

if [ ${#FILES[@]} -eq 0 ]; then
  echo "No tracked files to scan."
  exit 0
fi

PATTERNS=(
  'sk_test_[0-9A-Za-z]{20,}'
  'sk_live_[0-9A-Za-z]{20,}'
  'whsec_[0-9A-Za-z]{20,}'
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'
  'AIza[0-9A-Za-z\-_]{20,}'
  'ghp_[0-9A-Za-z]{20,}'
  'xox[baprs]-[0-9A-Za-z\-]{10,}'
  '\bAWS_SECRET_ACCESS_KEY\b|\baws_secret_access_key\b'
  '\bSERVICE_ROLE\b'
  '\bRESEND_API_KEY\b'
  '\bCLERK_SECRET_KEY\b'
  '\bSUPABASE_ANON_KEY\b'
  '\bGOOGLE_TRANSLATE_API_KEY\b'
)

FOUND=0
for p in "${PATTERNS[@]}"; do
  if grep -RInE -- ${p} "${FILES[@]}" >/tmp/secret_hits.txt 2>/dev/null; then
    echo "Potential secrets found for pattern: ${p}"
    cat /tmp/secret_hits.txt
    FOUND=1
  fi
done

if [ "$FOUND" -ne 0 ]; then
  echo "\n❌ Secret scan found potential issues. Please rotate/remove before merging."
  exit 1
fi

decho "✅ Secret scan passed (no matches)."
