import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Empty, ErrorNotice, Icon, IconButton, Loading, Page } from '@/components/ui';
import { useFavorites } from '@/context/FavoritesContext';
import { useAction } from '@/hooks/useAction';
import { ui } from '@/theme/theme';
export default function FavoritesScreen() {
  const favorite = useFavorites();
  const action = useAction();
  return (
    <Page title="Meus favoritos" back>
      <FlatList
        data={favorite.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={ui.content}
        ListHeaderComponent={<ErrorNotice message={action.error || favorite.error} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          favorite.loading ? (
            <Loading />
          ) : (
            <Empty
              icon="heart-outline"
              title="Guarde suas descobertas"
              text="Salve regiões e publicações para encontrar tudo por aqui."
            />
          )
        }
        renderItem={({ item }) => (
          <View style={[ui.card, ui.row]}>
            <Pressable
              accessibilityRole="button"
              style={[ui.row, ui.grow]}
              onPress={() =>
                router.push({
                  pathname: item.tipo === 'regiao' ? '/regiao/[id]' : '/forum/[id]',
                  params: { id: item.refId },
                })
              }
            >
              <Icon name={item.tipo === 'regiao' ? 'location-outline' : 'chatbubbles-outline'} />
              <View style={ui.grow}>
                <Text style={[ui.heading, { fontSize: 16 }]}>{item.titulo}</Text>
                <Text style={ui.caption}>{item.tipo === 'regiao' ? 'Região' : 'Publicação'}</Text>
              </View>
            </Pressable>
            <IconButton
              label="Remover favorito"
              name="heart"
              disabled={action.busy}
              onPress={() => action.run(() => favorite.toggle(item))}
            />
          </View>
        )}
      />
    </Page>
  );
}
