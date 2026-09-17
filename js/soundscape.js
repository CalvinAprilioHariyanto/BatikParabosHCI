/* ─────────────────────────────────────────────────────────
   soundscape.js — Contextual audio for the Craft Story
   Lightweight manager using native HTMLAudioElement.
   No external libraries.
───────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Configuration ──────────────────────────────────── */
  const FADE_DURATION = 800;           // ms per fade step
  const FADE_INTERVAL = 30;            // ms between volume ticks
  const STORAGE_KEY = 'parabos_sound_enabled';

  const STAGE_MAP = [
    { src: 'assets/audio/fabric-rustle.mp3', vol: 0.07, loop: true },  // 01 Cloth
    { src: 'assets/audio/texture.mp3', vol: 0.08, loop: true },  // 02 Pattern
    { src: 'assets/audio/canting-wax.mp3', vol: 0.10, loop: true },  // 03 Wax
    { src: 'assets/audio/dye-water.mp3', vol: 0.10, loop: true },  // 04 Dye
    { src: 'assets/audio/fabric-rustle.mp3', vol: 0.06, loop: true },  // 05 Finish
  ];

  /* ── State ──────────────────────────────────────────── */
  let enabled = false;
  let userInteracted = false;   // true after first toggle click
  let currentStage = -1;
  let audioElements = [];       // HTMLAudioElement[] — one per stage
  let fadeTimers = [];        // interval IDs for active fades
  let loadErrors = new Set(); // indices of stages with missing files

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Helpers ────────────────────────────────────────── */

  function createAudioElement(cfg, index) {
    const audio = new Audio();
    audio.src = cfg.src;
    audio.loop = cfg.loop;
    audio.volume = 0;
    audio.preload = 'none';            // don't preload until user opts in

    audio.addEventListener('error', () => {
      loadErrors.add(index);
    });

    return audio;
  }

  function fadeVolume(audio, from, to, duration, cb) {
    if (!audio) { if (cb) cb(); return; }

    const steps = Math.max(1, Math.floor(duration / FADE_INTERVAL));
    const delta = (to - from) / steps;
    let step = 0;

    audio.volume = Math.max(0, Math.min(1, from));

    const id = setInterval(() => {
      step++;
      const newVol = from + delta * step;
      audio.volume = Math.max(0, Math.min(1, newVol));

      if (step >= steps) {
        clearInterval(id);
        audio.volume = Math.max(0, Math.min(1, to));
        if (cb) cb();
      }
    }, FADE_INTERVAL);

    fadeTimers.push(id);
    return id;
  }

  function clearAllFades() {
    fadeTimers.forEach(id => clearInterval(id));
    fadeTimers = [];
  }

  function safePlay(audio) {
    if (!audio) return;
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { /* autoplay blocked or missing file — silent */ });
    }
  }

  function safePause(audio) {
    if (!audio) return;
    try { audio.pause(); } catch (_) { /* noop */ }
  }

  /* ── Core API ───────────────────────────────────────── */

  function initialize() {
    audioElements = STAGE_MAP.map((cfg, i) => createAudioElement(cfg, i));

    // Read saved preference (but don't auto-enable — needs interaction)
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'true' && !prefersReduced) {
        // Preference remembered; will activate on first interaction
      }
    } catch (_) { /* localStorage unavailable */ }
  }

  function enable() {
    enabled = true;
    userInteracted = true;

    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch (_) { }

    // Preload all audio elements now
    audioElements.forEach(a => { a.preload = 'auto'; a.load(); });

    // Start current stage if set
    if (currentStage >= 0) {
      activateStageAudio(currentStage);
    }

    updateToggleUI(true);
  }

  function disable() {
    enabled = false;

    try { localStorage.setItem(STORAGE_KEY, 'false'); } catch (_) { }

    clearAllFades();
    audioElements.forEach((audio, i) => {
      if (audio && !audio.paused) {
        fadeVolume(audio, audio.volume, 0, FADE_DURATION / 2, () => safePause(audio));
      }
    });

    updateToggleUI(false);
  }

  function setStage(index) {
    if (index === currentStage) return;
    const prevStage = currentStage;
    currentStage = index;

    if (!enabled || !userInteracted) return;

    activateStageAudio(index, prevStage);
  }

  function activateStageAudio(index, prevIndex) {
    if (loadErrors.has(index)) return;

    clearAllFades();

    const cfg = STAGE_MAP[index];
    const next = audioElements[index];

    if (!cfg || !next) return;

    // Fade out all others
    audioElements.forEach((audio, i) => {
      if (i !== index && audio && !audio.paused) {
        fadeVolume(audio, audio.volume, 0, FADE_DURATION, () => {
          safePause(audio);
          audio.currentTime = 0;
        });
      }
    });

    // Fade in the new stage
    next.volume = 0;
    safePlay(next);
    fadeVolume(next, 0, cfg.vol, FADE_DURATION);
  }

  function stopAll() {
    clearAllFades();
    audioElements.forEach(audio => {
      if (audio) {
        try {
          audio.volume = 0;
          audio.pause();
          audio.currentTime = 0;
        } catch (_) { }
      }
    });
  }

  /* ── Toggle UI ──────────────────────────────────────── */

  function updateToggleUI(isOn) {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;

    btn.setAttribute('aria-pressed', String(isOn));
    btn.classList.toggle('is-active', isOn);

    const label = btn.querySelector('.sound-toggle__label');
    if (label) label.textContent = isOn ? 'Sound On' : 'Sound';
  }

  function initToggle() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;

    // Restore visual state from localStorage (but don't auto-play)
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'true' && !prefersReduced) {
        btn.classList.add('is-remembered');
      }
    } catch (_) { }

    btn.addEventListener('click', () => {
      if (enabled) {
        disable();
      } else {
        enable();
      }
    });
  }

  /* ── Visibility — show toggle only near craft story ── */

  function initCraftVisibility() {
    const section = document.getElementById('craft-story');
    const btn = document.getElementById('sound-toggle');
    if (!section || !btn) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        btn.classList.toggle('is-section-visible', entry.isIntersecting);
      });
    }, { threshold: 0.05 });

    observer.observe(section);
  }

  /* ── Cleanup ────────────────────────────────────────── */

  function initCleanup() {
    window.addEventListener('beforeunload', () => {
      stopAll();
    });

    // Also stop if page becomes hidden (tab switch)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && enabled) {
        audioElements.forEach(audio => {
          if (audio && !audio.paused) {
            audio.volume = 0;
          }
        });
      } else if (!document.hidden && enabled && currentStage >= 0) {
        const cfg = STAGE_MAP[currentStage];
        const audio = audioElements[currentStage];
        if (cfg && audio && !audio.paused) {
          fadeVolume(audio, 0, cfg.vol, FADE_DURATION);
        }
      }
    });
  }

  /* ── Public interface ───────────────────────────────── */

  const soundscape = {
    initialize,
    enable,
    disable,
    setStage,
    stopAll,
    get enabled() { return enabled; },
    get currentStage() { return currentStage; }
  };

  window.parabos_soundscape = soundscape;

  /* ── Boot ────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    initialize();
    initToggle();
    initCraftVisibility();
    initCleanup();
  });

}());
