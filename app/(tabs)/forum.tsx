import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  escutarForuns,
  formatarAtividade,
  rotuloComentarios,
  type ForumItem,
} from "../../src/services/forum/forumService";

// ============================================================================
// HELPERS
// ============================================================================

/** Minúsculas e sem acentos, para a pesquisa ignorar "Ceilândia" x "ceilandia". */
function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ============================================================================
// CARD DO FÓRUM (um por documento da coleção "forum")
// ============================================================================

function ForumCard({ item }: { item: ForumItem }) {
  const { texto, ativoAgora } = formatarAtividade(item.ultimaAtividade);

  return (
    <Pressable
      onPress={() => router.push(`/forum/${item.id}` as any)}
      accessibilityRole="button"
      accessibilityLabel={`Abrir conversa de ${item.regiao}`}
      className="
        mb-3
        rounded-2xl
        border
        border-[#D7D7D7]
        bg-white
        px-3.5
        pb-3
        pt-3.5
        active:opacity-90
      "
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      {/* CABEÇALHO */}
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 pr-2 text-[16px] font-extrabold text-[#222]">
          {item.regiao}
        </Text>

        <View className="rounded-full bg-[#FBE4EF] px-3 py-1">
          <Text className="text-[9px] font-bold text-[#9A315F]">
            {rotuloComentarios(item.totalComentarios)}
          </Text>
        </View>
      </View>

      {/* DESCRIÇÃO */}
      {item.descricao ? (
        <Text
          numberOfLines={2}
          className="mt-2 text-[13px] leading-[18px] text-[#989898]"
        >
          {item.descricao}
        </Text>
      ) : null}

      {/* DIVISÓRIA */}
      <View className="my-3 h-[1px] w-full bg-[#DEDEDE]" />

      {/* RODAPÉ DO CARD */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className={`mr-2 h-2 w-2 rounded-full ${
              ativoAgora ? "bg-[#87A816]" : "bg-[#D0D0D0]"
            }`}
          />

          <Text
            className={`text-[10px] ${
              ativoAgora ? "font-semibold text-[#768D24]" : "text-[#A8A8A8]"
            }`}
          >
            {texto}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text className="mr-1 text-[10px] font-semibold text-[#9A315F]">
            Ver conversa
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#9A315F" />
        </View>
      </View>
    </Pressable>
  );
}

// ============================================================================
// TELA
// ============================================================================

export default function ForumScreen() {
  const [pesquisa, setPesquisa] = useState("");
  const [itens, setItens] = useState<ForumItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Escuta a coleção "forum" em tempo real: novos comentários e conversas
  // aparecem sem precisar recarregar a tela.
  useEffect(() => {
    const cancelar = escutarForuns(
      (lista) => {
        setItens(lista);
        setErro(null);
        setCarregando(false);
      },
      (e) => {
        console.log("Erro ao carregar o fórum:", e);
        setErro("Não foi possível carregar as conversas.");
        setCarregando(false);
      },
    );

    return cancelar;
  }, []);

  const forunsFiltrados = useMemo(() => {
    const termo = normalizar(pesquisa);

    if (!termo) return itens;

    return itens.filter(
      (item) =>
        normalizar(item.regiao).includes(termo) ||
        normalizar(item.descricao).includes(termo),
    );
  }, [pesquisa, itens]);

  return (
    <View className="flex-1 bg-[#FFF9F9]">
      {/* ESTRELA DECORATIVA */}
      <View pointerEvents="none" className="absolute -right-6 top-0 opacity-30">
        <Ionicons name="star" size={115} color="#F0EFA3" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <View className="px-4 pt-20">
          {/* TÍTULO */}
          <Text className="text-[32px] font-extrabold leading-[36px] text-[#202020]">
            Fórum
          </Text>

          <Text className="mt-0.5 text-[15px] text-[#ADADAD]">
            converse com moradores das RAs
          </Text>

          {/* PESQUISA */}
          <View className="mt-6 h-[46px] flex-row items-center rounded-full bg-[#EEEEEE] px-4">
            <Ionicons name="search-outline" size={22} color="#A9A9A9" />

            <TextInput
              value={pesquisa}
              onChangeText={setPesquisa}
              placeholder="Pesquisar conversa..."
              placeholderTextColor="#B4B4B4"
              className="ml-3 flex-1 text-[13px] text-[#333]"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {pesquisa.length > 0 && (
              <Pressable
                onPress={() => setPesquisa("")}
                accessibilityRole="button"
                accessibilityLabel="Limpar pesquisa"
                className="h-7 w-7 items-center justify-center"
              >
                <Ionicons name="close-circle" size={18} color="#B8B8B8" />
              </Pressable>
            )}
          </View>

          {/* LISTA */}
          <View className="mt-6">
            {carregando ? (
              <View className="items-center py-16">
                <ActivityIndicator color="#E85C9C" />
              </View>
            ) : erro ? (
              <View className="items-center py-16">
                <Ionicons name="cloud-offline-outline" size={44} color="#D0D0D0" />
                <Text className="mt-3 text-[14px] font-semibold text-[#777]">
                  {erro}
                </Text>
                <Text className="mt-1 text-[12px] text-[#AAA]">
                  Verifique sua conexão e tente novamente
                </Text>
              </View>
            ) : forunsFiltrados.length > 0 ? (
              forunsFiltrados.map((item) => (
                <ForumCard key={item.id} item={item} />
              ))
            ) : (
              <View className="items-center py-16">
                <Ionicons name="chatbubbles-outline" size={44} color="#D0D0D0" />

                <Text className="mt-3 text-[14px] font-semibold text-[#777]">
                  {itens.length === 0
                    ? "Ainda não há conversas"
                    : "Nenhuma conversa encontrada"}
                </Text>

                <Text className="mt-1 text-[12px] text-[#AAA]">
                  {itens.length === 0
                    ? "As conversas das regiões aparecerão aqui"
                    : "Tente pesquisar por outra região"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}