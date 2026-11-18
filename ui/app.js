// @ts-check
/** Hello 範例：畫面（可改用任何前端框架，打包後的檔案放在 ui/ 即可） */
const td = window.tooldock;

/** @template {HTMLElement} T @param {string} sel @returns {T} */
const $ = (sel) => /** @type {T} */ (document.querySelector(sel));

/** @typedef {{ id: string, text: string, createdAt: number }} Note */

/** @param {Note[]} notes */
function renderNotes(notes) {
  const list = $('#notes');
  list.innerHTML = notes.length
    ? notes.map((n) => `<li>
        <span>${td.escape(n.text)}</span>
        <time>${new Date(n.createdAt).toLocaleString('zh-TW', { hour12: false })}</time>
        <button class="danger" data-id="${n.id}">刪除</button>
      </li>`).join('')
    : '<li class="faint">還沒有筆記</li>';
}

$('#greet').addEventListener('click', async () => {
  /** @type {HTMLInputElement} */
  const input = $('#name');
  $('#greeting').textContent = await td.invoke('greet', input.value);
});

$('#add').addEventListener('click', async () => {
  /** @type {HTMLInputElement} */
  const input = $('#note');
  try {
    await td.invoke('addNote', input.value); // 畫面會由 notesChanged 事件更新
    input.value = '';
  } catch (err) {
    td.toast(err instanceof Error ? err.message : String(err), 'warn');
  }
});

$('#notes').addEventListener('click', (e) => {
  const btn = /** @type {HTMLElement} */ (e.target).closest('button[data-id]');
  if (btn instanceof HTMLElement) td.invoke('removeNote', btn.dataset.id);
});

$('#export').addEventListener('click', async () => {
  const file = await td.invoke('exportNotes');
  if (file) td.toast(`已匯出到 ${file}`, 'success');
});

// 後端 ctx.ui.emit('notesChanged', notes) 推送的事件
td.on('notesChanged', renderNotes);

td.invoke('listNotes').then(renderNotes);
