  /* ================= speech ================= */
  var synth = null, SU = window.SpeechSynthesisUtterance;
  try { synth = window.speechSynthesis || null; } catch (e) { synth = null; }
  var VOICES = [], pickedURI = load('wordhouse.voice.v2', '') || '', LAST_U = null, sndTipShown = false, audioUnlocked = false;
  function vScore(v) {
    var n = (v.name || '').toLowerCase(), l = (v.lang || '').toLowerCase().replace('_', '-'), sc = 0;
    if (l.indexOf('en') !== 0) return -1;
    if (l === 'en-us') sc += 30; else if (l === 'en-gb') sc += 18; else sc += 8;
    if (/natural|neural|online|premium|enhanced/.test(n)) sc += 60;
    if (/google/.test(n)) sc += 28;
    if (/samantha|ava|allison|nicky|serena|karen|daniel|aria|jenny|guy|zira/.test(n)) sc += 22;
    if (/espeak|compact|novelty|bad news|bells|boing|cellos|good news|jester|organ|whisper|zarvox|trinoids|albert|bubbles|deranged|hysterical|superstar/.test(n)) sc -= 80;
    if (!v.localService) sc += 6;
    return sc;
  }
  function loadVoices() {
    if (!synth || !synth.getVoices) return;
    var vs = synth.getVoices() || [];
    VOICES = vs.filter(function (v) { return vScore(v) >= 0; }).sort(function (a, b) { return vScore(b) - vScore(a); });
    buildVoiceSel();
  }
  function curVoice() {
    for (var i = 0; i < VOICES.length; i++) if (pickedURI && VOICES[i].voiceURI === pickedURI) return VOICES[i];
    return VOICES[0] || null;
  }
  function showSoundTip() { if (sndTipShown) return; sndTipShown = true; $('sndTip').hidden = false; }
  function speak(text, rate) {
    if (!synth || !SU || !text) return;
    try {
      if (!VOICES.length) loadVoices();
      /* iOS：cancel 紧接 speak 偶尔会吞掉这一句，只在真在念时才打断 */
      if (synth.speaking || synth.pending) { try { synth.cancel(); } catch (e) {} }
      var u = new SU(text); u.lang = 'en-US'; u.rate = rate || 0.9; u.pitch = 1.05; u.volume = 1;
      var v = curVoice(); if (v) { u.voice = v; u.lang = v.lang; }
      LAST_U = u;
      var started = false; u.onstart = function () { started = true; };
      synth.speak(u);
      setTimeout(function () { if (!started && !synth.speaking) showSoundTip(); }, 1400);
    } catch (e) { showSoundTip(); }
  }
  function sayWord(w) { return w.word === 'TV' ? 'T V' : w.word; }
  function speakWord(w) { speak(sayWord(w), 0.8); }
  function buildVoiceSel() {
    var sel = $('voiceSel'); if (!sel) return;
    while (sel.firstChild) sel.removeChild(sel.firstChild);
    var cv = curVoice();
    VOICES.forEach(function (v, i) {
      var o = document.createElement('option'); o.value = v.voiceURI; o.textContent = v.name + ' (' + v.lang + ')' + (i === 0 ? ' ★' : '');
      if (cv && cv.voiceURI === v.voiceURI) o.selected = true; sel.appendChild(o);
    });
    $('voiceBox').hidden = VOICES.length < 2;
  }
  if (synth) { try { loadVoices(); if (synth.addEventListener) synth.addEventListener('voiceschanged', loadVoices); else synth.onvoiceschanged = loadVoices; } catch (e) {} }
  if (!synth || !SU) $('cNote').hidden = false;

