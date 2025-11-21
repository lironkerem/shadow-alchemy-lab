/* js/eventListeners.js */
import { showToast, showConfirmDialog } from '/js/core/utils.js';
import { state, saveState } from '/js/core/state.js';

let attached = false;

export function attachDashboardListeners() {
  if (attached) return;
  attached = true;

  document.addEventListener('click', async e => {
    /* ignore slider clicks */
    if (e.target.classList.contains('intensity-slider') ||
        e.target.classList.contains('intensity-value') ||
        e.target.closest('.intensity-slider')) return;

    const t = e.target;
    const id = t.id || t.closest('button')?.id;

    /* main card buttons */
    if (id === 'startNewJourney' || t.closest('#startNewJourney')) {
      e.preventDefault();
      const { openShadowGuidedProcessModal } = await import('/js/features/shadowGuidedProcess.js');
      return openShadowGuidedProcessModal();
    }
    if (id === 'openFreeJournal' || t.closest('#openFreeJournal')) {
      e.preventDefault();
      const { openShadowDialogueModal } = await import('/js/features/shadowDialogue.js');
      return openShadowDialogueModal();
    }
    if (id === 'openTriggerLog' || t.closest('#openTriggerLog')) {
      e.preventDefault();
      const { openTriggerReleaseModal } = await import('/js/features/triggerRelease.js');
      return openTriggerReleaseModal();
    }
if (id === 'open-sub-shadows-lab' || t.closest('#open-sub-shadows-lab')) {
  e.preventDefault();
  const { openSubShadowsLabGrid } = await import('/js/features/subShadowsLabGrid.js');
  return openSubShadowsLabGrid();
}
    if (id === 'continue-last-session' || t.closest('#continue-last-session')) {
      e.preventDefault();
      const engine = window.archetypesEngine;
      if (engine.state.activeShadowId) {
        const { openSubShadowJourneyModal } = await import('/js/features/subShadowJourney.js');
        return openSubShadowJourneyModal(engine.state.activeShadowId);
      }
      if (engine.state.activeArchetypeId) {
        const { openArchetypeIntegrationStudioModal } = await import('/js/features/archetypeStudio.js');
        return openArchetypeIntegrationStudioModal();
      }
      return;
    }

    /* saved-work toggle */
    if (id === 'toggle-saved-work' || id === 'saved-work-arrow' || id === 'saved-work-header') {
      const content = document.getElementById('saved-work-content');
      const arrow = document.getElementById('saved-work-arrow');
      if (content && arrow) {
        const hide = content.style.display !== 'none';
        content.style.display = hide ? 'none' : 'block';
        arrow.textContent = hide ? '▼' : '▲';
      }
      return;
    }

    /* entry action buttons */
    const isEdit = t.classList.contains('entry-edit-btn');
    const isView = t.classList.contains('entry-view-btn');
    const isDel  = t.classList.contains('entry-delete-btn');

    if (isEdit || isView || isDel) {
      e.preventDefault(); e.stopPropagation();
      const entryId   = t.dataset.entryId;
      const entryType = t.dataset.entryType;

      if (isEdit) {
        if (entryType === 'free') {
          const entry = state.journalEntries.find(j => j.id === entryId);
          if (entry) {
            const { openShadowDialogueModal } = await import('/js/features/shadowDialogue.js');
            return openShadowDialogueModal(entry);
          }
        }
        if (entryType === 'trigger') {
          const entry = state.triggers.find(t => t.id === entryId);
          if (entry) {
            const { openTriggerReleaseModal } = await import('/js/features/triggerRelease.js');
            return openTriggerReleaseModal(entry);
          }
        }
        return;
      }

      if (isView) {
        if (entryType === 'journey') {
          const all = window.DailyJourneyEngine?.getAllJourneys() || [];
          const entry = all.find(j => j.id === entryId);
          if (entry) {
            const { openShadowGuidedProcessViewModal } = await import('/js/features/shadowGuidedProcessViewer.js');
            return openShadowGuidedProcessViewModal(entry);
          }
        }
        return;
      }

      if (isDel) {
        const name = entryType === 'journey' ? 'Shadow Guided Process' : entryType === 'free' ? 'Shadow Dialogue' : 'Trigger Release';
        showConfirmDialog(`Delete this ${name}? This action cannot be undone.`, () => {
          if (entryType === 'journey') {
            const all = window.DailyJourneyEngine?.getAllJourneys() || [];
            localStorage.setItem('daily_journey_v1', JSON.stringify(all.filter(j => j.id !== entryId)));
            showToast('Shadow Guided Process deleted');
          } else if (entryType === 'free') {
            state.journalEntries = state.journalEntries.filter(j => j.id !== entryId);
            saveState(); showToast('Shadow Dialogue deleted');
          } else if (entryType === 'trigger') {
            state.triggers = state.triggers.filter(t => t.id !== entryId);
            saveState(); showToast('Trigger Release deleted');
          }
          window.AppController.renderDashboard();
        });
        return;
      }
    }

    /* entry content clicks (view mode) */
    const entryContent = t.closest('.entry-content');
    if (entryContent) {
      const row = entryContent.closest('.journal-entry');
      if (!row) return;
      const id   = row.dataset.entryId;
      const type = row.dataset.entryType;

    if (type === 'journey') {
      const all = window.DailyJourneyEngine?.getAllJourneys() || [];
      const entry = all.find(j => j.id === id);
      if (entry) {
        const { openShadowGuidedProcessViewModal } = await import('/js/features/shadowGuidedProcessViewer.js');
        return openShadowGuidedProcessViewModal(entry);
      }
    }
    if (type === 'free') {
      const entry = state.journalEntries.find(j => j.id === id);
      if (entry) {
        const { openShadowDialogueModal } = await import('/js/features/shadowDialogue.js');
        return openShadowDialogueModal(entry);
      }
    }
    if (type === 'trigger') {
      const entry = state.triggers.find(t => t.id === id);
      if (entry) {
        const { openTriggerReleaseModal } = await import('/js/features/triggerRelease.js');
        return openTriggerReleaseModal(entry);
      }
    }
      return;
    }

    /* archetype card clicks */
    const archetypeCard = t.closest('.archetype-card');
    if (archetypeCard) {
      const archetypeId = archetypeCard.dataset.archetypeId;
      if (archetypeId) {
        const { openArchetypeIntegrationStudioModal } = await import('/js/features/archetypeStudio.js');
        return openArchetypeIntegrationStudioModal(archetypeId);
      }
    }
  });
}