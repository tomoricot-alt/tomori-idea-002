import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Chip, Page } from '../components/ui';
import { BODY_MAX, CATEGORIES, Category, Idea, IdeaInput, STATUSES, Status, TITLE_MAX, validateInput } from '../lib/ideas';
import { colors } from '../theme';

type Props = {
  initial: Idea | null; // null=新規
  onSave: (input: IdeaInput) => Promise<string | null>; // エラーメッセージ or null(成功)
  onCancel: () => void;
};

export function FormScreen({ initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [category, setCategory] = useState<Category>(initial?.category ?? 'ビジネス');
  const [status, setStatus] = useState<Status>(initial?.status ?? 'アイデア');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (saving) return;
    const input = { title, body, category, status };
    const invalid = validateInput(input);
    if (invalid) return setError(invalid);
    setSaving(true);
    setError(await onSave(input));
    setSaving(false);
  };

  return (
    <Page>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{initial ? 'アイデアを編集' : '新しいアイデア'}</Text>

        <Text style={styles.label}>タイトル</Text>
        <TextInput
          style={styles.input}
          placeholder="例：駅前に小さなカフェを開く"
          placeholderTextColor={colors.sub}
          value={title}
          maxLength={TITLE_MAX}
          onChangeText={(t) => { setTitle(t); setError(null); }}
        />

        <Text style={styles.label}>内容</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="思いついたことを自由に書きましょう"
          placeholderTextColor={colors.sub}
          value={body}
          maxLength={BODY_MAX}
          multiline
          textAlignVertical="top"
          onChangeText={setBody}
        />

        <Text style={styles.label}>カテゴリ</Text>
        <View style={styles.row}>
          {CATEGORIES.map((c) => <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />)}
        </View>

        <Text style={styles.label}>ステータス</Text>
        <View style={styles.row}>
          {STATUSES.map((s) => <Chip key={s} label={s} selected={status === s} onPress={() => setStatus(s)} />)}
        </View>

        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      </ScrollView>
      <View style={styles.footer}>
        <Button label="キャンセル" variant="secondary" onPress={onCancel} style={{ flex: 1 }} />
        <Button label={saving ? '保存中…' : '保存する'} onPress={submit} style={{ flex: 2 }} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 28, gap: 8 },
  heading: { fontSize: 24, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  label: { fontSize: 13, color: colors.sub, fontWeight: '700', marginTop: 10 },
  input: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.ink },
  multiline: { minHeight: 160 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { backgroundColor: colors.dangerSoft, color: colors.danger, padding: 12, borderRadius: 10, fontSize: 14, marginTop: 8 },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg },
});
