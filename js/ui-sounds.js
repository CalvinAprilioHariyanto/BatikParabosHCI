/* ─────────────────────────────────────────────────────────
   ui-sounds.js — Micro-interaction sound feedback
   Standalone module. Reads the global parabos_sound_enabled
   preference. No dependency on soundscape.js.
───────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const STORAGE_KEY = 'parabos_sound_enabled';

  const SOUNDS = {
    'add-to-cart': { src: 'assets/audio/add-to-cart.mp3', vol: 0.12 },
    'add-to-wishlist': { src: 'assets/audio/add-to-wishlist.mp3', vol: 0.10 },
    'collection-enter': { src: 'assets/audio/collection-enter.mp3', vol: 0.10 },
    'checkout-success': { src: 'assets/audio/checkout-success.mp3', vol: 0.14 },
  };

  /* Cache audio elements to avoid re-creating on every call */
  const cache = {};

  function isSoundEnabled() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (_) {
      return false;
    }
  }

  /**
   * Play a one-shot UI sound by key.
   * Respects the global sound preference.
   * Fails silently if the file is missing or playback is blocked.
   *
   * @param {string} key — one of: 'add-to-cart', 'add-to-wishlist',
   *                       'collection-enter', 'checkout-success'
   */
  function playUISound(key) {
    if (!isSoundEnabled()) return;

    const cfg = SOUNDS[key];
    if (!cfg) return;

    /* Reuse or create */
    let audio = cache[key];
    if (!audio) {
      audio = new Audio();
      audio.src = cfg.src;
      audio.preload = 'auto';
      audio.addEventListener('error', () => {
        /* Mark as broken so we don't retry */
        cache[key] = null;
      });
      cache[key] = audio;
    }

    if (!audio) return; // previously errored

    /* Reset and play */
    audio.volume = cfg.vol;
    audio.currentTime = 0;
    audio.loop = false;

    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { /* autoplay blocked — silent */ });
    }
  }

  window.playUISound = playUISound;

}());
