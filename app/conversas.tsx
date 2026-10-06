import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import type { User } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { authService, type Usuario } from "../src/services/authService";

// ============================================================================
// TIPOS / INTERFACES
// ============================================================================

type CategoriaForum =
  "Geral" | "Segurança" | "Mobilidade" | "Custo de vida" | "Lazer";

interface ForumPost {
  id: string;
  regiaoId: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaForum;

  // O UID cria o vínculo real com usuarios/{uid} no Firestore.
  autorId: string;
  autorNome: string;
  autorAvatar?: string;

  tempo: string;
  comentarios: number;
  curtidas: number;
}

const CATEGORIAS: ("Todas" | CategoriaForum)[] = [
  "Todas",
  "Geral",
  "Segurança",
  "Mobilidade",
  "Custo de vida",
  "Lazer",
];

// Dados temporários somente para reproduzir a tela do Figma.
// No Firestore, estes registros devem ficar na coleção forumPosts.
const POSTS_EXEMPLO: ForumPost[] = [
  {
    id: "post-1",
    regiaoId: "asa-norte",
    titulo: "Iluminação precária na comercial da 408 Norte",
    descricao:
      "Muitas lâmpadas queimadas perto do restaurante novo. Tá perigoso caminhar por lá depois das 20h...",
    categoria: "Segurança",
    autorId: "uid-juliana",
    autorNome: "Juliana M.",
    tempo: "12min",
    comentarios: 4,
    curtidas: 12,
  },
  {
    id: "post-2",
    regiaoId: "asa-norte",
    titulo: "Nova ciclovia no Eixinho: Opiniões?",
    descricao:
      "Alguém já testou o novo trecho da ciclovia? Achei que as sinalizações poderiam ser um pouco mais claras.",
    categoria: "Mobilidade",
    autorId: "uid-ricardo",
    autorNome: "Ricardo C.",
    tempo: "45min",
    comentarios: 8,
    curtidas: 25,
  },
  {
    id: "post-3",
    regiaoId: "asa-norte",
    titulo: "Preço do aluguel nas quadras 100 vs 300",
    descricao:
      "Estou procurando apartamento e notei uma diferença bizarra. O que justifica a 100 ser mais cara?",
    categoria: "Custo de vida",
    autorId: "uid-marina",
    autorNome: "Marina L.",
    tempo: "2h",
    comentarios: 32,
    curtidas: 104,
  },
  {
    id: "post-4",
    regiaoId: "asa-norte",
    titulo: "Piquenique no Parque Olhos D'Água",
    descricao:
      "Pensando em organizar um encontro da galera do Asa Norte no sábado. Quem anima levar algo?",
    categoria: "Lazer",
    autorId: "uid-joao",
    autorNome: "João P.",
    tempo: "5h",
    comentarios: 15,
    curtidas: 19,
  },
  {
    id: "post-5",
    regiaoId: "asa-norte",
    titulo: "Recomendação de pet shop 24h?",
    descricao:
      "Meu doguinho não tá bem e preciso de um lugar confiável aqui perto que atenda agora.",
    categoria: "Geral",
    autorId: "uid-beatriz",
    autorNome: "Beatriz F.",
    tempo: "8h",
    comentarios: 3,
    curtidas: 7,
  },
];

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function normalizarTexto(valor: string) {
  return valor
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getInitials(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (!partes.length) return "?";

  const primeira = partes[0]?.[0] ?? "";
  const ultima =
    partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";

  return `${primeira}${ultima}`.toUpperCase();
}

function corCategoria(categoria: CategoriaForum) {
  switch (categoria) {
    case "Segurança":
      return "#69752D";
    case "Mobilidade":
      return "#69752D";
    case "Custo de vida":
      return "#69752D";
    case "Lazer":
      return "#69752D";
    default:
      return "#69752D";
  }
}

// ============================================================================
// COMPONENTE DO CARD
// ============================================================================

function PostCard({
  post,
  onComment,
  onLike,
}: {
  post: ForumPost;
  onComment: (post: ForumPost) => void;
  onLike: (post: ForumPost) => void;
}) {
  return (
    <View
      className="mb-6 rounded-[14px] border border-[#D4D4D4] bg-white px-4 pb-4 pt-4"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-[15px] font-extrabold leading-[17px] text-[#202020]">
          {post.titulo}
        </Text>

        <View className="rounded-full bg-[#F1F1EC] px-2.5 py-1">
          <Text
            numberOfLines={1}
            className="text-[9px] font-extrabold uppercase tracking-[0.4px]"
            style={{ color: corCategoria(post.categoria) }}
          >
            {post.categoria}
          </Text>
        </View>
      </View>

      <Text
        className="mt-2 text-[12px] leading-[15px] text-[#202020]"
        numberOfLines={3}
      >
        {post.descricao}
      </Text>

      <View className="my-4 h-px bg-[#D8D8D8]" />

      <View className="flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-row items-center">
          <View className="h-6 w-6 items-center justify-center rounded-full bg-[#EFE7E3]">
            <Text className="text-[8px] font-bold text-[#6B1E42]">
              {getInitials(post.autorNome)}
            </Text>
          </View>

          <Text className="ml-2 text-[10px] text-[#8D8D8D]" numberOfLines={1}>
            {post.autorNome}
            <Text className="text-[#B1B1B1]"> • {post.tempo}</Text>
          </Text>
        </View>

        <View className="ml-3 flex-row items-center gap-3">
          <Pressable
            onPress={() => onComment(post)}
            hitSlop={8}
            className="flex-row items-center active:opacity-60"
          >
            <Ionicons name="chatbox-outline" size={16} color="#9C9C9C" />
            <Text className="ml-1 text-[10px] text-[#777]">
              {post.comentarios}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onLike(post)}
            hitSlop={8}
            className="flex-row items-center active:opacity-60"
          >
            <Ionicons
              name={post.curtidas >= 100 ? "heart" : "heart-outline"}
              size={17}
              color={post.curtidas >= 100 ? "#9A315F" : "#9C9C9C"}
            />
            <Text className="ml-1 text-[10px] text-[#777]">
              {post.curtidas}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// TELA
// ============================================================================

export default function ConversasScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    regiaoId?: string;
    regiao?: string;
  }>();

  const regiaoId =
    typeof params.regiaoId === "string" ? params.regiaoId : "asa-norte";
  const regiaoNome =
    typeof params.regiao === "string" ? params.regiao : "Asa Norte";

  const [pesquisa, setPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    "Todas" | CategoriaForum
  >("Todas");

  const [firebaseUser, setFirebaseUser] = useState<User | null>(
    authService.getUsuarioAtual(),
  );
  const [perfil, setPerfil] = useState<Usuario | null>(null);

  useEffect(() => {
    const unsubscribe = authService.observarAuth((user) => {
      setFirebaseUser(user);

      if (!user) {
        setPerfil(null);
        return;
      }

      authService
        .buscarUsuario(user.uid)
        .then(setPerfil)
        .catch(() => setPerfil(null));
    });

    return unsubscribe;
  }, []);

  const postsFiltrados = useMemo(() => {
    const termo = normalizarTexto(pesquisa);

    return POSTS_EXEMPLO.filter((post) => {
      const pertenceARegiao = post.regiaoId === regiaoId;
      const pertenceACategoria =
        categoriaSelecionada === "Todas" ||
        post.categoria === categoriaSelecionada;

      const correspondeAPesquisa =
        !termo ||
        normalizarTexto(post.titulo).includes(termo) ||
        normalizarTexto(post.descricao).includes(termo) ||
        normalizarTexto(post.autorNome).includes(termo);

      return pertenceARegiao && pertenceACategoria && correspondeAPesquisa;
    });
  }, [categoriaSelecionada, pesquisa, regiaoId]);

  /**
   * Proteção de UX.
   * IMPORTANTE: a segurança real das gravações deve existir também
   * nas Firestore Security Rules usando request.auth.
   */
  const executarSeAutenticado = (acao: () => void) => {
    if (firebaseUser) {
      acao();
      return;
    }

    Alert.alert(
      "Login necessário",
      "Você precisa estar logado para realizar esta ação.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Entrar",
          onPress: () => router.push("/login"),
        },
      ],
    );
  };

  const handleNovoPost = () => {
    executarSeAutenticado(() => {
      // Quando a tela de criação existir, substitua o Alert por:
      // router.push({ pathname: "/novo-post", params: { regiaoId, regiao: regiaoNome } });
      Alert.alert(
        "Novo post",
        `Usuário autenticado. O novo post será criado em ${regiaoNome}.`,
      );
    });
  };

  const handleComentario = (post: ForumPost) => {
    executarSeAutenticado(() => {
      // Futuramente: router.push(`/post/${post.id}`)
      Alert.alert("Comentários", `Abrir comentários de: ${post.titulo}`);
    });
  };

  const handleCurtir = (post: ForumPost) => {
    executarSeAutenticado(() => {
      // Futuramente esta ação grava em:
      // forumPosts/{post.id}/curtidas/{firebaseUser.uid}
      Alert.alert("Curtida", `Curtir/descurtir: ${post.titulo}`);
    });
  };

  const handlePerfil = () => {
    if (firebaseUser) {
      router.push("/usuarios" as any);
      return;
    }

    router.push("/login");
  };

  const nomeUsuario = perfil?.nome ?? firebaseUser?.displayName ?? "";
  const iniciaisUsuario = nomeUsuario ? getInitials(nomeUsuario) : "";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-[#FEF8F8]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          <View className="px-5 pt-14">
            {/* CABEÇALHO */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => router.back()}
                  accessibilityRole="button"
                  accessibilityLabel="Voltar"
                  className="h-9 w-9 items-center justify-center rounded-full bg-[#7E9B14] active:opacity-80"
                >
                  <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </Pressable>

                <Text className="ml-3 text-[22px] font-extrabold text-[#202020]">
                  Conversas
                </Text>
              </View>

              <Pressable
                onPress={handlePerfil}
                accessibilityRole="button"
                accessibilityLabel={firebaseUser ? "Abrir perfil" : "Entrar"}
                className="h-10 w-10 items-center justify-center rounded-full bg-[#EA6D9D] active:opacity-80"
              >
                {iniciaisUsuario ? (
                  <Text className="text-[13px] font-semibold text-white">
                    {iniciaisUsuario}
                  </Text>
                ) : (
                  <Ionicons name="person-outline" size={20} color="#FFFFFF" />
                )}
              </Pressable>
            </View>

            {/* REGIÃO */}
            <View className="mt-8">
              <Text className="text-[32px] font-extrabold leading-[36px] text-[#202020]">
                {regiaoNome}
              </Text>

              <Text className="mt-1 text-[14px] text-[#9C9C9C]">
                {
                  POSTS_EXEMPLO.filter((post) => post.regiaoId === regiaoId)
                    .length
                }{" "}
                conversas nesta região
              </Text>
            </View>

            {/* PESQUISA */}
            <View className="mt-4 h-12 flex-row items-center rounded-full bg-[#EEEEEE] px-4">
              <Ionicons name="search-outline" size={21} color="#ACACAC" />

              <TextInput
                value={pesquisa}
                onChangeText={setPesquisa}
                placeholder="Pesquisar conversa..."
                placeholderTextColor="#B2B2B2"
                className="ml-3 flex-1 text-[13px] text-[#333]"
                autoCorrect={false}
                autoCapitalize="none"
              />

              {pesquisa.length > 0 && (
                <Pressable onPress={() => setPesquisa("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color="#B7B7B7" />
                </Pressable>
              )}
            </View>
          </View>

          {/* CATEGORIAS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-6"
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 9,
            }}
          >
            {CATEGORIAS.map((categoria) => {
              const selecionada = categoriaSelecionada === categoria;

              return (
                <Pressable
                  key={categoria}
                  onPress={() => setCategoriaSelecionada(categoria)}
                  className={`h-10 items-center justify-center rounded-full border px-6 active:opacity-80 ${
                    selecionada
                      ? "border-[#EA6D9D] bg-[#EA6D9D]"
                      : "border-[#E3E3E3] bg-white"
                  }`}
                >
                  <Text
                    className={`text-[14px] ${
                      selecionada ? "font-medium text-white" : "text-[#8B8B8B]"
                    }`}
                  >
                    {categoria}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* POSTS */}
          <View className="mt-7 px-5">
            {postsFiltrados.length > 0 ? (
              postsFiltrados.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onComment={handleComentario}
                  onLike={handleCurtir}
                />
              ))
            ) : (
              <View className="items-center py-16">
                <Ionicons
                  name="chatbubbles-outline"
                  size={42}
                  color="#D0D0D0"
                />
                <Text className="mt-3 text-sm font-semibold text-[#777]">
                  Nenhuma conversa encontrada
                </Text>
                <Text className="mt-1 text-xs text-[#AAA]">
                  Tente alterar a busca ou a categoria.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* BOTÃO FLUTUANTE PARA CRIAR POST */}
        <Pressable
          onPress={handleNovoPost}
          accessibilityRole="button"
          accessibilityLabel="Criar novo post"
          className="absolute bottom-7 right-5 h-14 w-14 items-center justify-center rounded-full bg-[#8D2857] active:opacity-80"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 7,
          }}
        >
          <Ionicons name="pencil" size={23} color="#FFFFFF" />
        </Pressable>
      </View>
    </>
  );
}
