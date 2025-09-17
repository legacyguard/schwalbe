#!/bin/bash

# Script to remove console statements from TypeScript/JavaScript files
# Keeps console statements in test files and specific configuration files

echo "🧹 Starting console statement removal..."

# Count before
BEFORE_COUNT=$(grep -r "console\." --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ | grep -E "console\.(log|error|warn|debug|info)" | wc -l | tr -d ' ')
echo "Found $BEFORE_COUNT console statements before cleanup"

# Files to exclude from console removal (e.g., error handlers, debugging utilities)
EXCLUDE_PATTERNS=(
  "*/test/*"
  "*/tests/*"
  "*.test.*"
  "*.spec.*"
  "*/lib/debug*"
  "*/lib/logger*"
)

# Build exclude string for find command
EXCLUDE_STRING=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  EXCLUDE_STRING="$EXCLUDE_STRING -not -path '$pattern'"
done

# Remove console.log statements
echo "Removing console.log statements..."
find src/ \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -type f | while read -r file; do
  # Skip if file matches exclude patterns
  skip=false
  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ "$file" == *$pattern* ]]; then
      skip=true
      break
    fi
  done
  
  if [ "$skip" = false ]; then
    # Remove standalone console.log statements (full line)
    sed -i '' '/^[[:space:]]*console\.log(/d' "$file"
    
    # Remove console.error, console.warn, console.debug, console.info statements
    # But keep console.error in catch blocks for now (we'll handle them separately)
    sed -i '' '/^[[:space:]]*console\.warn(/d' "$file"
    sed -i '' '/^[[:space:]]*console\.debug(/d' "$file"
    sed -i '' '/^[[:space:]]*console\.info(/d' "$file"
    
    # Remove inline console statements (e.g., in conditionals)
    sed -i '' 's/console\.log([^;]*);*//g' "$file"
    sed -i '' 's/console\.warn([^;]*);*//g' "$file"
    sed -i '' 's/console\.debug([^;]*);*//g' "$file"
    sed -i '' 's/console\.info([^;]*);*//g' "$file"
  fi
done

# Handle console.error more carefully - replace with proper error handling where needed
echo "Processing console.error statements..."
find src/ \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -type f | while read -r file; do
  skip=false
  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ "$file" == *$pattern* ]]; then
      skip=true
      break
    fi
  done
  
  if [ "$skip" = false ]; then
    # In catch blocks, comment out console.error instead of removing
    # This preserves error handling structure
    sed -i '' 's/console\.error(/\/\/ console\.error(/g' "$file"
  fi
done

# Count after
AFTER_COUNT=$(grep -r "console\." --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ | grep -E "console\.(log|error|warn|debug|info)" | wc -l | tr -d ' ')
echo "✅ Removed $((BEFORE_COUNT - AFTER_COUNT)) console statements"
echo "📊 Remaining: $AFTER_COUNT console statements"

# Show remaining console statements (if any)
if [ "$AFTER_COUNT" -gt 0 ]; then
  echo ""
  echo "⚠️  Remaining console statements (may be in test files or intentionally kept):"
  grep -r "console\." --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ | grep -E "console\.(log|error|warn|debug|info)" | head -10
  echo "..."
fi

echo ""
echo "🎉 Console cleanup complete!"
echo "💡 Tip: Review the changes with 'git diff' before committing"
