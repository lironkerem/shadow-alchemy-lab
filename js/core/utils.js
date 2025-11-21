/* js/utils.js  – pure helpers, no side effects */

export function getCompanionVisual(level) {
  const stages = ['🌱 Seedling', '🔥 Flame', '🐍 Serpent', '🕊️ Phoenix', '💫 Light-Being', '✨ Ascended'];
  return stages[Math.min(level - 1, stages.length - 1)];
}

export function getArchetypeIcon(id) {
  const map = { hero: '🌕', lover: '🌸', warrior: '🔥', sage: '💎', healer: '🌊', shadow: '🌑' };
  return map[id] || '🔮';
}

export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function showConfirmDialog(message, onConfirm, onCancel) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.zIndex = '10000';
  overlay.innerHTML = `
    <div class="modal-card" style="max-width:400px;padding:var(--spacing-xl)">
      <h3 style="margin:0 0 var(--spacing-md);text-align:center">Confirm Deletion</h3>
      <p style="color:var(--neuro-text-light);text-align:center;margin-bottom:var(--spacing-xl)">${message}</p>
      <div style="display:flex;gap:var(--spacing-sm);justify-content:center">
        <button id="confirm-cancel" class="btn" style="flex:1">Cancel</button>
        <button id="confirm-delete" class="btn btn-primary" style="flex:1;background:linear-gradient(135deg,#ef4444,#dc2626)">Delete</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#confirm-cancel').onclick = () => { close(); if (onCancel) onCancel(); };
  overlay.querySelector('#confirm-delete').onclick = () => { close(); if (onConfirm) onConfirm(); };
  overlay.onclick = e => { if (e.target === overlay) close(); };
}