// @ts-check
'use strict';
/**
 * Hello 範例：後端
 *
 * 在獨立的 Node.js 程序中執行：可以使用 fs、child_process、fetch，
 * 也可以 require 任何 npm 套件（在本資料夾 `npm install <套件>` 即可，平台不需更新）。
 * 完整 API：node_modules/tooldock-types/index.d.ts
 */
const fs = require('fs');

/** @typedef {{ id: string, text: string, createdAt: number }} Note */

/** @param {import('tooldock-types').ExtensionContext} ctx */
exports.activate = (ctx) => {
  ctx.log.info('Hello 範例 已啟用');

  /** @returns {Note[]} */
  const load = () => ctx.storage.get('notes', []);

  /** @param {Note[]} notes */
  const save = (notes) => {
    ctx.storage.set('notes', notes);
    ctx.ui.emit('notesChanged', notes); // 推送給所有開啟中的畫面
    return notes;
  };

  // ── 畫面呼叫的方法：tooldock.invoke('<方法>', ...參數) ──
  ctx.ui.handle('greet', (name) => {
    const greeting = ctx.settings.get('helloExample.greeting', '哈囉');
    return `${greeting}，${name || '朋友'}！（來自 PID ${process.pid} 的後端）`;
  });

  ctx.ui.handle('listNotes', () => load());

  ctx.ui.handle('addNote', (text) => {
    const t = String(text || '').trim();
    if (!t) throw new Error('內容不可為空'); // 錯誤會傳回畫面端的 Promise reject
    return save([{ id: Date.now().toString(36), text: t, createdAt: Date.now() }, ...load()]);
  });

  ctx.ui.handle('removeNote', (id) => save(load().filter((n) => n.id !== id)));

  ctx.ui.handle('exportNotes', async () => {
    const r = await ctx.window.showSaveDialog({ defaultPath: 'notes.txt' });
    if (r.canceled || !r.filePath) return null;
    fs.writeFileSync(r.filePath, load().map((n) => `- ${n.text}`).join('\n'), 'utf8');
    return r.filePath;
  });

  // ── 指令：命令面板、lifecycle.json 的 hook、其他擴充都能呼叫 ──
  ctx.subscriptions.push(
    ctx.commands.register('helloExample.hello', async () => {
      await ctx.window.toast('來自 Hello 範例 的問候', 'success');
    }),
    ctx.settings.onDidChange((key) => ctx.ui.emit('settingsChanged', { key })),
  );
};

/**
 * 對應 package.json 的 contributes.lifecycle["app:before-quit"]
 * @param {import('tooldock-types').ExtensionContext} ctx
 */
exports.onBeforeQuit = (ctx) => {
  ctx.log.info('平台即將結束，筆記數量：', ctx.storage.get('notes', []).length);
};

exports.deactivate = () => {};
