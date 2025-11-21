/* js/features/shadowGuidedProcess.js  – absolute imports */
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

  // watch for the return button that DailyJourneyEngine injects
  const observer = new MutationObserver(() => {
    const btn = contentEl.querySelector('#return-dash');
    if (btn) {
      btn.addEventListener('click', closeModal);
      observer.disconnect();
    }
  });
  observer.observe(contentEl, { childList: true, subtree: true });

  if (window.DailyJourneyEngine) {
    window.DailyJourneyEngine.startDailyJourney(contentEl);
  }
}