// js/render.js
window.app = window.app || {};
(function(app){
  // Show image at order index (used for initial show or direct jumps)
  app.show = async function show(idx){
    if (!app.order.length) return;
    idx = Math.max(0, Math.min(idx, app.order.length - 1));
    app.i = idx;

    // Prefer already-cached URL
    let url = app.cacheGet(idx);
    if (!url) {
      // Fully decode before swapping (preloadImage ensures decode)
      const res = await app.preloadImage?.(idx);
      url = res?.url;
    }
    if (!url) return;

    const img = app.el.img;
    if (!img) return;

    // For normal show, don't touch 'is-loading' here (we're decoded).
    // img.classList.add('is-loading');
    img.classList.add('is-soft-blur');
    img.hidden = false;
    img.classList.toggle('cover-mode', !!app.el.coverModeInput?.checked);

    img.src = url;

    // HUD bits
    if (app.el.indexSpan) app.el.indexSpan.textContent = String(idx + 1);
    app.updateActiveThumb?.();

    // Kick off specific "next" preload and also keep the preload window ahead
    app.preloadNextFrom?.(idx);
    app.maybePreloadAhead?.(idx);
  };

  // Swap to a pre-decoded URL without extra blur toggles (used by timer_engine transitions)
  app.swapToPredecoded = function swapToPredecoded(idx, url){
    const img = app.el.img;
    if (!img || !url) return;
    img.hidden = false;
    img.classList.toggle('cover-mode', !!app.el.coverModeInput?.checked);
    img.src = url;

    if (app.el.indexSpan) app.el.indexSpan.textContent = String(idx + 1);
    app.updateActiveThumb?.();

    // prepare next window after swap
    app.preloadNextFrom?.(idx);
    app.maybePreloadAhead?.(idx);
  };
})(window.app);

