import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

// ============================================================================
// TIPOS / INTERFACES
// ============================================================================

interface ForumItem {
  id: string;
  regiao: string;
  descricao: string;
  conversas: number;
  comentarios: number;
  curtidas: number;
  atividade: string;
  ativoAgora?: boolean;
}

// ============================================================================
// DADOS TEMPORÁRIOS
// Posteriormente estes dados podem vir do Firebase
// ============================================================================

const forumItems: ForumItem[] = [
  {
    id: "1",
    regiao: "Asa Norte",
    descricao:
      "Iluminação precária na comercial da 408 Norte, moradores relatam insegurança ao transitar à noite...",
    conversas: 5,
    comentarios: 4,
    curtidas: 12,
    atividade: "Ativa agora · 12min",
    ativoAgora: true,
  },
  {
    id: "2",
    regiao: "Asa Sul",
    descricao:
      "Nova ciclovia no Eixinho: opiniões? Estão curtindo o novo trajeto ou acham que atrapalhou o trânsito...",
    conversas: 12,
    comentarios: 8,
    curtidas: 25,
    atividade: "Ativa agora · 45min",
    ativoAgora: true,
  },
  {
    id: "3",
    regiao: "Taguatinga",
    descricao:
      "Encontro de carros antigos no Taguaparque! Alguém sabe que horas começa a exposição no domingo...",
    conversas: 9,
    comentarios: 6,
    curtidas: 9,
    atividade: "Última atividade: ontem",
  },
  {
    id: "4",
    regiao: "Ceilândia",
    descricao:
      "Onde comprar as melhores frutas na feira? Ouvi dizer que a banca do seu Zé é a melhor...",
    conversas: 6,
    comentarios: 3,
    curtidas: 7,
    atividade: "Última atividade: ontem",
  },
  {
    id: "5",
    regiao: "Núcleo Bandeirante",
    descricao:
      "Tem ônibus direto pro aeroporto saindo daqui? Estou precisando viajar amanhã cedo e não queria...",
    conversas: 4,
    comentarios: 5,
    curtidas: 3,
    atividade: "Última atividade: 2 dias",
  },
  {
    id: "6",
    regiao: "Guará",
    descricao:
      "A pista de skate nova ficou sensacional, parabéns aos envolvidos pela reforma no Guará II...",
    conversas: 7,
    comentarios: 11,
    curtidas: 19,
    atividade: "Última atividade: domingo",
  },
];

// ============================================================================
// CARD DO FÓRUM
// ============================================================================

function ForumCard({ item }: { item: ForumItem }) {
  const abrirConversa = () => {
    // Futuramente:
    // router.push(`/forum/${item.id}`);

    console.log("Abrir fórum:", item.regiao);
  };

  return (
    <Pressable
      onPress={abrirConversa}
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
        shadowOffset: {
          width: 0,
          height: 2,
        },
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
            {item.conversas} conversas
          </Text>
        </View>
      </View>

      {/* DESCRIÇÃO */}
      <Text
        numberOfLines={2}
        className="mt-2 text-[13px] leading-[18px] text-[#989898]"
      >
        {item.descricao}
      </Text>

      {/* DIVISÓRIA */}
      <View className="my-3 h-[1px] w-full bg-[#DEDEDE]" />

      {/* RODAPÉ DO CARD */}
      <View className="flex-row items-center justify-between">
        {/* ATIVIDADE */}
        <View className="flex-row items-center">
          <View
            className={`mr-2 h-2 w-2 rounded-full ${
              item.ativoAgora ? "bg-[#87A816]" : "bg-[#D0D0D0]"
            }`}
          />

          <Text
            className={`text-[10px] ${
              item.ativoAgora
                ? "font-semibold text-[#768D24]"
                : "text-[#A8A8A8]"
            }`}
          >
            {item.atividade}
          </Text>
        </View>

        {/* CONTADORES */}
        <View className="flex-row items-center">
          <View className="mr-3 flex-row items-center">
            <Ionicons name="chatbox-outline" size={15} color="#8D8D8D" />

            <Text className="ml-1 text-[10px] text-[#8D8D8D]">
              {item.comentarios}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="heart-outline" size={16} color="#8D8D8D" />

            <Text className="ml-1 text-[10px] text-[#8D8D8D]">
              {item.curtidas}
            </Text>
          </View>
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

  const forumsFiltrados = useMemo(() => {
    const termo = pesquisa
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (!termo) {
      return forumItems;
    }

    return forumItems.filter((item) => {
      const regiao = item.regiao
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const descricao = item.descricao
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      return regiao.includes(termo) || descricao.includes(termo);
    });
  }, [pesquisa]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View className="flex-1 bg-[#FFF9F9]">
        {/* ESTRELA DECORATIVA */}
        <View
          pointerEvents="none"
          className="absolute -right-6 top-0 opacity-30"
        >
          <Ionicons name="star" size={115} color="#F0EFA3" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 105,
          }}
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
            <View
              className="
                mt-6
                h-[46px]
                flex-row
                items-center
                rounded-full
                bg-[#EEEEEE]
                px-4
              "
            >
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
                  className="h-7 w-7 items-center justify-center"
                >
                  <Ionicons name="close-circle" size={18} color="#B8B8B8" />
                </Pressable>
              )}
            </View>

            {/* LISTA */}
            <View className="mt-6">
              {forumsFiltrados.length > 0 ? (
                forumsFiltrados.map((item) => (
                  <ForumCard key={item.id} item={item} />
                ))
              ) : (
                <View className="items-center py-16">
                  <Ionicons
                    name="chatbubbles-outline"
                    size={44}
                    color="#D0D0D0"
                  />

                  <Text className="mt-3 text-[14px] font-semibold text-[#777]">
                    Nenhuma conversa encontrada
                  </Text>

                  <Text className="mt-1 text-[12px] text-[#AAA]">
                    Tente pesquisar por outra região
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* ================================================================ */}
        {/* BARRA INFERIOR */}
        {/* ================================================================ */}

        <View
          className="
            absolute
            bottom-5
            left-8
            right-8
            h-[52px]
            flex-row
            items-center
            justify-around
            rounded-full
            bg-white
            px-4
          "
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.14,
            shadowRadius: 12,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            elevation: 8,
          }}
        >
          {/* HOME */}
          <Pressable
            onPress={() => router.push("/passeios")}
            className="h-10 w-12 items-center justify-center"
          >
            <Ionicons name="home-outline" size={26} color="#CFCFCF" />
          </Pressable>

          {/* BUSCA */}
          <Pressable
            onPress={() => {
              // Adicione a rota futuramente
              // router.push("/pesquisa");
            }}
            className="h-10 w-12 items-center justify-center"
          >
            <Ionicons name="search-outline" size={27} color="#CFCFCF" />
          </Pressable>

          {/* FÓRUM - ATIVO */}
          <Pressable
            className="
              h-10
              w-12
              items-center
              justify-center
              rounded-xl
              bg-[#E85C9C]
            "
          >
            <Ionicons name="chatbubbles-outline" size={27} color="#FFFFFF" />
          </Pressable>

          {/* PERFIL */}
          <Pressable
            onPress={() => router.push("/")}
            className="h-10 w-12 items-center justify-center"
          >
            <Ionicons name="person-circle-outline" size={28} color="#CFCFCF" />
          </Pressable>
        </View>
      </View>
    </>
  );
}
