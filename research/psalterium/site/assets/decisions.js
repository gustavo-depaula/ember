/* Every open decision of every psalm on one page. Uses psalm.js for the rendering and for each psalm's stored state,
   so a choice made here is the choice its own page shows (where the browser lets file:// pages share localStorage). */

function bootDecisions() {
  const { psalms, kindIds } = JSON.parse(document.getElementById('decisions-data').textContent);
  const byId = (id) => document.getElementById(id);
  const states = Object.fromEntries(psalms.map((data) => [data.key, loadState(data, localStorage)]));
  // opens on the margin notes (ear.json) when any page has them: the few places that most want Gustavo's ear
  const hasEar = psalms.some((data) => (data.ear ?? []).length);
  const filter = { show: hasEar ? 'ear' : 'all', kind: 'all', psalm: 'all' };
  const pageHref = (data, ref) => `${data.key}.html#${verseAnchor(ref)}`;

  // an ear note leads its decision; a note with no decision behind it (a held gate major) links to its verse
  function earHtml(data) {
    return (data.ear ?? []).map((item) => {
      const d = item.decision && data.decisions.find((x) => x.id === item.decision);
      const lead = `<p class="ear-lead"><a href="${pageHref(data, item.refs[0])}">${escapeHtml(placeLabel(data, item.refs))}</a> ${emphasis(item.note)}</p>`;
      return d && isOpen(d)
        ? `<div class="ear-item">${lead}${decisionHtml(data, states[data.key], d, `${data.key}--`, pageHref(data, d.refs[0] ?? item.refs[0]))}</div>`
        : `<div class="ear-item alone">${lead}</div>`;
    });
  }

  function render() {
    const inView = psalms.filter((data) => filter.psalm === 'all' || filter.psalm === data.key);
    const shown = filter.show === 'ear' ? inView.flatMap(earHtml) : inView.flatMap((data) =>
      data.decisions
        .filter((d) => isOpen(d) && (filter.kind === 'all' || d.kind === filter.kind))
        .map((d) => decisionHtml(data, states[data.key], d, `${data.key}--`, `${data.key}.html#${isStanding(d) ? 'decide' : verseAnchor(d.refs[0])}`)));
    byId('decisions').innerHTML = shown.join('') || `<p class="empty">${filter.show === 'ear' ? 'Nothing is marked for your ear here.' : 'No open decision matches.'}</p>`;
    byId(`s-${filter.show}`).checked = true;
    byId(filter.kind === 'all' ? 'k-all' : kindIds[filter.kind]).checked = true;
    // the kinds sort every open decision; the ear notes are already few
    byId('kind-switch').hidden = filter.show === 'ear';
  }

  document.addEventListener('change', (e) => {
    const { name, value, type, id } = e.target;
    if (id === 'psalm-filter') filter.psalm = value;
    else if (type !== 'radio') return;
    else if (name === 'show') filter.show = value;
    else if (name === 'kind') filter.kind = value;
    else {
      const data = psalms.find((x) => x.key === e.target.dataset.psalm);
      if (!data) return;
      choose(data, states[data.key], e.target.dataset.decision, Number(value));
      saveState(data, states[data.key], localStorage);
    }
    const at = document.activeElement?.id;
    render();
    if (at) byId(at)?.focus({ preventScroll: true });
  });
  document.addEventListener('input', (e) => {
    const data = psalms.find((x) => x.key === e.target.dataset?.psalm);
    if (!data || !e.target.dataset.note) return;
    states[data.key].notes[e.target.dataset.note] = e.target.value;
    saveState(data, states[data.key], localStorage);
  });

  // only psalms that were touched — an untouched psalm has nothing to hand back
  const touched = (state) => Object.keys(state.picks).length || Object.values(state.notes).some(Boolean) || state.stumbles;
  const allMarkdown = () => psalms.filter((data) => touched(states[data.key])).map((data) => asMarkdown(data, states[data.key], todayIso())).join('\n\n---\n\n')
    || 'No decision has been made on any psalm in this browser.';
  byId('copy').addEventListener('click', () => handBack(allMarkdown(), byId('copied'), byId('fallback'), 'Copied — every psalm you have touched.'));

  render();
  return { psalms, states, filter, render, allMarkdown };
}

if (typeof document !== 'undefined' && document.getElementById('decisions-data')) window.psalteriumDecisions = bootDecisions();
