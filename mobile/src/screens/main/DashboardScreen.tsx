// src/screens/main/DashboardScreen.tsx
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export const DashboardScreen = () => {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to LegacyGuard</Text>
      <View style={styles.buttonContainer}>
        <Button title='Log Out' onPress={logout} color='#ff6b6b' />
      </View>
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
    marginBottom: 30,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
