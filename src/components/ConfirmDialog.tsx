import { Modal, Pressable, Text, View } from 'react-native';
import { Button, ErrorNotice } from './ui';
import { colors, ui } from '@/theme/theme';
export function ConfirmDialog({
  visible,
  title,
  text,
  confirm = 'Confirmar',
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  text: string;
  confirm?: string;
  busy?: boolean;
  error?: string;
  onConfirm(): void;
  onCancel(): void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        onPress={busy ? undefined : onCancel}
        style={{ flex: 1, backgroundColor: '#23131F88', justifyContent: 'center', padding: 24 }}
      >
        <Pressable
          onPress={() => {}}
          accessibilityViewIsModal
          style={{
            width: '100%',
            maxWidth: 440,
            alignSelf: 'center',
            backgroundColor: colors.surface,
            padding: 24,
            borderRadius: 26,
            gap: 16,
          }}
        >
          <Text style={ui.heading}>{title}</Text>
          <Text style={ui.body}>{text}</Text>
          <ErrorNotice message={error} />
          <Button title={confirm} onPress={onConfirm} busy={busy} />
          <Button title="Cancelar" variant="secondary" onPress={onCancel} disabled={busy} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
