window.app = window.app || {};
(function(app){
  app.thumbURLs = [];
  app.thumbsBuilt = false;
  app.thumbsAbort = null;
  let io = null; // IntersectionObserver for lazy thumbs

  app.abortThumbs = () => { if (app.thumbsAbort) app.thumbsAbort.abort(); app.thumbsAbort = null; };

  app.clearThumbs = () => {
    app.abortThumbs();
    if (!app.el.thumbsWrap) return;
    for (const url of app.thumbURLs) {
      if (!app.protectedUrls.has(url)) { try { URL.revokeObjectURL(url); } catch {} }
    }
    app.thumbURLs = [];
    app.el.thumbsWrap.innerHTML = '';
    app.thumbsBuilt = false;
    if (io) { io.disconnect(); io = null; }
  };

  function ensureObserver(){
    if (io) return io;
    io = new IntersectionObserver((entries) => {
      for (const ent of entries){
        if (!ent.isIntersecting) continue;
        const img = ent.target;
        const dataSrc = img.getAttribute('data-src');
        if (dataSrc && !img.src) {
          img.src = dataSrc;
          img.removeAttribute('data-src');
        }
        io.unobserve(img);
      }
    }, { root: app.el.thumbsWrap, rootMargin: '200px', threshold: 0.01 });
    return io;
  }

  // Ensure we have an order to build thumbnails from (does not start the timer)
  async function ensureOrderForThumbs() {
    if (Array.isArray(app.order) && app.order.some(v => typeof v === 'number')) return true;
    if (!app.handles || app.handles.length === 0) {
      app.status('Pick a folder first');
      return false;
    }
    const ok = app.buildOrder?.();
    return !!ok;
  }

  app.buildThumbs = async function buildThumbs(){
    if (!app.el.thumbsWrap) return;

    const haveOrder = await ensureOrderForThumbs();
    if (!haveOrder) { app.clearThumbs(); return; }

    app.clearThumbs();
    const observer = ensureObserver();

    const ctrl = new AbortController();
    app.thumbsAbort = ctrl;

    const numericOrder = app.order
      .map((v, idx) => (typeof v === 'number' ? { idx, val: v } : null))
      .filter(Boolean);

    const slice = numericOrder.slice(0, app.MAX_THUMBS);
    let built = 0;

    while (built < slice.length) {
      if (ctrl.signal.aborted) return;

      const end = Math.min(built + app.THUMB_BATCH, slice.length);
      const batch = slice.slice(built, end);

      await Promise.all(batch.map(async ({ idx, val }) => {
        try {
          let url = app.cacheGet(idx);
          if (!url) {
            // If already preloaded, getBlobUrl will be instant; else will create one.
            url = await app.getBlobUrlForIndex(idx);
          }
          app.protectedUrls.add(url);

          const div = document.createElement('div');
          div.className = 'thumb';
          div.dataset.orderIndex = String(idx);

          const img = document.createElement('img');

          // Eager show for current, neighbors, or preloaded
          const eager = Math.abs(idx - app.i) <= 2 || app.preloaded.has(idx);
          if (eager) {
            img.src = url;
          } else {
            img.setAttribute('loading', 'lazy');
            img.setAttribute('data-src', url);
            observer.observe(img);
          }

          div.appendChild(img);

          div.addEventListener('click', async () => {
            app.i = idx;
            await app.show(app.i);
            if (app.phase !== app.PHASE.IDLE && app.phase !== app.PHASE.DONE) {
              app.startPhase(app.phaseDuration);
            }
          });

          app.el.thumbsWrap.appendChild(div);
          if (!app.thumbURLs.includes(url)) app.thumbURLs.push(url);
        } catch (e) {
          console.warn('Thumb build error:', e);
        }
      }));

      built = end;
      await app.sleep(app.THUMB_BATCH_DELAY);
    }

    app.thumbsBuilt = true;
    app.updateActiveThumb();
  };

  app.updateActiveThumb = () => {
    if (!app.el.thumbsWrap || !app.thumbsBuilt) return;
    const items = app.el.thumbsWrap.querySelectorAll('.thumb');
    items.forEach(el => el.classList.remove('active'));
    let target = app.i;
    while (target >= 0 && typeof app.order[target] !== 'number') target--;
    const el = app.el.thumbsWrap.querySelector(`.thumb[data-order-index="${target}"]`);
    if (el){
      el.classList.add('active');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // -------- Auto-fade handling ----------
  let thumbsActionTimer = null;
  let lastThumbsActionAt = 0;

  function rescheduleThumbsAutoFade() {
    clearTimeout(thumbsActionTimer);
    thumbsActionTimer = setTimeout(() => {
      const since = Date.now() - lastThumbsActionAt;
      if (since >= 3000 && !app.el.thumbsTray.matches(':hover')) {
        app.el.thumbsTray.classList.add('is-fading');
      } else {
        rescheduleThumbsAutoFade();
      }
    }, 350);
  }

  // expose for controls.js to trigger when opened via button
  app.armThumbsAutoFade = function armThumbsAutoFade(){
    if (!app.el.thumbsTray) return;
    lastThumbsActionAt = Date.now();
    app.el.thumbsTray.classList.remove('is-fading');
    rescheduleThumbsAutoFade();
  };

  app.fadeInThumbsForSkipAction = async () => {
    if (!app.el.thumbsTray) return;

    app.el.thumbsTray.hidden = false;
    app.el.thumbsTray.classList.remove('is-fading');

    const needsBuild =
      !app.thumbsBuilt ||
      !app.el.thumbsWrap ||
      app.el.thumbsWrap.childElementCount === 0;

    if (needsBuild) {
      try {
        app.status('Building thumbnails…');
        const ok = await ensureOrderForThumbs();
        if (ok) { void app.buildThumbs(); }
      } catch (e) {
        console.warn('Auto-build thumbs failed:', e);
      } finally {
        setTimeout(() => { if (app.el.status?.textContent?.includes('Thumbnails')) app.status(''); }, 1500);
      }
    }

    app.armThumbsAutoFade();
  };

  if (app.el.thumbsTray) {
    app.el.thumbsTray.addEventListener('mouseenter', () => {
      clearTimeout(thumbsActionTimer);
      app.el.thumbsTray.classList.remove('is-fading');
    });
    app.el.thumbsTray.addEventListener('mouseleave', () => {
      app.armThumbsAutoFade();
    });
  }
})(window.app);

