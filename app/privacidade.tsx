import { ScrollView, Text, View } from 'react-native';
import { Page } from '@/components/ui';
import { ui } from '@/theme/theme';
export default function PrivacidadeScreen() {
  return (
    <Page title="Seus dados" back>
      <ScrollView contentContainerStyle={ui.content}>
        <Text style={ui.body}>
          Esta tela explica o funcionamento técnico desta versão do Mapeei. Não substitui uma
          política de privacidade revisada para publicação do aplicativo.
        </Text>
        {[
          [
            'Nome e foto',
            'São exibidos para outros membros autenticados em publicações, comentários e conversas. A foto é compactada e salva em Base64 no seu perfil e em uma cópia pública de exibição. Base64 é um formato de dados, não uma forma de criptografia.',
          ],
          [
            'E-mail e senha',
            'O e-mail do documento de perfil só pode ser lido pelo próprio titular nas regras do aplicativo. A senha é tratada pelo Firebase Authentication e não é gravada em documentos do Firestore.',
          ],
          [
            'Conversas privadas',
            'As regras restringem a leitura aos dois participantes. O chat não tem criptografia ponta a ponta: administradores autorizados do projeto Firebase podem acessar os dados por ferramentas administrativas.',
          ],
          [
            'Bloqueios',
            'No chat, você pode bloquear a outra pessoa. O bloqueio impede novas mensagens nos dois sentidos, mas não apaga o histórico.',
          ],
          [
            'Uso responsável',
            'Evite compartilhar endereço completo, documentos, senhas ou dados sensíveis nas publicações. Esta versão não possui exclusão de conta pela interface nem moderação administrativa.',
          ],
        ].map(([title, text]) => (
          <View key={title} style={ui.section}>
            <Text style={ui.heading}>{title}</Text>
            <Text style={ui.body}>{text}</Text>
          </View>
        ))}
      </ScrollView>
    </Page>
  );
}
