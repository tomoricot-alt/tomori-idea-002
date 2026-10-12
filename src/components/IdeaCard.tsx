import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDateTime, Idea } from '../lib/ideas';
import { colors, radius } from '../theme';
import { Badge } from './ui';

export function IdeaCard({ idea, onPress }: { idea: Idea; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View style={styles.badges}>
        <Badge label={idea.category} />
        <Badge label={idea.status} tone="line" />
      </View>
      <Text style={styles.title} numberOfLines={2}>{idea.title}</Text>
      {idea.body ? <Text style={styles.body} numberOfLines={2}>{idea.body}</Text> : null}
      <Text style={styles.date}>{formatDateTime(idea.createdAt)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius, padding: 16, borderWidth: 1, borderColor: colors.line, gap: 8 },
  badges: { flexDirection: 'row', gap: 6 },
  title: { fontSize: 17, fontWeight: '800', color: colors.ink },
  body: { fontSize: 14, color: colors.sub, lineHeight: 20 },
  date: { fontSize: 12, color: colors.sub },
});
