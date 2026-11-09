import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Icon, IconButton, Page, type IconName } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { colors, ui } from '@/theme/theme';
const categories: { title: string; icon: IconName; slug: string }[] = [
  { title: 'Segurança', icon: 'shield-checkmark-outline', slug: 'seguranca' },
  { title: 'Transporte', icon: 'bus-outline', slug: 'transporte' },
  { title: 'Lazer', icon: 'sunny-outline', slug: 'lazer' },
  { title: 'Custo de vida', icon: 'wallet-outline', slug: 'custo' },
];
const content = (slug: string) => router.push({ pathname: '/conteudo/[slug]', params: { slug } });
export default function HomeScreen() {
  const { perfil } = useAuth();
  return (
    <Page>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={[ui.between, { paddingHorizontal: 22, paddingTop: 10 }]}>
          <Image
            source={require('../../../assets/passeios/logo.png')}
            style={{ width: 125, height: 77 }}
            resizeMode="contain"
            accessibilityLabel="Mapeei"
          />
          <IconButton
            name="chatbubble-ellipses-outline"
            label="Abrir mensagens privadas"
            filled
            onPress={() => router.push('/mensagens')}
          />
        </View>
        <View style={{ paddingHorizontal: 22, gap: 22 }}>
          <Text style={[ui.muted, { marginTop: 3 }]}>
            Olá, {perfil?.nome.split(' ')[0]}. Vamos explorar?
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Passeios no Distrito Federal"
            onPress={() => content('passeios')}
            style={{ borderRadius: 30, overflow: 'hidden' }}
          >
            <Image
              source={require('../../../assets/passeios/hero.png')}
              style={{ width: '100%', aspectRatio: 361 / 242 }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', '#062F3090']}
              style={{ position: 'absolute', inset: 0 }}
            />
            <View
              style={{
                position: 'absolute',
                left: 23,
                right: 23,
                bottom: 23,
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 32,
                  lineHeight: 34,
                  fontWeight: '800',
                  maxWidth: 210,
                }}
              >
                Passeios no DF
              </Text>
              <View
                style={{
                  width: 39,
                  height: 39,
                  borderRadius: 20,
                  backgroundColor: '#FFFFFF33',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="arrow-forward-outline" color="#FFFFFF" />
              </View>
            </View>
          </Pressable>
          <View style={{ gap: 3 }}>
            <Text style={ui.title}>Para saber mais</Text>
            <Text style={ui.muted}>Clique no card e explore as informações.</Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 13, paddingHorizontal: 22, paddingVertical: 18 }}
        >
          {categories.map((item) => (
            <Pressable
              key={item.slug}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              onPress={() => content(item.slug)}
              style={({ pressed }) => ({
                width: 142,
                minHeight: 126,
                borderRadius: 25,
                padding: 15,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                backgroundColor: colors.brand,
                borderWidth: 5,
                borderColor: '#FFFFFF26',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Icon name={item.icon} color="#FFFFFF" size={36} />
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                {item.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={{ paddingHorizontal: 22, gap: 21 }}>
          <Text style={ui.body}>
            Conheça caminhos, organize suas dúvidas e descubra diferentes olhares sobre o lugar onde
            você quer viver.
          </Text>
          <Pressable
            onPress={() => router.push('/forum')}
            style={[
              ui.card,
              {
                backgroundColor: colors.oliveSoft,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 15,
              },
            ]}
            accessibilityRole="button"
          >
            <Icon name="chatbubbles-outline" color={colors.olive} size={30} />
            <View style={ui.grow}>
              <Text style={[ui.heading, { fontSize: 17 }]}>Seu bairro tem assunto.</Text>
              <Text style={ui.muted}>Pergunte, compartilhe e faça conexões.</Text>
            </View>
            <Icon name="chevron-forward" color={colors.olive} size={18} />
          </Pressable>
          <Text style={ui.title}>Morando sozinho pela primeira vez?</Text>
          <Pressable
            onPress={() => content('guia')}
            accessibilityRole="button"
            accessibilityLabel="Abrir guia para morar sozinho"
            style={{
              overflow: 'hidden',
              borderTopRightRadius: 36,
              borderBottomLeftRadius: 36,
              borderTopLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            <Image
              source={require('../../../assets/passeios/guide.png')}
              style={{ width: '100%', aspectRatio: 366 / 207 }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', '#8D2857EE']}
              style={{ position: 'absolute', inset: 0 }}
            />
            <Text
              style={{
                position: 'absolute',
                left: 22,
                right: 22,
                bottom: 21,
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              Confira nosso guia <Icon name="arrow-forward" color="#FFFFFF" size={17} />
            </Text>
          </Pressable>
          <Text style={ui.body}>
            Dicas e perguntas para planejar essa nova fase com mais organização e tranquilidade.
          </Text>
        </View>
      </ScrollView>
    </Page>
  );
}
