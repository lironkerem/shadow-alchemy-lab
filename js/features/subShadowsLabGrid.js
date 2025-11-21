// js/features/subShadowsLabGrid.js
import { createModal } from '/js/core/modal.js';
import { getArchetypeIcon } from '/js/core/utils.js';

const ARCHETYPE_META = [
  { id: 'hero',     title: 'Hero',     color: '#ef4444' },
  { id: 'lover',    title: 'Lover',    color: '#ec4899' },
  { id: 'warrior',  title: 'Warrior',  color: '#f59e0b' },
  { id: 'sage',     title: 'Sage',     color: '#3b82f6' },
  { id: 'healer',   title: 'Healer',   color: '#22c55e' },
  { id: 'shadow',   title: 'Shadow',   color: '#8b5cf6' }
];

export function openSubShadowsLabGrid() {
  const engine = window.archetypesEngine;

  // Build the 6-button grid (same markup as Studio)
  const gridHTML = `<div class="archetype-grid">
    ${ARCHETYPE_META.map(a => {
      const icon = getArchetypeIcon(a.id);
      return `
        <button class="archetype-card" data-archetype="${a.id}" style="border:2px solid ${a.color}20">
          <div style="font-size:2.2rem;margin-bottom:.4rem">${icon}</div>
          <div>${a.title}</div>
        </button>`;
    }).join('')}
  </div>`;

  const { modal, closeModal } = createModal({
    id: 'subShadowsLabGridModal',
    title: 'Sub-Shadows Lab',
    subtitle: 'Choose an archetype to see its sub-shadows',
    content: gridHTML,
    actions: '<button class="btn" id="close-grid-btn">Close</button>'
  });

  // Click-handlers: open filtered list
  modal.querySelectorAll('.archetype-card').forEach(card => {
    card.addEventListener('click', () => {
      const archetypeId = card.dataset.archetype;
      closeModal();
      openFilteredShadowList(archetypeId);
    });
  });
  modal.querySelector('#close-grid-btn').addEventListener('click', closeModal);
}

/* ---------- filtered list (re-uses old card styles) ---------- */
function openFilteredShadowList(archetypeId) {
  const engine = window.archetypesEngine;
  const shadows = engine.getShadowsByArchetype(archetypeId);
  const completed = engine.getCompletedShadows();

  if (!shadows.length) {
    import('/js/utils.js').then(m => m.showToast('No sub-shadows for this archetype yet.', 'info'));
    return;
  }

  const listHTML = `
    <div class="scrollable-content" style="max-height:60vh;overflow-y:auto">
      ${shadows.map(s => {
        const done = completed.includes(s.id);
        return `
          <div class="shadow-library-item" data-shadow-id="${s.id}" style="
            padding:var(--spacing-md);border-radius:var(--radius-md);margin-bottom:var(--spacing-sm);
            box-shadow:${done ? 'var(--shadow-inset)' : 'var(--shadow-raised)'};
            cursor:pointer;transition:all var(--transition-fast);${done?'opacity:.7':''}">
            <div style="display:flex;align-items:center;gap:var(--spacing-sm)">
              <span style="font-size:1.3rem">${s.icon}</span>
              <strong>${s.title}</strong>
              ${done?'<span style="color:var(--neuro-success);margin-left:auto">✓</span>':''}
            </div>
            <div class="muted" style="font-size:.85rem;margin-top:var(--spacing-xs)">${s.tagline}</div>
          </div>`;
      }).join('')}
    </div>`;

  const { modal, closeModal } = createModal({
    id: 'filteredShadowListModal',
    title: `${getArchetypeIcon(archetypeId)} ${ARCHETYPE_META.find(a=>a.id===archetypeId).title} Sub-Shadows`,
    subtitle: 'Pick a shadow to begin its 15-25 min journey',
    content: listHTML,
    actions: '<button class="btn" id="close-filtered-btn">Close</button>'
  });

  modal.querySelectorAll('.shadow-library-item').forEach(item => {
    item.addEventListener('click', () => {
      const shadowId = item.dataset.shadowId;
      closeModal();
      import('./subShadowJourney.js').then(m => m.openSubShadowJourneyModal(shadowId));
    });
  });
  modal.querySelector('#close-filtered-btn').addEventListener('click', closeModal);
}