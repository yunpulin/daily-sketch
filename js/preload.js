// js/preload.js
window.app = window.app || {};
(function(app){
  async function getBlobUrlForIndex(orderIndex){
    const cached = app.cacheGet(orderIndex);
    if (cached) return cached;
    const handleIdx = app.order[orderIndex];
    const fh = app.handles[handleIdx]?.handle;
    if (!fh) return null;
    const file = await fh.getFile();
    const url = URL.createObjectURL(file);
    app.cacheSet(orderIndex, url);
    return url;
  }

  async function decodeUrl(url){
    await new Promise((resolve, reject) => {
      const probe = new Image();
      probe.onload = () => resolve();
      probe.onerror = () => reject(new Error('image decode failed'));
      probe.decoding = 'async';
      probe.src = url;
      if (probe.complete) resolve();
    });
  }

  // ---- Public helpers ----

  // Fully preload & decode a specific index. Returns { index, url } when ready.
  app.preloadImage = async function preloadImage(index){
    if (index < 0 || index >= app.order.length) return null;
    const url = await getBlobUrlForIndex(index);
    if (!url) return null;
    try { await decodeUrl(url); } catch {}
    app.preloaded.add(index);
    app.protectedUrls.add(url);
    if (index > app.maxPreloadedIndex) app.maxPreloadedIndex = index;
    return { index, url };
  };

  // Preload initial first chunk
  app.preloadInitial = async function preloadInitial(){
    if (!app.order.length) return;
    app.preloaded.clear();
    app.maxPreloadedIndex = -1;
    const end = Math.min(app.order.length, app.PRELOAD_CHUNK);
    for (let i = 0; i < end; i++){
      await app.preloadImage(i);
    }
  };

  // Keep a sliding-window of preloads; called after showing idx
  app.maybePreloadAhead = async function maybePreloadAhead(currentIdx){
    // count how many preloaded ahead
    let ahead = 0;
    for (let j = currentIdx + 1; j <= Math.min(app.order.length - 1, app.maxPreloadedIndex); j++){
      if (app.preloaded.has(j)) ahead++;
    }
    if (ahead >= app.PRELOAD_THRESHOLD) return;

    // enqueue next block
    let start = Math.max(app.maxPreloadedIndex + 1, currentIdx + 1);
    if (start >= app.order.length) return;

    const end = Math.min(app.order.length, start + app.PRELOAD_CHUNK);
    for (let i = start; i < end; i++){
      await app.preloadImage(i);
    }
  };

  // Preload next (currentIdx + 1) specifically and remember it for instant swap
  app.preloadNextFrom = async function preloadNextFrom(currentIdx){
    const next = currentIdx + 1;
    if (next >= app.order.length) { app.nextReady = null; return; }
    // if already ready & stored, keep it; else (re)prepare
    if (app.nextReady && app.nextReady.index === next) return;
    const res = await app.preloadImage(next);
    app.nextReady = res; // {index, url} or null
  };

  // Consume the prepared "next" if it matches the expected index
  app.consumeNextReady = function consumeNextReady(expectedIdx){
    if (app.nextReady && app.nextReady.index === expectedIdx) {
      const url = app.nextReady.url;
      app.nextReady = null;
      return url;
    }
    return null;
  };

  // expose low-level URL getter (used by thumbnails fallback)
  app.getBlobUrlForIndex = getBlobUrlForIndex;
})(window.app);

