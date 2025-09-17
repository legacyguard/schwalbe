import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Button, Container, H1, Input, Spinner, YStack } from '@legacyguard/ui';
import { AuthenticationService } from '@/services/AuthenticationService';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await AuthenticationService.loginWithEmail(email, password);
      // Navigation will happen automatically via AuthContext
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error
          ? error.message
          : 'An error occurred during login'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size='small' padding='large'>
      <YStack flex={1} justifyContent='center' gap='$4'>
        <H1 textAlign='center' marginBottom='$6'>
          Login
        </H1>

        <Input
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
          disabled={isLoading}
          size='large'
        />

        <Input
          placeholder='Password'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          disabled={isLoading}
          size='large'
        />

        {isLoading ? (
          <YStack alignItems='center' marginTop='$4'>
            <Spinner size='large' color='$primaryBlue' />
          </YStack>
        ) : (
          <Button
            variant='primary'
            size='large'
            onPress={handleLogin}
            marginTop='$4'
          >
            Log In
          </Button>
        )}
      </YStack>
    </Container>
  );
};

export default LoginScreen;
