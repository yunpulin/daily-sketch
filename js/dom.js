window.app = window.app || {};
(function(app){
  const $ = (id) => document.getElementById(id);
  app.el = {
    landing: $('landing'),
    stage: $('stage'),
    landingSelectedName: $('landingSelectedName'),
    landingRecentList: $('landingRecentList'),
    landingCloseBtn: $('landingCloseBtn'),
    startSessionBtn: $('startSessionBtn'),
    landingError: $('landingError'),

    hud: $('hud'),
    img: $('img'),

    // counters / info
    indexSpan: $('indexSpan'),
    totalSpan: $('totalSpan'),
    status: $('status'),
    phaseLabel: $('phaseLabel'),

    // ring progress (group 2)
    ringFg: $('ringFg'),
    pillProgressPath: $('pillProgressPath'),
    remaining: $('remaining'),   // mm:SS text

    // scan HUD
    scan: $('scan'),
    scanLabel: $('scanLabel'),

    // icon buttons
    backBtn: $('backBtn'),
    ffBtn: $('ffBtn'),
    playPauseBtn: $('playPauseBtn'),
    iconPlay: $('iconPlay'),
    iconPause: $('iconPause'),

    fullscreenToggleBtn: $('fullscreenToggleBtn'),
    iconFullscreen: $('iconFullscreen'),

    thumbsBtn: $('thumbsBtn'),
    helpBtn: $('helpBtn'),
    settingsBtn: $('settingsBtn'),

    // panels
    thumbsTray: $('thumbsTray'),
    thumbsWrap: $('thumbsWrap'),
    closeThumbs: $('closeThumbs'),
    hintsPanel: $('hintsPanel'),
    closeHints: $('closeHints'),

    // form inputs (all on landing)
    pickBtn: $('pickBtn'),
    countInput: $('countInput'),
    secondsInput: $('secondsInput'),
    shuffleInput: $('shuffleInput'),
    recurseInput: $('recurseInput'),
    categorySel: $('categorySel'),
    breakEveryInput: $('breakEveryInput'),
    breakSecondsInput: $('breakSecondsInput'),
    warmupInput: $('warmupSecondsInput'),
    cooldownInput: $('cooldownSecondsInput'),
    soundPackSelect: $('soundPackSelect'),
    coverModeInput: $('coverModeInput'),
    fullscreenOnStart: $('fullscreenOnStartInput'),

    thumbSizeInput: $('thumbSizeInput'),
    thumbSizeLabel: $('thumbSizeLabel'),

    durationChips: $('durationPresets'),
    countChips: $('countPresets'),
  };

  app.on = (el, ev, fn, opts) => { if (el) el.addEventListener(ev, fn, opts); };
})(window.app);