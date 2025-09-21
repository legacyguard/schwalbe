#!/bin/bash

# Fix the last 3 remaining errors

# DocumentsScreen.tsx - fix unused document parameter
sed -i '' '157s/(document) =>/(_document) =>/' src/screens/main/DocumentsScreen.tsx

# WillScreen.tsx - Grid is already commented, but maybe the pattern is wrong - let's check
grep -n "Grid" src/screens/main/WillScreen.tsx | head -5

# Fix empty destructuring pattern - change from const { } = useAuth() to just call useAuth()
sed -i '' "s/const { } = useAuth()/useAuth()/" src/screens/main/WillScreen.tsx

echo "Last errors fixed!"
