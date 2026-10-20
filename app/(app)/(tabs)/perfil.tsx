import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Avatar, Button, Icon, Page, type IconName } from '@/components/ui';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAction } from '@/hooks/useAction';
import { authService } from '@/services/authService';
import { colors, ui } from '@/theme/theme';
export default function ProfileScreen() {
  const { perfil } = useAuth();
  const favorites = useFavorites();
  const action = useAction();
  const [confirm, setConfirm] = useState(false);
  const rows: { label: string; icon: IconName; route: Href }[] = [
    { label: 'Minhas conversas', icon: 'chatbubble-ellipses-outline', route: '/mensagens' },
    { label: 'Meus favoritos', icon: 'heart-outline', route: '/favoritos' },
    {
      label: 'Editar perfil e região de interesse',
      icon: 'settings-outline',
      route: '/perfil/editar',
    },
    { label: 'Privacidade e uso dos dados', icon: 'lock-closed-outline', route: '/privacidade' },
    {
      label: 'Ajuda e suporte',
      icon: 'help-circle-outline',
      route: { pathname: '/conteudo/[slug]', params: { slug: 'ajuda' } },
    },
  ];
  return (
    <Page>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View
          style={{
            backgroundColor: colors.brand,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            paddingHorizontal: 24,
            paddingTop: 30,
            paddingBottom: 31,
            alignItems: 'center',
            gap: 11,
          }}
        >
          <View style={{ padding: 4, borderRadius: 60, backgroundColor: '#FFFFFF38' }}>
            <Avatar nome={perfil?.nome || ''} foto={perfil?.fotoBase64} size={92} />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#FFFFFF' }}>{perfil?.nome}</Text>
          <Text style={{ fontSize: 13, color: '#FFFFFFCC' }}>{perfil?.email}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/perfil/editar')}
            style={{
              borderWidth: 1,
              borderColor: '#FFFFFF88',
              borderRadius: 22,
              paddingVertical: 11,
              paddingHorizontal: 26,
              marginTop: 4,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 13 }}>Editar perfil</Text>
          </Pressable>
        </View>
        <View style={{ padding: 22, gap: 22 }}>
          <Pressable
            onPress={() => router.push('/favoritos')}
            style={[ui.card, ui.between]}
            accessibilityRole="button"
          >
            <View style={ui.row}>
              <Icon name="heart" color={colors.pink} />
              <Text style={ui.body}>Seus lugares e conversas salvos</Text>
            </View>
            <Text style={[ui.heading, { color: colors.brand }]}>
              {favorites.loading ? '—' : favorites.items.length}
            </Text>
          </Pressable>
          <Text style={ui.heading}>Sua conta</Text>
          <View style={[ui.card, { padding: 0, overflow: 'hidden' }]}>
            {rows.map((row, index) => (
              <Pressable
                key={row.label}
                accessibilityRole="button"
                onPress={() => router.push(row.route)}
                style={[
                  ui.row,
                  {
                    paddingHorizontal: 16,
                    paddingVertical: 15,
                    borderBottomWidth: index === rows.length - 1 ? 0 : 1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={{ padding: 10, borderRadius: 13, backgroundColor: colors.soft }}>
                  <Icon name={row.icon} size={20} />
                </View>
                <Text style={[ui.body, { flex: 1, fontSize: 13 }]}>{row.label}</Text>
                <Icon name="chevron-forward" size={17} color={colors.muted} />
              </Pressable>
            ))}
          </View>
          <Button
            title="Sair da conta"
            variant="secondary"
            icon="log-out-outline"
            onPress={() => setConfirm(true)}
          />
          <Text style={[ui.caption, { textAlign: 'center' }]}>
            Mapeei · primeira entrega funcional
          </Text>
        </View>
      </ScrollView>
      <ConfirmDialog
        visible={confirm}
        title="Sair da conta?"
        text="Você precisará entrar novamente para acessar suas conversas."
        confirm="Sair"
        onCancel={() => setConfirm(false)}
        onConfirm={() => action.run(() => authService.logout())}
        busy={action.busy}
        error={action.error}
      />
    </Page>
  );
}
