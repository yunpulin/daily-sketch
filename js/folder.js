// js/folder.js
window.app = window.app || {};
(function (app) {
  // Fallback utilities (in case not defined elsewhere)
  app.sleep = app.sleep || ((ms) => new Promise((r) => setTimeout(r, ms)));
  app.ext =
    app.ext ||
    function (name) {
      const m = String(name || '').toLowerCase().match(/\.[^.]+$/);
      return m ? m[0] : '';
    };

  const IMG_EXTS = new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.bmp',
    '.tif',
    '.tiff',
  ]);
  const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov']); // optional
  const ACCEPT = new Set([...IMG_EXTS, ...VIDEO_EXTS]);

  // ————————————————————————————————————————————————————————————————————
  // Exposed helper per your spec:
  // After a folder/session is chosen: build order + preload + show first image,
  // but DO NOT start timer or warmup (stay IDLE).
  // ————————————————————————————————————————————————————————————————————
  app.prepareAfterScanIdle = async function prepareAfterScanIdle() {
    if (!app.buildOrder?.()) return;

    app.status?.('Preloading first photos…');
    await app.preloadInitial?.();

    // Show first (decoded) but keep app paused/IDLE
    await app.show?.(0);

    // Ensure we're IDLE (not auto-start)
    app.setPhase?.(app.PHASE.IDLE);
    // Flip center button to PLAY visibly
    const play = document.getElementById('iconPlay');
    const pause = document.getElementById('iconPause');
    const btn = document.getElementById('playPauseBtn');
    if (play && pause) {
      pause.setAttribute('hidden', ''); pause.style.display = 'none';
      play.removeAttribute('hidden'); play.style.display = '';
      btn?.setAttribute('aria-pressed', 'false');
    }

    app.status?.('Ready — press Play to start');
  };

  // ————————————————————————————————————————————————————————————————————
  // Directory traversal (File System Access API)
  // ————————————————————————————————————————————————————————————————————
  async function* walk(dirHandle, recurse, path = '') {
    for await (const entry of dirHandle.values()) {
      const newPath = path ? `${path}/${entry.name}` : entry.name;
      if (entry.kind === 'file') {
        const ext = app.ext(entry.name);
        if (ACCEPT.has(ext))
          yield { handle: entry, path: newPath, name: entry.name };
      } else if (entry.kind === 'directory' && recurse) {
        yield* walk(entry, recurse, newPath);
      }
    }
  }

  // Ask user to pick a directory (from Settings panel: scan and go to stage)
  app.chooseDirectory = async function chooseDirectory() {
    try {
      const dir = await window.showDirectoryPicker({ mode: 'read' });
      await app.chooseDirectoryWithHandle(dir);
      await app.addRecentSession?.(dir);
      await app.renderRecentSessions?.();
    } catch (e) {
      app.status?.('Folder selection canceled.');
    }
  };

  // Landing only: pick folder and set as selected for session (do not scan yet)
  app.chooseFolderForLanding = async function chooseFolderForLanding() {
    try {
      const dir = await window.showDirectoryPicker({ mode: 'read' });
      app.selectedHandle = dir;
      await app.addRecentSession?.(dir);
      app.updateLandingSelectedName?.(dir.name || 'Folder');
      await app.renderLandingRecents?.();
      if (app.el?.landingError) app.el.landingError.hidden = true;
    } catch (e) {
      if (e.name !== 'AbortError' && app.el?.landingError) {
        app.el.landingError.textContent = 'Folder selection canceled.';
        app.el.landingError.hidden = false;
      }
    }
  };

  // Use an existing DirectoryHandle (e.g., from recent sessions)
  app.chooseDirectoryWithHandle = async function chooseDirectoryWithHandle(dir) {
    app.status?.('Scanning folder…');
    if (app.el.scan) app.el.scan.hidden = false;

    // Reset state
    app.categories = new Set(['__ALL__']);
    app.handles = [];
    app.order = [];
    app.i = 0;
    app.cacheClear?.();
    app.clearThumbs?.();
    app.preloaded?.clear?.();
    app.maxPreloadedIndex = -1;

    let count = 0;
    const recurse = !!app.el.recurseInput?.checked;

    for await (const file of walk(dir, recurse, '')) {
      const cat = file.path.includes('/') ? file.path.split('/')[0] : file.path;
      app.categories.add(cat);
      app.handles.push({ ...file, cat });
      count++;
      if (count % 250 === 0) app.status?.(`Scanning… ${count} files`);
    }

    app.status?.(`Found ${app.handles.length} files`);
    if (app.el.scan) app.el.scan.hidden = true;

    // Populate categories dropdown
    const sel = app.el.categorySel;
    if (sel) {
      sel.innerHTML = '<option value="__ALL__">All</option>';
      [...app.categories]
        .filter((c) => c !== '__ALL__')
        .sort()
        .forEach((cat) => {
          const opt = document.createElement('option');
          opt.value = cat;
          opt.textContent = cat;
          sel.appendChild(opt);
        });
    }

    // Per spec: just preload & show first image; remain IDLE
    await app.prepareAfterScanIdle();

    if (app.el?.landing && app.el?.stage && !app.el.landing.hidden) {
      app.el.landing.hidden = true;
      app.el.stage.hidden = false;
    }
  };
})(window.app);

