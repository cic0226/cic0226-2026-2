import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { auth } from "../../src/services/firebase/firebase";
import {
    enviarComentario,
    escutarComentarios,
    escutarForum,
    formatarDataHora,
    rotuloComentarios,
    type Comentario,
    type ForumItem,
} from "../../src/services/forum/forumService";

// ============================================================================
// BOLHA DE COMENTÁRIO
// ============================================================================

function BolhaComentario({
  comentario,
  propria,
}: {
  comentario: Comentario;
  propria: boolean;
}) {
  return (
    <View className={`mb-3 max-w-[85%] ${propria ? "self-end" : "self-start"}`}>
      <Text
        className={`mb-0.5 text-[11px] font-semibold text-[#8D8D8D] ${
          propria ? "text-right" : ""
        }`}
      >
        {propria ? "Você" : comentario.autorNome}
      </Text>

      <View
        className={`rounded-2xl px-3.5 py-2.5 ${
          propria ? "bg-[#E85C9C]" : "border border-[#D7D7D7] bg-white"
        }`}
      >
        <Text
          className={`text-[14px] leading-[19px] ${
            propria ? "text-white" : "text-[#222]"
          }`}
        >
          {comentario.texto}
        </Text>
      </View>

      <Text
        className={`mt-0.5 text-[10px] text-[#A8A8A8] ${
          propria ? "text-right" : ""
        }`}
      >
        {formatarDataHora(comentario.criadoEm)}
      </Text>
    </View>
  );
}

// ============================================================================
// TELA DA CONVERSA (rota /forum/[id])
// ============================================================================

export default function ForumConversaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const listaRef = useRef<FlatList<Comentario>>(null);

  const [forum, setForum] = useState<ForumItem | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Escuta o fórum e seus comentários em tempo real
  useEffect(() => {
    if (!id) return;

    const cancelarForum = escutarForum(id, setForum, (e) =>
      console.log("Erro ao carregar o fórum:", e),
    );

    const cancelarComentarios = escutarComentarios(
      id,
      (lista) => {
        setComentarios(lista);
        setCarregando(false);
      },
      (e) => {
        console.log("Erro ao carregar comentários:", e);
        setCarregando(false);
      },
    );

    return () => {
      cancelarForum();
      cancelarComentarios();
    };
  }, [id]);

  // Rola até o comentário mais recente quando chega um novo
  useEffect(() => {
    if (comentarios.length === 0) return;

    const timer = setTimeout(
      () => listaRef.current?.scrollToEnd({ animated: true }),
      100,
    );

    return () => clearTimeout(timer);
  }, [comentarios.length]);

  const podeEnviar = texto.trim().length > 0 && !enviando;

  const enviar = async () => {
    if (!id || !podeEnviar) return;

    setEnviando(true);

    try {
      await enviarComentario(id, texto);
      setTexto("");
    } catch (error) {
      console.log("Erro ao enviar comentário:", error);
      Alert.alert(
        "Erro",
        "Não foi possível enviar seu comentário. Tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const meuId = auth.currentUser?.uid;

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-[#FFF9F9]"
    >
      {/* CABEÇALHO */}
      <View
        className="flex-row items-center px-4 pb-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          className="h-10 w-10 items-center justify-center rounded-full bg-[#EEEEEE] active:opacity-70"
        >
          <Ionicons name="arrow-back" size={20} color="#333" />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text
            numberOfLines={1}
            className="text-[20px] font-extrabold text-[#202020]"
          >
            {forum?.regiao ?? "Conversa"}
          </Text>

          <Text className="text-[12px] text-[#ADADAD]">
            {rotuloComentarios(comentarios.length)}
          </Text>
        </View>
      </View>

      {/* DESCRIÇÃO + COMENTÁRIOS */}
      <FlatList
        ref={listaRef}
        data={comentarios}
        keyExtractor={(c) => c.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        ListHeaderComponent={
          <View>
            <View className="mb-4 rounded-2xl border border-[#D7D7D7] bg-white p-3.5">
              <Text className="text-[13px] leading-[18px] text-[#555]">
                {forum?.descricao || "Sem descrição."}
              </Text>
            </View>

            <Text className="mb-3 text-[13px] font-semibold text-[#333]">
              Comentários
            </Text>
          </View>
        }
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator color="#E85C9C" style={{ marginTop: 24 }} />
          ) : (
            <View className="items-center py-10">
              <Ionicons name="chatbubbles-outline" size={40} color="#D0D0D0" />
              <Text className="mt-3 text-[14px] font-semibold text-[#777]">
                Nenhum comentário ainda
              </Text>
              <Text className="mt-1 text-[12px] text-[#AAA]">
                Seja o primeiro a comentar
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <BolhaComentario
            comentario={item}
            propria={item.autorId === meuId}
          />
        )}
      />

      {/* CAMPO DE COMENTÁRIO */}
      <View
        className="flex-row items-end border-t border-[#E8E8E8] bg-white px-3 pt-2"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escreva um comentário..."
          placeholderTextColor="#B4B4B4"
          multiline
          maxLength={500}
          editable={!enviando}
          className="max-h-28 min-h-[42px] flex-1 rounded-2xl bg-[#EEEEEE] px-4 py-2.5 text-[14px] text-[#333]"
        />

        <Pressable
          onPress={enviar}
          disabled={!podeEnviar}
          accessibilityRole="button"
          accessibilityLabel="Enviar comentário"
          className={`ml-2 h-[42px] w-[42px] items-center justify-center rounded-full bg-[#E85C9C] active:opacity-80 ${
            podeEnviar ? "" : "opacity-40"
          }`}
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={18} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}