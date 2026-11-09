import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button, Empty, ErrorNotice, Icon, IconButton, Page } from '@/components/ui';
import { useFavorites } from '@/context/FavoritesContext';
import { useAction } from '@/hooks/useAction';
import { REGIOES } from '@/data/regions';
import { colors, ui } from '@/theme/theme';
export default function RegionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const region = REGIOES.find((item) => item.id === id);
  const favorite = useFavorites();
  const action = useAction();
  if (!region)
    return (
      <Page title="Região" back>
        <Empty
          title="Região não encontrada"
          text="Volte e escolha um item do catálogo inicial."
          icon="location-outline"
        />
      </Page>
    );
  return (
    <Page
      title={region.nome}
      back
      right={
        <IconButton
          label={favorite.has('regiao', id) ? 'Remover favorito' : 'Favoritar região'}
          name={favorite.has('regiao', id) ? 'heart' : 'heart-outline'}
          disabled={action.busy || favorite.loading}
          onPress={() =>
            action.run(() => favorite.toggle({ tipo: 'regiao', refId: id, titulo: region.nome }))
          }
        />
      }
    >
      <ScrollView contentContainerStyle={ui.content}>
        <View style={[ui.card, { backgroundColor: colors.oliveSoft, minHeight: 155, gap: 16 }]}>
          <Icon name="map-outline" size={42} color={colors.olive} />
          <Text style={ui.title}>{region.nome}</Text>
          <Text style={ui.body}>{region.subtitulo}</Text>
        </View>
        <ErrorNotice message={action.error} />
        <Text style={ui.heading}>O que você quer descobrir?</Text>
        <Text style={ui.body}>
          Pergunte sobre moradia, transporte ou lazer. As publicações são relatos da comunidade, não
          indicadores oficiais.
        </Text>
        <Button
          title="Ver conversas desta região"
          icon="chatbubbles-outline"
          onPress={() => router.push({ pathname: '/forum', params: { regiao: region.nome } })}
        />
        <Button
          title="Fazer uma pergunta"
          variant="secondary"
          onPress={() => router.push({ pathname: '/forum/nova', params: { regiao: region.nome } })}
        />
        <Text style={ui.caption}>
          Não há preços, imóveis ou notas de segurança cadastrados nesta primeira entrega.
        </Text>
      </ScrollView>
    </Page>
  );
}
