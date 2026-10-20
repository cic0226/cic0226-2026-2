<<<<<<< Updated upstream
   import { Stack } from 'expo-router';
import { AuthProvider } from '../src/services/context/AuthContext'; // use o caminho real do seu arquivo

   export default function RootLayout() {

     return (
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
     );
   }
=======
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Button, ErrorNotice, Loading, Page } from '@/components/ui';
import { colors, ui } from '@/theme/theme';
import { missingFirebaseKeys } from '@/config/firebase.config';
function Navigation() {
  const { user, loading, error, retry } = useAuth();
  if (loading)
    return (
      <Page>
        <Loading label="Preparando sua conta..." />
      </Page>
    );
  if (error)
    return (
      <Page>
        <View style={{ padding: 24, gap: 18 }}>
          <Text style={ui.heading}>Vamos sincronizar seu perfil</Text>
          <ErrorNotice message={error} />
          <Button title="Tentar novamente" onPress={retry} />
          <Button
            title="Sair da conta"
            variant="secondary"
            onPress={() => {
              void authService.logout().catch(retry);
            }}
          />
        </View>
      </Page>
    );
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Screen name="privacidade" />
    </Stack>
  );
}
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {missingFirebaseKeys.length ? (
        <Page>
          <View style={{ padding: 24, gap: 16 }}>
            <Text style={ui.title}>Configure o Firebase</Text>
            <Text style={ui.body}>
              Preencha o arquivo .env na raiz e reinicie com npx expo start --clear.
            </Text>
            <ErrorNotice message={`Campos ausentes: ${missingFirebaseKeys.join(', ')}`} />
          </View>
        </Page>
      ) : (
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      )}
    </SafeAreaProvider>
  );
}
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <Page>
        <View style={{ padding: 24, gap: 18 }}>
          <Text style={ui.heading}>Não foi possível abrir esta tela</Text>
          <ErrorNotice message={error.message} />
          <Button title="Tentar novamente" onPress={retry} />
        </View>
      </Page>
    </SafeAreaProvider>
  );
}
>>>>>>> Stashed changes
