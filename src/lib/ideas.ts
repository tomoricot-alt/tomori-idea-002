export const CATEGORIES = ['ビジネス', '仕事', '暮らし', 'その他'] as const;
export const STATUSES = ['アイデア', '検討中', '実行済み'] as const;

export type Category = (typeof CATEGORIES)[number];
export type Status = (typeof STATUSES)[number];

export type Idea = {
  id: string;
  title: string;
  body: string;
  category: Category;
  status: Status;
  createdAt: number; // 登録日時 (epoch ms)
  updatedAt: number; // 更新日時 (epoch ms)
};

export type IdeaInput = Pick<Idea, 'title' | 'body' | 'category' | 'status'>;

export const TITLE_MAX = 100;
export const BODY_MAX = 5000;

/** 入力チェック。問題なければ null、あればエラーメッセージ。 */
export function validateInput(input: IdeaInput): string | null {
  const title = input.title.trim();
  if (!title) return 'タイトルを入力してください。';
  if (title.length > TITLE_MAX) return `タイトルは${TITLE_MAX}文字以内で入力してください。`;
  if (input.body.length > BODY_MAX) return `内容は${BODY_MAX}文字以内で入力してください。`;
  return null;
}

let seq = 0;
export function newId(now: number): string {
  seq = (seq + 1) % 1000;
  return `${now.toString(36)}-${seq.toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createIdea(input: IdeaInput, now: number): Idea {
  return {
    id: newId(now),
    title: input.title.trim(),
    body: input.body.trim(),
    category: input.category,
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateIdea(ideas: Idea[], id: string, input: IdeaInput, now: number): Idea[] {
  return ideas.map((i) =>
    i.id === id ? { ...i, title: input.title.trim(), body: input.body.trim(), category: input.category, status: input.status, updatedAt: now } : i,
  );
}

export function deleteIdea(ideas: Idea[], id: string): Idea[] {
  return ideas.filter((i) => i.id !== id);
}

export type Filter = {
  keyword: string;
  category: Category | null;
  status: Status | null;
};

export const EMPTY_FILTER: Filter = { keyword: '', category: null, status: null };

/** 絞り込み + 新しい順(登録日時の降順)。 */
export function filterIdeas(ideas: Idea[], f: Filter): Idea[] {
  const words = f.keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return ideas
    .filter((i) => {
      if (f.category && i.category !== f.category) return false;
      if (f.status && i.status !== f.status) return false;
      const text = `${i.title}\n${i.body}`.toLowerCase();
      return words.every((w) => text.includes(w));
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** 保存データの検証。不正なデータは捨てて、読める分だけ返す。 */
export function sanitizeIdeas(raw: unknown): Idea[] {
  if (!Array.isArray(raw)) return [];
  const out: Idea[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    if (typeof o.id !== 'string' || typeof o.title !== 'string') continue;
    const createdAt = typeof o.createdAt === 'number' && isFinite(o.createdAt) ? o.createdAt : 0;
    out.push({
      id: o.id,
      title: o.title,
      body: typeof o.body === 'string' ? o.body : '',
      category: (CATEGORIES as readonly unknown[]).includes(o.category) ? (o.category as Category) : 'その他',
      status: (STATUSES as readonly unknown[]).includes(o.status) ? (o.status as Status) : 'アイデア',
      createdAt,
      updatedAt: typeof o.updatedAt === 'number' && isFinite(o.updatedAt) ? o.updatedAt : createdAt,
    });
  }
  return out;
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
