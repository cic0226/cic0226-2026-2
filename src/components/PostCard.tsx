import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useStream } from '@/hooks/useStream';
import { useAction } from '@/hooks/useAction';
import { forumService } from '@/services/forumService';
import type { Publicacao } from '@/types/models';
import { tempoRelativo } from '@/utils/date';
import { colors, ui } from '@/theme/theme';
import { Author } from './Author';
import { Chip, ErrorNotice, Icon, IconButton } from './ui';
export function PostCard({ post, detailed = false }: { post: Publicacao; detailed?: boolean }) {
  const { user } = useAuth();
  const favorite = useFavorites();
  const action = useAction();
  const like = useStream(
    useCallback(
      (next: (value: boolean) => void, error: (e: Error) => void) =>
        forumService.escutarCurtida(post.id, user!.uid, next, error),
      [post.id, user?.uid],
    ),
    false,
  );
  const open = () => router.push({ pathname: '/forum/[id]', params: { id: post.id } });
  return (
    <View style={[ui.card, { gap: 14 }]}>
      <View style={ui.row}>
        <Author uid={post.autorId} fallback={post.autorNomeLegado} />
        <Text style={ui.caption}>{tempoRelativo(post.criadoEm || post.ultimaAtividade)}</Text>
      </View>
      <Pressable
        disabled={detailed}
        onPress={open}
        accessibilityRole={detailed ? undefined : 'button'}
        accessibilityLabel={`Abrir publicação: ${post.titulo}`}
        style={{ gap: 7 }}
      >
        <Text
          style={[ui.heading, { fontSize: 18, lineHeight: 25 }]}
          numberOfLines={detailed ? undefined : 2}
        >
          {post.titulo}
        </Text>
        <Text
          style={[ui.body, { fontSize: 14, lineHeight: 21 }]}
          numberOfLines={detailed ? undefined : 3}
        >
          {post.texto}
        </Text>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <Chip text={post.categoria} />
        {post.regiao ? <Chip text={post.regiao} icon="location-outline" /> : null}
      </View>
      <View style={[ui.between, { borderTopWidth: 1, borderColor: colors.border, paddingTop: 5 }]}>
        <View style={ui.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={like.data ? 'Remover curtida' : 'Curtir publicação'}
            accessibilityState={{
              selected: like.data,
              disabled: action.busy || like.loading || !!like.error,
            }}
            disabled={action.busy || like.loading || !!like.error}
            onPress={() => action.run(() => forumService.alternarCurtida(post.id))}
            style={[ui.row, { minHeight: 44, paddingRight: 8, gap: 5 }]}
          >
            <Icon
              name={like.data ? 'heart' : 'heart-outline'}
              size={21}
              color={like.data ? colors.pink : colors.muted}
            />
            <Text style={ui.muted}>{post.totalCurtidas}</Text>
          </Pressable>
          <Pressable
            disabled={detailed}
            accessibilityRole={detailed ? undefined : 'button'}
            accessibilityLabel={`Ver ${post.totalComentarios} comentários`}
            onPress={open}
            style={[ui.row, { minHeight: 44, gap: 5 }]}
          >
            <Icon name="chatbubble-outline" size={19} color={colors.muted} />
            <Text style={ui.muted}>{post.totalComentarios}</Text>
          </Pressable>
        </View>
        <IconButton
          name={favorite.has('forum', post.id) ? 'bookmark' : 'bookmark-outline'}
          label={favorite.has('forum', post.id) ? 'Remover dos favoritos' : 'Salvar publicação'}
          disabled={action.busy || favorite.loading}
          onPress={() =>
            action.run(() =>
              favorite.toggle({ tipo: 'forum', refId: post.id, titulo: post.titulo }),
            )
          }
        />
      </View>
      {post.editadoEm && detailed ? (
        <Text style={ui.caption}>Publicação editada pelo autor.</Text>
      ) : null}
      <ErrorNotice
        message={action.error || like.error}
        onRetry={like.error ? like.retry : undefined}
      />
    </View>
  );
}
