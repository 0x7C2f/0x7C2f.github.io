/* Awesome Pi Coding Agent page script */

const CATEGORY_ICONS = {
  extension: '🔌',
  theme: '🎨',
  video: '🎬',
  article: '📰',
  misc: '📦',
};

let searchIndex = null;
let categories = null;
let stats = null;
let activeCategory = 'all';
let currentQuery = '';

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function loadJsonl(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  const text = await res.text();
  const entries = [];
  const lines = text.split(/\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      entries.push(JSON.parse(trimmed));
    } catch (err) {
      console.warn(`Skipping invalid JSONL line in ${path}: ${err.message}`);
    }
  }
  return entries;
}

async function init() {
  try {
    const [si, cats, st] = await Promise.all([
      loadJsonl('/assets/awesome-pi-data/search-index.jsonl'),
      loadJsonl('/assets/awesome-pi-data/categories.jsonl'),
      loadJson('/assets/awesome-pi-data/stats.json'),
    ]);
    searchIndex = si;
    categories = cats;
    stats = st;

    const statsEl = document.getElementById('stats-total');
    if (statsEl) statsEl.textContent = `${st.total.toLocaleString()} resources`;
    render();
  } catch (err) {
    console.error(err);
    const container = document.getElementById('awesome-pi-results');
    if (container) container.innerHTML = '<p class="awesome-pi-error">Failed to load directory data.</p>';
  }
}

function getFiltered() {
  let entries = searchIndex || [];
  if (activeCategory !== 'all') {
    entries = entries.filter((e) => e.c === activeCategory);
  }
  if (currentQuery) {
    const q = currentQuery.toLowerCase().trim();
    const terms = q.split(/\s+/).filter(Boolean);
    if (terms.length) {
      entries = entries.filter((e) => {
        const text = `${e.n} ${e.d} ${e.c}`.toLowerCase();
        return terms.every((t) => text.includes(t));
      });
    }
  }
  return entries;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function truncateText(s, len) {
  return s.length > len ? s.slice(0, len) + '…' : s;
}

function render() {
  const container = document.getElementById('awesome-pi-results');
  const emptyEl = document.getElementById('awesome-pi-empty');
  const countEl = document.getElementById('awesome-pi-search-count');
  const entries = getFiltered();

  if (!entries.length) {
    container.innerHTML = '';
    emptyEl.style.display = '';
    countEl.textContent = '0 results';
    return;
  }

  emptyEl.style.display = 'none';
  countEl.textContent = currentQuery ? `${entries.length} result${entries.length === 1 ? '' : 's'}` : '';

  container.innerHTML = entries.map((r) => {
    const icon = CATEGORY_ICONS[r.c] || '📄';
    const categoryLabel = r.c.charAt(0).toUpperCase() + r.c.slice(1);
    const popHtml = r.p ? `<span>${escapeHtml(r.p)}</span>` : '';
    return `<a href="${escapeHtml(r.u)}" target="_blank" rel="noopener noreferrer" class="awesome-pi-entry-card" data-searchable="${escapeHtml(r.n)} ${escapeHtml(r.d)} ${r.c}">
      <h3>${icon} ${escapeHtml(r.n)}</h3>
      <p class="awesome-pi-desc">${escapeHtml(truncateText(r.d, 200))}</p>
      <div class="awesome-pi-meta">
        <span>${escapeHtml(categoryLabel)}</span>
        ${popHtml}
        <span class="awesome-pi-external" style="margin-left:auto">↗</span>
      </div>
    </a>`;
  }).join('');
}

function setupTabs() {
  const tabs = document.querySelectorAll('.awesome-pi-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      render();
    });
  });
}

function setupSearch() {
  const input = document.getElementById('awesome-pi-search-input');
  if (!input) return;
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      currentQuery = input.value;
      render();
    }, 150);
  });
}

setupTabs();
setupSearch();
init();
