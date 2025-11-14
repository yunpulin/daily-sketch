// js/sessions.js
// Recent sessions (stores up to 10 directory handles). Uses IndexedDB to persist FileSystemHandles.
window.app = window.app || {};
(function (app) {
  const DB_NAME = app.DB_NAME || 'photo_timer_db';
  const STORE = app.DB_STORE || 'recents';
  const LIMIT = app.RECENT_LIMIT || 10;

  // Small IndexedDB wrapper
  let dbPromise = null;
  function openDB() {
    if (dbPromise) return dbPromise;
    // Bump version to 2 to ensure onupgradeneeded runs and we can add any missing index
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 2);
      req.onupgradeneeded = (e) => {
        const db = req.result;

        // Create store if missing
        let store;
        if (!db.objectStoreNames.contains(STORE)) {
          store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        } else {
          store = req.transaction.objectStore(STORE);
        }

        // Create index if missing (safe to call only when store is available in upgrade txn)
        try {
          if (!store.indexNames.contains('by_time')) {
            store.createIndex('by_time', 'updatedAt', { unique: false });
          }
        } catch (_) {
          // Some browsers may not expose indexNames; ignore — we don't rely on the index at runtime.
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  async function idbGetAll() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      // Do NOT rely on index existence. Get all and sort in memory.
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbAdd(entry) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const req = store.add(entry);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbPut(entry) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const req = store.put(entry);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbDelete(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Request/verify permission for stored handles
  async function verifyPermission(handle) {
    if (!handle) return false;
    try {
      const opts = { mode: 'read' };
      if ((await handle.queryPermission?.(opts)) === 'granted') return true;
      if ((await handle.requestPermission?.(opts)) === 'granted') return true;
    } catch (e) {
      // ignore
    }
    return false;
  }

  // Compare handles (best-effort): try isSameEntry, fallback to name match
  async function isSameDirectory(a, b) {
    if (!a || !b) return false;
    if (a.isSameEntry && b.isSameEntry) {
      try {
        return await a.isSameEntry(b);
      } catch (_) {}
    }
    return a.name && b.name && a.name === b.name;
  }

  // Keep at most LIMIT entries (newest first)
  async function pruneToLimit(entries) {
    if (entries.length <= LIMIT) return entries;
    entries.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const toDelete = entries.slice(LIMIT);
    for (const e of toDelete) {
      await idbDelete(e.id);
    }
    return entries.slice(0, LIMIT);
  }

  // Public: add/update a recent session (dedupe same folder → keep last one)
  app.addRecentSession = async function addRecentSession(dirHandle) {
    if (!dirHandle) return;

    let all = await idbGetAll();
    // Try to find existing by handle equality
    let match = null;
    for (const e of all) {
      if (await isSameDirectory(e.handle, dirHandle)) {
        match = e;
        break;
      }
    }

    const now = Date.now();
    if (match) {
      match.handle = dirHandle;
      match.name = dirHandle.name || match.name;
      match.updatedAt = now;
      await idbPut(match);
    } else {
      const rec = {
        id: undefined, // auto
        name: dirHandle.name || 'Folder',
        handle: dirHandle,
        updatedAt: now,
      };
      await idbAdd(rec);
    }

    // Enforce LIMIT
    all = await idbGetAll();
    await pruneToLimit(all);
  };

  // Public: render the "last 10 sessions" list in Settings
  app.renderRecentSessions = async function renderRecentSessions() {
    const host = document.getElementById('recentSessions');
    if (!host) return;
    host.innerHTML = '';

    let all = await idbGetAll();
    all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    if (!all.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-note';
      empty.textContent = 'No recent sessions yet.';
      host.appendChild(empty);
      return;
    }

    for (const rec of all) {
      const row = document.createElement('div');
      row.className = 'recent-row';

      const btn = document.createElement('button');
      btn.className = 'recent-item';
      btn.type = 'button';
      btn.textContent = rec.name || 'Folder';
      btn.title = 'Open this session';
      btn.addEventListener('click', async () => {
        await app.openRecentSession(rec.id);
      });

      const del = document.createElement('button');
      del.className = 'recent-del';
      del.type = 'button';
      del.setAttribute('aria-label', 'Remove from recents');
      del.innerHTML = '&times;';
      del.addEventListener('click', async (e) => {
        e.stopPropagation();
        await idbDelete(rec.id);
        await app.renderRecentSessions();
      });

      row.appendChild(btn);
      row.appendChild(del);
      host.appendChild(row);
    }
  };

  // Public: open a recent session by id
  app.openRecentSession = async function openRecentSession(id) {
    const db = await openDB();
    const entry = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    if (!entry || !entry.handle) {
      app.status?.('This saved session is no longer available.');
      return;
    }

    const ok = await verifyPermission(entry.handle);
    if (!ok) {
      app.status?.('Permission denied for this folder.');
      return;
    }

    // Update timestamp and re-render
    entry.updatedAt = Date.now();
    await idbPut(entry);
    await app.renderRecentSessions();

    // Use the folder flow
    await app.chooseDirectoryWithHandle?.(entry.handle);
  };

  // Hook up "Choose Folder" in Settings if present
  if (app.el?.pickBtn) {
    app.el.pickBtn.addEventListener('click', async () => {
      app.el.pickBtn.disabled = true;
      try {
        await app.chooseDirectory?.();
      } finally {
        app.el.pickBtn.disabled = false;
      }
    });
  }

  // Render the list once at startup
  (async () => {
    try {
      await app.renderRecentSessions();
    } catch (_) {
      // ignore
    }
  })();
})(window.app);

