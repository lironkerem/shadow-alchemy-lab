// js/core/state.js
export const STORAGE_KEY = 'shadowAlchemyAppData';

export let state = {
  user: { name: 'User', lightParticles: 0, companionLevel: 1 },
  triggers: [],
  journalEntries: []
};

export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;
  try {
    const parsed = JSON.parse(data);

    // Migration: old tokens → lightParticles
    if (parsed.user?.tokens != null && parsed.user.lightParticles == null) {
      parsed.user.lightParticles = parsed.user.tokens;
      delete parsed.user.tokens;
    }
    // ensure field exists
    if (parsed.user?.lightParticles == null) parsed.user.lightParticles = 0;

    // recalc level
    parsed.user.companionLevel = getCurrentLevel(parsed.user.lightParticles);

    state = Object.assign(state, parsed);
  } catch (e) {
    console.warn('[state] failed to load', e);
  }
}

/* ---------- level helpers ---------- */
const LEVELS = [
  { level: 1, min: 0, max: 49 },
  { level: 2, min: 50, max: 109 },
  { level: 3, min: 110, max: 199 },
  { level: 4, min: 200, max: 299 },
  { level: 5, min: 300, max: 500 },
  { level: 6, min: 501, max: Infinity }
];

export function getCurrentLevel(lp) {
  for (const L of LEVELS) if (lp >= L.min && lp <= L.max) return L.level;
  return 6;
}

export function getNextLevelInfo(lp) {
  const cur = getCurrentLevel(lp);
  if (cur >= 6) return { nextLevel: 6, needed: 0, current: lp, isMaxLevel: true };
  const next = LEVELS[cur]; // cur is 0-indexed for next
  return { nextLevel: cur + 1, needed: next.min - lp, current: lp, isMaxLevel: false };
}