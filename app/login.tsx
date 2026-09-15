import { Stack, useRouter } from "expo-router";

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useState } from "react";

import { authService } from "../src/services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);

  const fazerLogin = async () => {
    // Validação simples
    if (!email.trim()) {
      Alert.alert("Atenção", "Informe seu e-mail.");
      return;
    }

    if (!senha) {
      Alert.alert("Atenção", "Informe sua senha.");
      return;
    }

    try {
      setLoading(true);

      const credential = await authService.login(email.trim(), senha);

      console.log("Usuário logado:", credential.user.uid);

      console.log("E-mail:", credential.user.email);

      Alert.alert("Sucesso", "Login realizado com sucesso!");
    } catch (error: any) {
      console.log("Código:", error.code);
      console.log("Mensagem:", error.message);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        Alert.alert("Erro", "E-mail ou senha inválidos.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Erro", "O e-mail informado é inválido.");
      } else if (error.code === "auth/too-many-requests") {
        Alert.alert(
          "Erro",
          "Muitas tentativas de login. Tente novamente mais tarde.",
        );
      } else {
        Alert.alert("Erro", "Não foi possível realizar o login.");
      }
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  const irParaCadastro = () => {
    router.push("/cadastro");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        className="flex-1 bg-[#FEF8F8]"
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../assets/login/arteCabecalho.png")}
          className="h-[140px] w-full"
          resizeMode="cover"
        />

        <View className="px-6 pt-6 pb-8">
          <Text className="text-[22px] font-bold text-[#222]">
            Bem-vindo(a) de volta!
          </Text>

          <Text className="mt-1 mb-5 text-xs text-[#888]">
            Entre com suas credenciais para acessar sua conta.
          </Text>

          {/* E-MAIL */}

          <Text className="mt-3.5 mb-1.5 text-xs font-medium text-[#333]">
            E-mail
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            className="
              h-[46px]
              rounded-xl
              border
              border-[#DDD]
              bg-white
              px-3.5
              text-[13px]
              text-[#222]
              focus:border-[#8D2857]
            "
            placeholder="Digite seu e-mail"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {/* SENHA */}

          <Text className="mt-3.5 mb-1.5 text-xs font-medium text-[#333]">
            Senha
          </Text>

          <TextInput
            value={senha}
            onChangeText={setSenha}
            className="
              h-[46px]
              rounded-xl
              border
              border-[#DDD]
              bg-white
              px-3.5
              text-[13px]
              text-[#222]
              focus:border-[#8D2857]
            "
            placeholder="Digite sua senha"
            placeholderTextColor="#999"
            secureTextEntry
            editable={!loading}
            onSubmitEditing={fazerLogin}
          />

          {/* ESQUECEU SENHA */}

          <Pressable>
            <Text className="mt-2 self-end text-[11px] font-semibold text-[#E36192]">
              Esqueceu sua senha?
            </Text>
          </Pressable>

          {/* LEMBRAR DE MIM */}

          <View className="mt-[18px] flex-row items-center">
            <Pressable
              className="
                h-4
                w-4
                rounded-[3px]
                border
                border-[#666]
              "
            />

            <Text className="ml-[7px] text-[11px] text-[#333]">
              Lembrar de mim
            </Text>
          </View>

          {/* LOGIN */}

          <Pressable
            onPress={fazerLogin}
            disabled={loading}
            className={`
              mt-[22px]
              h-12
              items-center
              justify-center
              rounded-full
              bg-[#8D2857]
              active:opacity-80
              ${loading ? "opacity-60" : ""}
            `}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-sm font-semibold text-white">Login</Text>
            )}
          </Pressable>

          <Text className="my-3.5 text-center text-[11px] text-[#444]">Ou</Text>

          {/* APPLE */}

          <Pressable
            className="
              mb-3
              h-11
              flex-row
              items-center
              justify-center
              rounded-full
              border
              border-[#DDD]
              bg-white
              active:bg-gray-50
            "
          >
            <Text className="mr-2 text-lg text-black"></Text>

            <Text className="text-xs text-[#222]">Inscreva-se com Apple</Text>
          </Pressable>

          {/* GOOGLE */}

          <Pressable
            className="
              mb-3
              h-11
              flex-row
              items-center
              justify-center
              rounded-full
              border
              border-[#DDD]
              bg-white
              active:bg-gray-50
            "
          >
            <Text className="mr-2 text-base font-bold">G</Text>

            <Text className="text-xs text-[#222]">Inscreva-se com Google</Text>
          </Pressable>

          {/* CRIAR CONTA */}

          <View className="mt-1.5 flex-row items-center justify-center">
            <Text className="text-[11px] text-[#333]">Não tem uma conta?</Text>

            <Pressable onPress={irParaCadastro}>
              <Text className="ml-1 text-[11px] font-semibold text-[#E36192]">
                Crie agora
              </Text>
            </Pressable>
          </View>

          {/* LOGO */}

          <Image
            source={require("../assets/login/logoMapeei.png")}
            className="mt-6 h-[100px] w-[100px] self-center"
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </>
  );
}
