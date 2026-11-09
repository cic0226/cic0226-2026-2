import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './ui';
import { colors, ui } from '@/theme/theme';
export function Composer({
  value,
  onChange,
  onSend,
  busy,
  disabled,
  maxLength,
  placeholder,
}: {
  value: string;
  onChange(value: string): void;
  onSend(): void;
  busy?: boolean;
  disabled?: boolean;
  maxLength: number;
  placeholder: string;
}) {
  const insets = useSafeAreaInsets();
  const blocked = disabled || busy || !value.trim();
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom, 12),
        gap: 3,
      }}
    >
      <View style={[ui.row, { alignItems: 'flex-end' }]}>
        <TextInput
          accessibilityLabel={placeholder}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          value={value}
          onChangeText={onChange}
          multiline
          maxLength={maxLength}
          editable={!disabled && !busy}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 46,
            maxHeight: 130,
            paddingHorizontal: 16,
            paddingTop: 13,
            paddingBottom: 12,
            borderRadius: 24,
            backgroundColor: colors.background,
            color: colors.text,
            fontSize: 14,
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar"
          accessibilityState={{ disabled: !!blocked, busy: !!busy }}
          disabled={blocked}
          onPress={onSend}
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: colors.brand,
            opacity: blocked ? 0.45 : 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {busy ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Icon name="send" size={19} color={colors.surface} />
          )}
        </Pressable>
      </View>
      {value.length > maxLength * 0.7 ? (
        <Text style={[ui.caption, { textAlign: 'right' }]}>
          {value.length}/{maxLength}
        </Text>
      ) : null}
    </View>
  );
}
