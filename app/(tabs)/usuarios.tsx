import { useRouter } from "expo-router";

import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { doc, getDoc, setDoc } from "firebase/firestore";

import { Ionicons } from "@expo/vector-icons";

import { authService } from "../../src/services/authService";

import { auth, db } from "../../src/services/firebase/firebase";

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
  isUpdatingAvatar?: boolean; // true enquanto a foto está sendo buscada/salva
}

// ============================================================================
// FIRESTORE: campo da foto de perfil (Base64) na collection de usuários
// ============================================================================

/**
 * Nome da collection de usuários e do campo que guarda a foto de perfil em
 * Base64. O Firestore não tem schema fixo: esse campo passa a existir no
 * documento automaticamente na primeira vez que `salvarAvatarBase64` roda.
 * Ajuste os valores abaixo se sua collection/campo já tiverem outro nome.
 */
const COLECAO_USUARIOS = "usuarios";
const CAMPO_AVATAR_BASE64 = "avatarBase64";

/** Busca o Base64 da foto de perfil salvo no Firestore para o usuário informado. */
async function buscarAvatarBase64(uid: string): Promise<string | undefined> {
  const referencia = doc(db, COLECAO_USUARIOS, uid);
  const snapshot = await getDoc(referencia);

  if (!snapshot.exists()) return undefined;

  const dados = snapshot.data();
  const valor = dados[CAMPO_AVATAR_BASE64];

  return typeof valor === "string" ? valor : undefined;
}

/**
 * Salva (ou atualiza) o Base64 da foto de perfil no documento do usuário.
 * Usa `setDoc` com `merge: true` em vez de `updateDoc` para funcionar mesmo
 * que o campo (ou o documento inteiro) ainda não exista.
 */
async function salvarAvatarBase64(
  uid: string,
  avatarBase64: string,
): Promise<void> {
  const referencia = doc(db, COLECAO_USUARIOS, uid);
  await setDoc(referencia, { [CAMPO_AVATAR_BASE64]: avatarBase64 }, { merge: true });
}

// ============================================================================
// EXIBIÇÃO: valida/normaliza o Base64 lido do Firestore para o <Image>
// ============================================================================

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

// ============================================================================
// CAPTURA: escolher/tirar uma foto e converter para Base64 (para armazenar)
// ============================================================================

/**
 * Abre a câmera ou a galeria (conforme `fonte`), pede a permissão necessária
 * e devolve a foto escolhida já em Base64 (com o prefixo "data:image/..."),
 * pronta para ser enviada ao Firestore. Devolve null se o usuário cancelar
 * ou negar a permissão.
 *
 * Observação sobre tamanho: Base64 aumenta o tamanho do arquivo em ~33% e
 * o Firestore tem limite de 1MB por documento. Por isso a foto é recortada
 * em quadrado e comprimida (quality: 0.5). Para fotos ainda maiores,
 * considere reduzir mais a resolução com `expo-image-manipulator` antes de
 * gerar o Base64 final.
 */
async function escolherImagemComoBase64(
  fonte: "galeria" | "camera",
): Promise<string | null> {
  const permissao =
    fonte === "galeria"
      ? await ImagePicker.requestMediaLibraryPermissionsAsync()
      : await ImagePicker.requestCameraPermissionsAsync();

  if (!permissao.granted) {
    Alert.alert(
      "Permissão necessária",
      fonte === "galeria"
        ? "Precisamos de acesso à sua galeria para escolher uma foto."
        : "Precisamos de acesso à câmera para tirar uma foto.",
    );
    return null;
  }

  const opcoes: ImagePicker.ImagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    base64: true,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  };

  const resultado =
    fonte === "galeria"
      ? await ImagePicker.launchImageLibraryAsync(opcoes)
      : await ImagePicker.launchCameraAsync(opcoes);

  if (resultado.canceled) return null;

  const asset = resultado.assets[0];

  if (!asset.base64) return null;

  const mime = asset.mimeType ?? "image/jpeg";

  return `data:${mime};base64,${asset.base64}`;
}

/**
 * Pergunta ao usuário se a foto vem da câmera ou da galeria, executa a
 * captura/seleção e devolve o Base64 resultante (ou null se ele cancelar
 * em qualquer etapa).
 */
function escolherFonteEImagem(): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert("Editar foto de perfil", "Escolha a origem da imagem", [
      {
        text: "Câmera",
        onPress: async () => resolve(await escolherImagemComoBase64("camera")),
      },
      {
        text: "Galeria",
        onPress: async () =>
          resolve(await escolherImagemComoBase64("galeria")),
      },
      { text: "Cancelar", style: "cancel", onPress: () => resolve(null) },
    ]);
  });
}

// Mapa de ícones disponíveis para os itens de menu
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

// ============================================================================
// SUBCOMPONENTES
// ============================================================================

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

// ============================================================================
// COMPONENTE DE APRESENTAÇÃO (recebe tudo via props, conforme UserProfileProps)
// ============================================================================

export function UserProfileScreen({
  user,
  onEditProfile,
  onOpenFavorites,
  onNavigate,
  onLogout,
  isUpdatingAvatar = false,
}: UserProfileProps) {
  const [avatarFalhou, setAvatarFalhou] = useState(false);

  // mudança de foto: se o Base64 do usuário mudar, damos uma nova chance à imagem
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
      {/* <Stack.Screen options={{ headerShown: false }} /> */}

      <ScrollView className="flex-1 bg-[#FEF8F8]" contentContainerStyle={{ paddingBottom: 110 }}>
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

            {isUpdatingAvatar && (
              <View className="absolute inset-0 items-center justify-center bg-black/40">
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </View>

          <Text className="mt-3 text-lg font-bold text-white">{user.name}</Text>

          <Text className="mt-0.5 text-xs text-white/70">@{user.username}</Text>

          {/* Ao tocar, abre a câmera/galeria e salva a nova foto no Firestore */}
          <Pressable
            onPress={onEditProfile}
            disabled={isUpdatingAvatar}
            accessibilityRole="button"
            accessibilityLabel="Editar perfil: alterar foto"
            className={`mt-4 rounded-full bg-[#6B1E42] px-5 py-2 active:opacity-80 ${
              isUpdatingAvatar ? "opacity-60" : ""
            }`}
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

// ============================================================================
// TELA (rota "usuario"): conecta o componente de apresentação acima aos
// dados reais e à navegação do app.
// ============================================================================

// Placeholder para nome/username/favoritos enquanto essa parte não vem do
// Firebase. O avatarBase64 abaixo É sobrescrito pelo valor real do
// Firestore assim que a tela carrega (useEffect em UsuarioScreen).
const usuarioPlaceholder: UserProfileData = {
  id: "0",
  name: "unamed",
  username: "unamed",
  avatarBase64: undefined,
  favoritesCount: 0,
};

export default function UsuarioScreen() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UserProfileData>(usuarioPlaceholder);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  // Busca o avatar salvo no Firestore assim que a tela carrega
  useEffect(() => {
    const uid = auth.currentUser?.uid;

    if (!uid) return;

    setIsUpdatingAvatar(true);

    buscarAvatarBase64(uid)
      .then((avatarBase64) => {
        setUsuario((atual) => ({ ...atual, id: uid, avatarBase64 }));
      })
      .catch((error) => {
        console.log("Erro ao buscar foto de perfil:", error);
      })
      .finally(() => {
        setIsUpdatingAvatar(false);
      });
  }, []);

  // Clique em "Editar perfil": abre câmera/galeria, converte para Base64 e
  // salva no Firestore (collection "usuarios", campo "avatarBase64").
  const handleEditProfile = async () => {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      Alert.alert(
        "Sessão expirada",
        "Faça login novamente para editar sua foto de perfil.",
      );
      return;
    }

    setIsUpdatingAvatar(true);

    try {
      const novoAvatarBase64 = await escolherFonteEImagem();

      if (!novoAvatarBase64) return; // usuário cancelou a seleção

      // Atualiza a tela imediatamente...
      setUsuario((atual) => ({ ...atual, avatarBase64: novoAvatarBase64 }));

      // ...e persiste no Firestore
      await salvarAvatarBase64(uid, novoAvatarBase64);
    } catch (error) {
      console.log("Erro ao atualizar foto de perfil:", error);
      Alert.alert(
        "Erro",
        "Não foi possível salvar a nova foto. Tente novamente.",
      );
    } finally {
      setIsUpdatingAvatar(false);
    }
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
      user={usuario}
      onEditProfile={handleEditProfile}
      onOpenFavorites={handleOpenFavorites}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      isUpdatingAvatar={isUpdatingAvatar}
    />
  );
}