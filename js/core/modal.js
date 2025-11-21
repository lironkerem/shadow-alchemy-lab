// js/modal.js
export function createModal({ id, title, subtitle, content, actions, onClose }) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = id;
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--spacing-md)">
        <div style="flex:1">
          <h3 style="margin:0">${title}</h3>
          ${subtitle ? `<p class="muted" style="margin-top:var(--spacing-xs)">${subtitle}</p>` : ''}
        </div>
        <button class="btn modal-close-btn" style="padding:8px 12px;font-size:1.2rem;margin-left:var(--spacing-md);flex-shrink:0">✕</button>
      </div>
      ${content}
      <div class="modal-actions">${actions}</div>
    </div>`;
  document.body.appendChild(modal);

  const closeModal = () => {
    modal.remove();
    if (onClose) onClose();
  };
  modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  return { modal, closeModal };
}