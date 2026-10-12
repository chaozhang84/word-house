  /* ================= 听音选图 Listen & pick（不依赖 3D，3D 打不开时也能玩） ================= */
  var QZ = null;
  function openQuiz() {
    if (HUNT.on) stopHunt(true);
    var pool = WORDS.filter(function (w) { return found[w.id]; });
    if (pool.length < 5) { var zw = zoneNow ? zoneWords(zoneNow) : []; pool = zw.length >= 5 ? zw : WORDS.slice(); }
    var qs = shuffle(pool.slice()).slice(0, 5).map(function (w) {
      var others = shuffle(WORDS.filter(function (o) { return o.id !== w.id && emo(o.id) !== emo(w.id); })).slice(0, 2);
      return { w: w, opts: shuffle([w].concat(others)) };
    });
    QZ = { qs: qs, i: 0, ok: 0, got: 0, tries: 0 };
    showSide(null); $('quiz').hidden = false; quizRender();
  }
  function spkBtn(onclick) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'spk'; b.setAttribute('aria-label', 'Listen');
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
    b.addEventListener('click', onclick); return b;
  }
  function quizRender() {
    var body = $('quizBody'); while (body.firstChild) body.removeChild(body.firstChild);
    var q = QZ.qs[QZ.i]; QZ.tries = 0; QZ.lock = false;
    var meta = document.createElement('div'); meta.className = 'qmeta';
    var m1 = document.createElement('span'); m1.textContent = (QZ.i + 1) + ' / ' + QZ.qs.length;
    var m2 = document.createElement('span'); m2.textContent = '⭐ +' + QZ.got;
    meta.appendChild(m1); meta.appendChild(m2); body.appendChild(meta);
    var qq = document.createElement('div'); qq.className = 'quizq';
    qq.appendChild(spkBtn(function () { speakWord(q.w); }));
    var ask = document.createElement('p'); ask.style.font = '800 20px/1.3 var(--round)'; ask.textContent = T('house.quiz.ask', '听一听，是哪一个？'); qq.appendChild(ask);
    body.appendChild(qq);
    var opts = document.createElement('div'); opts.className = 'opts'; opts.style.marginTop = '12px';
    q.opts.forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'opt';
      var e = document.createElement('span'); e.className = 'e'; e.textContent = emo(o.id); b.appendChild(e);
      var t = document.createElement('span'); t.textContent = o.word; b.appendChild(t);
      b.addEventListener('click', function () {
        if (QZ.lock) return;
        if (o.id === q.w.id) {
          QZ.lock = true; b.classList.add('ok'); yay();
          var pts = QZ.tries === 0 ? 2 : 0; if (pts) { QZ.ok++; QZ.got += pts; addStars(pts); }
          var r = b.getBoundingClientRect(), ar = $('app').getBoundingClientRect(); confetti(r.left - ar.left + r.width / 2, r.top - ar.top + r.height / 2, 30);
          if (!found[o.id]) { found[o.id] = 1; saveAll(); checkRoom(wZone(o)); setProgress(); }
          speak('Yes! ' + sayWord(o) + '!', 0.9);
          setTimeout(function () { QZ.i++; if (QZ.i >= QZ.qs.length) quizEnd(); else quizRender(); }, 1300);
        } else {
          QZ.tries++; b.classList.remove('bad'); void b.offsetWidth; b.classList.add('bad'); b.disabled = true; boop();
          speak('That is the ' + sayWord(o) + '.', 0.9);
        }
      });
      opts.appendChild(b);
    });
    body.appendChild(opts);
    setTimeout(function () { speakWord(q.w); }, 300);
  }
  function quizEnd() {
    var body = $('quizBody'); while (body.firstChild) body.removeChild(body.firstChild);
    var tot = QZ.qs.length, ok = QZ.ok;
    var big = document.createElement('div'); big.className = 'big-emoji'; big.textContent = ok === tot ? '🏆' : ok >= 3 ? '🎉' : '💪'; body.appendChild(big);
    var h = document.createElement('h2'); h.className = 'center'; h.textContent = F('house.quiz.result', '答对 {n} / {t} 题，获得 {s} ⭐', { n: ok, t: tot, s: QZ.got }); body.appendChild(h);
    var a = document.createElement('div'); a.className = 'acts'; a.style.marginTop = '12px';
    var b1 = document.createElement('button'); b1.type = 'button'; b1.className = 'chip primary'; b1.textContent = T('house.hunt.again', '再玩一次'); b1.addEventListener('click', openQuiz);
    var b2 = document.createElement('button'); b2.type = 'button'; b2.className = 'chip'; b2.textContent = T('house.hunt.explore', '继续探索'); b2.addEventListener('click', function () { $('quiz').hidden = true; setTimeout(flushCele, 300); });
    a.appendChild(b1); a.appendChild(b2); body.appendChild(a);
    fanfare(); confetti(null, null, ok === tot ? 140 : 60);
  }
  $('quizBtn').addEventListener('click', openQuiz);
  $('quizX').addEventListener('click', function () { $('quiz').hidden = true; setTimeout(flushCele, 300); });

