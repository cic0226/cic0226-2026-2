import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AuthShell, Button, ErrorNotice, Field, Icon } from '@/components/ui';
import { useAction } from '@/hooks/useAction';
import { authService } from '@/services/authService';
import { colors, ui } from '@/theme/theme';
export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [aceitou, setAceitou] = useState(false);
  const action = useAction();
  function submit() {
    void action.run(async () => {
      if (senha !== confirmacao) throw new Error('As senhas não coincidem.');
      if (!aceitou) throw new Error('Confirme que leu como os dados do perfil serão exibidos.');
      await authService.cadastrar(nome, email, senha);
    });
  }
  return (
    <AuthShell
      title="Comece agora com o Mapeei!"
      subtitle="Crie sua conta para conhecer, compartilhar e se conectar."
    >
      <Field
        label="Nome"
        placeholder="Como você quer ser chamado(a)?"
        value={nome}
        onChangeText={setNome}
        maxLength={80}
        autoComplete="name"
        editable={!action.busy}
      />
      <Field
        label="E-mail"
        placeholder="Digite seu e-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        editable={!action.busy}
      />
      <Field
        label="Senha"
        placeholder="Pelo menos 6 caracteres"
        value={senha}
        onChangeText={setSenha}
        password
        autoComplete="new-password"
        editable={!action.busy}
      />
      <Field
        label="Confirmar senha"
        placeholder="Digite a senha novamente"
        value={confirmacao}
        onChangeText={setConfirmacao}
        password
        autoComplete="new-password"
        editable={!action.busy}
      />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: aceitou }}
        onPress={() => setAceitou(!aceitou)}
        style={[ui.row, { alignItems: 'flex-start', minHeight: 44 }]}
      >
        <Icon name={aceitou ? 'checkbox' : 'square-outline'} />
        <Text style={[ui.muted, { flex: 1 }]}>
          Entendo que meu nome e minha foto ficam visíveis para outros usuários autenticados.
        </Text>
      </Pressable>
      <Button
        title="Como meus dados são usados?"
        variant="ghost"
        onPress={() => router.push('/privacidade')}
      />
      <ErrorNotice message={action.error} />
      <Button title="Criar minha conta" busy={action.busy} onPress={submit} />
      <Button title="Já tenho uma conta" variant="ghost" onPress={() => router.replace('/login')} />
    </AuthShell>
  );
}
