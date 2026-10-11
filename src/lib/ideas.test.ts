import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createIdea, deleteIdea, EMPTY_FILTER, filterIdeas, sanitizeIdeas, updateIdea, validateInput, type Idea, type IdeaInput,
} from './ideas';

const input = (o: Partial<IdeaInput> = {}): IdeaInput => ({ title: '新サービス', body: '本文', category: 'ビジネス', status: 'アイデア', ...o });

test('validateInput: 空・空白のみのタイトルはエラー', () => {
  assert.ok(validateInput(input({ title: '' })));
  assert.ok(validateInput(input({ title: '   ' })));
  assert.equal(validateInput(input()), null);
  assert.equal(validateInput(input({ body: '' })), null); // 内容は空でも可
  assert.ok(validateInput(input({ title: 'あ'.repeat(101) })));
});

test('createIdea: 前後の空白除去と日時設定、IDはユニーク', () => {
  const a = createIdea(input({ title: ' 題 ' }), 1000);
  const b = createIdea(input(), 1000);
  assert.equal(a.title, '題');
  assert.equal(a.createdAt, 1000);
  assert.equal(a.updatedAt, 1000);
  assert.notEqual(a.id, b.id);
});

test('updateIdea: 更新日時だけ変わり登録日時は保持', () => {
  const a = createIdea(input(), 1000);
  const b = createIdea(input({ title: '別' }), 1000);
  const r = updateIdea([a, b], a.id, input({ title: '変更後', status: '検討中' }), 5000);
  assert.equal(r[0].title, '変更後');
  assert.equal(r[0].status, '検討中');
  assert.equal(r[0].createdAt, 1000);
  assert.equal(r[0].updatedAt, 5000);
  assert.equal(r[1].title, '別');
});

test('deleteIdea', () => {
  const a = createIdea(input(), 1);
  const b = createIdea(input(), 2);
  assert.deepEqual(deleteIdea([a, b], a.id), [b]);
});

const sample = (): Idea[] => [
  createIdea(input({ title: 'カフェ開業', body: '駅前に小さな店', category: 'ビジネス', status: 'アイデア' }), 100),
  createIdea(input({ title: '会議を短く', body: 'スタンディングでやる', category: '仕事', status: '検討中' }), 300),
  createIdea(input({ title: '朝の散歩', body: 'カフェ巡りも兼ねる', category: '暮らし', status: '実行済み' }), 200),
];

test('filterIdeas: 新しい順', () => {
  assert.deepEqual(filterIdeas(sample(), EMPTY_FILTER).map((i) => i.title), ['会議を短く', '朝の散歩', 'カフェ開業']);
});

test('filterIdeas: タイトルと本文のキーワード検索(複数語はAND)', () => {
  const s = sample();
  assert.deepEqual(filterIdeas(s, { ...EMPTY_FILTER, keyword: 'カフェ' }).map((i) => i.title), ['朝の散歩', 'カフェ開業']);
  assert.deepEqual(filterIdeas(s, { ...EMPTY_FILTER, keyword: 'カフェ 駅前' }).map((i) => i.title), ['カフェ開業']);
  assert.deepEqual(filterIdeas(s, { ...EMPTY_FILTER, keyword: 'zzz' }), []);
});

test('filterIdeas: カテゴリ・ステータス絞り込みと併用', () => {
  const s = sample();
  assert.deepEqual(filterIdeas(s, { ...EMPTY_FILTER, category: '仕事' }).map((i) => i.title), ['会議を短く']);
  assert.deepEqual(filterIdeas(s, { ...EMPTY_FILTER, status: '実行済み' }).map((i) => i.title), ['朝の散歩']);
  assert.deepEqual(filterIdeas(s, { keyword: 'カフェ', category: 'ビジネス', status: '検討中' }), []);
});

test('sanitizeIdeas: 不正データは除外・欠損は補完', () => {
  assert.deepEqual(sanitizeIdeas('x'), []);
  assert.deepEqual(sanitizeIdeas(null), []);
  const r = sanitizeIdeas([null, 5, { id: 1 }, { id: 'a', title: 't', category: '不明', createdAt: 10 }]);
  assert.equal(r.length, 1);
  assert.equal(r[0].category, 'その他');
  assert.equal(r[0].status, 'アイデア');
  assert.equal(r[0].updatedAt, 10);
});
