// js/timer_engine.js
window.app = window.app || {};
(function(app){
  let timerId = null;
  let startedAt = 0;
  let lastWholeSecond = null;
  let paused = false;
  let timeLeft = 0;

  // ---- helpers ----
  const imgEl = () => app.el?.img;

  // Immediately apply soft blur with transitions disabled, so the image becomes blurred in the same frame.
  function forceSoftBlurNow(){
    const img = imgEl(); if (!img) return;
    const prev = img.style.transition;
    img.style.transition = 'none';        // disable animations for this change
    //img.classList.add('is-soft-blur');    // become blurred immediately
    img.classList.remove('clean-img');    // become blurred immediately
    // force reflow to commit the style before we restore transitions
    // eslint-disable-next-line no-unused-expressions
    img.offsetHeight;
    img.style.transition = prev;          // restore whatever was there (empty means CSS rule)
  }

  // Smoothly remove the blur (uses CSS transition on filter/opacity)
  function smoothUnblur(){
    const img = imgEl(); if (!img) return;
    // img.classList.remove('is-soft-blur');
    img.classList.add('clean-img');
  }

  const photoDurationSec = () => {
    const v = Number(app.el.secondsInput?.value);
    return Number.isFinite(v) && v > 0 ? v : 30;
  };
  const breakEveryCount = () => {
    const v = Number(app.el.breakEveryInput?.value);
    return Number.isFinite(v) && v > 0 ? v : 0;
  };
  const breakSeconds = () => {
    const v = Number(app.el.breakSecondsInput?.value);
    return Number.isFinite(v) && v > 0 ? v : 30;
  };
  const mmSS = (totalSeconds) => {
    if (!Number.isFinite(totalSeconds)) return '00:00';
    const s = Math.max(0, Math.ceil(totalSeconds));
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2,'0');
    return `${String(m).padStart(2,'0')}:${ss}`;
  };

  function setPlayIcon(isPlaying){
    const play = document.getElementById('iconPlay');
    const pause = document.getElementById('iconPause');
    const btn = document.getElementById('playPauseBtn');
    if (!play || !pause) return;
    if (isPlaying) {
      play.setAttribute('hidden',''); play.style.display = 'none';
      pause.removeAttribute('hidden'); pause.style.display = '';
    } else {
      pause.setAttribute('hidden',''); pause.style.display = 'none';
      play.removeAttribute('hidden');  play.style.display = '';
    }
    if (btn) btn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
  }

  function updateCircle(elapsed){
    if (!app.el.ringFg || !app.CIRC || !Number.isFinite(app.phaseDuration) || app.phaseDuration <= 0) return;
    const pct = Math.min(1, Math.max(0, elapsed / app.phaseDuration));
    const offset = app.CIRC * (1 - pct);
    app.el.ringFg.style.strokeDashoffset = `${offset}`;
  }
  function tick(){
    const elapsed = (Date.now()-startedAt)/1000;
    const leftFloat = app.phaseDuration - elapsed;
    if (app.el.remaining) app.el.remaining.textContent = mmSS(leftFloat);
    updateCircle(elapsed);
    const whole = Math.floor(leftFloat + 0.0001);
    if (Number.isFinite(whole) && whole !== lastWholeSecond){
      lastWholeSecond = whole;
      if (whole <= 3 && whole > 1) app.playCue('tick');
      if (whole === 1) app.playCue('final');
    }
    if (Number.isFinite(elapsed) && Number.isFinite(app.phaseDuration) && elapsed >= app.phaseDuration) app.advance();
  }

  // timers
  app.startPhase = function startPhase(duration){
    app.phaseDuration = Number.isFinite(duration) && duration > 0 ? duration : photoDurationSec();
    startedAt = Date.now();
    lastWholeSecond = null;
    if (app.el.ringFg && app.CIRC) app.el.ringFg.style.strokeDashoffset = `${app.CIRC}`;
    clearInterval(timerId);
    timerId = setInterval(tick, 200);
    paused = false;
    setPlayIcon(true);
    app.scheduleHudHide?.();
  };
  app.pauseTimer = function pauseTimer(){
    if (paused) return;
    paused = true;
    clearInterval(timerId);
    timerId = null;
    const elapsed = (Date.now()-startedAt)/1000;
    timeLeft = Math.max(0, app.phaseDuration - elapsed);
    setPlayIcon(false);
    app.showHud?.(); app.cancelHudHide?.();
  };
  app.resumeTimer = function resumeTimer(){
    if (!paused) return;
    paused = false;
    startedAt = Date.now() - (app.phaseDuration - timeLeft)*1000;
    clearInterval(timerId);
    timerId = setInterval(tick, 200);
    setPlayIcon(true);
    app.scheduleHudHide?.();
  };
  app.resetTimerUI = function resetTimerUI(){
    clearInterval(timerId); timerId = null;
    paused = false;
    if (app.el.remaining) app.el.remaining.textContent = '00:00';
    if (app.el.ringFg && app.CIRC) {
      app.el.ringFg.style.strokeDasharray = `${app.CIRC}`;
      app.el.ringFg.style.strokeDashoffset = `${app.CIRC}`;
    }
    setPlayIcon(false);
    app.showHud?.(); app.cancelHudHide?.();
  };

  // ----- Session choreography -----
  app.beginSession = async function beginSession(){
    if (app.el.fullscreenOnStart?.checked && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(()=>{});
    }

    // Per new spec: blur first, then show, then blur-in depending on warm-up
    forceSoftBlurNow();
    await app.show(0);

    const hasWarmup = (Number(app.el.warmupInput?.value) || 0) > 0;
    if (hasWarmup){
      // keep blurred during warm-up
      app.setPhase(app.PHASE.WARMUP);
      app.startPhase(Number(app.el.warmupInput.value));
      // when warm-up finishes, advance() clears blur and starts timer
    } else {
      app.setPhase(app.PHASE.PHOTO);
      app.startPhase(photoDurationSec());
      // blur-in (remove blur) shortly after starting timer
      //setTimeout(smoothUnblur, 160);
      smoothUnblur();
    }
    requestAnimationFrame(() => setPlayIcon(true));
  };

  app.advance = async function advance(){
    const brkEvery = (() => {
      const n = breakEveryCount();
      return Number.isFinite(n) ? n : 0;
    })();

    // Warm-up ended → blur-in now (clear blur) & start first photo
    if (app.phase === app.PHASE.WARMUP){
      app.setPhase(app.PHASE.PHOTO);
      smoothUnblur();
      app.startPhase(photoDurationSec());
      return;
    }

    // Returning from BREAK → blur-in & start next photo
    if (app.phase === app.PHASE.BREAK){
      document.querySelector('.break-screen').hidden = true;
      app.setPhase(app.PHASE.PHOTO);
      smoothUnblur();
      app.startPhase(photoDurationSec());
      return;
    }

    const lastIndex = app.order.length - 1;
    const current = app.i;
    const next = Math.min(current + 1, lastIndex);
    const isDone = current >= lastIndex;
    const hasBreak = brkEvery > 0 && (current + 1) % brkEvery === 0 && !isDone;

    if (isDone){
      if (app.cooldownSec>0 && app.phase !== app.PHASE.COOLDOWN && app.phase !== app.PHASE.DONE){
        app.setPhase(app.PHASE.COOLDOWN);
        app.startPhase(app.cooldownSec);
        return;
      }
      app.setPhase(app.PHASE.DONE);
      app.status('Session complete ✨');
      app.resetTimerUI();
      if (app.el.ringFg) app.el.ringFg.style.strokeDashoffset = '0';
      app.playCue('break_end');
      return;
    }

    // 1) Blur current photo immediately (no animation hitch)
    forceSoftBlurNow();

    // 2) Prepare NEXT while we show blur-out for 150ms (was 300ms)
    let nextUrl = app.consumeNextReady?.(next);
    let preparePromise = null;
    if (!nextUrl) {
      preparePromise = app.preloadImage?.(next).then(res => { nextUrl = res?.url || null; }).catch(()=>{});
    }

    // Ensure the blur-out is visible, and also wait for decode if still loading
    const waitBlur = app.sleep ? app.sleep(150) : new Promise(r => setTimeout(r, 150));
    if (preparePromise) {
      await Promise.race([
        Promise.all([waitBlur, preparePromise]),
        waitBlur
        // Safety timeout in case decode stalls; still proceed after the blur-out duration
      ]);
    } else {
      await waitBlur;
    }

    // 3) Proceed to BREAK or NEXT
    if (hasBreak){
      app.setPhase(app.PHASE.BREAK);
      forceSoftBlurNow();
      document.querySelector('.break-screen').hidden = false;
      app.startPhase(breakSeconds());

      // Swap to next while staying blurred during break
      if (!nextUrl && app.preloadImage) {
        // If race didn’t finish, finalize now
        const res = await app.preloadImage(next).catch(()=>null);
        nextUrl = nextUrl || res?.url || null;
      }
      if (nextUrl){
        app.i = next;
        app.swapToPredecoded?.(next, nextUrl);
      }
      // Blur will be cleared when BREAK finishes (handled in the BREAK branch above)
      return;
    }

    // No break: swap to next (still blurred), then start timer and blur-in
    if (!nextUrl && app.preloadImage) {
      const res = await app.preloadImage(next).catch(()=>null);
      nextUrl = nextUrl || res?.url || null;
    }
    if (nextUrl){
      app.i = next;
      app.swapToPredecoded?.(next, nextUrl);
    }

    app.setPhase(app.PHASE.PHOTO);
    app.startPhase(photoDurationSec());
    // Gentle blur-in (remove blur after timer starts)
    // setTimeout(smoothUnblur, 160);
    smoothUnblur();
    app.playCue('advance');
  };

  app.togglePlayPause = function togglePlayPause(){
    if (app.phase === app.PHASE.IDLE || app.phase === app.PHASE.DONE) {
      if (!app.order.length) {
        if (!app.handles.length) { app.status('Pick a folder first'); return; }
        if (!app.buildOrder()) return;
      }
      app.beginSession();
      setTimeout(() => setPlayIcon(true), 0);
      return;
    }
    if (paused) { app.resumeTimer(); } else { app.pauseTimer(); }
  };
})(window.app);

