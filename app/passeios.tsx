import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const categories = [
  {
    title: "Segurança",
    icon: "shield-checkmark-outline" as const,
  },
  {
    title: "Transporte",
    icon: "bus-outline" as const,
  },
  {
    title: "Lazer",
    icon: "wine-outline" as const,
  },
  {
    title: "Custo de vida",
    icon: "wallet-outline" as const,
  },
];

export default function PasseiosScreen() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 110,
        }}
      >
        <View className="items-center px-5 pt-10">

          {/* LOGO */}
          <Image
            source={require("../assets/passeios/logo.png")}
            resizeMode="contain"
            className="h-auto w-full"
          />

          {/* BANNER */}
          <div className="relative ">
            <Image
                source={require("../assets/passeios/hero.png")}
                resizeMode="cover"
                className="mt-4 h-auto p-0 mx-0 w-full rounded-[30px]"
            />
            <Text className="text-[32px] font-extrabold leading-[34px] text-white bottom-0 left-0 absolute mb-6 ml-6 w-44">
              Passeios no DF
            </Text>
          </div>
          

          {/* TÍTULO */}
          <View className="mt-5 w-full">
            <Text className="text-[32px] font-extrabold leading-[34px] text-black">
              Para saber mais
            </Text>

            <Text className="text-[15px] leading-5 text-neutral-400">
              clique no card para navegar pelas informações
            </Text>
          </View>

          {/* CARDS */}
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4 w-[calc(100%+56px)]"
            contentContainerStyle={{
                paddingHorizontal: 28,
                gap: 16,
            }}
        >
        {categories.map((category) => (
            <Pressable
            key={category.title}
            onPress={() => router.push("/")}
            className="h-32 w-40 overflow-hidden rounded-[28px] bg-[#92184F]"
            style={({ pressed }) => ({
                opacity: pressed ? 0.82 : 1,

                shadowColor: "#000",
                shadowOpacity: 0.28,
                shadowRadius: 8,
                shadowOffset: {
                width: 0,
                height: 6,
                },

                elevation: 6,
            })}
            >
            {/* BRILHO NAS BORDAS */}
            <View
                pointerEvents="none"
                className="absolute inset-0 rounded-[28px] border-[7px] border-white/10"
            />

            {/* BRILHO MAIS FORTE NA BORDA SUPERIOR */}
            <View
                pointerEvents="none"
                className="absolute inset-x-0 top-0 h-8 rounded-t-[28px] bg-white/10"
            />

            {/* CONTEÚDO */}
            <View className="flex-1 items-center justify-center p-4">
                <Ionicons
                name={category.icon}
                size={42}
                color="white"
                />

                <Text className="mt-1 text-[17px] font-extrabold text-white">
                {category.title}
                </Text>
            </View>
            </Pressable>
        ))}
        </ScrollView>

          {/* TEXTO EXPLICATIVO */}
          <View className="mt-5 w-full px-1">
            <Text className="text-[16px] leading-[21px] text-black">
              Para ajudar você a tomar decisões com mais
              confiança, reunimos informações de{" "}
              <Text className="font-extrabold">
                fontes oficiais e dados públicos
              </Text>{" "}
              sobre segurança,
              transporte, comércio/lazer e custo de vida,
              juntamente dos{" "}
              <Text className="font-extrabold">
                relatos de moradores reais!
              </Text>
            </Text>

            <Text className="mt-3 text-[16px] leading-[21px] text-black">
              Navegue por dados destrinchados e fáceis de
              entender, e sinta-se com repertório sobre o
              contexto local das diferentes regiões do Brasil.
            </Text>
          </View>

          {/* TÍTULO DO GUIA */}
          <Text className="mt-4 w-full text-[31px] font-extrabold leading-[32px] text-black">
            Morando sozinho pela
            primeira vez?
          </Text>

          {/* CARD DO GUIA */}
          <Pressable
            onPress={() => router.push("/")}
            className="mt-3 h-auto w-auto overflow-hidden rounded-tr-[40px] rounded-bl-[40px]"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 5,
              shadowOffset: {
                width: 0,
                height: 3,
              },
              elevation: 4,
            }}
          >
            <Image
              source={require("../assets/passeios/guide.png")}
              resizeMode="cover"
            />
            {/* DEGRADÊ */}
            <LinearGradient
                colors={[
                "transparent",
                "rgba(146, 24, 79, 0.15)",
                "rgba(146, 24, 79, 0.65)",
                "#92184F",
                ]}
                locations={[0, 0.35, 0.65, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="absolute inset-0"
            />

            <View className="absolute inset-x-0 bottom-0 h-14 justify-center  px-6">
              <Text className="text-[16px] font-extrabold text-white">
                Clique aqui para conferir nosso guia!
              </Text>
            </View>
          </Pressable>

          {/* TEXTO DO GUIA */}
          <Text className="mt-4 w-full px-1 text-[16px] leading-[21px] text-black">
            Nosso guia reúne dicas práticas, checklists,
            explicações de termos comuns do mercado
            imobiliário e orientações para ajudar você a se
            preparar com mais segurança e tranquilidade
            para essa nova fase.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}



      {/* BARRA INFERIOR */}
      <View
        className="absolute bottom-5 left-7 right-7 h-12 flex-row items-center justify-around rounded-full bg-white px-4"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.14,
          shadowRadius: 10,
          shadowOffset: {
            width: 0,
            height: 3,
          },
          elevation: 7,
        }}
      >
        {/* HOME */}
        <Pressable
          onPress={() => router.push("/")}
          className="items-center justify-center"
        >
          <Ionicons
            name="home"
            size={26}
            color="#E75A9C"
          />
        </Pressable>

        {/* BUSCA */}
        <Pressable className="items-center justify-center">
          <Ionicons
            name="search-outline"
            size={26}
            color="#CFCFCF"
          />
        </Pressable>

        {/* CHAT */}
        <Pressable className="items-center justify-center">
          <Ionicons
            name="chatbubbles-outline"
            size={26}
            color="#CFCFCF"
          />
        </Pressable>

        {/* PERFIL */}
        <Pressable className="items-center justify-center">
          <Ionicons
            name="person-circle-outline"
            size={27}
            color="#CFCFCF"
          />
        </Pressable>
      </View>
