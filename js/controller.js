/*  controller.js  – 40-line bootstrap  */
import { state, saveState, loadState } from '/js/core/state.js';
import { renderDashboard } from '/js/dashboardRenderer.js';
import { attachDashboardListeners } from '/js/eventListeners.js';

const archetypesEngine = new ArchetypesEngine({           // global engines already loaded via <script>
  sessionId: `s_${Date.now()}`
});

window.AppController = {                                  // public API (unchanged)
  init,
  renderDashboard,
  addLightParticles
};

/* ---------- bootstrap ---------- */
async function init() {
  console.info('[AppController] bootstrapping');
  await archetypesEngine.ensureDataLoaded();
  loadState();                                           // hydrate state
  renderDashboard();                                     // first paint
  attachDashboardListeners();                            // wire clicks
}

/* ---------- shared helpers ---------- */
function addLightParticles(n = 1) {
  const old = state.user.lightParticles;
  state.user.lightParticles += n;
  const lvl = state.user.companionLevel;
  state.user.companionLevel = getCurrentLevel(state.user.lightParticles); // recalc
  if (state.user.companionLevel > lvl) {
    import('./utils.js').then(u =>
      u.showToast(`Your Shadow Companion evolved to Level ${state.user.companionLevel}! ${u.getCompanionVisual(state.user.companionLevel)}`)
    );
  }
  saveState();
  renderDashboard();                                     // refresh stats
}

/* ---------- tiny level helper (duplicated for speed) ---------- */
const LEVELS = [
  { level: 1, min: 0, max: 49 },
  { level: 2, min: 50, max: 109 },
  { level: 3, min: 110, max: 199 },
  { level: 4, min: 200, max: 299 },
  { level: 5, min: 300, max: 500 },
  { level: 6, min: 501, max: Infinity }
];
function getCurrentLevel(lp) {
  for (const L of LEVELS) if (lp >= L.min && lp <= L.max) return L.level;
  return 6;
}

/* ---------- auto-boot ---------- */
document.addEventListener('DOMContentLoaded', init);

window.archetypesEngine = archetypesEngine;   // expose to world