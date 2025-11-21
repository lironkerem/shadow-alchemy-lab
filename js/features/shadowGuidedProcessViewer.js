// js/features/shadowGuidedProcessViewer.js
import { createModal } from '/js/core/modal.js';

export function openShadowGuidedProcessViewModal(entry) {
  const stepsHTML = entry.steps.map(s => `
    <div class="qa-block">
      <div class="q">${s.question}</div>
      <div class="a">${s.answerText}</div>
      <div class="muted" style="font-size:0.85rem;margin-top:0.25rem">
        Emotion: ${s.emotion} | Intensity: ${s.intensity}/10
      </div>
    </div>`).join('');

  const { closeModal } = createModal({
    id: 'shadowGuidedProcessViewModal',
    title: `Shadow Guided Process: ${entry.caseId}`,
    subtitle: new Date(entry.date).toLocaleString(),
    content: `
      <hr>
      <div class="scrollable-content">
        ${stepsHTML}
        ${entry.vent ? `
          <div class="qa-block">
            <div class="q">Cathartic Release</div>
            <div class="a">${entry.vent}</div>
          </div>` : ''}
        <hr>
        <div class="qa-block">
          <div class="q">Analysis</div>
          <div class="muted">
            <strong>Themes:</strong> ${entry.themes?.join(', ') || 'None'}<br>
            <strong>Primary Emotion:</strong> ${entry.primaryEmotion || 'Unknown'}<br>
            <strong>Suggested Practice:</strong> ${entry.suggestedPractice?.title || 'None'}
          </div>
        </div>
      </div>`,
    actions: '<button id="closeShadowGuidedProcessModal" class="btn">Close</button>'
  });

  document.getElementById('closeShadowGuidedProcessModal').addEventListener('click', closeModal);
}