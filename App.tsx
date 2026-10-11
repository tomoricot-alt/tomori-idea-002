import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { createIdea, deleteIdea, EMPTY_FILTER, Filter, filterIdeas, Idea, IdeaInput, updateIdea } from './src/lib/ideas';
import { loadIdeas, saveIdeas } from './src/lib/storage';
import { DetailScreen } from './src/screens/DetailScreen';
import { FormScreen } from './src/screens/FormScreen';
import { ListScreen } from './src/screens/ListScreen';
import { colors } from './src/theme';

type Route = { name: 'list' } | { name: 'detail'; id: string } | { name: 'form'; id: string | null };

const SAVE_ERROR = '保存に失敗しました。ブラウザの保存領域がいっぱい、またはプライベートモードの可能性があります。';
const LOAD_ERROR = '保存データを読み込めませんでした。ブラウザの設定を確認してください。';

export default function App() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [route, setRoute] = useState<Route>({ name: 'list' });
  const [filter, setFilter] = useState<Filter>(EMPTY_FILTER);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadIdeas().then((r) => { setIdeas(r.ideas); setLoadError(r.error); setLoaded(true); });
  }, []);

  /** 保存に成功した場合のみ画面の状態を更新する(失敗時は変更を反映しない)。 */
  const commit = useCallback(async (next: Idea[]): Promise<boolean> => {
    const ok = await saveIdeas(next);
    if (ok) setIdeas(next);
    return ok;
  }, []);

  const visible = useMemo(() => filterIdeas(ideas, filter), [ideas, filter]);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}><ActivityIndicator color={colors.accent} /></View>;
  }

  const current = route.name !== 'list' && route.id ? ideas.find((i) => i.id === route.id) ?? null : null;
  const go = (r: Route) => { setNotice(null); setRoute(r); };

  const onSave = async (input: IdeaInput): Promise<string | null> => {
    const now = Date.now();
    if (route.name === 'form' && route.id) {
      const id = route.id;
      if (!(await commit(updateIdea(ideas, id, input, now)))) return SAVE_ERROR;
      go({ name: 'detail', id });
    } else {
      if (!(await commit([createIdea(input, now), ...ideas]))) return SAVE_ERROR;
      go({ name: 'list' });
    }
    return null;
  };

  const onDelete = async (id: string) => {
    if (await commit(deleteIdea(ideas, id))) go({ name: 'list' });
    else setNotice(SAVE_ERROR);
  };

  let screen: React.ReactNode;
  if (route.name === 'form') {
    screen = <FormScreen key={route.id ?? 'new'} initial={current} onSave={onSave} onCancel={() => go(route.id ? { name: 'detail', id: route.id } : { name: 'list' })} />;
  } else if (route.name === 'detail' && current) {
    screen = <DetailScreen idea={current} notice={notice} onBack={() => go({ name: 'list' })} onEdit={() => go({ name: 'form', id: current.id })} onDelete={() => onDelete(current.id)} />;
  } else {
    screen = <ListScreen ideas={visible} total={ideas.length} filter={filter} onFilter={setFilter} onOpen={(id) => go({ name: 'detail', id })} onNew={() => go({ name: 'form', id: null })} notice={loadError ? LOAD_ERROR : null} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'ios' ? 48 : 0 }}>
      <StatusBar style="dark" />
      {screen}
    </View>
  );
}
