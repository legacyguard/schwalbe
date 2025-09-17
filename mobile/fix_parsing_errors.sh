#!/bin/bash

# Fix the parsing errors in the import statements

# DocumentsScreen.tsx
sed -i '' "s/import { RefreshControl, \/\/ Platform } from 'react-native'/import { RefreshControl } from 'react-native'/" src/screens/main/DocumentsScreen.tsx

# PeopleScreen.tsx  
sed -i '' "s/import { RefreshControl, Alert, \/\/ Platform } from 'react-native'/import { RefreshControl, Alert } from 'react-native'/" src/screens/main/PeopleScreen.tsx

# WillScreen.tsx
sed -i '' "s/import { Alert, \/\/ Platform } from 'react-native'/import { Alert } from 'react-native'/" src/screens/main/WillScreen.tsx

# Fix ScannerScreen.tsx - remove Button from destructured import (it's already commented)
sed -i '' "s/import { YStack, Container, Heading, ScrollContainer }/import { YStack, Container, Heading, ScrollContainer }/" src/screens/main/ScannerScreen.tsx

echo "Parsing errors fixed!"
