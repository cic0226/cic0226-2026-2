
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NomeIcone = keyof typeof Ionicons.glyphMap;

const COR_ATIVA = "#FFFFFF";
const COR_INATIVA = "#B8B8B8";

/**
 * Ícone de uma aba: quando focada, ganha o quadrado rosa com ícone branco
 * (como no protótipo); quando não, fica só o ícone cinza em contorno.
 */
function IconeAba({
  nome,
  nomeAtivo,
  focado,
}: {
  nome: NomeIcone;
  nomeAtivo: NomeIcone;
  focado: boolean;
}) {
  return (
    <View
      className={`h-11 w-11 items-center justify-center rounded-2xl ${
        focado ? "bg-[#E36192]" : ""
      }`}
    >
      <Ionicons
        name={focado ? nomeAtivo : nome}
        size={22}
        color={focado ? COR_ATIVA : COR_INATIVA}
      />
    </View>
  );
}

export default function TabsLayout() {
  // Respeita a área segura (barra de gestos do Android/iOS)
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute", // flutua sobre o conteúdo
          left: 20,
          right: 20,
          bottom: insets.bottom + 12,
          height: 64,
          borderRadius: 32,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          paddingTop: 0,
          paddingBottom: 0,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        },
        tabBarItemStyle: {
          height: 64,
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      {/* O "name" precisa ser IGUAL ao nome do arquivo dentro de (tabs) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <IconeAba nome="home-outline" nomeAtivo="home" focado={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="forum"
        options={{
          title: "Fórum",
          tabBarAccessibilityLabel: "Fórum",
          tabBarIcon: ({ focused }) => (
            <IconeAba
              nome="chatbox-ellipses-outline"
              nomeAtivo="chatbox-ellipses"
              focado={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarAccessibilityLabel: "Chat",
          tabBarIcon: ({ focused }) => (
            <IconeAba
              nome="chatbubbles-outline"
              nomeAtivo="chatbubbles"
              focado={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="usuarios"
        options={{
          title: "Perfil",
          tabBarAccessibilityLabel: "Perfil",
          tabBarIcon: ({ focused }) => (
            <IconeAba
              nome="person-circle-outline"
              nomeAtivo="person-circle"
              focado={focused}
            />
          ),
        }}
      />

      {/* <Tabs.Screen
        name="forum"
        options={{
          title: "Forum",
          tabBarAccessibilityLabel: "Forum",
          tabBarIcon: ({ focused }) => (
            <IconeAba
              nome="compass"
              nomeAtivo="compass-outline"
              focado={focused}
            />
          ),
        }}
      /> */}
    </Tabs>
  );
}