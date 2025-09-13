#!/usr/bin/env bash
set -euo pipefail

OUT=./docs/_autodoc_context.txt
mkdir -p docs

# GIT DIFF (staged vs HEAD)
echo "### GIT DIFF (staged vs HEAD)
" > "$OUT"
(git diff --cached --name-status || true) >> "$OUT"

# RECENT COMMITS (last 3)
echo -e "\n\n### RECENT COMMITS (last 3)\n" >> "$OUT"
(git log -3 --pretty=format:'%h %ad %s' --date=short || true) >> "$OUT"

# CHANGED FILES (head)
echo -e "\n\n### CHANGED FILES (head)\n" >> "$OUT"
(git diff --name-only HEAD~1..HEAD 2>/dev/null | sed 's/^/- /' || true) >> "$OUT"

# TOP-LEVEL SRC TREE
echo -e "\n\n### TOP-LEVEL SRC TREE\n" >> "$OUT"
if command -v tree >/dev/null 2>&1; then
  (tree -L 2 src || true) >> "$OUT"
else
  echo "(tree not installed; showing fallback)" >> "$OUT"
  (find src -maxdepth 2 -type d -print 2>/dev/null | sed 's/^/- /' || true) >> "$OUT"
fi

# API ENDPOINT SIGNATURES (grep)
echo -e "\n\n### API ENDPOINT SIGNATURES (grep)\n" >> "$OUT"
(grep -R --line-number -E 'router\.(get|post|put|patch|delete)|app\.(get|post|put|patch|delete)' src 2>/dev/null | head -n 500 || true) >> "$OUT"

# ENV REFERENCES
echo -e "\n\n### ENV REFERENCES\n" >> "$OUT"
(grep -R --line-number -E 'process\.env\.[A-Z_0-9]+' src 2>/dev/null | head -n 200 || true) >> "$OUT"

# NOTE
echo -e "\n\n### NOTE\nPaste this file into Warp AI as context (copy/paste), then use the prompt in docs/feature_specs/README.md.\n" >> "$OUT"

echo "Context saved to: $OUT"