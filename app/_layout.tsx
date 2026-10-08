   import { Stack } from 'expo-router';
import { AuthProvider } from '../src/services/context/AuthContext'; // use o caminho real do seu arquivo

   export default function RootLayout() {

     return (
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
     );
   }