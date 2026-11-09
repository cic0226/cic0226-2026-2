import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Text, View, type ViewToken } from 'react-native';
import { doc, onSnapshot, type Timestamp } from 'firebase/firestore';
import {
  Avatar,
  Button,
  Empty,
  ErrorNotice,
  Icon,
  IconButton,
  KeyboardPage,
  Loading,
  Page,
} from '@/components/ui';
import { Composer } from '@/components/Composer';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useAction } from '@/hooks/useAction';
import { useForeground } from '@/hooks/useForeground';
import { useStream } from '@/hooks/useStream';
import { chatService } from '@/services/chatService';
import { db } from '@/services/firebase/firestore';
import type { Mensagem, PerfilPublico } from '@/types/models';
import { criarConversaId } from '@/utils/validation';
import { mensagemErro } from '@/utils/errors';
import { diaMensagem, horaMensagem, millis } from '@/utils/date';
import { colors, ui } from '@/theme/theme';

/** A key remounts all subscriptions/draft state when a different recipient is opened. */
export default function ConversationScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const { user } = useAuth();
  let valid = false;
  try {
    criarConversaId(user!.uid, uid);
    valid = true;
  } catch {
    /* Invalid deep link. */
  }
  return valid ? (
    <Conversation key={`${user!.uid}:${uid}`} otherUid={uid} />
  ) : (
    <Page title="Conversa" back>
      <Empty title="Destinatário inválido" text="Abra o perfil de outro autor pelo fórum." />
    </Page>
  );
}
function Conversation({ otherUid }: { otherUid: string }) {
  const { user } = useAuth();
  const foreground = useForeground();
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  const peer = useStream<PerfilPublico | null>(
    useCallback(
      (next, error) =>
        onSnapshot(
          doc(db, 'perfisPublicos', otherUid),
          (s) => next(s.exists() ? (s.data() as PerfilPublico) : null),
          error,
        ),
      [otherUid],
    ),
    null,
  );
  const blocked = useStream<boolean>(
    useCallback((next, error) => chatService.escutarBloqueio(otherUid, next, error), [otherUid]),
    false,
  );
  const [conversationId, setConversationId] = useState('');
  const [openingError, setOpeningError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const peerReady = !!peer.data;
  useEffect(() => {
    let active = true;
    if (!peerReady || !focused) return;
    setOpeningError('');
    void chatService
      .abrirConversa(otherUid)
      .then((id) => {
        if (active) setConversationId(id);
      })
      .catch((e: unknown) => {
        if (active) setOpeningError(mensagemErro(e));
      });
    return () => {
      active = false;
    };
  }, [peerReady, otherUid, attempt, focused]);
  const [count, setCount] = useState(40);
  const messages = useStream<Mensagem[]>(
    useCallback(
      (next, error) => {
        if (!conversationId) {
          next([]);
          return () => {};
        }
        return chatService.escutarMensagens(conversationId, count, next, error);
      },
      [conversationId, count],
    ),
    [],
  );
  const receipt = useStream<Timestamp | null>(
    useCallback(
      (next, error) => {
        if (!conversationId) {
          next(null);
          return () => {};
        }
        return chatService.escutarLeitura(conversationId, otherUid, next, error);
      },
      [conversationId, otherUid],
    ),
    null,
  );
  const [latestIncoming, setLatestIncoming] = useState<Mensagem | null>(null);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 250,
  }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<Mensagem>[] }) => {
      const visible = viewableItems
        .filter(
          (entry) =>
            entry.isViewable &&
            entry.item.autorId !== user!.uid &&
            millis(entry.item.criadoEm) !== null,
        )
        .map((entry) => entry.item)
        .sort((a, b) => (millis(b.criadoEm) ?? 0) - (millis(a.criadoEm) ?? 0));
      setLatestIncoming(visible[0] ?? null);
    },
  ).current;
  const [receiptError, setReceiptError] = useState('');
  const [receiptAttempt, setReceiptAttempt] = useState(0);
  const marked = useRef(-1);
  useEffect(() => {
    let active = true;
    if (
      !foreground ||
      !focused ||
      !conversationId ||
      !latestIncoming ||
      (millis(latestIncoming.criadoEm) ?? -1) <= marked.current
    )
      return;
    const message = latestIncoming;
    void chatService
      .marcarLida(conversationId, message)
      .then(() => {
        if (active) {
          marked.current = millis(message.criadoEm) ?? -1;
          setReceiptError('');
        }
      })
      .catch(() => {
        if (active)
          setReceiptError(
            'Não foi possível confirmar a leitura. Suas mensagens continuam disponíveis.',
          );
      });
    return () => {
      active = false;
    };
  }, [
    foreground,
    focused,
    conversationId,
    latestIncoming?.id,
    latestIncoming?.criadoEm,
    receiptAttempt,
  ]);
  const [text, setText] = useState('');
  const sendAction = useAction();
  const operation = useRef<{ id: string; text: string } | null>(null);
  function send() {
    void sendAction.run(async () => {
      const body = text.trim();
      if (!operation.current || operation.current.text !== body)
        operation.current = { id: chatService.novaMensagemId(conversationId), text: body };
      await chatService.enviar(conversationId, body, operation.current.id);
      setText('');
      operation.current = null;
    });
  }
  const [showBlock, setShowBlock] = useState(false);
  const blockAction = useAction();
  async function changeBlock() {
    const ok = await blockAction.run(() =>
      blocked.data ? chatService.desbloquear(otherUid) : chatService.bloquear(otherUid),
    );
    if (ok) {
      setShowBlock(false);
      setAttempt((v) => v + 1);
    }
  }
  const name = peer.data?.nome ?? 'Conversa';
  const ready = !!conversationId;
  return (
    <Page>
      <View style={[ui.row, { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 14, gap: 10 }]}>
        <IconButton
          label="Voltar"
          name="arrow-back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/mensagens'))}
        />
        <Avatar nome={name} foto={peer.data?.fotoBase64} size={43} />
        <View style={ui.grow}>
          <Text numberOfLines={1} style={[ui.heading, { fontSize: 18 }]}>
            {name}
          </Text>
          <Text style={ui.caption}>Conversa privada</Text>
        </View>
        <IconButton
          label={blocked.data ? 'Desbloquear usuário' : 'Bloquear usuário'}
          name={blocked.data ? 'lock-open-outline' : 'shield-outline'}
          disabled={blocked.loading || !!blocked.error}
          onPress={() => {
            blockAction.clearError();
            setShowBlock(true);
          }}
        />
      </View>
      <KeyboardPage>
        {!ready ? (
          peer.loading ? (
            <Loading />
          ) : peer.error ? (
            <View style={ui.content}>
              <ErrorNotice message={peer.error} onRetry={peer.retry} />
            </View>
          ) : !peer.data ? (
            <Empty
              title="Perfil ainda indisponível"
              text="Contas antigas precisam entrar uma vez na nova versão para disponibilizar o perfil público. Nenhum dado pessoal foi exposto."
            />
          ) : openingError ? (
            <View style={ui.content}>
              <ErrorNotice message={openingError} onRetry={() => setAttempt((v) => v + 1)} />
              <Text style={ui.muted}>
                A conversa também pode estar bloqueada por um dos participantes.
              </Text>
            </View>
          ) : (
            <Loading label="Abrindo conversa..." />
          )
        ) : (
          <>
            <View style={{ paddingHorizontal: 22, paddingBottom: 12 }}>
              <Text style={[ui.caption, { textAlign: 'center' }]}>
                Visível aos dois participantes no aplicativo. Não possui criptografia de ponta a
                ponta.
              </Text>
            </View>
            <FlatList
              inverted
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              data={messages.data}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: 14,
                flexGrow: messages.data.length ? undefined : 1,
              }}
              ListEmptyComponent={
                messages.loading ? (
                  <Loading />
                ) : !messages.error ? (
                  <Empty
                    title={`Diga olá para ${name.split(' ')[0]}`}
                    text="Converse com respeito e evite compartilhar informações sensíveis."
                  />
                ) : null
              }
              ListFooterComponent={
                messages.data.length >= count ? (
                  <Button
                    title="Carregar mensagens anteriores"
                    variant="ghost"
                    busy={messages.loading}
                    onPress={() => setCount((v) => v + 40)}
                  />
                ) : null
              }
              renderItem={({ item, index }) => {
                const own = item.autorId === user!.uid;
                const older = messages.data[index + 1];
                const dateHeader =
                  !older || diaMensagem(item.criadoEm) !== diaMensagem(older.criadoEm);
                const read =
                  own &&
                  millis(item.criadoEm) !== null &&
                  (millis(receipt.data) ?? -1) >= (millis(item.criadoEm) ?? Infinity);
                return (
                  <View>
                    {dateHeader ? (
                      <Text style={[ui.caption, { alignSelf: 'center', marginVertical: 16 }]}>
                        {diaMensagem(item.criadoEm)}
                      </Text>
                    ) : null}
                    <View
                      style={{
                        alignSelf: own ? 'flex-end' : 'flex-start',
                        maxWidth: '86%',
                        borderRadius: 19,
                        borderBottomRightRadius: own ? 5 : 19,
                        borderBottomLeftRadius: own ? 19 : 5,
                        backgroundColor: own ? colors.brand : colors.surface,
                        paddingHorizontal: 15,
                        paddingTop: 12,
                        paddingBottom: 9,
                        marginBottom: 10,
                      }}
                    >
                      <Text
                        selectable
                        style={[ui.body, { color: own ? colors.surface : colors.text }]}
                      >
                        {item.texto}
                      </Text>
                      <View style={[ui.row, { justifyContent: 'flex-end', marginTop: 5, gap: 5 }]}>
                        <Text style={{ color: own ? '#EED2DF' : colors.muted, fontSize: 10 }}>
                          {horaMensagem(item.criadoEm)}
                        </Text>
                        {own ? (
                          <View accessibilityLabel={read ? 'Lida' : 'Enviada'}>
                            <Icon
                              name={read ? 'checkmark-done' : 'checkmark'}
                              size={14}
                              color={own ? colors.surface : colors.brand}
                            />
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>
                );
              }}
            />
            <View style={{ paddingHorizontal: 16, gap: 6, paddingBottom: 6 }}>
              <ErrorNotice message={messages.error} onRetry={messages.retry} />
              <ErrorNotice message={blocked.error} onRetry={blocked.retry} />
              <ErrorNotice
                message={receipt.error || receiptError}
                onRetry={() => {
                  receipt.retry();
                  setReceiptAttempt((v) => v + 1);
                }}
              />
              <ErrorNotice message={sendAction.error} />
              {blocked.data ? (
                <View style={[ui.card, { gap: 7 }]}>
                  <Text style={ui.muted}>
                    Você bloqueou este usuário. O histórico foi mantido; novas mensagens estão
                    desativadas para ambos.
                  </Text>
                  <Button title="Desbloquear" variant="ghost" onPress={() => setShowBlock(true)} />
                </View>
              ) : null}
            </View>
            <Composer
              value={text}
              onChange={setText}
              onSend={send}
              busy={sendAction.busy}
              disabled={blocked.data || blocked.loading || !!blocked.error || !!messages.error}
              maxLength={4000}
              placeholder={blocked.data ? 'Conversa bloqueada' : 'Digite sua mensagem...'}
            />
          </>
        )}
      </KeyboardPage>
      <ConfirmDialog
        visible={showBlock}
        title={blocked.data ? 'Desbloquear usuário?' : 'Bloquear usuário?'}
        text={
          blocked.data
            ? 'Vocês poderão conversar novamente, desde que o outro participante também não tenha bloqueado você.'
            : 'Novas mensagens serão impedidas nos dois sentidos. O histórico continua disponível e nenhum conteúdo será apagado.'
        }
        confirm={blocked.data ? 'Desbloquear' : 'Bloquear'}
        busy={blockAction.busy}
        error={blockAction.error}
        onConfirm={() => void changeBlock()}
        onCancel={() => {
          if (!blockAction.busy) setShowBlock(false);
        }}
      />
    </Page>
  );
}
