// js/features/subShadowsLab.js
import { createModal } from '/js/core/modal.js';

export function openSubShadowsLabModal() {
  const engine = window.archetypesEngine; // global instance
  const allShadows = engine.getAllShadows();
  const completedShadows = engine.getCompletedShadows();

  const categories = {
    'Hero Shadows': [], 'Lover Shadows': [], 'Warrior Shadows': [],
    'Sage Shadows': [], 'Healer Shadows': [], 'Shadow Shadows': []
  };
  allShadows.forEach(s => {
    if (categories[s.category]) categories[s.category].push(s);
  });

  const categoriesHTML = Object.entries(categories)
    .filter(([, shadows]) => shadows.length)
    .map(([category, shadows]) => `
      <div style="margin-bottom:var(--spacing-lg)">
        <h4 style="color:var(--neuro-accent);margin-bottom:var(--spacing-sm)">${category}</h4>
        <div style="display:grid;gap:var(--spacing-sm)">
          ${shadows.map(s => {
            const done = completedShadows.includes(s.id);
            return `
              <div class="shadow-library-item" data-shadow-id="${s.id}" style="
                padding:var(--spacing-md);border-radius:var(--radius-md);
                box-shadow:${done ? 'inset 4px 4px 8px var(--neuro-shadow-dark), inset -4px -4px 8px var(--neuro-shadow-light)' : '4px 4px 8px var(--neuro-shadow-dark), -4px -4px 8px var(--neuro-shadow-light)'};
                cursor:pointer;transition:all var(--transition-fast);${done ? 'opacity:0.7' : ''}">
                <div style="display:flex;align-items:center;gap:var(--spacing-sm);margin-bottom:var(--spacing-xs)">
                  <span style="font-size:1.2rem">${s.icon}</span>
                  <strong>${s.title}</strong>
                  ${done ? '<span style="color:var(--neuro-success);margin-left:auto">✓ Complete</span>' : ''}
                </div>
                <div class="muted" style="font-size:0.85rem;margin-bottom:var(--spacing-xs)">${s.tagline}</div>
                <div class="muted" style="font-size:0.8rem">⏱️ ${s.estimatedTime}</div>
              </div>`;
          }).join('')}
        </div>
      </div>`).join('');

  const { modal, closeModal } = createModal({
    id: 'subShadowsLabModal',
    title: 'Sub-Shadows Lab',
    subtitle: 'Targeted 15-25 minute journeys focused on specific shadow patterns. Click any shadow to begin.',
    content: `<div class="scrollable-content" style="overflow-y:auto">${categoriesHTML}</div>`,
    actions: '<button id="close-sub-shadows-lab-btn" class="btn">Close</button>'
  });

  const card = modal.querySelector('.modal-card');
  card.style.maxWidth = '700px';
  card.style.maxHeight = '90vh';

  modal.querySelector('#close-sub-shadows-lab-btn').addEventListener('click', closeModal);

  modal.querySelectorAll('.shadow-library-item').forEach(item => {
    item.addEventListener('click', () => {
      const shadowId = item.dataset.shadowId;
      closeModal();
      import('./subShadowJourney.js').then(m => m.openSubShadowJourneyModal(shadowId));
    });
    item.addEventListener('mouseenter', () => {
      if (!completedShadows.includes(item.dataset.shadowId)) {
        item.style.transform = 'translateY(-2px)';
        item.style.boxShadow = '6px 6px 12px var(--neuro-shadow-dark), -6px -6px 12px var(--neuro-shadow-light)';
      }
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
      item.style.boxShadow = completedShadows.includes(item.dataset.shadowId)
        ? 'inset 4px 4px 8px var(--neuro-shadow-dark), inset -4px -4px 8px var(--neuro-shadow-light)'
        : '4px 4px 8px var(--neuro-shadow-dark), -4px -4px 8px var(--neuro-shadow-light)';
    });
  });
}