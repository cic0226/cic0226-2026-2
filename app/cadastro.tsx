import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

export default function LoginScreen() {
  return (
    <ScrollView
        
    style={styles.container}
        contentContainerStyle={styles.scrollContent}>
          
        {/*as imagens de cadastro sao as mesmas de login*/}
        <Image source={require("../assets/login/arteCabecalho.png")}style={styles.headerImage}/>
      
        <View style={styles.content}>
    
        
            <Text style={styles.title}>Comece agora com o MaPeei!</Text>
            
            <Text style={styles.label}>Nome</Text>

            <TextInput style={styles.input} placeholder="Digite seu nome" />

            <Text style={styles.label}>E-mail</Text>
            
            <TextInput style={styles.input} placeholder="Digite seu e-mail" />

            <Text style={styles.label}>Senha</Text>

            <TextInput style={styles.input}placeholder="Digite sua senha"secureTextEntry/>


            <View style={styles.termsCheckContainer}>
            <Pressable style={styles.checkbox} />
            <Text style={styles.rememberText}>Li e concordo com os termos de uso</Text>
            </View>

            <Pressable style={styles.mainButton}>
            <Text style={styles.mainButtonText}>Inscrever-se</Text>
            </Pressable>

            <Text style={styles.orText}>Ou</Text>

            {/* botao Apple */}
            <Pressable style={styles.socialButton}>
            <Text style={styles.socialIcon}></Text>
            <Text style={styles.socialButtonText}>Inscreva-se com Apple</Text>
            </Pressable>

            {/* botao Google */}
            <Pressable style={styles.socialButton}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.socialButtonText}>Inscreva-se com Google</Text>
            </Pressable>
            
            
            <View style={styles.aredyAccountContainer}>
                <Text style={styles.aredyAccountText}>Já possui uma conta?</Text>
                
                <Pressable>
                    <Text style={styles.loginLink}>Entre</Text>
                </Pressable>
            </View>

        </View>
        
        <Image source={require("../assets/login/logoMapeei.png")}style={styles.logoContainer}resizeMode="contain"/>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  
  //logo mapeei roda pe
  logoContainer: {
    alignSelf: "center",
    marginTop: 24,
    width: 100,
    height:100,
  },
//logo mapeei roda pe
    
    
    
  
  container: {
    flex: 1,
    backgroundColor: "#FEF8F8",
  },

  scrollContent: {
    paddingBottom: 30,
  },

  headerImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    marginTop: 4,
    marginBottom: 20,
    fontSize: 12,
    color: "#888",
  },

  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    marginTop: 14,
    marginBottom: 6,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFF",
    fontSize: 13,
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
    fontSize: 11,
    color: "#E36192",
    fontWeight: "600",
  },

  termsCheckContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },

  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 3,
  },

  rememberText: {
    marginLeft: 7,
    fontSize: 11,
    color: "#333",
  },

  mainButton: {
    height: 48,
    backgroundColor: "#8D2857",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  mainButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  orText: {
    textAlign: "center",
    marginVertical: 14,
    fontSize: 11,
    color: "#444",
  },

  socialButton: {
    height: 44,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    marginBottom: 12,
  },

  socialIcon: {
    fontSize: 18,
    marginRight: 8,
    color: "#000",
  },

  googleIcon: {
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },

  socialButtonText: {
    fontSize: 12,
    color: "#222",
  },

  aredyAccountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },

  aredyAccountText: {
    fontSize: 11,
    color: "#333",
  },

  loginLink: {
    marginLeft: 4,
    fontSize: 11,
    color: "#E36192",
    fontWeight: "600",
  },

  logo: {
    width: 90,
    height: 40,
    alignSelf: "center",
    marginTop: 24,
  },
});