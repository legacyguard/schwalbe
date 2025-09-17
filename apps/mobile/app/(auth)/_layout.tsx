import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1e293b' },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="biometric" />
    </Stack>
  );
}