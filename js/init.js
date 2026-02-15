// js/init.js
(function(){
  // Always initialize a global app bag
  const app = window.app || (window.app = { el: {} });

  // safe event binder even if app.on isn't defined yet
  const on = app.on || ((el, ev, fn, opts) => { if (el && el.addEventListener) el.addEventListener(ev, fn, opts); });

  app.updateLandingSelectedName = function(name) {
    if (app.el.landingSelectedName) app.el.landingSelectedName.textContent = name || 'No folder selected';
  };

  app.startSession = async function startSession() {
    if (!app.el.landingError) return;
    app.el.landingError.hidden = true;
    if (typeof app.saveSettings === 'function') app.saveSettings();

    if (!app.selectedHandle) {
      app.el.landingError.textContent = 'Select a folder (or a recent session) before starting.';
      app.el.landingError.hidden = false;
      return;
    }

    if (app.el.startSessionBtn) app.el.startSessionBtn.disabled = true;
    try {
      await app.chooseDirectoryWithHandle(app.selectedHandle);
      app.beginSession?.();
    } finally {
      if (app.el.startSessionBtn) app.el.startSessionBtn.disabled = false;
    }
  };

  function init() {
    // 1) Load persisted settings & recent sessions
    if (typeof app.loadSettings === 'function') app.loadSettings();
    if (typeof app.renderLandingRecents === 'function') app.renderLandingRecents();

    // 2) Preset chips (count & duration)
    on(app.el.durationChips, 'click', (e) => {
      const v = e.target.closest?.('.chip')?.dataset?.seconds;
      if (!v || !app.el.secondsInput) return;
      app.el.secondsInput.value = v;
      if (typeof app.saveSettings === 'function') app.saveSettings();
    });
    on(app.el.countChips, 'click', (e) => {
      const v = e.target.closest?.('.chip')?.dataset?.count;
      if (!v || !app.el.countInput) return;
      app.el.countInput.value = v;
      if (typeof app.saveSettings === 'function') app.saveSettings();
    });

    on(app.el.startSessionBtn, 'click', () => app.startSession());

    // 3) Settings persistence (bind only if controls exist)
    const persistEls = [
      'countInput','secondsInput','shuffleInput','recurseInput','categorySel',
      'breakEveryInput','breakSecondsInput','warmupInput','cooldownInput',
      'soundPackSelect','coverModeInput','fullscreenOnStart'
    ];
    persistEls.forEach(k => {
      const el = app.el[k];
      if (el) on(el, 'change', () => { if (typeof app.saveSettings === 'function') app.saveSettings(); });
    });

    // 4) Thumb size slider
    on(app.el.thumbSizeInput, 'input', () => {
      const v = app.el.thumbSizeInput.value;
      document.documentElement.style.setProperty('--thumb-w', `${v}px`);
      if (app.el.thumbSizeLabel) app.el.thumbSizeLabel.textContent = `${v}px`;
    });
    on(app.el.thumbSizeInput, 'change', () => { if (typeof app.saveSettings === 'function') app.saveSettings(); });
    on(app.el.thumbSizeInput, 'dblclick', () => {
      document.documentElement.style.setProperty('--thumb-w', 'clamp(96px, 14vw, 208px)');
      if (app.el.thumbSizeInput) app.el.thumbSizeInput.value = '';
      if (app.el.thumbSizeLabel) app.el.thumbSizeLabel.textContent = 'Auto';
      if (typeof app.saveSettings === 'function') app.saveSettings();
    });

    // 5) Ensure initial Play/Pause icon state
    if (app.el.iconPlay && app.el.iconPause && app.el.playPauseBtn) {
      const phase = window.app?.phase;
      const idleish = !phase || phase === window.app?.PHASE?.IDLE || phase === window.app?.PHASE?.DONE;
      if (idleish) {
        app.el.iconPlay.removeAttribute('hidden');
        app.el.iconPlay.style.display = '';
        app.el.iconPause.setAttribute('hidden','');
        app.el.iconPause.style.display = 'none';
        app.el.playPauseBtn.setAttribute('aria-pressed', 'false');
      }
    }

    if (app.el.remaining) app.el.remaining.textContent = '00:00';
    if (typeof app.showHud === 'function') app.showHud();
  }

  // Run after DOM is ready so elements exist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
