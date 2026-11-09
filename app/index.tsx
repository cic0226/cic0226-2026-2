<<<<<<< Updated upstream:app/index.tsx
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";

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

import { useEffect, useState } from "react";

import { authService } from "../src/services/authService";
import { useAuth } from "../src/services/context/AuthContext";

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
      // O redirecionamento é feito abaixo, assim que o Firebase confirmar
      // o usuário autenticado (volta à tela anterior ou vai para /passeios).
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

  // "/" é a tela de login, mas o app pode ser usado como visitante.
  const { user, carregando } = useAuth();
  const { voltar } = useLocalSearchParams<{ voltar?: string }>();

  // voltar=1: o visitante veio de uma ação que exige login (comentar,
  // curtir...). Depois de entrar, voltamos para onde ele estava.
  const veioDeUmaAcao = voltar === "1" && router.canGoBack();

  useEffect(() => {
    if (user && veioDeUmaAcao) router.back();
  }, [user, veioDeUmaAcao, router]);

  const continuarComoVisitante = () => {
    if (veioDeUmaAcao) router.back();
    else router.replace("/passeios");
  };

  if (carregando || (user && veioDeUmaAcao)) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FEF8F8]">
        <ActivityIndicator color="#8D2857" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/passeios" />;
  }

=======
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AuthShell, Button, ErrorNotice, Field } from '@/components/ui';
import { useAction } from '@/hooks/useAction';
import { authService } from '@/services/authService';
import { colors, ui } from '@/theme/theme';
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const action = useAction();
  const submit = () => {
    void action.run(() => authService.login(email, senha));
  };
>>>>>>> Stashed changes:app/(auth)/login.tsx
  return (
    <AuthShell
      title="Bem-vindo(a) de volta!"
      subtitle="Entre com suas credenciais para acessar sua conta."
    >
      <Field
        label="E-mail"
        placeholder="Digite seu e-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        editable={!action.busy}
      />
      <Field
        label="Senha"
        placeholder="Digite sua senha"
        value={senha}
        onChangeText={setSenha}
        password
        autoCapitalize="none"
        autoComplete="current-password"
        editable={!action.busy}
        onSubmitEditing={submit}
        returnKeyType="go"
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/recuperar-senha')}
        style={{ alignSelf: 'flex-end', minHeight: 40, justifyContent: 'center' }}
      >
<<<<<<< Updated upstream:app/index.tsx
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

          {/* VISITANTE */}

          <Pressable
            onPress={continuarComoVisitante}
            accessibilityRole="button"
            className="mt-4 h-11 items-center justify-center rounded-full border border-[#8D2857] active:bg-[#FBE9F1]"
          >
            <Text className="text-xs font-semibold text-[#8D2857]">
              Continuar como visitante
            </Text>
          </Pressable>

          <Text className="mt-2 text-center text-[10px] text-[#999]">
            Visitantes podem navegar, mas precisam entrar para comentar,
            curtir ou enviar mensagens.
          </Text>

          {/* LOGO */}

          <Image
            source={require("../assets/login/logoMapeei.png")}
            className="mt-6 h-[100px] w-[100px] self-center"
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </>
=======
        <Text style={{ color: colors.pink, fontWeight: '600', fontSize: 13 }}>
          Esqueceu sua senha?
        </Text>
      </Pressable>
      <ErrorNotice message={action.error} />
      <Button title="Entrar" onPress={submit} busy={action.busy} />
      <Text style={[ui.caption, { textAlign: 'center' }]}>
        Sua sessão permanece conectada até você sair.
      </Text>
      <View style={[ui.row, { justifyContent: 'center', flexWrap: 'wrap' }]}>
        <Text style={ui.muted}>Ainda não tem uma conta?</Text>
        <Pressable
          onPress={() => router.push('/cadastro')}
          accessibilityRole="button"
          style={{ paddingVertical: 10 }}
        >
          <Text style={{ color: colors.brand, fontWeight: '700' }}>Cadastre-se</Text>
        </Pressable>
      </View>
    </AuthShell>
>>>>>>> Stashed changes:app/(auth)/login.tsx
  );
}
