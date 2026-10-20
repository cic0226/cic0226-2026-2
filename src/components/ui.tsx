import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, type PropsWithChildren, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, ui } from '@/theme/theme';
import { iniciais } from '@/utils/validation';
export type IconName = keyof typeof Ionicons.glyphMap;
export function Icon({
  name,
  size = 22,
  color = colors.brand,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
export function IconButton({
  name,
  label,
  onPress,
  disabled = false,
  color = colors.brand,
  filled = false,
}: {
  name: IconName;
  label: string;
  onPress(): void;
  disabled?: boolean;
  color?: string;
  filled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.iconButton,
        filled && { backgroundColor: colors.soft },
        (pressed || disabled) && { opacity: 0.5 },
      ]}
    >
      <Icon name={name} color={color} />
    </Pressable>
  );
}
export function Button({
  title,
  onPress,
  busy = false,
  disabled = false,
  variant = 'primary',
  icon,
}: {
  title: string;
  onPress(): void;
  busy?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        primary
          ? { backgroundColor: colors.brand }
          : variant === 'secondary'
            ? { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
            : {},
        (pressed || disabled || busy) && { opacity: 0.55 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={primary ? colors.surface : colors.brand} />
      ) : (
        <>
          {icon ? (
            <Icon name={icon} size={19} color={primary ? colors.surface : colors.brand} />
          ) : null}
          <Text
            style={{
              fontWeight: '700',
              fontSize: 14,
              color: primary ? colors.surface : colors.brand,
            }}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
export function Field({
  label,
  error,
  password,
  multiline,
  style,
  ...props
}: TextInputProps & { label?: string; error?: string; password?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 7 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View
        style={[
          s.field,
          { borderColor: error ? colors.danger : focused ? colors.brand : colors.border },
          multiline && { alignItems: 'flex-start' },
        ]}
      >
        <TextInput
          {...props}
          accessibilityLabel={props.accessibilityLabel ?? label ?? props.placeholder}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          secureTextEntry={password && !visible}
          multiline={multiline}
          placeholderTextColor={colors.muted}
          style={[
            s.input,
            multiline && {
              minHeight: 112,
              maxHeight: 240,
              paddingTop: 14,
              textAlignVertical: 'top',
            },
            style,
          ]}
        />
        {password ? (
          <IconButton
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setVisible(!visible)}
            color={colors.muted}
          />
        ) : null}
      </View>
      {error ? <ErrorNotice message={error} /> : null}
    </View>
  );
}
export function ErrorNotice({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  if (!message) return null;
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.error}>
      <Text style={{ color: colors.danger, lineHeight: 20, fontSize: 13 }}>{message}</Text>
      {onRetry ? <Button title="Tentar novamente" variant="ghost" onPress={onRetry} /> : null}
    </View>
  );
}
export function Loading({ label = 'Carregando...' }: { label?: string }) {
  return (
    <View style={s.empty} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.brand} />
      <Text style={ui.muted}>{label}</Text>
    </View>
  );
}
export function Empty({
  title,
  text,
  icon = 'chatbubbles-outline',
  action,
}: {
  title: string;
  text: string;
  icon?: IconName;
  action?: ReactNode;
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Icon name={icon} size={32} />
      </View>
      <Text style={[ui.heading, { textAlign: 'center' }]}>{title}</Text>
      <Text style={[ui.muted, { textAlign: 'center' }]}>{text}</Text>
      {action}
    </View>
  );
}
export function Avatar({
  nome,
  foto,
  size = 42,
}: {
  nome: string;
  foto?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [foto]);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.oliveSoft,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {foto && !failed ? (
        <Image
          source={{ uri: foto }}
          style={{ width: size, height: size }}
          onError={() => setFailed(true)}
          accessibilityLabel={`Foto de ${nome}`}
        />
      ) : (
        <Text style={{ color: colors.olive, fontWeight: '800', fontSize: size * 0.34 }}>
          {iniciais(nome)}
        </Text>
      )}
    </View>
  );
}
export function Chip({
  text,
  selected = false,
  onPress,
  icon,
}: {
  text: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  const body = (
    <>
      {icon ? (
        <Icon name={icon} size={14} color={selected ? colors.surface : colors.brand} />
      ) : null}
      <Text
        style={{ color: selected ? colors.surface : colors.brand, fontSize: 12, fontWeight: '600' }}
      >
        {text}
      </Text>
    </>
  );
  const style = [s.chip, { backgroundColor: selected ? colors.brand : colors.soft }];
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={style}
    >
      {body}
    </Pressable>
  ) : (
    <View style={style}>{body}</View>
  );
}
export function Header({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  return (
    <View style={s.header}>
      {back ? (
        <IconButton
          name="arrow-back"
          label="Voltar"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      ) : null}
      <View style={ui.grow}>
        <Text style={[ui.heading, { fontSize: 24 }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? <Text style={ui.caption}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
export function Page({
  children,
  title,
  subtitle,
  back,
  right,
  style,
}: PropsWithChildren<{
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}>) {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <View style={[s.page, style]}>
        {title ? <Header title={title} subtitle={subtitle} back={back} right={right} /> : null}
        {children}
      </View>
    </SafeAreaView>
  );
}
export function KeyboardPage({ children }: PropsWithChildren) {
  return (
    <KeyboardAvoidingView style={ui.grow} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {children}
    </KeyboardAvoidingView>
  );
}
export function AuthShell({
  children,
  title,
  subtitle,
}: PropsWithChildren<{ title: string; subtitle: string }>) {
  return (
    <Page>
      <KeyboardPage>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 36 }}
        >
          <Image
            source={require('../../assets/login/arteCabecalho.png')}
            style={{ width: '100%', aspectRatio: 393 / 153 }}
            resizeMode="cover"
          />
          <View style={{ paddingHorizontal: 26, paddingTop: 28, gap: 17 }}>
            <View style={{ gap: 5 }}>
              <Text style={[ui.heading, { fontSize: 24 }]}>{title}</Text>
              <Text style={ui.muted}>{subtitle}</Text>
            </View>
            {children}
            <Image
              source={require('../../assets/login/logoMapeei.png')}
              style={{ alignSelf: 'center', width: 148, height: 84, marginTop: 12 }}
              resizeMode="contain"
              accessibilityLabel="Mapeei"
            />
          </View>
        </ScrollView>
      </KeyboardPage>
    </Page>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: { flex: 1, alignSelf: 'center', width: '100%', maxWidth: 720 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    minHeight: 74,
  },
  button: {
    minHeight: 50,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: colors.text, fontSize: 13, fontWeight: '600' },
  field: {
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 51,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  error: { borderRadius: 12, backgroundColor: '#FCEEF0', padding: 12, gap: 6 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
    paddingHorizontal: 25,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 26,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
