#!/bin/bash

echo "🧪 Validating i18n configuration..."
echo ""

# Check directories
echo "📁 Checking directory structure..."
dirs=("locales/_shared/en" "locales/_shared/sk" "locales/legal" "locales/web" "locales/mobile" "locales/config")
for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✅ $dir"
    else
        echo "  ❌ $dir (missing)"
    fi
done

echo ""
echo "📄 Checking JSON files..."

# Check EN file
if python3 -m json.tool locales/_shared/en/common/ui.json > /dev/null 2>&1; then
    echo "  ✅ EN translations valid"
else
    echo "  ❌ EN translations invalid"
fi

# Check SK file
if python3 -m json.tool locales/_shared/sk/common/ui.json > /dev/null 2>&1; then
    echo "  ✅ SK translations valid"
else
    echo "  ❌ SK translations invalid"
fi

# Check config
if python3 -m json.tool locales/config/languages.json > /dev/null 2>&1; then
    echo "  ✅ Config file valid"
else
    echo "  ❌ Config file invalid"
fi

echo ""
echo "🎉 i18n validation complete!"
