import { Stack } from 'expo-router';
import { FavoritesProvider } from '@/context/FavoritesContext';
export default function AppLayout() {
  return (
    <FavoritesProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </FavoritesProvider>
  );
}
