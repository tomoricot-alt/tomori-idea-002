import AsyncStorage from '@react-native-async-storage/async-storage';
import { Idea, sanitizeIdeas } from './ideas';

const KEY = 'tomori-idea:ideas:v1';

export type LoadResult = { ideas: Idea[]; error: boolean };

export async function loadIdeas(): Promise<LoadResult> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return { ideas: raw ? sanitizeIdeas(JSON.parse(raw)) : [], error: false };
  } catch {
    return { ideas: [], error: true };
  }
}

/** 保存に成功したら true。失敗(容量超過・プライベートモード等)なら false。 */
export async function saveIdeas(ideas: Idea[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ideas));
    return true;
  } catch {
    return false;
  }
}
