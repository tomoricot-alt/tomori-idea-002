import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, MAX_WIDTH, radius } from '../theme';

/** 汎用ボタン。primary=深緑、secondary=枠線、danger=赤。 */
export function Button({
  label, onPress, variant = 'primary', style,
}: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger'; style?: ViewStyle }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.btn, styles[`btn_${variant}`], pressed && { opacity: 0.8 }, style]}
    >
      <Text style={[styles.btnText, variant === 'secondary' && { color: colors.accent }, variant === 'danger' && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

/** 選択式のチップ(カテゴリ・ステータスの選択/絞り込み用)。 */
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}
    >
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

/** 表示専用の小さなバッジ。 */
export function Badge({ label, tone = 'soft' }: { label: string; tone?: 'soft' | 'line' }) {
  return (
    <View style={[styles.badge, tone === 'line' && { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line }]}>
      <Text style={[styles.badgeText, tone === 'line' && { color: colors.sub }]}>{label}</Text>
    </View>
  );
}

/** 画面共通の枠。PCでは中央寄せ。 */
export function Page({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.page}>
      <View style={styles.pageInner}>{children}</View>
    </View>
  );
}

/** Alert.alert はWebで確認ボタンが動かないため、Modalで確認ダイアログを自作。 */
export function ConfirmDialog({
  visible, title, message, confirmLabel, cancelLabel = 'キャンセル', onConfirm, onCancel,
}: {
  visible: boolean; title: string; message: string; confirmLabel: string; cancelLabel?: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog} accessibilityRole="alert">
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogMsg}>{message}</Text>
          <View style={{ gap: 10, marginTop: 20 }}>
            <Button label={confirmLabel} variant="danger" onPress={onConfirm} />
            <Button label={cancelLabel} variant="secondary" onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: 52, borderRadius: radius, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  btn_primary: { backgroundColor: colors.accent },
  btn_secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  btn_danger: { backgroundColor: colors.dangerSoft },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  chip: { minHeight: 40, paddingHorizontal: 16, borderRadius: 20, justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 14, color: colors.ink, fontWeight: '600' },
  badge: { backgroundColor: colors.accentSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, color: colors.accent, fontWeight: '700' },
  page: { flex: 1, backgroundColor: colors.bg, alignItems: 'center' },
  pageInner: { flex: 1, width: '100%', maxWidth: MAX_WIDTH },
  overlay: { flex: 1, backgroundColor: 'rgba(37,48,43,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 380, backgroundColor: colors.card, borderRadius: 18, padding: 24 },
  dialogTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  dialogMsg: { fontSize: 15, color: colors.sub, marginTop: 8, lineHeight: 22 },
});
