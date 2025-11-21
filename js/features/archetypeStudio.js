/* js/features/archetypeStudio.js  – production-ready */
import { createModal } from '/js/core/modal.js';
import { getArchetypeIcon } from '/js/core/utils.js';

export function openArchetypeIntegrationStudioModal(archetypeId = null) {
  const engine = window.archetypesEngine;
  if (archetypeId) engine.setActiveArchetype(archetypeId);

engine.state.activeShadowId = null;

  const journey = engine.getActiveJourney();
  if (!journey) return;                       // upstream toast

  const { modal, closeModal } = createModal({
    id: 'archetypeIntegrationStudioModal',
    title: `${journey.icon || getArchetypeIcon(journey.id)} ${journey.title}`,
    subtitle: journey.subtitle,

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

import('/js/features/subShadowJourney.js').then(m => m.renderStep(modal));
}