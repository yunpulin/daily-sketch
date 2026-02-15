window.app = window.app || {};
(function(app){
  let hudHideTimer = null;
  function panelsOpen() {
    return !!(app.el.hintsPanel && !app.el.hintsPanel.hidden);
  }
  function canAutoHide() {
    return app.phase !== app.PHASE.IDLE && app.phase !== app.PHASE.DONE && !panelsOpen();
  }
  app.hideHud = () => app.el.hud.classList.add('autohide-hidden');
  app.showHud = () => app.el.hud.classList.remove('autohide-hidden');
  app.cancelHudHide = () => { if (hudHideTimer) { clearTimeout(hudHideTimer); hudHideTimer = null; } };
  app.scheduleHudHide = () => {
    app.cancelHudHide();
    if (!canAutoHide()) return;
    hudHideTimer = setTimeout(() => { if (canAutoHide()) app.hideHud(); }, app.HUD_AUTOHIDE_MS);
  };
  ['mousemove','keydown','touchstart','click'].forEach(evt => {
    document.addEventListener(evt, () => { app.showHud(); app.scheduleHudHide(); }, { passive: true });
  });
  app.on(app.el.hud, 'click', (e) => {
    app.showHud();
    app.scheduleHudHide();
    e.stopPropagation();
  });
})(window.app);

