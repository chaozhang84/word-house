  /* ================= start ================= */
  setProgress();
  setHint(); setButtons();
  try {
    if (!window.THREE) throw new Error('three.js not loaded');
    init3D();
  } catch (err) {
    api3d = null;
    $('fallback').hidden = false; $('goBtn').disabled = true; $('zonebar').hidden = true;
    $('huntBtn').hidden = true;
    hintMain = T('house.fallbackHint', '点「听音选图」或「单词表」来学习吧！'); hintSub = ''; bubbleSet(hintMain, '');
    showSide('drawer');
    if (window.console) console.error(err);
  }
  window.__wordHouse = function () { return api3d; };
