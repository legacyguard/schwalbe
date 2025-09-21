import React, { useState } from 'react';
import {
  Button,
  Card,
  // useTheme,
  CardAnimation,
  CardContent,
  Container,
  Divider,
  FormInput,
  FormSection,
  H1,
  Paragraph,
  Row,
  Stack,
} from '@legacyguard/ui';
import { useSignIn } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';

export const SignInScreen = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const navigation = useNavigation();
  // const theme = useTheme()

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    if (!isLoaded) return;

    setIsLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });

      await setActive({ session: completeSignIn.createdSessionId });

      // Navigate to main app
      navigation.navigate('MainTabs' as never);
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      Alert.alert(
        'Sign In Failed',
        err.errors?.[0]?.message || 'Invalid email or password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp' as never);
  };

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Stack
          padding='$4'
          justifyContent='center'
          flex={1}
          gap='$6'
          maxWidth={400}
          width='100%'
          marginHorizontal='auto'
        >
          {/* Header */}
          <Stack gap='$2' alignItems='center'>
            <H1 color='primary'>LegacyGuard</H1>
            <Paragraph size='large' color='muted'>
              Sign in to your account
            </Paragraph>
          </Stack>

          {/* Sign In Form */}
          <Card {...CardAnimation.default}>
            <CardContent>
              <FormSection spacing='$4'>
                <FormInput
                  testID='email-input'
                  placeholder='Enter your email'
                  value={email}
                  onChangeText={setEmail}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoComplete='email'
                  icon={Mail}
                  field={{ label: 'Email', errorMessage: errors.email }}
                />

                <FormInput
                  testID='password-input'
                  placeholder='Enter your password'
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete='password'
                  icon={Lock}
                  field={{ label: 'Password', errorMessage: errors.password }}
                  rightIcon={
                    <Button
                      size='small'
                      variant='ghost'
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  }
                />

                <Row justifyContent='flex-end'>
                  <Button
                    variant='ghost'
                    size='small'
                    onPress={handleForgotPassword}
                  >
                    Forgot Password?
                  </Button>
                </Row>

                <Button
                  testID='signin-button'
                  variant='primary'
                  size='large'
                  fullWidth
                  onPress={handleSignIn}
                  disabled={isLoading}
                  loading={isLoading}
                >
                  Sign In
                </Button>
              </FormSection>
            </CardContent>
          </Card>

          {/* Divider */}
          <Row align='center' space='small'>
            <Divider flex={1} />
            <Paragraph size='small' color='muted'>
              OR
            </Paragraph>
            <Divider flex={1} />
          </Row>

          {/* Social Sign In */}
          <Stack gap='$3'>
            <Button
              variant='secondary'
              size='large'
              fullWidth
              onPress={() => console.log('Sign in with Google')}
            >
              Continue with Google
            </Button>

            <Button
              variant='secondary'
              size='large'
              fullWidth
              onPress={() => console.log('Sign in with Apple')}
            >
              Continue with Apple
            </Button>
          </Stack>

          {/* Sign Up Link */}
          <Row justify='center' space='small'>
            <Paragraph size='medium' color='muted'>
              Don't have an account?
            </Paragraph>
            <Button variant='ghost' size='small' onPress={handleSignUp}>
              Sign Up
            </Button>
          </Row>
        </Stack>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default SignInScreen;
