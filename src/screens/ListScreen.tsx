import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { IdeaCard } from '../components/IdeaCard';
import { Button, Chip, Page } from '../components/ui';
import { CATEGORIES, Filter, Idea, STATUSES } from '../lib/ideas';
import { colors } from '../theme';

type Props = {
  ideas: Idea[]; // 絞り込み後
  total: number; // 登録総数
  filter: Filter;
  onFilter: (f: Filter) => void;
  onOpen: (id: string) => void;
  onNew: () => void;
  notice: string | null;
};

export function ListScreen({ ideas, total, filter, onFilter, onOpen, onNew, notice }: Props) {
  const filtering = !!(filter.keyword.trim() || filter.category || filter.status);
  return (
    <Page>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>TOMORI IDEA</Text>
        <Text style={styles.heading}>アイデア一覧</Text>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <TextInput
          style={styles.search}
          placeholder="タイトル・内容で検索"
          placeholderTextColor={colors.sub}
          value={filter.keyword}
          onChangeText={(keyword) => onFilter({ ...filter, keyword })}
          returnKeyType="search"
        />
        <Text style={styles.label}>カテゴリ</Text>
        <View style={styles.row}>
          <Chip label="すべて" selected={!filter.category} onPress={() => onFilter({ ...filter, category: null })} />
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={filter.category === c} onPress={() => onFilter({ ...filter, category: filter.category === c ? null : c })} />
          ))}
        </View>
        <Text style={styles.label}>ステータス</Text>
        <View style={styles.row}>
          <Chip label="すべて" selected={!filter.status} onPress={() => onFilter({ ...filter, status: null })} />
          {STATUSES.map((s) => (
            <Chip key={s} label={s} selected={filter.status === s} onPress={() => onFilter({ ...filter, status: filter.status === s ? null : s })} />
          ))}
        </View>

        <Text style={styles.count}>
          {filtering ? `${ideas.length}件 / 全${total}件` : `全${total}件`}
        </Text>

        {ideas.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{total === 0 ? 'まだアイデアがありません' : '条件に合うアイデアがありません'}</Text>
            <Text style={styles.emptySub}>
              {total === 0 ? '思いついたことを、まずは一つ書き留めてみましょう。' : '検索ワードや絞り込みを変えてみてください。'}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {ideas.map((i) => <IdeaCard key={i.id} idea={i} onPress={() => onOpen(i.id)} />)}
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button label="＋ 新しいアイデアを書く" onPress={onNew} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 28, paddingBottom: 24, gap: 10 },
  brand: { fontSize: 12, letterSpacing: 3, color: colors.accent, fontWeight: '800' },
  heading: { fontSize: 28, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  notice: { backgroundColor: colors.dangerSoft, color: colors.danger, padding: 12, borderRadius: 10, fontSize: 14 },
  search: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 14, fontSize: 16, color: colors.ink },
  label: { fontSize: 12, color: colors.sub, fontWeight: '700', marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  count: { fontSize: 13, color: colors.sub, marginTop: 8 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 6 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  emptySub: { fontSize: 14, color: colors.sub, textAlign: 'center' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg },
});
