window.app = window.app || {};
(function(app){
  app.sleep = (ms) => new Promise(r => setTimeout(r, ms));
  app.ext = (n) => { const idx=n.lastIndexOf('.'); return idx>=0 ? n.slice(idx).toLowerCase() : ''; };
  app.status = (msg) => { if (app.el.status) app.el.status.textContent = msg || ''; };
  app.setPhase = (p) => { app.phase = p; if (app.el.phaseLabel) app.el.phaseLabel.textContent = p.toLowerCase(); };

  // Initialize circular progress perimeter
  function initRing(){
    const el = app.el.ringFg;
    if (!el) return;
    let len = 0;
    try { len = el.getTotalLength ? el.getTotalLength() : 0; } catch { len = 0; }
    if (!len) {
      const r = Number(el.getAttribute('r') || 54);
      len = 2 * Math.PI * r;
    }
    app.CIRC = len;
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
  }
  function initPillProgress(){
    const el = app.el.pillProgressPath;
    if (!el) return;
    el.style.strokeDasharray = '100';
    el.style.strokeDashoffset = '100';
  }
  function initHudProgress(){
    initRing();
    initPillProgress();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHudProgress, { once: true });
  } else {
    initHudProgress();
  }

  // ---- Audio ----
  let audioCtx = null;
  function ensureAudio(){ if (audioCtx) return; try { audioCtx = new (window.AudioContext||window.webkitAudioContext)(); } catch {} }
  function tone({freq=880,type='sine',ms=120,gain=0.2}) {
    if (app.pack?.()==='off') return; ensureAudio(); if (!audioCtx) return;
    const o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.type=type; o.frequency.setValueAtTime(freq,audioCtx.currentTime);
    g.gain.setValueAtTime(0.0001,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(gain,audioCtx.currentTime+0.01);
    o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime+ms/1000);
  }
  const click=(ms=40,gain=0.35)=>tone({freq:2000,type:'square',ms,gain});
  const woodblock=(low=false)=>tone({freq:low?620:820,type:'triangle',ms:90,gain:0.25});
  const claves=()=>tone({freq:2600,type:'square',ms:70,gain:0.22});
  const classic=(high=false)=>tone({freq:high?1200:880,type:'sine',ms:120,gain:0.22});
  app.playCue = (name) => {
    const p=app.pack?.(); if (p==='off') return;
    switch(name){
      case 'tick':        return p==='classic'?classic(false):p==='woodblock'?woodblock(false):p==='claves'?claves():click();
      case 'final':       return p==='classic'?classic(true):p==='woodblock'?woodblock(true):p==='claves'?(claves(),setTimeout(claves,60)):(click(),setTimeout(click,70));
      case 'advance':     return p==='classic'?classic(true):p==='woodblock'?woodblock(true):p==='claves'?claves():click();
      case 'break_start': return p==='woodblock'?(woodblock(true),setTimeout(()=>woodblock(false),120)):p==='classic'?classic(false):p==='claves'?claves():click();
      case 'break_end':   return p==='classic'?classic(true):p==='woodblock'?woodblock(true):p==='claves'?(claves(),setTimeout(claves,60)):(click(),setTimeout(click,70));
    }
  };
  app.pack = () => app.el.soundPackSelect?.value || 'classic';
})(window.app);

