import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AuthShell, Button, ErrorNotice, Field, Icon } from '@/components/ui';
import { useAction } from '@/hooks/useAction';
import { authService } from '@/services/authService';
import { colors, ui } from '@/theme/theme';
export default function RecuperarSenhaScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const action = useAction();
  const submit = () =>
    action.run(async () => {
      try {
        await authService.recuperarSenha(email);
      } catch (e) {
        if ((e as { code?: string }).code !== 'auth/user-not-found') throw e;
      }
      setSent(true);
    });
  return (
    <AuthShell
      title="Vamos recuperar seu acesso"
      subtitle="Informe o e-mail utilizado no cadastro."
    >
      {sent ? (
        <View style={[ui.card, { gap: 12, backgroundColor: colors.oliveSoft }]}>
          <Icon name="mail-open-outline" color={colors.olive} />
          <Text style={ui.body}>
            Se houver uma conta para este e-mail, você receberá as instruções. Confira também a
            caixa de spam.
          </Text>
        </View>
      ) : (
        <>
          <Field
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="Seu e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />
          <ErrorNotice message={action.error} />
          <Button title="Enviar instruções" busy={action.busy} onPress={submit} />
        </>
      )}
      <Button
        title="Voltar para o login"
        variant="ghost"
        onPress={() => router.replace('/login')}
      />
    </AuthShell>
  );
}
