// js/features/subShadowJourney.js
import { createModal } from '/js/core/modal.js';
import { showToast } from '/js/core/utils.js';

export function openSubShadowJourneyModal(shadowId) {
  const engine = window.archetypesEngine;
  const shadow = engine.setActiveShadow(shadowId);
  if (!shadow) return showToast('Shadow journey not found', 'error');

  const { modal, closeModal } = createModal({
    id: 'subShadowJourneyModal',
    title: `${shadow.icon} ${shadow.title}`,
    subtitle: `${shadow.tagline}<br><span style="font-size:0.85rem">⏱️ ${shadow.estimatedTime}</span>`,
    content: '<div id="sub-shadow-journey-content" style="overflow-y:auto;max-height:calc(90vh - 200px)"></div>',
    actions: '',
    onClose: () => {
      engine.saveUserState();
      window.AppController.renderDashboard();
    }
  });

  const card = modal.querySelector('.modal-card');
  card.style.maxWidth = '700px';
  card.style.maxHeight = '90vh';

  renderStep(modal);
}

async function renderStep(modal) {
  const engine   = window.archetypesEngine;
  const contentEl= modal.querySelector('#sub-shadow-journey-content');
  const idx      = engine.state.selectedStepIndex;
  const journey  = engine.getActiveJourney();
  if (!journey) return;

  const total    = journey.steps.length;
  if (idx >= total) return showCompletion(modal);

  const step     = engine.getStep(idx);
  const progress = Math.round((idx / total) * 100);
  const existing = engine.state.answers[step.id] || '';

  contentEl.innerHTML = `
    <div style="background:var(--neuro-bg);padding:var(--spacing-md);border-radius:var(--radius-lg);box-shadow:var(--shadow-inset-sm);margin-bottom:var(--spacing-md)">
      <h4 style="margin:0 0 var(--spacing-xs) 0;color:var(--neuro-accent)">${step.title}</h4>
      <p class="muted" style="font-size:0.9rem;margin:0">Step ${idx + 1} of ${total}</p>
    </div>
    <div class="progress-bar" style="margin:var(--spacing-md) 0"><div class="progress-fill" style="width:${progress}%"></div></div>
    <p style="margin-bottom:var(--spacing-md);line-height:1.6">${step.description}</p>
    <div style="background:var(--neuro-bg);padding:var(--spacing-lg);border-radius:var(--radius-lg);box-shadow:var(--shadow-inset);margin:var(--spacing-lg) 0">
      <p style="font-weight:600;margin-bottom:var(--spacing-sm)">${step.prompt}</p>
      <p class="muted" style="font-size:0.9rem;line-height:1.5">${step.guidance}</p>
    </div>
    ${renderInput(step, existing)}
    <div class="modal-actions">
      ${idx > 0 ? '<button id="step-back" class="btn">Back</button>' : '<button id="step-close" class="btn">Close</button>'}
      <button id="step-next" class="btn btn-primary">${idx === total - 1 ? 'Complete Journey' : 'Next Step'}</button>
    </div>`;

  contentEl.querySelector('#step-back')?.addEventListener('click', () => {
    engine.previousStep();
    renderStep(modal);
  });
  contentEl.querySelector('#step-close')?.addEventListener('click', () => {
    engine.saveUserState();
    modal.remove();
    window.AppController.renderDashboard();
  });
  contentEl.querySelector('#step-next').addEventListener('click', () => {
    const resp = collectResponse(step, contentEl);
    if (!resp || (typeof resp === 'string' && resp.trim() === ''))
      return showToast('Please provide a response before continuing.', 'error');

    engine.submitUserResponse(step.id, resp);
    if (idx < total - 1) {
      engine.nextStep();
      renderStep(modal);
    } else {
      engine.state.selectedStepIndex = total;
      engine.saveUserState();
      renderStep(modal);
    }
  });
}

function renderInput(step, existing = '') {
  if (step.expectedInputType === 'choice' && step.choices) {
    return `<div style="display:grid;grid-template-columns:1fr;gap:var(--spacing-sm);margin:var(--spacing-lg) 0">
      ${step.choices.map(c => `
        <label class="btn" style="display:block;text-align:left;cursor:pointer;box-shadow:var(--shadow-raised);padding:var(--spacing-md)">
          <input type="radio" name="step-choice" value="${c}" ${existing === c ? 'checked' : ''}> ${c}
        </label>`).join('')}
    </div>`;
  }
  return `<textarea id="step-textarea" class="form-input" style="min-height:180px;margin:var(--spacing-lg) 0;resize:none" placeholder="Take your time. Write from the heart...">${existing}</textarea>`;
}

function collectResponse(step, container) {
  if (step.expectedInputType === 'choice') {
    const checked = container.querySelector('input[name="step-choice"]:checked');
    return checked ? checked.value : '';
  }
  return container.querySelector('#step-textarea')?.value.trim() || '';
}

function showCompletion(modal) {
  const engine  = window.archetypesEngine;
  const journey = engine.getActiveJourney();
  const summary = engine.generateIntegrationSummary();
  const particles = summary.journeyType === 'shadow' ? 5 : 5;

  const contentEl = modal.querySelector('#sub-shadow-journey-content');
  contentEl.innerHTML = `
    <h3>🎉 Journey Complete</h3>
    <div style="background:var(--neuro-bg);padding:var(--spacing-lg);border-radius:var(--radius-lg);box-shadow:var(--shadow-inset-lg);margin:var(--spacing-lg) 0">
      <p style="margin-bottom:var(--spacing-md);white-space:pre-line">${journey.completionMessage}</p>
      <div style="background:var(--neuro-bg);padding:var(--spacing-md);border-radius:var(--radius-md);box-shadow:var(--shadow-inset-sm);margin-top:var(--spacing-md)">
        <strong>Recommended Practice:</strong><br>${journey.recommendedPractice}
      </div>
      <div style="margin-top:var(--spacing-md);padding:var(--spacing-md);background:var(--neuro-bg);border-radius:var(--radius-md);box-shadow:var(--shadow-inset-sm)">
        <strong>XP Earned:</strong> +${engine.state.xp} points
      </div>
    </div>
    <div class="modal-actions">
      <button id="complete-journey" class="btn btn-primary">Complete & Earn Light-Particles</button>
    </div>`;

  contentEl.querySelector('#complete-journey').addEventListener('click', () => {
    window.AppController.addLightParticles(particles);
    import('../utils.js').then(m => m.showToast(`${journey.title} complete! +${particles} Light-Particles earned.`));
    engine.completeJourney();
    engine.clearUserState();
    modal.remove();
    window.AppController.renderDashboard();
  });
}

export { renderStep };