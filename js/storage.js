window.app = window.app || {};
(function(app){
  const KEY = 'photo_timer_settings_v1';

  app.saveSettings = function saveSettings(){
    try {
      const data = {
        count: Number(app.el.countInput.value || 30),
        seconds: Number(app.el.secondsInput.value || 120),
        shuffle: !!app.el.shuffleInput.checked,
        recurse: !!app.el.recurseInput.checked,
        category: app.el.categorySel.value,
        breakEvery: Number(app.el.breakEveryInput.value || 0),
        breakSeconds: Number(app.el.breakSecondsInput.value || 3),
        warmupSeconds: Number(app.el.warmupInput.value || 5),
        cooldownSeconds: Number(app.el.cooldownInput.value || 5),
        soundPack: app.el.soundPackSelect.value,
        coverMode: !!app.el.coverModeInput.checked,
        fullscreenOnStart: !!app.el.fullscreenOnStart.checked,
        thumbSize: app.el.thumbSizeInput.value || '',
      };
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
  };

  app.loadSettings = function loadSettings(){
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if ('count' in d) app.el.countInput.value = d.count;
      if ('seconds' in d) app.el.secondsInput.value = d.seconds;
      if ('shuffle' in d) app.el.shuffleInput.checked = !!d.shuffle;
      if ('recurse' in d) app.el.recurseInput.checked = !!d.recurse;
      if ('category' in d) app.el.categorySel.value = d.category;
      if ('breakEvery' in d) app.el.breakEveryInput.value = d.breakEvery;
      if ('breakSeconds' in d) app.el.breakSecondsInput.value = d.breakSeconds;
      if ('warmupSeconds' in d) app.el.warmupInput.value = d.warmupSeconds;
      if ('cooldownSeconds' in d) app.el.cooldownInput.value = d.cooldownSeconds;
      if ('soundPack' in d) app.el.soundPackSelect.value = d.soundPack;
      if ('coverMode' in d) app.el.coverModeInput.checked = !!d.coverMode;
      if ('fullscreenOnStart' in d) app.el.fullscreenOnStart.checked = !!d.fullscreenOnStart;
      if ('thumbSize' in d && d.thumbSize) {
        app.el.thumbSizeInput.value = d.thumbSize;
        app.el.thumbSizeLabel.textContent = `${d.thumbSize}px`;
        document.documentElement.style.setProperty('--thumb-w', `${d.thumbSize}px`);
      }
    } catch {}
  };
})(window.app);

