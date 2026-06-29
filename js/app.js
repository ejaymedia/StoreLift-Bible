/* ============================================================
   STORELIFT SALES BIBLE — GLOBAL JAVASCRIPT
   Handles: sidebar, progress tracking, localStorage, utilities
   ============================================================ */

/* ─── STORAGE KEYS ───────────────────────────────────────── */
const STORAGE = {
  PROGRESS:      'sl_progress',
  DAILY_GOALS:   'sl_daily_goals',
  LAST_VISITED:  'sl_last_visited',
  CURRENT_MOD:   'sl_current_module',
  CHECKLISTS:    'sl_checklists',
  CALL_COUNT:    'sl_call_count',
};

/* ─── MODULE REGISTRY ────────────────────────────────────── */
const MODULES = [
  { id: 'dashboard',     label: 'Dashboard',                  icon: '⊞',  file: 'index.html' },
  { id: 'mindset',       label: 'Sales Mindset',              icon: '🧠', file: 'mindset.html' },
  { id: 'dealerships',   label: 'Nigerian Car Dealerships',   icon: '🚗', file: 'dealerships.html' },
  { id: 'cold-calling',  label: 'Cold Calling Masterclass',   icon: '📞', file: 'cold-calling.html' },
  { id: 'conversation',  label: 'Conversation Flow',          icon: '💬', file: 'conversation.html' },
  { id: 'objections',    label: 'Objection Handling',         icon: '🛡️', file: 'objections.html' },
  { id: 'demo',          label: 'Demo Presentation',          icon: '🖥️', file: 'demo.html' },
  { id: 'closing',       label: 'Closing Clients',            icon: '🤝', file: 'closing.html' },
  { id: 'whatsapp',      label: 'WhatsApp Templates',         icon: '💚', file: 'whatsapp.html' },
  { id: 'psychology',    label: 'Sales Psychology',           icon: '🎯', file: 'psychology.html' },
  { id: 'daily-system',  label: 'Daily Sales System',         icon: '📅', file: 'daily-system.html' },
  { id: 'simulator',     label: 'AI Call Simulator',          icon: '🤖', file: 'simulator.html' },
  { id: 'resources',     label: 'Resources',                  icon: '📚', file: 'resources.html' },
];

/* ─── PROGRESS HELPERS ───────────────────────────────────── */
function getProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE.PROGRESS)) || {}; }
  catch { return {}; }
}

function setModuleProgress(moduleId, percent) {
  const p = getProgress();
  p[moduleId] = Math.min(100, Math.max(0, percent));
  localStorage.setItem(STORAGE.PROGRESS, JSON.stringify(p));
}

function getModuleProgress(moduleId) {
  return getProgress()[moduleId] || 0;
}

function markModuleComplete(moduleId) {
  setModuleProgress(moduleId, 100);
}

function getTotalProgress() {
  const p = getProgress();
  const total = MODULES.length;
  const done = Object.values(p).filter(v => v === 100).length;
  return Math.round((done / total) * 100);
}

/* ─── DAILY GOALS ────────────────────────────────────────── */
const DEFAULT_GOALS = { calls: 30, conversations: 5, demos: 2, clients: 1 };
const TODAY_KEY = new Date().toDateString();

function getDailyGoals() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE.DAILY_GOALS)) || {};
    return stored[TODAY_KEY] || { calls: 0, conversations: 0, demos: 0, clients: 0 };
  } catch { return { calls: 0, conversations: 0, demos: 0, clients: 0 }; }
}

function updateDailyGoal(key, value) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE.DAILY_GOALS)) || {};
    if (!stored[TODAY_KEY]) stored[TODAY_KEY] = { calls: 0, conversations: 0, demos: 0, clients: 0 };
    stored[TODAY_KEY][key] = Math.max(0, value);
    localStorage.setItem(STORAGE.DAILY_GOALS, JSON.stringify(stored));
  } catch {}
}

/* ─── CHECKLIST HELPERS ──────────────────────────────────── */
function getChecklists() {
  try { return JSON.parse(localStorage.getItem(STORAGE.CHECKLISTS)) || {}; }
  catch { return {}; }
}

function toggleChecklistItem(listId, itemId) {
  const lists = getChecklists();
  if (!lists[listId]) lists[listId] = {};
  lists[listId][itemId] = !lists[listId][itemId];
  localStorage.setItem(STORAGE.CHECKLISTS, JSON.stringify(lists));
  return lists[listId][itemId];
}

function isChecked(listId, itemId) {
  const lists = getChecklists();
  return !!(lists[listId] && lists[listId][itemId]);
}

/* ─── RECENTLY VISITED ───────────────────────────────────── */
function recordVisit(moduleId) {
  try {
    const visits = JSON.parse(localStorage.getItem(STORAGE.LAST_VISITED)) || [];
    const filtered = visits.filter(v => v.id !== moduleId);
    filtered.unshift({ id: moduleId, time: Date.now() });
    localStorage.setItem(STORAGE.LAST_VISITED, JSON.stringify(filtered.slice(0, 5)));
  } catch {}
}

function getRecentVisits() {
  try { return JSON.parse(localStorage.getItem(STORAGE.LAST_VISITED)) || []; }
  catch { return []; }
}

/* ─── SIDEBAR ────────────────────────────────────────────── */
function initSidebar(activeModuleId) {
  const sidebar  = document.querySelector('.sidebar');
  const overlay  = document.querySelector('.sidebar-overlay');
  const hamburger = document.querySelector('.hamburger');

  if (!sidebar) return;

  /* Build nav items */
  const nav = document.querySelector('#sidebar-nav');
  if (nav) {
    const progress = getProgress();
    nav.innerHTML = MODULES.map(m => {
      const pct = progress[m.id] || 0;
      const isActive = m.id === activeModuleId;
      const isComplete = pct === 100;
      return `
        <a href="${m.file}" class="nav-item ${isActive ? 'active' : ''}" data-module="${m.id}">
          <span class="nav-icon">${isComplete ? '✅' : m.icon}</span>
          <span class="nav-label">${m.label}</span>
          ${pct > 0 && pct < 100 ? `<span class="nav-badge">${pct}%</span>` : ''}
        </a>
      `;
    }).join('');
  }

  /* Mobile toggle */
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  /* Search */
  const searchInput = document.querySelector('#sidebar-search');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.nav-item').forEach(el => {
        const label = el.querySelector('.nav-label')?.textContent.toLowerCase() || '';
        el.style.display = label.includes(q) ? '' : 'none';
      });
    });
  }

  /* Record visit */
  if (activeModuleId && activeModuleId !== 'dashboard') {
    recordVisit(activeModuleId);
  }
}

/* ─── ACCORDIONS ─────────────────────────────────────────── */
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const isOpen = body.classList.contains('open');

      /* Close all in same accordion group */
      const parentAccordion = header.closest('.accordion');
      if (parentAccordion) {
        parentAccordion.querySelectorAll('.accordion-body.open').forEach(b => {
          b.classList.remove('open');
          b.previousElementSibling.classList.remove('open');
        });
      }

      if (!isOpen) {
        body.classList.add('open');
        header.classList.add('open');
      }
    });
  });
}

/* ─── CHECKBOXES ─────────────────────────────────────────── */
function initCheckboxes(listId) {
  document.querySelectorAll(`[data-checklist="${listId}"] .check-item`).forEach(item => {
    const itemId = item.dataset.item;
    const box = item.querySelector('.check-box');

    /* Restore state */
    if (isChecked(listId, itemId)) {
      box.classList.add('checked');
      item.classList.add('checked');
    }

    item.addEventListener('click', () => {
      const checked = toggleChecklistItem(listId, itemId);
      box.classList.toggle('checked', checked);
      item.classList.toggle('checked', checked);
    });
  });
}

/* ─── COPY BUTTONS ───────────────────────────────────────── */
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.copy;
      let text = '';
      if (target) {
        const el = document.querySelector(target);
        text = el ? el.innerText : '';
      } else {
        const block = btn.closest('[data-copyable]');
        if (block) text = block.querySelector('.copyable-text')?.innerText || '';
      }
      if (!text) return;
      navigator.clipboard.writeText(text.trim()).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = '✓ Copied';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '⎘ Copy';
        }, 2000);
      });
    });
  });
}

/* ─── TOAST ──────────────────────────────────────────────── */
function showToast(message, icon = '✓') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="toast-icon">${icon}</span> ${message}`;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ─── COUNTER ANIMATION ──────────────────────────────────── */
function animateCounter(el, target, duration = 1000) {
  const start = Date.now();
  const startVal = 0;
  function tick() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(startVal + (target - startVal) * ease);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ─── PROGRESS RING ──────────────────────────────────────── */
function updateProgressRing(svgEl, percent) {
  const circle = svgEl.querySelector('.progress-ring-fill');
  if (!circle) return;
  const r = parseFloat(circle.getAttribute('r'));
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDasharray  = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = offset;
}

/* ─── DAILY GOAL COUNTER (click to increment) ────────────── */
function initGoalCounters() {
  document.querySelectorAll('[data-goal]').forEach(el => {
    const key = el.dataset.goal;
    const goals = getDailyGoals();
    const target = DEFAULT_GOALS[key];
    let current = goals[key] || 0;

    const valueEl = el.querySelector('.goal-current');
    const fillEl  = el.querySelector('.progress-fill');
    const addBtn  = el.querySelector('.goal-add');
    const subBtn  = el.querySelector('.goal-sub');

    function update() {
      if (valueEl) valueEl.textContent = current;
      if (fillEl) fillEl.style.width = Math.min(100, (current / target) * 100) + '%';
      updateDailyGoal(key, current);
    }

    if (addBtn) addBtn.addEventListener('click', () => { current++; update(); showToast(`+1 ${key}!`); });
    if (subBtn) subBtn.addEventListener('click', () => { if (current > 0) { current--; update(); } });

    update();
  });
}

/* ─── MOTIVATION QUOTES ──────────────────────────────────── */
const QUOTES = [
  { text: "Every no brings you closer to a yes. Make the calls.", author: "StoreLift Principle" },
  { text: "The dealership owner you're calling needs a website. You just haven't told them yet.", author: "StoreLift Principle" },
  { text: "Confidence is not thinking you'll close every call. It's knowing rejection doesn't stop you.", author: "StoreLift Principle" },
  { text: "You're not selling a website. You're selling more customers for their dealership.", author: "StoreLift Principle" },
  { text: "30 calls a day. 5 conversations. 2 demos. 1 client. Do the math — it works.", author: "StoreLift System" },
  { text: "They're sitting on Instagram losing customers. You have the solution. Make the call.", author: "StoreLift Principle" },
  { text: "Desperation loses deals. Curiosity wins them. Ask questions, don't beg.", author: "StoreLift Principle" },
  { text: "The best salespeople don't sell. They help people solve problems.", author: "StoreLift Principle" },
  { text: "Nigerian dealerships are ready. The market is open. You just need to show up.", author: "StoreLift Principle" },
  { text: "One client pays your hosting costs for 6 months. One call is all it takes.", author: "StoreLift Math" },
];

function getDailyQuote() {
  const dayIndex = Math.floor(Date.now() / 86400000) % QUOTES.length;
  return QUOTES[dayIndex];
}

/* ─── INIT ALL ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initAccordions();
  initCopyButtons();
});
