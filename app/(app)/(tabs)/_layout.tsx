import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '@/components/ui';
import { colors } from '@/theme/theme';
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const icon =
    (name: IconName, filled: IconName) =>
    ({ focused, color }: { focused: boolean; color: string }) => (
      <Icon name={focused ? filled : name} color={color} size={23} />
    );
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pink,
        tabBarInactiveTintColor: '#A89EA3',
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 3 },
        tabBarStyle: {
          position: 'absolute',
          marginHorizontal: 20,
          bottom: Math.max(insets.bottom, 12),
          height: 64,
          paddingTop: 9,
          paddingBottom: 8,
          borderRadius: 34,
          borderTopWidth: 0,
          backgroundColor: colors.surface,
          shadowColor: '#321027',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.13,
          shadowRadius: 16,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', tabBarIcon: icon('home-outline', 'home') }}
      />
      <Tabs.Screen
        name="explorar"
        options={{ title: 'Explorar', tabBarIcon: icon('search-outline', 'search') }}
      />
      <Tabs.Screen
        name="forum"
        options={{ title: 'Fórum', tabBarIcon: icon('chatbubbles-outline', 'chatbubbles') }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: icon('person-circle-outline', 'person-circle') }}
      />
    </Tabs>
  );
}
