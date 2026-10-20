import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Empty, Field, Icon, Page } from '@/components/ui';
import { REGIOES } from '@/data/regions';
import { normalizar } from '@/utils/validation';
import { colors, ui } from '@/theme/theme';
export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const data = useMemo(
    () => REGIOES.filter((item) => normalizar(item.nome).includes(normalizar(search))),
    [search],
  );
  return (
    <Page title="Pesquisar" subtitle="Regiões administrativas do DF">
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={ui.content}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View style={{ gap: 16, marginBottom: 22 }}>
            <Field
              value={search}
              onChangeText={setSearch}
              placeholder="Qual região você quer conhecer?"
            />
            <Text style={ui.muted}>Uma seleção inicial para explorar e conversar.</Text>
          </View>
        }
        ListEmptyComponent={
          <Empty
            icon="search-outline"
            title="Nenhum resultado"
            text="Experimente outro nome de região."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/regiao/[id]', params: { id: item.id } })}
            accessibilityRole="button"
            accessibilityLabel={`Explorar ${item.nome}`}
            style={[ui.card, ui.row, { paddingVertical: 20 }]}
          >
            <View
              style={{
                width: 54,
                height: 58,
                borderRadius: 19,
                backgroundColor: colors.soft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="location-outline" size={28} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[ui.heading, { fontSize: 18 }]}>{item.nome}</Text>
              <Text style={ui.muted}>{item.subtitulo}</Text>
            </View>
            <Icon name="chevron-forward" size={17} color={colors.muted} />
          </Pressable>
        )}
      />
    </Page>
  );
}
