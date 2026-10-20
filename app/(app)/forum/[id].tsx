import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Author } from '@/components/Author';
import { Composer } from '@/components/Composer';
import { PostCard } from '@/components/PostCard';
import {
  Button,
  Empty,
  ErrorNotice,
  IconButton,
  KeyboardPage,
  Loading,
  Page,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useAction } from '@/hooks/useAction';
import { useStream } from '@/hooks/useStream';
import { forumService } from '@/services/forumService';
import type { Comentario, Publicacao } from '@/types/models';
import { tempoRelativo } from '@/utils/date';
import { ui } from '@/theme/theme';
export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [count, setCount] = useState(20);
  const [text, setText] = useState('');
  const action = useAction();
  const operation = useRef<{ id: string; text: string } | null>(null);
  const post = useStream<Publicacao | null>(
    useCallback((next, error) => forumService.escutarPublicacao(id, next, error), [id]),
    null,
  );
  const comments = useStream<Comentario[]>(
    useCallback(
      (next, error) => forumService.escutarComentarios(id, count, next, error),
      [id, count],
    ),
    [],
  );
  function send() {
    void action.run(async () => {
      const trimmed = text.trim();
      if (!operation.current || operation.current.text !== trimmed)
        operation.current = { id: forumService.novoComentarioId(id), text: trimmed };
      await forumService.comentar(id, trimmed, operation.current.id);
      setText('');
      operation.current = null;
    });
  }
  const right =
    post.data?.autorId === user?.uid ? (
      <IconButton
        label="Editar publicação"
        name="create-outline"
        onPress={() => router.push({ pathname: '/forum/nova', params: { editar: id } })}
      />
    ) : undefined;
  return (
    <Page title="Publicação" back right={right}>
      <KeyboardPage>
        {post.loading && !post.data ? (
          <Loading />
        ) : post.error ? (
          <View style={{ padding: 22 }}>
            <ErrorNotice message={post.error} onRetry={post.retry} />
          </View>
        ) : !post.data ? (
          <Empty title="Publicação não encontrada" text="Ela não está disponível neste endereço." />
        ) : (
          <>
            <FlatList
              data={comments.data}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 18 }}
              ListHeaderComponent={
                <View style={{ gap: 20, marginBottom: 20 }}>
                  <PostCard post={post.data} detailed />
                  <View style={ui.between}>
                    <Text style={ui.heading}>Comentários</Text>
                    <Text style={ui.caption}>Mais recentes primeiro</Text>
                  </View>
                  <ErrorNotice message={comments.error} onRetry={comments.retry} />
                </View>
              }
              ListEmptyComponent={
                comments.loading ? (
                  <Loading />
                ) : !comments.error ? (
                  <Empty title="A conversa começa com você" text="Deixe o primeiro comentário." />
                ) : null
              }
              ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
              ListFooterComponent={
                comments.data.length >= count ? (
                  <Button
                    title="Carregar comentários anteriores"
                    variant="ghost"
                    busy={comments.loading}
                    onPress={() => setCount((v) => v + 20)}
                  />
                ) : null
              }
              renderItem={({ item }) => (
                <View style={[ui.card, { gap: 12 }]}>
                  <View style={ui.row}>
                    <Author uid={item.autorId} fallback={item.autorNomeLegado} size={34} />
                    <Text style={ui.caption}>{tempoRelativo(item.criadoEm)}</Text>
                  </View>
                  <Text style={ui.body}>{item.texto}</Text>
                </View>
              )}
            />
            {action.error ? (
              <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                <ErrorNotice message={action.error} />
              </View>
            ) : null}
            <Composer
              value={text}
              onChange={setText}
              onSend={send}
              busy={action.busy}
              maxLength={2000}
              placeholder="Escreva um comentário..."
            />
          </>
        )}
      </KeyboardPage>
    </Page>
  );
}
