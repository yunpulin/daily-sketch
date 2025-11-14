window.app = window.app || {};
(function(app){
  const cache = new Map(); // key: order index, val: blobURL

  app.cacheGet = (idx) => cache.get(idx);
  app.cacheSet = (idx, url) => cache.set(idx, url);
  app.cacheClear = () => {
    for (const url of cache.values()) {
      try { if (!app.protectedUrls.has(url)) URL.revokeObjectURL(url); } catch {}
    }
    cache.clear();
  };
})(window.app);

