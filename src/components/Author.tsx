import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { Avatar } from './ui';
import { colors, ui } from '@/theme/theme';
export function Author({
  uid,
  fallback,
  caption,
  size = 38,
}: {
  uid: string;
  fallback?: string;
  caption?: string;
  size?: number;
}) {
  const { user } = useAuth();
  const profile = usePublicProfile(uid);
  const mine = user?.uid === uid;
  const nome = profile?.nome || fallback || (uid ? 'Perfil pendente' : 'Comunidade Mapeei');
  const canChat = /^[A-Za-z0-9_-]{1,128}$/.test(uid) && !mine;
  return (
    <Pressable
      disabled={!canChat}
      accessibilityRole={canChat ? 'button' : undefined}
      accessibilityLabel={canChat ? `Conversar em privado com ${nome}` : nome}
      onPress={() => router.push({ pathname: '/conversa/[uid]', params: { uid } })}
      style={({ pressed }) => [ui.row, { flex: 1, minWidth: 0, opacity: pressed ? 0.65 : 1 }]}
    >
      <Avatar nome={nome} foto={profile?.fotoBase64} size={size} />
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }} numberOfLines={1}>
          {nome}
          {mine ? ' (você)' : ''}
        </Text>
        <Text style={ui.caption} numberOfLines={1}>
          {caption || (canChat ? 'Toque para conversar' : 'Membro da comunidade')}
        </Text>
      </View>
    </Pressable>
  );
}
