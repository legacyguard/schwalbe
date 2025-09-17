// src/screens/main/VaultScreen.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const VaultScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Document Vault</Text>
      <Text style={styles.subtitle}>
        Your secure documents will appear here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
