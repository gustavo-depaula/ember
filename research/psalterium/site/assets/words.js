/* Filter boxes over the long tables of a word page. Accents are ignored, so "exaudi" finds "exáudi". */

const foldText = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function filterRows(rows, query) {
  const wanted = foldText(query).split(/\s+/).filter(Boolean);
  return rows.map((text) => wanted.every((word) => foldText(text).includes(word)));
}

if (typeof document !== 'undefined') {
  document.addEventListener('input', (e) => {
    const tableId = e.target.dataset?.table;
    if (!tableId) return;
    const rows = [...document.querySelectorAll(`#${tableId} tbody tr`)];
    filterRows(rows.map((row) => row.textContent), e.target.value).forEach((keep, i) => { rows[i].hidden = !keep; });
  });
}
