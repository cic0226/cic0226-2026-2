import { authService } from "@/src/services/authService";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";

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

export default function CadastroScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [loading, setLoading] = useState(false);

  const criarUsuario = async () => {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe seu nome.");

      return;
    }

    if (!email.trim()) {
      Alert.alert("Atenção", "Informe seu e-mail.");

      return;
    }

    if (!senha) {
      Alert.alert("Atenção", "Informe sua senha.");

      return;
    }

    if (senha.length < 6) {
      Alert.alert("Atenção", "A senha deve possuir pelo menos 6 caracteres.");

      return;
    }

    if (!aceitouTermos) {
      Alert.alert("Atenção", "Você precisa aceitar os termos de uso.");

      return;
    }

    try {
      setLoading(true);

      const usuario = await authService.cadastrar(
        nome.trim(),
        email.trim().toLowerCase(),
        senha,
      );

      console.log("Usuário cadastrado:", usuario.uid);

      console.log("E-mail:", usuario.email);

      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");

      // router.replace("/");
    } catch (error: any) {
      console.log("Código:", error.code);

      console.log("Mensagem:", error.message);

      switch (error.code) {
        case "auth/email-already-in-use":
          Alert.alert(
            "E-mail já cadastrado",
            "Já existe uma conta utilizando este e-mail.",
          );
          break;

        case "auth/invalid-email":
          Alert.alert(
            "E-mail inválido",
            "Informe um endereço de e-mail válido.",
          );
          break;

        case "auth/weak-password":
          Alert.alert("Senha fraca", "Escolha uma senha mais forte.");
          break;

        case "auth/network-request-failed":
          Alert.alert(
            "Sem conexão",
            "Não foi possível conectar ao servidor. Verifique sua internet.",
          );
          break;

        default:
          Alert.alert("Erro", "Não foi possível realizar o cadastro.");
      }
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  const irParaLogin = () => {
    router.push("/login");
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
        contentContainerClassName="pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Imagem do cabeçalho */}

        <Image
          source={require("../assets/login/arteCabecalho.png")}
          className="h-[140px] w-full"
          resizeMode="cover"
        />

        <View className="px-6 pt-6">
          {/* Título */}

          <Text className="text-[22px] font-bold text-[#222]">
            Comece agora com o MaPeei!
          </Text>

          <Text className="mt-1 mb-5 text-xs text-[#888]">
            Crie sua conta para começar.
          </Text>

          <Text className="mt-3.5 mb-1.5 text-xs font-medium text-[#333]">
            Nome
          </Text>

          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome"
            placeholderTextColor="#999"
            autoCapitalize="words"
            autoCorrect={false}
            editable={!loading}
            returnKeyType="next"
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
          />

          <Text className="mt-3.5 mb-1.5 text-xs font-medium text-[#333]">
            E-mail
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            returnKeyType="next"
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
          />

          <Text className="mt-3.5 mb-1.5 text-xs font-medium text-[#333]">
            Senha
          </Text>

          <TextInput
            value={senha}
            onChangeText={setSenha}
            placeholder="Digite sua senha"
            placeholderTextColor="#999"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={criarUsuario}
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
          />

          <Pressable
            onPress={() => setAceitouTermos((valorAtual) => !valorAtual)}
            className="mt-[18px] flex-row items-center"
          >
            <View
              className={`
                h-4
                w-4
                items-center
                justify-center
                rounded-[3px]
                border
                ${
                  aceitouTermos
                    ? "border-[#8D2857] bg-[#8D2857]"
                    : "border-[#666] bg-transparent"
                }
              `}
            >
              {aceitouTermos && (
                <Text className="text-[10px] font-bold text-white">✓</Text>
              )}
            </View>

            <Text className="ml-[7px] text-[11px] text-[#333]">
              Li e concordo com os termos de uso
            </Text>
          </Pressable>

          <Pressable
            onPress={criarUsuario}
            disabled={loading}
            className={`
              mt-[22px]
              h-12
              items-center
              justify-center
              rounded-full
              bg-[#8D2857]
              active:opacity-80
              ${loading ? "opacity-60" : "opacity-100"}
            `}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-sm font-semibold text-white">
                Inscrever-se
              </Text>
            )}
          </Pressable>

          <Text className="my-3.5 text-center text-[11px] text-[#444]">Ou</Text>

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
            <Text className="mr-2 text-base font-bold text-[#4285F4]">G</Text>

            <Text className="text-xs text-[#222]">Inscreva-se com Google</Text>
          </Pressable>

          <View className="mt-1.5 flex-row items-center justify-center">
            <Text className="text-[11px] text-[#333]">
              Já possui uma conta?
            </Text>

            <Pressable onPress={irParaLogin}>
              <Text className="ml-1 text-[11px] font-semibold text-[#E36192]">
                Entre
              </Text>
            </Pressable>
          </View>

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
