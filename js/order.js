window.app = window.app || {};
(function(app){
  function rngShuffle(arr){
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  app.buildOrder = function buildOrder(){
    if (!app.handles.length) { app.status('No files to build'); return false; }

    const wantCat = app.el.categorySel.value;
    let pool = app.handles.map((_, idx) => idx);
    if (wantCat && wantCat !== '__ALL__') {
      pool = pool.filter(i => app.handles[i].cat === wantCat);
    }
    if (!pool.length) { app.status('No files in selected category'); return false; }

    const count = Math.max(1, Number(app.el.countInput.value || 30));
    if (app.el.shuffleInput.checked) rngShuffle(pool);

    app.order = pool.slice(0, count);
    app.el.indexSpan.textContent = '1';
    app.el.totalSpan.textContent = String(app.order.length);
    return true;
  };
})(window.app);

