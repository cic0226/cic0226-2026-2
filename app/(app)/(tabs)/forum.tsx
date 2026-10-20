import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import {
  Button,
  Chip,
  Empty,
  ErrorNotice,
  Field,
  IconButton,
  Loading,
  Page,
} from '@/components/ui';
import { PostCard } from '@/components/PostCard';
import { useStream } from '@/hooks/useStream';
import { forumService } from '@/services/forumService';
import { CATEGORIAS, type Publicacao } from '@/types/models';
import { normalizar } from '@/utils/validation';
import { ui } from '@/theme/theme';
export default function ForumScreen() {
  const params = useLocalSearchParams<{ regiao?: string }>();
  const [region, setRegion] = useState(params.regiao || '');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [count, setCount] = useState(20);
  useEffect(() => setRegion(params.regiao || ''), [params.regiao]);
  const stream = useStream<Publicacao[]>(
    useCallback((next, error) => forumService.escutar(count, next, error), [count]),
    [],
  );
  const posts = useMemo(
    () =>
      stream.data.filter(
        (p) =>
          (category === 'Todas' || p.categoria === category) &&
          (!region || normalizar(p.regiao) === normalizar(region)) &&
          normalizar(`${p.titulo} ${p.texto} ${p.regiao}`).includes(normalizar(search)),
      ),
    [stream.data, category, region, search],
  );
  return (
    <Page
      title="Fórum"
      subtitle="A comunidade tem muito para compartilhar"
      right={
        <IconButton
          label="Mensagens privadas"
          name="chatbubble-ellipses-outline"
          filled
          onPress={() => router.push('/mensagens')}
        />
      }
    >
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={ui.content}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={
          <View style={{ gap: 15, paddingBottom: 21 }}>
            <Field
              value={search}
              onChangeText={setSearch}
              placeholder="Pesquisar nas publicações carregadas"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {['Todas', ...CATEGORIAS].map((name) => (
                <Chip
                  key={name}
                  text={name}
                  selected={category === name}
                  onPress={() => setCategory(name)}
                />
              ))}
            </ScrollView>
            {region ? (
              <Chip
                text={`${region} · limpar filtro`}
                icon="location-outline"
                onPress={() => {
                  setRegion('');
                  router.setParams({ regiao: '' });
                }}
              />
            ) : null}
            <Button
              title="Criar publicação"
              icon="add"
              onPress={() => router.push({ pathname: '/forum/nova', params: { regiao: region } })}
            />
            <ErrorNotice message={stream.error} onRetry={stream.retry} />
          </View>
        }
        ListEmptyComponent={
          stream.loading ? (
            <Loading />
          ) : !stream.error ? (
            <Empty
              title="Vamos começar uma conversa?"
              text={
                search || region || category !== 'Todas'
                  ? 'Nenhuma publicação carregada corresponde aos filtros. Carregue mais ou limpe a busca.'
                  : 'Compartilhe uma experiência ou faça a primeira pergunta.'
              }
            />
          ) : null
        }
        ListFooterComponent={
          <View style={{ gap: 12, marginTop: 16 }}>
            <Text style={[ui.caption, { textAlign: 'center' }]}>
              Busca e filtros aplicados às {stream.data.length} publicações carregadas.
            </Text>
            {stream.data.length >= count ? (
              <Button
                title="Carregar mais publicações"
                variant="secondary"
                busy={stream.loading}
                onPress={() => setCount((v) => v + 20)}
              />
            ) : null}
          </View>
        }
        renderItem={({ item }) => <PostCard post={item} />}
      />
    </Page>
  );
}
