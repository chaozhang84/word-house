  /* ================= little sounds (WebAudio, no files) ================= */
  var AC = null;
  function actx() {
    if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (C) { try { AC = new C(); } catch (e) { AC = null; } } }
    if (AC && AC.state === 'suspended') { try { var p = AC.resume(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
    return AC;
  }
  function unlockAudio() {
    if (audioUnlocked) return; audioUnlocked = true; actx();
    try { if (synth && SU) { var u = new SU(' '); u.volume = 0; LAST_U = u; synth.speak(u); } } catch (e) {}
  }
  document.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });
  function tone(freq, t, dur, type, vol) {
    var a = actx(); if (!a) return;
    var t0 = a.currentTime + (t || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.13, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur || 0.3));
    o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + (dur || 0.3) + 0.05);
  }
  function ding() { tone(880, 0, 0.35); tone(1320, 0.09, 0.4); }
  function yay() { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.09, 0.35, 'triangle', 0.14); }); }
  function fanfare() { [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { tone(f, i * 0.11, 0.42, 'triangle', 0.13); }); }
  function boop() { tone(240, 0, 0.18, 'square', 0.05); tone(180, 0.12, 0.22, 'square', 0.05); }
  function creak() {
    var a = actx(); if (!a) return;
    var t0 = a.currentTime, o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(150, t0); o.frequency.linearRampToValueAtTime(230, t0 + 0.5); o.frequency.linearRampToValueAtTime(130, t0 + 1.1);
    f.type = 'bandpass'; f.frequency.value = 600; f.Q.value = 4;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.1, t0 + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);
    o.connect(f); f.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + 1.3);
  }

