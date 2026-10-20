import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Chip, ErrorNotice, Field, KeyboardPage, Loading, Page } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useAction } from '@/hooks/useAction';
import { forumService } from '@/services/forumService';
import { CATEGORIAS, type Categoria } from '@/types/models';
import { REGIOES } from '@/data/regions';
import { mensagemErro } from '@/utils/errors';
import { ui } from '@/theme/theme';
export default function NewPostScreen() {
  const params = useLocalSearchParams<{ editar?: string; regiao?: string }>();
  const { user, perfil } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('Geral');
  const [regiao, setRegiao] = useState(params.regiao || perfil?.regiao || '');
  const [loading, setLoading] = useState(!!params.editar);
  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);
  const action = useAction();
  useEffect(() => {
    if (!params.editar) return;
    let active = true;
    setLoading(true);
    setLoadError('');
    forumService
      .buscar(params.editar)
      .then((post) => {
        if (!active) return;
        if (!post || post.autorId !== user?.uid)
          throw new Error('Você só pode editar suas próprias publicações.');
        setTitulo(post.titulo);
        setTexto(post.texto);
        setCategoria(post.categoria);
        setRegiao(post.regiao);
      })
      .catch((e) => {
        if (active) setLoadError(mensagemErro(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.editar, user?.uid, revision]);
  function submit() {
    void action.run(async () => {
      const input = { titulo, texto, categoria, regiao };
      if (params.editar) {
        await forumService.editar(params.editar, input);
        if (router.canGoBack()) router.back();
        else router.replace({ pathname: '/forum/[id]', params: { id: params.editar } });
      } else {
        const id = await forumService.publicar(input);
        router.replace({ pathname: '/forum/[id]', params: { id } });
      }
    });
  }
  return (
    <Page title={params.editar ? 'Editar publicação' : 'Criar publicação'} back>
      <KeyboardPage>
        {loading ? (
          <Loading />
        ) : loadError ? (
          <View style={{ padding: 22 }}>
            <ErrorNotice message={loadError} onRetry={() => setRevision((v) => v + 1)} />
          </View>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[ui.content, { paddingBottom: 50 }]}
          >
            <Text style={ui.muted}>
              Uma pergunta pode abrir muitas possibilidades. Seu nome e sua foto acompanham a
              publicação.
            </Text>
            <Field
              label="Título"
              placeholder="Sobre o que vamos conversar?"
              value={titulo}
              onChangeText={setTitulo}
              maxLength={120}
              editable={!action.busy}
            />
            <Field
              label="Sua publicação"
              placeholder="Conte sua experiência ou faça uma pergunta..."
              multiline
              value={texto}
              onChangeText={setTexto}
              maxLength={5000}
              editable={!action.busy}
              style={{ minHeight: 165 }}
            />
            <Text style={[ui.caption, { textAlign: 'right', marginTop: -14 }]}>
              {texto.length}/5000
            </Text>
            <Text style={ui.heading}>Categoria</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIAS.map((item) => (
                <Chip
                  key={item}
                  text={item}
                  selected={categoria === item}
                  onPress={() => setCategoria(item)}
                />
              ))}
            </View>
            <Text style={ui.heading}>Região</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Chip text="Todo o DF" selected={!regiao} onPress={() => setRegiao('')} />
              {REGIOES.map((item) => (
                <Chip
                  key={item.id}
                  text={item.nome}
                  selected={regiao === item.nome}
                  onPress={() => setRegiao(item.nome)}
                />
              ))}
            </View>
            <ErrorNotice message={action.error} />
            <Button
              title={params.editar ? 'Salvar alterações' : 'Publicar'}
              icon="paper-plane-outline"
              busy={action.busy}
              onPress={submit}
            />
          </ScrollView>
        )}
      </KeyboardPage>
    </Page>
  );
}
