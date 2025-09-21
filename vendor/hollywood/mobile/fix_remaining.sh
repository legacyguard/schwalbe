#!/bin/bash

# Fix remaining unused variables by prefixing with underscore

# SubscriptionStatus.tsx - useAuth import
sed -i '' "s/import { useAuth } from/\/\/ import { useAuth } from/" src/components/subscription/SubscriptionStatus.tsx

# SignInScreen.tsx - useTheme
sed -i '' "s/  useTheme,/  \/\/ useTheme,/" src/screens/auth/SignInScreen.tsx

# DashboardScreenV2.tsx - useEffect, setMetrics, isTablet  
sed -i '' "s/import React, { useState, useEffect } from/import React, { useState } from/" src/screens/main/DashboardScreenV2.tsx
sed -i '' "s/const \[metrics, setMetrics\]/const [metrics, _setMetrics]/" src/screens/main/DashboardScreenV2.tsx
sed -i '' "s/const isTablet =/const _isTablet =/" src/screens/main/DashboardScreenV2.tsx

# DocumentsScreen.tsx - Filter, Platform, offlineDocuments, document param
sed -i '' "s/  Filter,/  \/\/ Filter,/" src/screens/main/DocumentsScreen.tsx
sed -i '' "s/, Platform/, \/\/ Platform/" src/screens/main/DocumentsScreen.tsx
sed -i '' "s/const { offlineDocuments,/const { \/\/ offlineDocuments,/" src/screens/main/DocumentsScreen.tsx
sed -i '' "s/(document) =>/(\_document) =>/" src/screens/main/DocumentsScreen.tsx

# PeopleScreen.tsx - CheckboxGroup, Switch, Platform, navigation, showAddModal, editingPerson, getRoleColor
sed -i '' "s/  CheckboxGroup,/  \/\/ CheckboxGroup,/" src/screens/main/PeopleScreen.tsx
sed -i '' "s/  Switch,/  \/\/ Switch,/" src/screens/main/PeopleScreen.tsx
sed -i '' "s/, Platform/, \/\/ Platform/" src/screens/main/PeopleScreen.tsx
sed -i '' "s/const navigation =/const _navigation =/" src/screens/main/PeopleScreen.tsx
sed -i '' "s/const \[showAddModal,/const [_showAddModal,/" src/screens/main/PeopleScreen.tsx
sed -i '' "s/const \[editingPerson,/const [_editingPerson,/" src/screens/main/PeopleScreen.tsx
sed -i '' "s/const getRoleColor =/const _getRoleColor =/" src/screens/main/PeopleScreen.tsx

# ProfileScreen.tsx - CardHeader, CardTitle, CardDescription, CardContent, CircularProgress
sed -i '' "s/  CardHeader,/  \/\/ CardHeader,/" src/screens/main/ProfileScreen.tsx
sed -i '' "s/  CardTitle,/  \/\/ CardTitle,/" src/screens/main/ProfileScreen.tsx
sed -i '' "s/  CardDescription,/  \/\/ CardDescription,/" src/screens/main/ProfileScreen.tsx
sed -i '' "s/  CardContent,/  \/\/ CardContent,/" src/screens/main/ProfileScreen.tsx
sed -i '' "s/  CircularProgress,/  \/\/ CircularProgress,/" src/screens/main/ProfileScreen.tsx

# ScannerScreen.tsx - Button
sed -i '' "s/{ YStack, Button, Container, Heading, ScrollContainer }/{ YStack, Container, Heading, ScrollContainer }/" src/screens/main/ScannerScreen.tsx

# WillScreen.tsx - CheckboxGroup, Grid, Platform, navigation, user
sed -i '' "s/  CheckboxGroup,/  \/\/ CheckboxGroup,/" src/screens/main/WillScreen.tsx
sed -i '' "s/  Grid,/  \/\/ Grid,/" src/screens/main/WillScreen.tsx
sed -i '' "s/, Platform/, \/\/ Platform/" src/screens/main/WillScreen.tsx
sed -i '' "s/const navigation =/const _navigation =/" src/screens/main/WillScreen.tsx
sed -i '' "s/const { user }/const { \/\/ user }/" src/screens/main/WillScreen.tsx

# OfflineVaultService.ts - Crypto import and data variable
sed -i '' "s/import \* as Crypto from/\/\/ import \* as Crypto from/" src/services/OfflineVaultService.ts
sed -i '' "s/const data =/const _data =/" src/services/OfflineVaultService.ts

echo "Fixes applied!"
