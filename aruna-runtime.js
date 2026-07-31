(() => {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const guestName = ['to', 'dear', 'kepada']
    .map((key) => params.get(key))
    .find((value) => value && value.trim());

  function normalizeGuestName(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);
  }

  function applyGuestName() {
    const name = normalizeGuestName(guestName);
    if (!name) return;

    document.querySelectorAll('.namatamu').forEach((wrapper) => {
      const textTarget = wrapper.querySelector('.elementor-heading-title') || wrapper;
      textTarget.textContent = name;
    });

    document.querySelectorAll('#form-field-form_namalengkap, input[name*="namalengkap"]').forEach((input) => {
      if (!input.value) input.value = name;
    });

    document.querySelectorAll('#form-field-nama_terundang, input[name*="nama_terundang"]').forEach((input) => {
      input.value = name;
    });
  }

  function ensureOpenInvitationAudio() {
    const openTargets = document.querySelectorAll('#tombol-buka, #tombol-buka-2');

    openTargets.forEach((target) => {
      target.addEventListener('click', () => {
        const song = document.getElementById('song');
        if (!song || !song.paused) return;

        const playResult = song.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(() => {
            // Browser restrictions may still reject playback. The existing
            // music control remains available as the manual fallback.
          });
        }
      }, { passive: true });
    });
  }

  function makeCopyButtonsReliable() {
    document.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-copy], .copy-content, .wdp-copy');
      if (!button) return;

      const explicitValue = button.getAttribute('data-copy');
      if (!explicitValue) return;

      try {
        await navigator.clipboard.writeText(explicitValue);
      } catch (_) {
        // Existing WeddingPress copy behavior remains the fallback.
      }
    });
  }

  function init() {
    applyGuestName();
    ensureOpenInvitationAudio();
    makeCopyButtonsReliable();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // Elementor and WeddingPress may redraw some widgets after initial load.
  window.addEventListener('load', applyGuestName, { once: true });
  setTimeout(applyGuestName, 1200);
})();
