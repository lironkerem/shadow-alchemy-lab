/* js/features/shadowGuidedProcess.js  – fixed version */
import { createModal } from '/js/core/modal.js';

export function openShadowGuidedProcessModal() {
  const { modal, closeModal } = createModal({
    id: 'shadowGuidedProcessModal',
    title: 'Shadow Guided Process',
    subtitle: '',
    content: '<div id="shadow-guided-process-content" style="overflow-y:auto;max-height:calc(90vh - 100px)"></div>',
    actions: '',
    onClose: () => window.AppController.renderDashboard()
  });

  const card = modal.querySelector('.modal-card');
  card.style.maxWidth = '700px';
  card.style.maxHeight = '90vh';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';

  const contentEl = modal.querySelector('#shadow-guided-process-content');

  // FIXED: Check if DailyJourneyEngine exists and is initialized
  if (!window.DailyJourneyEngine) {
    console.error('DailyJourneyEngine not found!');
    contentEl.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: var(--neuro-error);">
        <h3>Engine Not Loaded</h3>
        <p>The Daily Journey Engine is not available. Please refresh the page.</p>
        <button id="close-error" class="btn" style="margin-top: 1rem;">Close</button>
      </div>
    `;
    contentEl.querySelector('#close-error').addEventListener('click', closeModal);
    return;
  }

  // FIXED: Wait for DOM to be ready and then start journey
  setTimeout(() => {
    try {
      console.log('Starting Daily Journey...');
      window.DailyJourneyEngine.startDailyJourney(contentEl);
      console.log('Daily Journey started successfully');
    } catch (error) {
      console.error('Failed to start Daily Journey:', error);
      contentEl.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--neuro-error);">
          <h3>Error Starting Journey</h3>
          <p>${error.message}</p>
          <button id="close-error" class="btn" style="margin-top: 1rem;">Close</button>
        </div>
      `;
      contentEl.querySelector('#close-error').addEventListener('click', closeModal);
    }
  }, 100);

  // watch for the return button that DailyJourneyEngine injects
  const observer = new MutationObserver(() => {
    const btn = contentEl.querySelector('#return-dash');
    if (btn) {
      btn.addEventListener('click', closeModal);
      observer.disconnect();
    }
  });
  observer.observe(contentEl, { childList: true, subtree: true });
}