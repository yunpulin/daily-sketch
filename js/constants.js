window.app = window.app || {};
(function(app){
  // IndexedDB for recent sessions
  app.DB_NAME = 'photo_timer_db';
  app.DB_STORE = 'recents';
  app.RECENT_LIMIT = 10;

  // HUD behavior
  app.HUD_AUTOHIDE_MS = 1800;

  // Thumbnails
  app.MAX_THUMBS = 100;          // cap for performance
  app.THUMB_BATCH = 9;
  app.THUMB_BATCH_DELAY = 20;

  // Preload policy (matches your spec)
  app.PRELOAD_CHUNK = 3;        // preload first 3, and next 3 when needed
  app.PRELOAD_THRESHOLD = 2;     // when fewer than 2 ahead remain, queue next 3 

  // Phases
  app.PHASE = Object.freeze({
    IDLE: 'IDLE',
    WARMUP: 'WARMUP',
    PHOTO: 'PHOTO',
    BREAK: 'BREAK',
    COOLDOWN: 'COOLDOWN',
    DONE: 'DONE'
  });

  // Initialize current phase so first Play/Space starts the session
  app.phase = app.PHASE.IDLE;

  // Defaults (can be overridden by UI)
  app.warmupSec = 5;
  app.cooldownSec = 5;

  // For ring circumference (filled by utils when DOM ready)
  app.CIRC = 0;

  // Collections
  app.handles = [];      // [{handle, path, name, cat}, ...]
  app.categories = new Set(['__ALL__']);
  app.order = [];        // indices into app.handles
  app.i = 0;             // current index

  // Preload bookkeeping
  app.preloaded = new Set();   // order-indexes already blob-URL-cached
  app.maxPreloadedIndex = -1;  // highest contiguous preloaded index
  app.preloadInFlight = null;  // current preload promise

  app.protectedUrls = new Set(); // urls referenced by thumbnails; don't revoke on clear
})(window.app);

