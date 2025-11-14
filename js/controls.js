// js/controls.js
window.app = window.app || {};
(function(app){
  // Choose Folder
  app.on(app.el.pickBtn, 'click', async () => {
    app.el.pickBtn.disabled = true;
    try { await app.chooseDirectory(); } finally { app.el.pickBtn && (app.el.pickBtn.disabled = false); }
  });

  // Play/Pause (single button)
  app.on(app.el.playPauseBtn, 'click', () => app.togglePlayPause());

  // Spacebar as play/pause — robust + ignores form fields
  function isTypingTarget(t){
    if (!t) return false;
    const tag = (t.tagName || '').toLowerCase();
    return t.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
  }
  document.addEventListener('keydown', (e) => {
    // compatible checks for Space across browsers
    const isSpace = e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar';
    if (!isSpace) return;
    if (e.repeat) return;                 // ignore auto-repeat
    if (isTypingTarget(e.target)) return; // don't interfere with typing
    e.preventDefault();
    app.togglePlayPause();
  });

  // Back / FF
  app.on(app.el.backBtn, 'click', async () => {
    app.fadeInThumbsForSkipAction();
    let j = app.i - 1;
    while (j >= 0 && typeof app.order[j] !== 'number') j--;
    if (j >= 0) { app.i = j; await app.show(app.i); app.startPhase(app.phaseDuration); }
  });
  app.on(app.el.ffBtn, 'click', async () => {
    app.fadeInThumbsForSkipAction();
    await app.advance();
  });

  // keyboard left/right
  document.addEventListener('keydown', async (e) => {
    if (isTypingTarget(e.target)) return;
    if (e.code==='ArrowRight') { app.fadeInThumbsForSkipAction(); await app.advance(); }
    if (e.code==='ArrowLeft')  {
      app.fadeInThumbsForSkipAction();
      if (app.i>0){ app.i--; await app.show(app.i); app.startPhase(app.phaseDuration); }
    }
    if (e.key?.toLowerCase?.()==='f') app.el.fullscreenToggleBtn?.click();
    if (e.key==='?' || (e.shiftKey && e.key === '/')) app.el.helpBtn?.click();
  });

  // Fullscreen toggle
  app.on(app.el.fullscreenToggleBtn, 'click', async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(()=>{});
      app.el.fullscreenToggleBtn.title = 'Fullscreen';
      app.el.iconFullscreen.innerHTML = `
        <path d="M15 3h6v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 21H3v-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 3l-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M3 21l7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      `;
    } else {
      await document.documentElement.requestFullscreen().catch(()=>{});
      app.el.fullscreenToggleBtn.title = 'Exit Fullscreen';
      app.el.iconFullscreen.innerHTML = `
        <path d="M19 15v6h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 9V3h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 3l-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M3 21l7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      `;
    }
    app.showHud(); app.scheduleHudHide();
  });

  // Thumbnails toggle (ensure auto-fade arms when opened via button)
  app.on(app.el.thumbsBtn, 'click', async () => {
      const tray = app.el.thumbsTray || document.getElementById('thumbsTray');
      if (!tray) return;
      tray.classList.remove('is-fading');
      const willShow = tray.hidden;
      tray.hidden = !tray.hidden;
      app.showHud?.(); app.scheduleHudHide?.();
      if (!tray.hidden && !app.thumbsBuilt) {
      app.status?.('Building thumbnails…'); await app.buildThumbs?.(); app.status?.('Thumbnails ready');
      }
      if (willShow) app.armThumbsAutoFade?.();
      });
  app.on(app.el.closeThumbs, 'click', () => {
      const tray = app.el.thumbsTray || document.getElementById('thumbsTray');
      if (!tray) return;
      tray.hidden = true;
      tray.classList.remove('is-fading');
      app.showHud?.(); app.scheduleHudHide?.();
      });

  // Panels
  app.on(app.el.settingsBtn, 'click', () => {
      const panel = app.el.settingsPanel || document.getElementById('settings');
      if (!panel) { console.warn('Settings panel not found'); return; }
      panel.hidden = !panel.hidden;
      app.showHud?.(); app.scheduleHudHide?.();
      });
  app.on(app.el.closeSettings, 'click', () => {
      const panel = app.el.settingsPanel || document.getElementById('settings');
      if (!panel) return;
      panel.hidden = true;
      app.showHud?.(); app.scheduleHudHide?.();
      });
  app.on(app.el.helpBtn, 'click', () => {
      const panel = app.el.hintsPanel || document.getElementById('hintsPanel');
      if (!panel) return;
      panel.hidden = !panel.hidden;
      app.showHud?.(); app.scheduleHudHide?.();
      });
  app.on(app.el.closeHints, 'click', () => {
      const panel = app.el.hintsPanel || document.getElementById('hintsPanel');
      if (!panel) return;
      panel.hidden = true;
      app.showHud?.(); app.scheduleHudHide?.();
      });

  // Click-outside to close panels
  document.addEventListener('click', (e) => {
    const d = app.el;
    if (d.settingsPanel && !d.settingsPanel.hidden) {
      if (!d.settingsPanel.contains(e.target) && e.target !== d.settingsBtn) {
        d.settingsPanel.hidden = true; app.showHud(); app.scheduleHudHide();
      }
    }
    if (d.hintsPanel && !d.hintsPanel.hidden) {
      if (!d.hintsPanel.contains(e.target) && e.target !== d.helpBtn) {
        d.hintsPanel.hidden = true; app.showHud(); app.scheduleHudHide();
      }
    }
    if (d.thumbsTray && !d.thumbsTray.hidden) {
      if (!d.thumbsTray.contains(e.target) && e.target !== d.thumbsBtn) {
        d.thumbsTray.hidden = true; app.showHud(); app.scheduleHudHide();
      }
    }
  }, { capture: true });
})(window.app);

