#!/bin/bash

# Fix all useDocumentFilter imports
echo "Fixing useDocumentFilter imports..."

# Find all files that import useDocumentFilter from DocumentFilterContext
grep -r "from '@/contexts/DocumentFilterContext'" src/ --include="*.tsx" --include="*.ts" | cut -d: -f1 | sort | uniq | while read file; do
  echo "Fixing: $file"
  # Replace the import path
  sed -i '' "s|from '@/contexts/DocumentFilterContext'|from '@/contexts/useDocumentFilter'|g" "$file"
done

echo "Import fixes completed!"
