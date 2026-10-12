  /* ================= 寻宝游戏 Treasure hunt：听单词，在 3D 房间里找到它 ================= */
  var HUNT = { on: false };
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function huntTargets(z) {
    var seen = {}, out = [];
    LABELS.forEach(function (L) { if (L.zone === z && L.id.indexOf('nav:') !== 0 && !seen[L.id] && BYID[L.id]) { seen[L.id] = 1; out.push(L.id); } });
    return out;
  }
  function labelMode(q) {
    LABELS.forEach(function (L) {
      if (L.id.indexOf('nav:') === 0) return;
      var want = q ? 'q' : 'w'; if (L.mode === want) return; L.mode = want;
      while (L.el.firstChild) L.el.removeChild(L.el.firstChild);
      if (q) { L.el.classList.add('q'); L.el.textContent = '❓'; }
      else {
        L.el.classList.remove('q', 'hintme', 'no');
        var e = document.createElement('span'); e.className = 'e'; e.textContent = emo(L.id); L.el.appendChild(e);
        L.el.appendChild(document.createTextNode(BYID[L.id].word));
      }
      L.w = 0;
    });
  }
  function startHunt() {
    if (!api3d) { openQuiz(); return; }
    if (mode === 'entering' || mode === 'exiting' || HUNT.on) return;
    var ids = huntTargets(zoneNow);
    if (ids.length < 3) { say(T('house.hunt.none', '这里能找的东西太少啦，去别的房间试试吧！'), '', 3000); pipDo('shake'); return; }
    /* 优先出还没掌握的词，其次已掌握的 */
    var fresh = shuffle(ids.filter(function (id) { return !mastered[id]; })), old = shuffle(ids.filter(function (id) { return mastered[id]; }));
    var list = fresh.concat(old).slice(0, Math.min(5, ids.length));
    HUNT = { on: true, zone: zoneNow, list: shuffle(list), i: 0, tries: 0, res: [], got: 0, ear: !!load('wordhouse.ear.v1', false), lock: false };
    showSide(null); $('fabs').hidden = true; $('huntBar').hidden = false; $('pip').hidden = window.innerWidth <= 760;
    $('huntEar').setAttribute('aria-pressed', HUNT.ear ? 'true' : 'false');
    $('huntBar').classList.toggle('ear', HUNT.ear);
    labelsOn = true; labelMode(true);
    setHint(); setButtons(); huntRound();
  }
  function huntDots() {
    var d = $('huntDots'); while (d.firstChild) d.removeChild(d.firstChild);
    HUNT.list.forEach(function (id, i) { var e = document.createElement('i'); e.className = i < HUNT.i ? (HUNT.res[i] === 2 ? 'ok' : HUNT.res[i] ? 'late' : 'miss') : i === HUNT.i ? 'now' : ''; d.appendChild(e); });
  }
  function huntRound() {
    var id = HUNT.list[HUNT.i], w = BYID[id];
    HUNT.tries = 0; HUNT.lock = false;
    LABELS.forEach(function (L) { L.el.classList.remove('hintme', 'no'); });
    $('huntEmo').textContent = emo(id); $('huntWord').textContent = w.word; $('huntZh').textContent = w.zh || w.def;
    $('huntTag').textContent = '🎯 ' + (HUNT.i + 1) + ' / ' + HUNT.list.length;
    huntDots();
    setTimeout(function () { speak('Find the ' + sayWord(w) + '!', 0.85); }, 250);
  }
  function huntPick(id) {
    if (!HUNT.on || HUNT.lock) return;
    var tgt = HUNT.list[HUNT.i], tw = BYID[tgt];
    if (id === tgt) {
      HUNT.lock = true;
      var pts = HUNT.tries === 0 ? 3 : 1;
      HUNT.res[HUNT.i] = HUNT.tries === 0 ? 2 : 1; HUNT.got += pts;
      if (HUNT.tries === 0) mastered[tgt] = 1;
      if (!found[tgt]) { found[tgt] = 1; checkRoom(wZone(tw)); }
      saveAll(); yay(); pipDo('jump'); confetti(lastPt.x, lastPt.y, 40); addStars(pts);
      LABELS.forEach(function (L) { if (L.id === tgt) { L.el.classList.remove('q', 'hintme'); L.el.textContent = emo(tgt) + ' ' + tw.word; L.mode = ''; L.w = 0; } });
      say(['Great job!', 'Super!', 'Well done!', 'Awesome!', 'You got it!'][Math.floor(Math.random() * 5)] + ' ' + emo(tgt), '+' + pts + ' ⭐', 1800);
      speak('Yes! ' + sayWord(tw) + '!', 0.9);
      setProgress();
      /* 这 1.5 秒里如果关掉了寻宝（或又开了一局），就不再继续这一局，否则标签会卡在 ❓ */
      var h = HUNT;
      setTimeout(function () { if (HUNT !== h || !h.on) return; HUNT.i++; if (HUNT.i >= HUNT.list.length) endHunt(); else { labelMode(false); labelMode(true); huntRound(); } }, 1500);
    } else {
      HUNT.tries++; boop(); pipDo('shake');
      LABELS.forEach(function (L) { if (L.id === id) { L.el.classList.remove('no'); void L.el.offsetWidth; L.el.classList.add('no'); } });
      var cw = BYID[id];
      if (cw) say(F('house.hunt.wrong', '这是 {w}，不是它哦～再找找！', { w: emo(id) + ' ' + cw.word }), '', 2400);
      else say(T('house.hunt.wrong2', '不是这个哦，再找找！'), '', 2000);
      if (cw) setTimeout(function () { speak('That is the ' + sayWord(cw) + '.', 0.9); }, 50);
      if (HUNT.tries >= 2) {
        LABELS.forEach(function (L) { if (L.id === tgt) L.el.classList.add('hintme'); });
        api3d.lookAt(tgt);
        say(T('house.hunt.hint', '小提示：看看那个一闪一闪的 ❓'), '', 3000);
      }
    }
  }
  function huntSkip() {
    if (!HUNT.on || HUNT.lock) return;
    HUNT.res[HUNT.i] = false; HUNT.i++;
    if (HUNT.i >= HUNT.list.length) endHunt(); else { labelMode(false); labelMode(true); huntRound(); }
  }
  function stopHunt(silent) {
    if (!HUNT.on) return;
    HUNT.on = false; labelMode(false);
    $('huntBar').hidden = true; $('fabs').hidden = false; $('pip').hidden = false;
    setProgress(); setHint(); setButtons();
    if (!silent) say(T('house.hunt.stopped', '下次再来寻宝吧！'), '', 2000);
  }
  function endHunt() {
    var ok = HUNT.res.filter(Boolean).length, first = HUNT.res.filter(function (r) { return r === 2; }).length, tot = HUNT.list.length, got = HUNT.got, z = HUNT.zone;
    var bonus = first === tot ? 3 : 0;
    stopHunt(true);
    if (bonus) addStars(bonus, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    var icon = first === tot ? '🏆' : ok >= tot / 2 ? '🎉' : '💪';
    var title = first === tot ? T('house.hunt.perfect', '全部找对！你是寻宝大王！') : F('house.hunt.result', '找到了 {n} / {t} 个！', { n: ok, t: tot });
    fanfare(); speak(first === tot ? 'Perfect! You are a word hunter!' : 'Good job!', 0.95);
    showCele(icon, title, F('house.hunt.earned', '一次就找对 {f} 个 · 这一轮获得 {s} ⭐', { f: first, s: got + bonus }), '#FFC2D6', [
      [T('house.hunt.again', '再玩一次'), 'primary', function () { if (zoneNow === z) startHunt(); }],
      [T('house.hunt.explore', '继续探索'), '', null]
    ]);
  }
  $('huntBtn').addEventListener('click', startHunt);
  $('huntX').addEventListener('click', function () { stopHunt(false); });
  $('huntSkip').addEventListener('click', huntSkip);
  $('huntSay').addEventListener('click', function () { if (HUNT.on) speakWord(BYID[HUNT.list[HUNT.i]]); });
  $('huntEar').addEventListener('click', function () {
    HUNT.ear = !HUNT.ear; store('wordhouse.ear.v1', HUNT.ear);
    this.setAttribute('aria-pressed', HUNT.ear ? 'true' : 'false'); $('huntBar').classList.toggle('ear', HUNT.ear);
    if (HUNT.ear && HUNT.on) speakWord(BYID[HUNT.list[HUNT.i]]);
  });

