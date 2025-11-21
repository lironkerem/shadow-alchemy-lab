// js/features/shadowDialogue.js
import { createModal } from '/js/core/modal.js';
import { showToast, showConfirmDialog } from '/js/core/utils.js';
import { state, saveState } from '/js/core/state.js';

const SHADOW_DIALOGUE_TARGETS = [
  'My Spouse','My Lover','My Child','My Family','My Mom','My Dad',
  'My Brother','My Sister','My Best Friend','My Friend','My Acquaintance',
  'My Boss','My Co-worker','My Neighbor','My Pet','My Body',
  'My Self','My God','My Life','My Job'
];

export function openShadowDialogueModal(entry = null) {
  const isEditing = !!entry;

  const { modal, closeModal } = createModal({
    id: 'shadowDialogueModal',
    title: isEditing ? 'View / Edit Entry' : 'Shadow Dialogue',
    subtitle: 'A space for free-form reflection. Write whatever comes to mind without judgment.',
    content: `
      <label style="display:block;margin-top:1rem;margin-bottom:.5rem;color:var(--neuro-text-light)">Your Subject is?</label>
      <select id="mirror-journal-target" class="form-input" style="margin-bottom:1rem">
        <option value="">-- Your Subject is? --</option>
        ${SHADOW_DIALOGUE_TARGETS.map(t =>
          `<option value="${t}" ${isEditing && entry.target === t ? 'selected' : ''}>${t}</option>`).join('')}
      </select>
      <textarea id="shadow-dialogue-textarea" class="form-input" style="min-height:250px;resize:none">${isEditing ? entry.text : ''}</textarea>`,
    actions: `
      ${isEditing ? '<button id="deleteShadowDialogueEntry" class="btn">Delete</button>' : ''}
      <button id="closeShadowDialogueModal" class="btn">Close</button>
      <button id="saveShadowDialogue" class="btn btn-primary">Save Entry</button>`
  });

  modal.querySelector('#saveShadowDialogue').addEventListener('click', () => {
    const text   = modal.querySelector('#shadow-dialogue-textarea').value.trim();
    const target = modal.querySelector('#mirror-journal-target').value;
    if (!text) return;

    if (isEditing) {
      const idx = state.journalEntries.findIndex(j => j.id === entry.id);
      Object.assign(state.journalEntries[idx], { text, target });
      showToast('Shadow Dialogue updated');
    } else {
      state.journalEntries.push({ id: `free-${Date.now()}`, date: new Date().toISOString(), text, target });
      window.AppController.addLightParticles(1);
      showToast('Shadow Dialogue saved');
    }
    saveState();
    window.AppController.renderDashboard();
    closeModal();
  });

  if (isEditing) {
    modal.querySelector('#deleteShadowDialogueEntry').addEventListener('click', () => {
      showConfirmDialog('Delete this entry?', () => {
        state.journalEntries = state.journalEntries.filter(j => j.id !== entry.id);
        saveState();
        window.AppController.renderDashboard();
        closeModal();
        showToast('Entry deleted');
      });
    });
  }
  modal.querySelector('#closeShadowDialogueModal').addEventListener('click', closeModal);
}