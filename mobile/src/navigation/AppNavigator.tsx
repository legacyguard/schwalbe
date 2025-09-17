import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';

export const AppNavigator = () => {
  const { isLoggedIn } = useAuth();
  return (
    <NavigationContainer>
      {isLoggedIn ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
