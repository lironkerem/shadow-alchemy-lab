/*! DailyJourneyEngine.js  –  Shadow Alchemy  |  10-life-area version  |  production-ready */
(function (window, document) {
  'use strict';

  const STORAGE_KEY = 'daily_journey_v1';
  const REWARD_TOKENS = 5;

  /* ========== DATA LAYER ========== */
  const CASES = [
    { id: 'relationships', label: 'Relationships', intro: 'Mirrors and projections.' },
    { id: 'work',          label: 'Work',          intro: 'Identity, purpose, and worth.' },
    { id: 'money',         label: 'Money',         intro: 'Worth, scarcity, and value.' },
    { id: 'body',          label: 'Body',          intro: 'Shame, pride, and conditioning.' },
    { id: 'thoughts',      label: 'Thoughts',      intro: 'Internal narratives and limits.' },
    { id: 'lovelife',      label: 'Love Life',     intro: 'Intimacy, desire, vulnerability.' },
    { id: 'family',        label: 'Family',        intro: 'Inherited patterns and roles.' },
    { id: 'spirituality',  label: 'Spirituality',  intro: 'Meaning, faith, and existential unrest.' },
    { id: 'purpose',       label: 'Purpose',       intro: 'Direction, doubt, and the fear of wasting time.' },
    { id: 'play',          label: 'Play',          intro: 'Pleasure, guilt-free fun, and forgotten lightness.' }
  ];

  const QUESTIONS_TEMPLATE = [
    'Describe what happened or how you feel about {case} right now.',
    'What are you telling yourself about this situation? Notice any internal judgments or stories.',
    'Beneath that story, what emotion sits quietly? Name it and any bodily sensation.',
    'What need was not met here? What would this part of you ask for in a perfect world?',
    'If the shadow part could speak, what short message would it give you now? (Give it compassion.)'
  ];

  const QUESTIONS_SPIRITUALITY = [
    'Describe what is stirring (or feels absent) in your spiritual life right now.',
    'What story are you telling yourself about your connection to something greater—or to nothing at all?',
    'Sit quietly: what emotion lives under that story? Name it, and notice where it sits in the body.',
    'What sacred need is asking to be met here—truth, trust, surrender, or simply space to doubt?',
    'If the restless or faithful part could speak a single whisper to you, what compassionate message would it offer?'
  ];

  const QUESTIONS_PURPOSE = [
    'Describe the quiet (or loud) question you\'re hearing about your direction in life right now.',
    'What internal narrative links your worth to “making it count” or “getting it right”?',
    'Beneath that narrative, what emotion waits—restlessness, dread, longing, something else? Locate it physically.',
    'Which deeper need is asking for acknowledgment—meaning, contribution, freedom, or simply permission to not know yet?',
    'If the part of you that fears wasted time could hand you a single sentence of kindness, what would it say?'
  ];

  const QUESTIONS_PLAY = [
    'When you picture pure, light-hearted play, what moment—or absence—shows up first?',
    'What story do you carry about whether you\'ve “earned” joy or if it\'s a distraction from “real work”?',
    'Drop into the body: what emotion lives under that story—guilt, fear of slack, wistful hunger? Name and locate it.',
    'Which need is quietly asking—rest, creative mischief, sensory delight, or simply the right to exist without output?',
    'If your playful shadow could leap forward and gift you one playful permission slip, what exuberant words would it write?'
  ];

  const EMOTIONS = [
    'Choose one', 'anger', 'sadness', 'fear', 'shame', 'guilt', 'joy',
    'relief', 'anxiety', 'loneliness', 'love', 'embarrassment'
  ];

  const THEME_KEYWORDS = {
    rejection: ['reject', 'rejected', 'rejection', 'ignored', 'left out'],
    control: ['control', 'controlled', 'controlling', 'micromanage', 'must'],
    worth: ['worth', 'worthless', 'deserve', 'deserved', 'value'],
    shame: ['shame', 'ashamed', 'embarrass', 'humiliat'],
    abandonment: ['abandon', 'abandoned', 'left'],
    fear: ['fear', 'afraid', 'scared', 'panic'],
    anger: ['angry', 'anger', 'rage', 'mad'],
    grief: ['loss', 'grief', 'grieve', 'sad'],
    envy: ['envy', 'jealous', 'jealousy'],
    perfection: ['perfect', 'must', 'should', 'ought']
  };

  const PRACTICE_SUGGESTIONS = {
    grounding: { id: 'grounding', title: 'Grounding Body Scan', desc: '3–5 minute grounding body scan to settle energy.' },
    breath: { id: 'breath', title: 'Heart Breath', desc: '4-6 breathing cycles focusing on the heart center.' },
    mirror: { id: 'mirror', title: 'Mirror Compassion', desc: '2–4 minutes of soft mirror-gazing and kind phrases.' },
    movement: { id: 'movement', title: 'Somatic Release', desc: 'Safe movement or shaking for 2–5 minutes to discharge energy.' },
    boundary: { id: 'boundary', title: 'Boundary Script', desc: 'Write and rehearse a short, clear boundary message.' },
    journal: { id: 'journal', title: 'Free Vent Page', desc: 'Continue to write uncensored for 5–10 minutes.' }
  };

  const ARCHETYPE_SUGGESTIONS = {
    perfectionist: { id: 'perfectionist', name: 'Perfectionist', short: 'Control and high standards' },
    wounded_child: { id: 'wounded_child', name: 'Wounded Child', short: 'Need for safety and validation' },
    warrior: { id: 'warrior', name: 'Warrior', short: 'Boundary and agency' },
    lover: { id: 'lover', name: 'Lover', short: 'Desire and intimacy' },
    sage: { id: 'sage', name: 'Sage', short: 'Wisdom and perspective' }
  };

  /* ========== STORAGE LAYER ========== */
  function loadAllJourneys() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('DailyJourneyEngine: load error', e);
      return [];
    }
  }

  function saveAllJourneys(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('DailyJourneyEngine: save error', e);
    }
  }

  /* ========== ANALYSIS LAYER ========== */
  function extractThemes(text) {
    const t = (text || '').toLowerCase();
    const found = {};
    for (const theme in THEME_KEYWORDS) {
      for (const kw of THEME_KEYWORDS[theme]) {
        if (t.includes(kw)) found[theme] = (found[theme] || 0) + 1;
      }
    }
    return Object.keys(found).sort((a, b) => found[b] - found[a]);
  }

  function detectPrimaryEmotion(text) {
    const t = (text || '').toLowerCase();
    for (const em of EMOTIONS) if (t.includes(em)) return em;
    if (t.match(/(afraid|scared|panic)/)) return 'fear';
    if (t.match(/(angry|mad|rage)/)) return 'anger';
    if (t.match(/(sad|loss|grief)/)) return 'sadness';
    return 'neutral';
  }

  function calculateAverageIntensity(answers) {
    if (!Array.isArray(answers) || !answers.length) return 0;
    const sum = answers.reduce((s, a) => s + (Number(a.intensity) || 0), 0);
    return Math.round((sum / answers.length) * 10) / 10;
  }

  function suggestPractice(themes) {
    if (!themes || !themes.length) return PRACTICE_SUGGESTIONS.journal;
    if (themes.includes('shame') || themes.includes('rejection')) return PRACTICE_SUGGESTIONS.mirror;
    if (themes.includes('control') || themes.includes('perfection')) return PRACTICE_SUGGESTIONS.boundary;
    if (themes.includes('anger') || themes.includes('grief')) return PRACTICE_SUGGESTIONS.movement;
    if (themes.includes('fear') || themes.includes('anxiety')) return PRACTICE_SUGGESTIONS.breath;
    return PRACTICE_SUGGESTIONS.grounding;
  }

  function suggestArchetype(themes) {
    if (!themes || !themes.length) return ARCHETYPE_SUGGESTIONS.wounded_child;
    if (themes.includes('perfection')) return ARCHETYPE_SUGGESTIONS.perfectionist;
    if (themes.includes('control')) return ARCHETYPE_SUGGESTIONS.warrior;
    if (themes.includes('worth') || themes.includes('money')) return ARCHETYPE_SUGGESTIONS.wounded_child;
    return ARCHETYPE_SUGGESTIONS.wounded_child;
  }

  /* ========== HELPERS ========== */
  function buildQuestions(caseId) {
    const caseLabel = (CASES.find(c => c.id === caseId) || {}).label || caseId;
    let tpl = QUESTIONS_TEMPLATE;
    switch (caseId) {
      case 'spirituality': tpl = QUESTIONS_SPIRITUALITY; break;
      case 'purpose':      tpl = QUESTIONS_PURPOSE;      break;
      case 'play':          tpl = QUESTIONS_PLAY;         break;
    }
    return tpl.map((text, idx) => ({
      id: `q${idx + 1}`,
      text: text.replace('{case}', caseLabel)
    }));
  }

  function awardTokens(tokens = REWARD_TOKENS) {
    if (window.AppController && typeof window.AppController.addTokens === 'function') {
      try { window.AppController.addTokens(tokens); } catch (e) { console.warn('DailyJourneyEngine: addTokens error', e); }
    }
  }

  function uid(prefix = '') {
    return prefix + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  /* ========== UI LAYER ========== */
  function renderCaseSelection(root, callback) {
    const caseGrid = CASES.map(c => `
      <button class="btn case-btn" data-case-id="${c.id}">
        <strong>${c.label}</strong>
        <span class="muted" style="font-size: 0.8rem; font-weight: 400;">${c.intro}</span>
      </button>
    `).join('');
    root.innerHTML = `
      <h3>Choose an area of life to journal about today</h3>
      <div class="case-selection-grid">${caseGrid}</div>
    `;
    root.querySelector('.case-selection-grid').addEventListener('click', e => {
      const btn = e.target.closest('.case-btn');
      if (btn) callback(btn.dataset.caseId);
    });
  }

  function renderStep(root, session, questions, stepIndex, onBack, onNext) {
    const q = questions[stepIndex];
    const progressPercent = Math.round(((stepIndex) / questions.length) * 100);
    root.querySelector('#journey-progress').innerHTML = `
      <div class="muted" style="font-size:0.9rem">Step ${stepIndex + 1} of ${questions.length}</div>
      <div class="progress-bar" style="margin-top:8px">
        <div class="progress-fill" style="width:${progressPercent}%"></div>
      </div>
    `;
    const emotionOptions = EMOTIONS.concat(['other', 'neutral'])
      .map(em => `<option value="${em}">${em.charAt(0).toUpperCase() + em.slice(1)}</option>`)
      .join('');
    root.querySelector('#journey-question-box').innerHTML = `
      <h4>${q.text}</h4>
      <textarea id="journey-answer" class="form-input" placeholder="Write your response here..." 
        style="min-height: 120px; margin-top: 0.5rem;"></textarea>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; align-items: center;">
        <div>
          <label class="form-label">Primary emotion:</label>
          <select id="journey-emotion" class="form-input">${emotionOptions}</select>
        </div>
        <div>
          <label class="form-label">Intensity: <span id="intensity-value">5</span></label>
          <input id="journey-intensity" type="range" min="1" max="10" value="5">
        </div>
      </div>
    `;
    const intensitySlider = root.querySelector('#journey-intensity');
    const intensityValue = root.querySelector('#intensity-value');
    intensitySlider.addEventListener('input', () => { intensityValue.textContent = intensitySlider.value; });
    const existing = session.steps.find(s => s.qid === q.id);
    if (existing) {
      root.querySelector('#journey-answer').value = existing.answerText || '';
      root.querySelector('#journey-emotion').value = existing.emotion || 'neutral';
      intensitySlider.value = existing.intensity || 5;
      intensityValue.textContent = intensitySlider.value;
    }
    root.querySelector('#journey-nav').innerHTML =
      (stepIndex > 0 ? '<button id="journey-back" class="btn">Back</button>' : '') +
      `<button id="journey-next" class="btn btn-primary">
        ${stepIndex === questions.length - 1 ? 'Proceed to Vent' : 'Save & Next'}
      </button>`;
    root.querySelector('#journey-next').addEventListener('click', () => {
      const stepEntry = {
        qid: q.id,
        question: q.text,
        answerText: root.querySelector('#journey-answer').value.trim(),
        emotion: root.querySelector('#journey-emotion').value,
        intensity: Number(root.querySelector('#journey-intensity').value)
      };
      onNext(stepEntry);
    });
    const backBtn = root.querySelector('#journey-back');
    if (backBtn) backBtn.addEventListener('click', onBack);
  }

  function renderVent(root, onBack, onFinish) {
    root.querySelector('#journey-progress').innerHTML = `
      <div class="muted" style="font-size:0.9rem">Integration & Release</div>
      <div class="progress-bar" style="margin-top:8px">
        <div class="progress-fill" style="width:95%"></div>
      </div>
    `;
    root.querySelector('#journey-question-box').innerHTML = `
      <h4>Cathartic Venting</h4>
      <p class="muted">This space is for release, not editing. Write freely.</p>
      <textarea id="journey-vent" class="form-input" placeholder="Venting box..."
        style="min-height: 180px; margin-top: 0.5rem;"></textarea>
    `;
    root.querySelector('#journey-nav').innerHTML = `
      <button id="journey-back" class="btn">Back to Questions</button>
      <button id="journey-finish" class="btn btn-primary">Finish Journey</button>
    `;
    root.querySelector('#journey-back').addEventListener('click', onBack);
    root.querySelector('#journey-finish').addEventListener('click', () => {
      onFinish(root.querySelector('#journey-vent').value.trim());
    });
  }

  function renderComplete(root, summary) {
    root.innerHTML = `
      <h3>Journey Complete</h3>
      <p class="muted">Your reflection is saved. You earned tokens for your practice.</p>
      <div class="neuro-stat" style="text-align: left; margin-top: 1.5rem;">
        <div><strong>Primary themes</strong>: ${(summary.themes || []).slice(0, 3).join(', ') || 'None detected'}</div>
        <div style="margin-top:6px"><strong>Suggested practice</strong>: ${(summary.suggestedPractice || {}).title || 'None'}</div>
        <div style="margin-top:6px"><strong>Suggested archetype</strong>: ${(summary.suggestedArchetype || {}).name || 'None'}</div>
      </div>
      <div class="card-actions">
        <button id="return-dash" class="btn">Return to Dashboard</button>
      </div>
    `;
  }

  /* ========== ENGINE CLASS ========== */
  const DailyJourneyEngine = {
    _lastSummary: null,
    init() {
      loadAllJourneys();
      console.info('DailyJourneyEngine initialized (10-area version)');
    },
    getAllJourneys() { return loadAllJourneys(); },
    startDailyJourney(containerOrSelector, options = {}) {
      const root = (typeof containerOrSelector === 'string')
        ? document.querySelector(containerOrSelector)
        : containerOrSelector;
      if (!root) { console.warn('DailyJourneyEngine: no container found'); return; }
      const chosenCase = options.caseId || null;
      if (!chosenCase) {
        renderCaseSelection(root, (caseId) => { this.startDailyJourney(root, { caseId }); });
        return;
      }
      const questions = buildQuestions(chosenCase);
      const session = {
        id: uid('journey-'),
        caseId: chosenCase,
        startedAt: Date.now(),
        steps: [],
        vent: '',
        meta: {}
      };
      const caseLabel = (CASES.find(c => c.id === chosenCase) || {}).label || chosenCase;
      root.innerHTML = `
        <h3>Daily Journey – ${caseLabel}</h3>
        <p class="muted">A guided 5-step reflection. Move slowly, breathe, and answer from the heart.</p>
        <div id="journey-progress" style="margin: 1rem 0;"></div>
        <div id="journey-question-box" style="margin-top: 8px;"></div>
        <div id="journey-nav" class="card-actions" style="margin-top: 1rem;"></div>
      `;
      const self = this;
      function showStep() {
        const stepIndex = session.steps.length;
        if (stepIndex >= questions.length) {
          renderVent(root,
            () => { session.steps.pop(); showStep(); },
            (vent) => { session.vent = vent; self.completeJourney(session); renderComplete(root, self._lastSummary || {}); }
          );
        } else {
          renderStep(root, session, questions, stepIndex,
            () => { session.steps.pop(); showStep(); },
            (stepEntry) => { session.steps.push(stepEntry); showStep(); }
          );
        }
      }
      showStep();
    },
    completeJourney(session) {
      const allText = session.steps.map(s => s.answerText).join(' ') + ' ' + (session.vent || '');
      const themes = [];
      session.steps.forEach(s => extractThemes(s.answerText || '').forEach(f => { if (!themes.includes(f)) themes.push(f); }));
      extractThemes(session.vent || '').forEach(f => { if (!themes.includes(f)) themes.push(f); });
      const entry = {
        id: uid('entry-'),
        sessionId: session.id,
        caseId: session.caseId,
        date: new Date().toISOString(),
        steps: session.steps.slice(),
        vent: session.vent,
        meta: session.meta || {},
        themes,
        primaryEmotion: detectPrimaryEmotion(allText),
        intensity: calculateAverageIntensity(session.steps),
        suggestedPractice: suggestPractice(themes),
        suggestedArchetype: suggestArchetype(themes)
      };
      const all = loadAllJourneys(); all.push(entry); saveAllJourneys(all); awardTokens(REWARD_TOKENS);
      this._lastSummary = { themes: entry.themes, suggestedPractice: entry.suggestedPractice, suggestedArchetype: entry.suggestedArchetype };
      return { entry, summary: this._lastSummary };
    }
  };

  /* ========== GLOBAL EXPORT ========== */
  window.DailyJourneyEngine = DailyJourneyEngine;
  document.addEventListener('DOMContentLoaded', () => DailyJourneyEngine.init());
})(window, document);