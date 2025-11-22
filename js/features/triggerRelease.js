/* js/features/triggerRelease.js  – patched & production-ready */
import { createModal } from '/js/core/modal.js';
import { showToast, showConfirmDialog } from '/js/core/utils.js';
import { state, saveState } from '/js/core/state.js';

export function openTriggerReleaseModal(entry = null) {
  const isEditing = !!entry;

  /* ---------- full trigger list ---------- */
  const coreTriggers = {
    'Fear Based Triggers': ['Fear', 'Anxiety', 'Panic', 'Worry', 'Insecurity', 'Vulnerability', 'Helplessness', 'Overwhelm', 'Shock', 'Apprehension'],
    'Anger Based Triggers': ['Anger', 'Rage', 'Frustration', 'Irritation', 'Resentment', 'Bitterness', 'Contempt', 'Disgust', 'Hostility', 'Annoyance'],
    'Shame Based Triggers': ['Shame', 'Embarrassment', 'Guilt', 'Humiliation', 'Unworthiness', 'Failure', 'Self hatred', 'Regret', 'Inferiority', 'Social fear of judgment'],
    'Sadness Based Triggers': ['Sadness', 'Grief', 'Disappointment', 'Loneliness', 'Abandonment', 'Hopelessness', 'Despair', 'Feeling misunderstood', 'Feeling unseen', 'Melancholy'],
    'Control Based Triggers': ['Powerlessness', 'Lack of control', 'Uncertainty', 'Confusion', 'Jealousy', 'Envy', 'Possessiveness', 'Fear of loss', 'Distrust'],
    'Relationship Based Triggers': ['Rejection', 'Betrayal', 'Neglect', 'Being ignored', 'Feeling dismissed', 'Lack of appreciation', 'Lack of validation', 'Feeling replaced', 'Feeling unwanted', 'Feeling unimportant'],
    'Identity Based Triggers': ['Feeling attacked', 'Feeling criticized', 'Feeling excluded', 'Feeling misunderstood', 'Feeling judged', 'Feeling insufficient', 'Feeling disrespected', 'Feeling invisible', 'Feeling compared', 'Feeling underestimated'],
    'Boundary Based Triggers': ['Feeling invaded', 'Feeling controlled', 'Feeling pressured', 'Feeling manipulated', 'Feeling used', 'Feeling exploited', 'Feeling trapped', 'Feeling suffocated'],
    'Performance Based Triggers': ['Fear of failure', 'Fear of success', 'High expectations', 'Perfectionism', 'Pressure', 'Competition', 'Judgement from others', 'Self criticism'],
    'Existential Based Triggers': ['Meaninglessness', 'Emptiness', 'Loss of purpose', 'Loss of identity', 'Isolation', 'Time pressure', 'Mortality', 'Change', 'Unpredictability']
  };

  const coreTriggerOptions = Object.keys(coreTriggers).map(t =>
    `<option value="${t}" ${isEditing && entry.coreTrigger === t ? 'selected' : ''}>${t}</option>`
  ).join('');

  let emotionOptionsHTML = '<option value="">First select a Core Trigger</option>';
  if (isEditing && entry.coreTrigger && coreTriggers[entry.coreTrigger]) {
    emotionOptionsHTML = coreTriggers[entry.coreTrigger].map(e =>
      `<option value="${e}" ${entry.emotion === e ? 'selected' : ''}>${e}</option>`
    ).join('');
  }

  const { modal, closeModal } = createModal({
    id: 'triggerReleaseModal',
    title: isEditing ? 'View / Edit Trigger' : 'Trigger Release',
    subtitle: 'Record emotional reactions and patterns to understand your inner landscape.',
    content: `
      <div style="display:flex;flex-direction:column;gap:var(--spacing-md);max-height:calc(90vh - 220px);overflow-y:auto;padding-right:var(--spacing-sm)">

        <!-- inputs -->
        <div>
          <label class="form-label">Who or What Triggered you?</label>
          <input type="text" id="trigger-source" class="form-input" placeholder="e.g., My boss, A comment, Traffic..." value="${isEditing && entry.source ? entry.source : ''}">
        </div>

        <label class="form-label">Describe your trigger</label>
        <textarea id="trigger-textarea" class="form-input" style="min-height:150px;resize:none" placeholder="What happened and how did it make you feel?">${isEditing ? entry.text : ''}</textarea>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-md)">
          <div>
            <label class="form-label">Core Trigger:</label>
            <select id="trigger-core-trigger" class="form-input"><option value="">Choose Core Trigger</option>${coreTriggerOptions}</select>
          </div>
          <div>
            <label class="form-label">Specific emotion:</label>
            <select id="trigger-emotion" class="form-input" ${!isEditing || !entry.coreTrigger ? 'disabled' : ''} style="color:${!isEditing || !entry.coreTrigger ? '#9ca3af' : ''}">
              ${emotionOptionsHTML}
            </select>
          </div>
        </div>

        <div>
          <label class="form-label">Intensity (0-10):</label>
          <div style="display:flex;align-items:center;gap:var(--spacing-sm)">
            <input type="range" id="trigger-intensity-slider" class="intensity-slider" min="0" max="10" value="${isEditing ? entry.intensity : 5}" style="flex:1">
            <span id="trigger-intensity-value" class="intensity-value">${isEditing ? entry.intensity : 5}</span>
          </div>
        </div>
      </div>
    `,
    actions: `
      ${isEditing ? '<button id="deleteTriggerEntry" class="btn">Delete</button>' : ''}
      <button id="closeTriggerModal" class="btn">Close</button>
      <button id="saveTriggerEntry" class="btn btn-primary">Save Entry</button>
    `,
  });

  /* ---------- wire events ---------- */
  const slider = modal.querySelector('#trigger-intensity-slider');
  const valueDisplay = modal.querySelector('#trigger-intensity-value');
  slider.addEventListener('input', () => valueDisplay.textContent = slider.value);

  // FIXED: Core trigger change handler - placed BEFORE save logic
  const coreSelect = modal.querySelector('#trigger-core-trigger');
  const emotionSelect = modal.querySelector('#trigger-emotion');

  coreSelect.addEventListener('change', () => {
    const selectedCore = coreSelect.value;
    
    if (selectedCore && coreTriggers[selectedCore]) {
      // Enable emotion dropdown and populate with emotions
      emotionSelect.disabled = false;
      emotionSelect.style.color = '';
      emotionSelect.innerHTML = coreTriggers[selectedCore].map(e =>
        `<option value="${e}">${e}</option>`
      ).join('');
    } else {
      // Disable and reset emotion dropdown
      emotionSelect.disabled = true;
      emotionSelect.style.color = '#9ca3af';
      emotionSelect.innerHTML = '<option value="">First select a Core Trigger</option>';
    }
  });

  modal.querySelector('#saveTriggerEntry').addEventListener('click', () => {
    const source = modal.querySelector('#trigger-source').value.trim();
    const text = modal.querySelector('#trigger-textarea').value.trim();
    const core = modal.querySelector('#trigger-core-trigger').value;
    const emotion = modal.querySelector('#trigger-emotion').value;
    const intensity = parseInt(slider.value);

    if (!text || !core || !emotion) return showToast('Required fields missing', 'error');

    if (isEditing) {
      const idx = state.triggers.findIndex(t => t.id === entry.id);
      Object.assign(state.triggers[idx], { source, text, coreTrigger: core, emotion, intensity });
      showToast('Trigger updated successfully');
    } else {
      state.triggers.push({
        id: `trigger-${Date.now()}`,
        date: new Date().toISOString(),
        source,
        text,
        coreTrigger: core,
        emotion,
        intensity
      });
      window.AppController.addLightParticles(1);
      showToast('Trigger released successfully');
    }
    saveState();
    window.AppController.renderDashboard();
    closeModal();
  });

  if (isEditing) {
    modal.querySelector('#deleteTriggerEntry').addEventListener('click', () => {
      showConfirmDialog('Delete this trigger? This action cannot be undone.', () => {
        state.triggers = state.triggers.filter(t => t.id !== entry.id);
        saveState();
        window.AppController.renderDashboard();
        closeModal();
        showToast('Trigger deleted');
      });
    });
  }

  modal.querySelector('#closeTriggerModal').addEventListener('click', closeModal);
}