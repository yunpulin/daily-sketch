// js/init.js
(function(){
  // Always initialize a global app bag
  const app = window.app || (window.app = { el: {} });

  // safe event binder even if app.on isn't defined yet
  const on = app.on || ((el, ev, fn, opts) => { if (el && el.addEventListener) el.addEventListener(ev, fn, opts); });

  function init() {
    // 1) Load persisted settings & recent sessions (if modules are present)
    if (typeof app.loadSettings === 'function') app.loadSettings();
    if (typeof app.renderRecentSessions === 'function') app.renderRecentSessions();

    // 2) Preset chips
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

    // ✅ Always show Settings on launch so user picks folder or a session
    if (app.el.settingsPanel) {
      app.el.settingsPanel.hidden = false;
    }

    // for good measure, keep HUD visible when settings open
    if (typeof app.showHud === 'function') app.showHud();
  }

  // Run after DOM is ready so elements exist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
