// Web版の動作確認（Playwright + Chromium）。事前に `npm run build:web` が必要。
import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { serve } from './serve-dist.mjs';

const executablePath = process.env.CHROMIUM_PATH || undefined;
const server = await serve(4173);
const url = 'http://localhost:4173/tomori-idea-002/';
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const results = [];
const check = async (name, fn) => { await fn(); results.push(name); console.log('✔', name); };

try {
  // iPhone相当の画面サイズ
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, locale: 'ja-JP' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url);
  const text = (t) => page.getByText(t, { exact: true }).first();
  const btn = (name) => page.getByRole('button', { name, exact: true });
  const noText = async (t) => assert.equal(await page.getByText(t, { exact: true }).count(), 0, `${t} が表示されている`);

  const add = async (title, body, category, status) => {
    await btn('＋ 新しいアイデアを書く').click();
    await page.getByPlaceholder('例：駅前に小さなカフェを開く').fill(title);
    await page.getByPlaceholder('思いついたことを自由に書きましょう').fill(body);
    await btn(category).click();
    await btn(status).click();
    await btn('保存する').click();
  };

  await check('初期表示: 日本語UIと空の状態', async () => {
    await text('アイデア一覧').waitFor();
    await text('まだアイデアがありません').waitFor();
  });
  await check('空タイトルは保存できずエラー表示', async () => {
    await btn('＋ 新しいアイデアを書く').click();
    await btn('保存する').click();
    await text('タイトルを入力してください。').waitFor();
    await btn('キャンセル').click();
    await text('アイデア一覧').waitFor();
  });
  await check('新規登録→一覧に表示(カテゴリ・ステータス付き)', async () => {
    await add('駅前カフェ', '小さな店を開きたい', 'ビジネス', 'アイデア');
    await text('駅前カフェ').waitFor();
    await text('全1件').waitFor();
  });
  await add('会議を短くする', 'スタンディングで実施', '仕事', '検討中');
  await add('朝の散歩', 'カフェ巡りも兼ねる', '暮らし', '実行済み');
  await check('新しい順に並ぶ', async () => {
    const order = await page.evaluate(() => {
      const t = document.body.innerText;
      return ['朝の散歩', '会議を短くする', '駅前カフェ'].map((s) => t.indexOf(s));
    });
    assert.ok(order[0] < order[1] && order[1] < order[2], `順序: ${order}`);
  });
  await check('キーワード検索(タイトル・本文)', async () => {
    const q = page.getByPlaceholder('タイトル・内容で検索');
    await q.fill('カフェ');
    await text('2件 / 全3件').waitFor();
    await noText('会議を短くする');
    await q.fill('スタンディング');
    await text('1件 / 全3件').waitFor();
    await text('会議を短くする').waitFor();
    await q.fill('存在しない語');
    await text('条件に合うアイデアがありません').waitFor();
    await q.fill('');
    await text('全3件').waitFor();
  });
  await check('カテゴリ・ステータス絞り込み', async () => {
    await btn('仕事').click();
    await text('1件 / 全3件').waitFor();
    await text('会議を短くする').waitFor();
    await noText('朝の散歩');
    await btn('すべて').nth(0).click(); // カテゴリ解除
    await btn('実行済み').click();
    await text('1件 / 全3件').waitFor();
    await text('朝の散歩').waitFor();
    await btn('すべて').nth(1).click(); // ステータス解除
    await text('全3件').waitFor();
  });
  await check('詳細表示→編集→保存', async () => {
    await text('駅前カフェ').click();
    await text('小さな店を開きたい').waitFor();
    await btn('編集する').click();
    await page.getByPlaceholder('例：駅前に小さなカフェを開く').fill('駅前カフェ（改）');
    await btn('検討中').click();
    await btn('保存する').click();
    await text('駅前カフェ（改）').waitFor();
    await btn('‹ 一覧に戻る').click();
    await text('駅前カフェ（改）').waitFor();
  });
  await check('削除キャンセルでは残り、削除確認で消える', async () => {
    await text('朝の散歩').click();
    await btn('削除').click();
    await text('このアイデアを削除しますか？').waitFor();
    await btn('キャンセル').click();
    await text('このアイデアを削除しますか？').waitFor({ state: 'hidden' });
    await text('朝の散歩').waitFor();
    await btn('削除').click();
    await btn('削除する').click();
    await text('全2件').waitFor();
    await noText('朝の散歩');
  });
  await check('リロード後もデータが残る(端末内保存)', async () => {
    await page.reload();
    await text('全2件').waitFor();
    await text('駅前カフェ（改）').waitFor();
    await text('会議を短くする').waitFor();
    await noText('朝の散歩');
  });
  await check('横スクロールなし(iPhone幅)', async () => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(overflow, false);
  });
  await page.screenshot({ path: process.env.SHOT || 'e2e-screenshot.png', fullPage: true });

  await check('PC幅(1280px)でも崩れない', async () => {
    const pc = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'ja-JP', storageState: await ctx.storageState() });
    const p = await pc.newPage();
    await p.goto(url);
    await p.getByText('会議を短くする', { exact: true }).first().waitFor();
    const w = await p.evaluate(() => Math.max(...[...document.querySelectorAll('[role=button]')].map((e) => e.getBoundingClientRect().width)));
    assert.ok(w <= 720, `最大幅 ${w}`);
    await p.screenshot({ path: (process.env.SHOT || 'e2e-screenshot.png').replace('.png', '-pc.png') });
    await pc.close();
  });
  assert.deepEqual(errors, []);
  console.log(`\n${results.length} 件すべて成功`);
} catch (e) {
  console.error('✘ 失敗:', e);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
