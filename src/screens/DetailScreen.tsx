import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, ConfirmDialog, Page } from '../components/ui';
import { formatDateTime, Idea } from '../lib/ideas';
import { colors } from '../theme';

type Props = {
  idea: Idea;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  notice: string | null;
};

export function DetailScreen({ idea, onBack, onEdit, onDelete, notice }: Props) {
  const [confirming, setConfirming] = useState(false);
  return (
    <Page>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable accessibilityRole="button" onPress={onBack} hitSlop={10}>
          <Text style={styles.back}>‹ 一覧に戻る</Text>
        </Pressable>
        <View style={styles.badges}>
          <Badge label={idea.category} />
          <Badge label={idea.status} tone="line" />
        </View>
        <Text style={styles.title}>{idea.title}</Text>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <Text style={styles.body}>{idea.body || '（内容なし）'}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>登録日時　{formatDateTime(idea.createdAt)}</Text>
          <Text style={styles.metaText}>更新日時　{formatDateTime(idea.updatedAt)}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button label="削除" variant="danger" onPress={() => setConfirming(true)} style={{ flex: 1 }} />
        <Button label="編集する" onPress={onEdit} style={{ flex: 2 }} />
      </View>
      <ConfirmDialog
        visible={confirming}
        title="このアイデアを削除しますか？"
        message={`「${idea.title}」を削除します。この操作は元に戻せません。`}
        confirmLabel="削除する"
        onConfirm={() => { setConfirming(false); onDelete(); }}
        onCancel={() => setConfirming(false)}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 28, gap: 12 },
  back: { fontSize: 15, color: colors.accent, fontWeight: '700', marginBottom: 4 },
  badges: { flexDirection: 'row', gap: 6 },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink, lineHeight: 34 },
  notice: { backgroundColor: colors.dangerSoft, color: colors.danger, padding: 12, borderRadius: 10, fontSize: 14 },
  body: { fontSize: 16, lineHeight: 26, color: colors.ink },
  meta: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.line, gap: 4 },
  metaText: { fontSize: 13, color: colors.sub },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg },
});
