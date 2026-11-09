import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Avatar, Button, Chip, ErrorNotice, Field, KeyboardPage, Page } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useAction } from '@/hooks/useAction';
import { selecionarFotoBase64 } from '@/services/imageService';
import { profileService } from '@/services/profileService';
import { REGIOES } from '@/data/regions';
import { ui } from '@/theme/theme';
export default function EditProfileScreen() {
  const { perfil } = useAuth();
  const [nome, setNome] = useState(perfil?.nome || '');
  const [foto, setFoto] = useState<string | null>(perfil?.fotoBase64 ?? null);
  const [regiao, setRegiao] = useState(perfil?.regiao || '');
  const photoAction = useAction();
  const save = useAction();
  async function choose() {
    await photoAction.run(async () => {
      const result = await selecionarFotoBase64();
      if (result) setFoto(result);
    });
  }
  async function submit() {
    if (await save.run(() => profileService.salvar({ nome, fotoBase64: foto, regiao }))) {
      if (router.canGoBack()) router.back();
      else router.replace('/perfil');
    }
  }
  return (
    <Page title="Editar perfil" back>
      <KeyboardPage>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[ui.content, { gap: 23, paddingBottom: 50 }]}
        >
          <View style={{ alignItems: 'center', gap: 12 }}>
            <Avatar nome={nome} foto={foto} size={112} />
            <Button
              title="Escolher foto"
              icon="image-outline"
              variant="secondary"
              onPress={choose}
              busy={photoAction.busy}
              disabled={save.busy}
            />
            {foto ? (
              <Button
                title="Remover foto"
                variant="ghost"
                onPress={() => setFoto(null)}
                disabled={save.busy || photoAction.busy}
              />
            ) : null}
            <Text style={[ui.caption, { textAlign: 'center' }]}>
              A foto só será enviada ao salvar. Ela fica visível para outros membros.
            </Text>
          </View>
          <ErrorNotice message={photoAction.error} />
          <Field
            label="Nome público"
            value={nome}
            onChangeText={setNome}
            maxLength={80}
            editable={!save.busy}
          />
          <Field label="E-mail da conta" value={perfil?.email} editable={false} />
          <Text style={ui.caption}>A alteração de e-mail não está disponível nesta entrega.</Text>
          <Text style={ui.heading}>Região de interesse</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip text="Todas" selected={!regiao} onPress={() => setRegiao('')} />
            {REGIOES.map((item) => (
              <Chip
                key={item.id}
                text={item.nome}
                selected={regiao === item.nome}
                onPress={() => setRegiao(item.nome)}
              />
            ))}
          </View>
          <ErrorNotice message={save.error} />
          <Button
            title="Salvar alterações"
            onPress={submit}
            busy={save.busy}
            disabled={photoAction.busy}
          />
        </ScrollView>
      </KeyboardPage>
    </Page>
  );
}
