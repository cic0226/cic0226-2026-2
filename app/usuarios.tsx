import { Stack, useRouter } from "expo-router";

import { useEffect, useState } from "react";

import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { authService } from "../src/services/authService";

// ============================================================================
// TIPOS / INTERFACES
// ============================================================================

export interface UserProfileData {
  id: string;
  name: string;
  username: string;
  avatarBase64?: string; // String de foto em formato Base64
  favoritesCount: number;
}

export interface MenuItemOption {
  id: string;
  label: string;
  iconName: string;
  onPress: () => void;
  isDestructive?: boolean; // Para o botão Sair (destaque em vermelho)
}

export interface UserProfileProps {
  user: UserProfileData;
  onEditProfile: () => void;
  onOpenFavorites: () => void;
  onNavigate: (route: string) => void;
  onLogout: () => void;
}


/**
 * Valida e normaliza uma string de avatar em Base64, devolvendo uma URI
 * pronta para o componente <Image>. Retorna null quando a string estiver
 * vazia ou não parecer um Base64 válido, para acionar o fallback de iniciais.
 */

function getAvatarUri(avatarBase64?: string): string | null {
  if (!avatarBase64) return null;

  const valor = avatarBase64.trim();

  if (valor.length === 0) return null;

  // prefixo "data:image/..."
  if (valor.startsWith("data:image")) {
    return valor;
  }


  const pareceBase64Valido = /^[A-Za-z0-9+/]+={0,2}$/.test(valor);

  if (!pareceBase64Valido) return null;

  return `data:image/png;base64,${valor}`;
}


function getInitials(name: string): string {
  const partes = name.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "?";

  const primeira = partes[0][0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";

  return (primeira + ultima).toUpperCase();
}

//icones
const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  bell: "notifications-outline",
  search: "search-outline",
  settings: "settings-outline",
  lock: "lock-closed-outline",
  help: "help-circle-outline",
  logout: "log-out-outline",
  heart: "heart",
};

const ICONE_PADRAO: keyof typeof Ionicons.glyphMap = "ellipse-outline";

function TituloSecao({ children }: { children: string }) {
  return (
    <Text className="mb-2 mt-6 px-1 text-[13px] font-semibold text-[#333]">
      {children}
    </Text>
  );
}

function ItemMenu({
  option,
  isLast,
}: {
  option: MenuItemOption;
  isLast: boolean;
}) {
  const nomeIcone = ICONS[option.iconName] ?? ICONE_PADRAO;
  const destrutivo = option.isDestructive === true;

  return (
    <Pressable
      onPress={option.onPress}
      accessibilityRole="button"
      accessibilityLabel={option.label}
      className={`
        flex-row
        items-center
        px-4
        py-3.5
        active:bg-[#FBF5F7]
        ${!isLast ? "border-b border-[#F0EDEE]" : ""}
      `}
    >
      <View
        className={`
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          ${destrutivo ? "bg-[#FBE9E9]" : "bg-[#F4F0F2]"}
        `}
      >
        <Ionicons
          name={nomeIcone}
          size={18}
          color={destrutivo ? "#D64545" : "#6B1E42"}
        />
      </View>

      <Text
        className={`
          ml-3
          flex-1
          text-[13px]
          ${destrutivo ? "font-semibold text-[#D64545]" : "text-[#222]"}
        `}
      >
        {option.label}
      </Text>

      {!destrutivo && <Ionicons name="chevron-forward" size={16} color="#BBB" />}
    </Pressable>
  );
}

// recebe tudo via props, conforme UserProfileProps

export function UserProfileScreen({
  user,
  onEditProfile,
  onOpenFavorites,
  onNavigate,
  onLogout,
}: UserProfileProps) {
  const [avatarFalhou, setAvatarFalhou] = useState(false);

  //mudanca de foto
  useEffect(() => {
    setAvatarFalhou(false);
  }, [user.avatarBase64]);

  const avatarUri = avatarFalhou ? null : getAvatarUri(user.avatarBase64);
  const iniciais = getInitials(user.name);

  const gruposMenu: { titulo: string; itens: MenuItemOption[] }[] = [
    {
      titulo: "Preferências",
      itens: [
        {
          id: "notificacoes",
          label: "Notificações",
          iconName: "bell",
          onPress: () => onNavigate("notificacoes"),
        },
        {
          id: "preferencias-busca",
          label: "Preferências de busca",
          iconName: "search",
          onPress: () => onNavigate("preferencias-busca"),
        },
      ],
    },
    {
      titulo: "Conta",
      itens: [
        {
          id: "configuracoes",
          label: "Configurações",
          iconName: "settings",
          onPress: () => onNavigate("configuracoes"),
        },
        {
          id: "privacidade",
          label: "Privacidade",
          iconName: "lock",
          onPress: () => onNavigate("privacidade"),
        },
        {
          id: "ajuda",
          label: "Ajuda e suporte",
          iconName: "help",
          onPress: () => onNavigate("ajuda"),
        },
        {
          id: "sair",
          label: "Sair",
          iconName: "logout",
          onPress: onLogout,
          isDestructive: true,
        },
      ],
    },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView className="flex-1 bg-[#FEF8F8]" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* CABECALHO CURVO */}
        <View className="items-center rounded-b-[40px] bg-[#8D2857] px-6 pb-8 pt-14">
          <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/30 bg-[#6E7B3D]">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="h-full w-full"
                resizeMode="cover"
                onError={() => setAvatarFalhou(true)}
                accessibilityLabel={`Foto de perfil de ${user.name}`}
              />
            ) : (
              <Text className="text-2xl font-bold text-white">{iniciais}</Text>
            )}
          </View>

          <Text className="mt-3 text-lg font-bold text-white">{user.name}</Text>

          <Text className="mt-0.5 text-xs text-white/70">@{user.username}</Text>

          <Pressable
            onPress={onEditProfile}
            accessibilityRole="button"
            accessibilityLabel="Editar perfil"
            className="mt-4 rounded-full bg-[#6B1E42] px-5 py-2 active:opacity-80"
          >
            <Text className="text-xs font-semibold text-white">Editar perfil</Text>
          </Pressable>
        </View>

        {/* CARTAO DE DESTAQUE: MEUS FAVORITOS (sobrepoe a curva do cabecalho) */}
        <Pressable
          onPress={onOpenFavorites}
          accessibilityRole="button"
          accessibilityLabel={`Meus favoritos, ${user.favoritesCount} regiões salvas`}
          className="-mt-6 mx-5 flex-row items-center rounded-2xl bg-[#6B1E42] p-4 active:opacity-90"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <Ionicons name="heart" size={20} color="#FFFFFF" />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-white">Meus favoritos</Text>
            <Text className="mt-0.5 text-[11px] text-white/70">
              Regiões que você salvou
            </Text>
          </View>

          <View className="flex-row items-center rounded-full bg-white/90 px-2.5 py-1">
            <Text className="mr-0.5 text-[11px] font-semibold text-[#6B1E42]">
              {user.favoritesCount}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#6B1E42" />
          </View>
        </Pressable>

        {/* GRUPOS DE MENU */}
        <View className="px-5">
          {gruposMenu.map((grupo) => (
            <View key={grupo.titulo}>
              <TituloSecao>{grupo.titulo}</TituloSecao>

              <View
                className="overflow-hidden rounded-2xl bg-white"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                {grupo.itens.map((item, index) => (
                  <ItemMenu
                    key={item.id}
                    option={item}
                    isLast={index === grupo.itens.length - 1}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

// trocar `usuarioExemplo` pela leitura do usuário autenticado (Firebase)
// assim que o serviço correspondente estiver disponível.

const usuarioExemplo: UserProfileData = {
  id: "0",
  name: "Maria Rodrigues",
  username: "mariarodrigues_bsb",
  avatarBase64: undefined,
  favoritesCount: 2,
};


export default function UsuarioScreen() {
  const router = useRouter();

  const handleEditProfile = () => {
    //router.push("/editar-perfil");
  };

  const handleOpenFavorites = () => {
    //router.push("/favoritos");
  };

  const handleNavigate = (route: string) => {
    router.push(`/${route}` as any);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.log("Erro ao sair:", error);
    } finally {
      router.replace("/login");
    }
  };

  return (
    <UserProfileScreen
      user={usuarioExemplo}
      onEditProfile={handleEditProfile}
      onOpenFavorites={handleOpenFavorites}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}