import { Tabs } from 'expo-router';
import { Home, FileText, User, Shield } from '@tamagui/lucide-icons';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation('navigation');
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: '#1e293b',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: t('documents'),
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="protection"
        options={{
          title: t('protection'),
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Shield size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
