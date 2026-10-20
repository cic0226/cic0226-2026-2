import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import type { Timestamp } from 'firebase/firestore';
import { Avatar, Button, Empty, ErrorNotice, Icon, Loading, Page } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useStream } from '@/hooks/useStream';
import { chatService } from '@/services/chatService';
import type { Conversa } from '@/types/models';
import { millis, tempoRelativo } from '@/utils/date';
import { colors, ui } from '@/theme/theme';
function ConversationItem({ item, currentUid }: { item: Conversa; currentUid: string }) {
  const other = item.participantes.find((id) => id !== currentUid) ?? '';
  const profile = usePublicProfile(other);
  const receipt = useStream<Timestamp | null>(
    useCallback(
      (next, error) => chatService.escutarLeitura(item.id, currentUid, next, error),
      [item.id, currentUid],
    ),
    null,
  );
  const unread =
    !receipt.loading &&
    !receipt.error &&
    !!item.ultimaMensagem &&
    item.ultimaMensagemAutorId !== currentUid &&
    (millis(item.atualizadoEm) ?? 0) > (millis(receipt.data) ?? -1);
  const name = profile?.nome ?? 'Usuário';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Conversa com ${name}${unread ? ', nova mensagem' : ''}`}
      onPress={() => router.push({ pathname: '/conversa/[uid]', params: { uid: other } })}
      style={({ pressed }) => [ui.card, ui.row, { gap: 13, opacity: pressed ? 0.65 : 1 }]}
    >
      <Avatar nome={name} foto={profile?.fotoBase64} size={50} />
      <View style={[ui.grow, { gap: 5 }]}>
        <View style={ui.between}>
          <Text numberOfLines={1} style={[ui.body, { fontWeight: '700', flex: 1 }]}>
            {name}
          </Text>
          <Text style={ui.caption}>{tempoRelativo(item.atualizadoEm)}</Text>
        </View>
        <Text
          numberOfLines={2}
          style={[ui.muted, unread && { color: colors.text, fontWeight: '700' }]}
        >
          {item.ultimaMensagem
            ? `${item.ultimaMensagemAutorId === currentUid ? 'Você: ' : ''}${item.ultimaMensagem}`
            : 'Comece a conversa com um olá.'}
        </Text>
      </View>
      {unread ? (
        <View style={{ height: 9, width: 9, borderRadius: 5, backgroundColor: colors.brand }} />
      ) : (
        <Icon name="chevron-forward" size={18} color={colors.muted} />
      )}
    </Pressable>
  );
}
export default function MessagesScreen() {
  const { user } = useAuth();
  const [count, setCount] = useState(20);
  const stream = useStream<Conversa[]>(
    useCallback((next, error) => chatService.escutarConversas(count, next, error), [count]),
    [],
  );
  return (
    <Page title="Conversas" subtitle="Sua comunidade, mais perto" back>
      <FlatList
        data={stream.data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[ui.content, { paddingBottom: 36 }]}
        ListHeaderComponent={
          <View style={{ gap: 14, paddingBottom: 18 }}>
            <Text style={ui.muted}>
              Toque no nome ou na foto de um autor no fórum para conversar no privado.
            </Text>
            <ErrorNotice message={stream.error} onRetry={stream.retry} />
          </View>
        }
        ListEmptyComponent={
          stream.loading ? (
            <Loading />
          ) : !stream.error ? (
            <Empty
              title="Toda conexão começa com um olá"
              text="Conheça pessoas da comunidade e inicie uma conversa pelo perfil de um autor."
              action={<Button title="Ir ao fórum" onPress={() => router.push('/forum')} />}
            />
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={
          stream.data.length >= count ? (
            <Button
              title="Carregar mais conversas"
              variant="ghost"
              busy={stream.loading}
              onPress={() => setCount((v) => v + 20)}
            />
          ) : null
        }
        renderItem={({ item }) => <ConversationItem item={item} currentUid={user!.uid} />}
      />
    </Page>
  );
}
