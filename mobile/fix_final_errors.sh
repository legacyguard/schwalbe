#!/bin/bash

# Fix the invalid destructuring syntax

# DocumentsScreen.tsx - fix invalid destructuring
sed -i '' "s/const { \/\/ offlineDocuments, addDocument, isAvailable } = useOfflineVault()/const { addDocument, isAvailable } = useOfflineVault()/" src/screens/main/DocumentsScreen.tsx

# WillScreen.tsx - fix invalid destructuring
sed -i '' "s/const { \/\/ user } = useAuth()/const { } = useAuth()/" src/screens/main/WillScreen.tsx

# ScannerScreen.tsx - comment out Button import
sed -i '' "s/import { View, Text, Button, Image,/import { View, Text, \/\/ Button,\n  Image,/" src/screens/main/ScannerScreen.tsx

echo "Final errors fixed!"
