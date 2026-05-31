import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export default function TabLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: {
          backgroundColor: t.tabBar,
          borderTopColor: t.tabBarBorder,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="houses" options={{ title: 'Houses', tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="cars" options={{ title: 'Cars', tabBarIcon: ({ color, size }) => <Ionicons name="car-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="services" options={{ title: 'Services', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="favorites" options={{ title: 'Saved', tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="coins" options={{ title: 'Coins', tabBarIcon: ({ color, size }) => <Ionicons name="logo-bitcoin" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
