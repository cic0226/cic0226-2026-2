import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button, Empty, Icon, Page } from '@/components/ui';
import { CONTENT } from '@/data/content';
import { colors, ui } from '@/theme/theme';
export default function ContentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const item = CONTENT[slug];
  if (!item)
    return (
      <Page title="Conteúdo" back>
        <Empty title="Conteúdo não encontrado" text="Volte para o início para continuar." />
      </Page>
    );
  return (
    <Page title={item.title} back>
      <ScrollView contentContainerStyle={ui.content}>
        <View style={[ui.card, { backgroundColor: colors.soft, gap: 12 }]}>
          <Icon name={item.icon} size={36} />
          <Text
            style={[ui.caption, { fontWeight: '700', letterSpacing: 1.3, color: colors.brand }]}
          >
            {item.eyebrow}
          </Text>
          <Text style={ui.title}>{item.intro}</Text>
        </View>
        {item.sections.map((section) => (
          <View key={section.title} style={ui.section}>
            <Text style={ui.heading}>{section.title}</Text>
            <Text style={ui.body}>{section.text}</Text>
          </View>
        ))}
        <Text style={ui.caption}>
          Conteúdo editorial inicial. As integrações com fontes de dados oficiais ainda não estão
          incluídas.
        </Text>
        <Button
          title="Conversar com a comunidade"
          icon="chatbubbles-outline"
          onPress={() => router.push('/forum')}
        />
      </ScrollView>
    </Page>
  );
}
