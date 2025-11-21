// js/dashboardRenderer.js
import { state } from '/js/core/state.js';
import { getCompanionVisual, getArchetypeIcon } from '/js/core/utils.js';
import { getNextLevelInfo } from '/js/core/state.js';

export function renderDashboard() {
  const main = document.getElementById('main-content');
  if (!main) return;

  /* ---------- stats bar ---------- */
  const next = getNextLevelInfo(state.user.lightParticles);
  const statsBarHTML = `
    <div class="stats-bar">
      <div class="neuro-stat"><div class="stat-label">Your Shadow Companion</div><div class="stat-value">${getCompanionVisual(state.user.companionLevel)}</div></div>
      <div class="neuro-stat"><div class="stat-label">Level</div><div class="stat-value">${state.user.companionLevel}</div></div>
      <div class="neuro-stat"><div class="stat-label">Light-Particles</div><div class="stat-value">${state.user.lightParticles}</div></div>
      <div class="neuro-stat"><div class="stat-label">${next.isMaxLevel ? 'Max Level!' : `To Level ${next.nextLevel}`}</div><div class="stat-value" style="font-size:1rem">${next.isMaxLevel ? '✨' : `${next.needed} needed`}</div></div>
    </div>`;

  /* ---------- recent entries ---------- */
  const allEntries = [
    ...(window.DailyJourneyEngine?.getAllJourneys() || []).map(j => ({ ...j, type: 'journey' })),
    ...(state.journalEntries || []).map(j => ({ ...j, type: 'free' })),
    ...(state.triggers || []).map(t => {
      if (!t.id) t.id = `trigger-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      return { ...t, type: 'trigger' };
    })
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const recentHTML = allEntries.length
    ? allEntries.slice(0, 5).map(entry => {
        if (entry.type === 'journey') return journeyRow(entry);
        if (entry.type === 'trigger') return triggerRow(entry);
        return dialogueRow(entry);
      }).join('')
    : '<p class="muted">No entries saved yet. Complete a Shadow Guided Process, a Shadow Dialogue, or Trigger Release.</p>';

  /* ---------- cards ---------- */
  const engine = window.archetypesEngine;
  const hasActive = (engine.state.activeArchetypeId || engine.state.activeShadowId) && engine.state.progress > 0;
  const universal = engine.getUniversalArchetypes();
  const completedShadows = engine.getCompletedShadows();
  const allShadows = engine.getAllShadows();
  const shadowPct = allShadows.length ? Math.round((completedShadows.length / allShadows.length) * 100) : 0;

  main.innerHTML = `
    ${statsBarHTML}
    <div class="dashboard">
      ${shadowLabCard()}
      ${archetypeCard(universal, hasActive)}
      ${subShadowsCard(allShadows, completedShadows, shadowPct)}
      ${savedWorkCard(recentHTML)}
    </div>`;
}

/* ---------- card fragments ---------- */
function shadowLabCard() {
  return `
    <div class="card">
      <div style="text-align:center;margin-bottom:var(--spacing-lg)">
        <div style="font-size:3rem;margin-bottom:var(--spacing-sm)">🔮</div>
        <h3 style="margin:0 0 var(--spacing-xs) 0">Shadow Lab</h3>
        <p style="color:var(--neuro-text-light);font-size:0.95rem;max-width:500px;margin:0 auto">Your primary ritual for reflection and integration.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--spacing-lg);margin-top:var(--spacing-xl)">
        <button id="startNewJourney" class="btn" style="padding:var(--spacing-xl);font-size:1.1rem;font-weight:700;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--spacing-sm);text-align:center;line-height:1.4"><span style="font-size:2rem">🌑</span><span>9-Step Shadow<br>Guided Process</span></button>
        <button id="openFreeJournal" class="btn" style="padding:var(--spacing-xl);font-size:1.1rem;font-weight:700;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--spacing-sm);text-align:center;line-height:1.4"><span style="font-size:2rem">💭</span><span>Shadow<br>Dialogue</span></button>
        <button id="openTriggerLog" class="btn" style="padding:var(--spacing-xl);font-size:1.1rem;font-weight:700;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--spacing-sm);text-align:center;line-height:1.4"><span style="font-size:2rem">⚡</span><span>Trigger<br>Release</span></button>
      </div>
    </div>`;
}

function archetypeCard(universal, hasActive) {
  const engine = window.archetypesEngine;
  return `
    <div class="card">
      <div style="text-align:center;margin-bottom:var(--spacing-lg)">
        <div style="font-size:3rem;margin-bottom:var(--spacing-sm)">✨</div>
        <h3 style="margin:0 0 var(--spacing-xs) 0">The Six Archetypes Integration Studio</h3>
        <p style="color:var(--neuro-text-light);font-size:0.95rem;max-width:500px;margin:0 auto">Enter a personalized Shadow Alchemy journey.</p>
      </div>
      ${hasActive ? `
        <div style="background:var(--neuro-bg);padding:var(--spacing-md);border-radius:var(--radius-md);box-shadow:var(--shadow-inset-sm);margin-bottom:var(--spacing-md)">
          <strong>Active Journey:</strong> ${engine.state.activeArchetypeId || engine.state.activeShadowId} (${engine.state.progress}% complete)
          <button id="continue-last-session" class="btn btn-primary" style="width:100%;margin-top:var(--spacing-sm)">Continue Journey</button>
        </div>` : ''}
      <div class="archetype-grid">
        ${universal.map(a => `
          <div class="archetype-card" data-archetype-id="${a.id}">
            <div style="font-size:1.5rem;margin-bottom:0.25rem">${a.icon}</div>
            <div style="font-weight:600">${a.title}</div>
            <div style="font-size:0.8rem;color:var(--neuro-text-lighter);margin-top:0.25rem">${a.short}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function subShadowsCard(allShadows, completedShadows, shadowPct) {
  return `
    <div class="card">
      <div style="text-align:center;margin-bottom:var(--spacing-lg)">
        <div style="font-size:3rem;margin-bottom:var(--spacing-sm)">🌑</div>
        <h3 style="margin:0 0 var(--spacing-xs) 0">Sub-Shadows Lab</h3>
        <p style="color:var(--neuro-text-light);font-size:0.95rem;max-width:500px;margin:0 auto">Deep dive into 17 specific shadow patterns.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--spacing-md);margin:var(--spacing-lg) 0">
        <div style="text-align:center;padding:var(--spacing-md);background:var(--neuro-bg);border-radius:var(--radius-md);box-shadow:var(--shadow-inset-sm)"><div style="font-size:1.5rem;margin-bottom:var(--spacing-xs)">⏱️</div><div style="font-weight:600;font-size:0.9rem;margin-bottom:2px">15-25 Minutes</div><div style="font-size:0.8rem;color:var(--neuro-text-light)">Per session</div></div>
        <div style="text-align:center;padding:var(--spacing-md);background:var(--neuro-bg);border-radius:var(--radius-md);box-shadow:var(--shadow-inset-sm)"><div style="font-size:1.5rem;margin-bottom:var(--spacing-xs)">💎</div><div style="font-weight:600;font-size:0.9rem;margin-bottom:2px">+5 Light-Particles</div><div style="font-size:0.8rem;color:var(--neuro-text-light)">Per completion</div></div>
        <div style="text-align:center;padding:var(--spacing-md);background:var(--neuro-bg);border-radius:var(--radius-md);box-shadow:var(--shadow-inset-sm)"><div style="font-size:1.5rem;margin-bottom:var(--spacing-xs)">🎯</div><div style="font-weight:600;font-size:0.9rem;margin-bottom:2px">17 Patterns</div><div style="font-size:0.8rem;color:var(--neuro-text-light)">To explore</div></div>
      </div>
      <button id="open-sub-shadows-lab" class="btn btn-primary" style="width:100%;padding:var(--spacing-lg);font-size:1.1rem;font-weight:700;margin-top:var(--spacing-sm)">🔮 Explore All ${allShadows.length} Shadow Patterns</button>
    </div>`;
}

function savedWorkCard(recentHTML) {
  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer" id="saved-work-header">
        <div style="text-align:center;flex:1">
          <div style="font-size:3rem;margin-bottom:var(--spacing-sm)">📚</div>
          <h3 style="margin:0 0 var(--spacing-xs) 0">Your Saved Work</h3>
          <p style="color:var(--neuro-text-light);font-size:0.95rem;margin:0">Recent entries: Shadow Guided Process, Trigger Release, and Shadow Dialogue.</p>
        </div>
        <button class="btn" style="padding:8px 16px;margin-left:var(--spacing-md);flex-shrink:0" id="toggle-saved-work"><span id="saved-work-arrow">▼</span></button>
      </div>
      <div id="saved-work-content" style="display:none;margin-top:var(--spacing-md)">${recentHTML}</div>
    </div>`;
}

/* ---------- row helpers ---------- */
function journeyRow(j) {
  return `
    <div class="journal-entry" data-entry-id="${j.id}" data-entry-type="journey" style="display:flex;justify-content:space-between;align-items:center;gap:var(--spacing-md)">
      <div style="flex:1;cursor:pointer;min-width:0" class="entry-content">
        <div><strong>Shadow Guided Process: ${j.caseId}</strong> — ${new Date(j.date).toLocaleDateString()}</div>
        <div class="muted" style="font-size:0.9rem">${j.primaryEmotion || ''} | ${j.themes?.slice(0, 2).join(', ') || ''}</div>
      </div>
      <div class="entry-actions" style="display:flex;gap:var(--spacing-xs);flex-shrink:0">
        <button class="btn btn-small entry-view-btn" data-entry-id="${j.id}" data-entry-type="journey">View</button>
        <button class="btn btn-small entry-delete-btn" data-entry-id="${j.id}" data-entry-type="journey">Delete</button>
      </div>
    </div>`;
}

function triggerRow(t) {
  return `
    <div class="journal-entry" data-entry-id="${t.id}" data-entry-type="trigger" style="display:flex;justify-content:space-between;align-items:center;gap:var(--spacing-md)">
      <div style="flex:1;cursor:pointer;min-width:0" class="entry-content">
        <div><strong>Trigger Release</strong>${t.source ? `: ${t.source}` : ''} — ${new Date(t.date).toLocaleDateString()}</div>
        <div class="muted" style="font-size:0.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.coreTrigger ? `${t.coreTrigger} → ` : ''}${t.emotion ? `${t.emotion} | ` : ''}Intensity: ${t.intensity}/10</div>
      </div>
      <div class="entry-actions" style="display:flex;gap:var(--spacing-xs);flex-shrink:0">
        <button class="btn btn-small entry-edit-btn" data-entry-id="${t.id}" data-entry-type="trigger">Edit</button>
        <button class="btn btn-small entry-delete-btn" data-entry-id="${t.id}" data-entry-type="trigger">Delete</button>
      </div>
    </div>`;
}

function dialogueRow(d) {
  return `
    <div class="journal-entry" data-entry-id="${d.id}" data-entry-type="free" style="display:flex;justify-content:space-between;align-items:center;gap:var(--spacing-md)">
      <div style="flex:1;cursor:pointer;min-width:0" class="entry-content">
        <div><strong>Shadow Dialogue${d.target ? `: ${d.target}` : ''}</strong> — ${new Date(d.date).toLocaleDateString()}</div>
        <div class="muted" style="font-size:0.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d.text.substring(0, 50)}...</div>
      </div>
      <div class="entry-actions" style="display:flex;gap:var(--spacing-xs);flex-shrink:0">
        <button class="btn btn-small entry-edit-btn" data-entry-id="${d.id}" data-entry-type="free">Edit</button>
        <button class="btn btn-small entry-delete-btn" data-entry-id="${d.id}" data-entry-type="free">Delete</button>
      </div>
    </div>`;
}