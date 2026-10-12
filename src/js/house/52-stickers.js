  /* ================= stickers: 集齐一个房间的单词 = 一张贴纸 ================= */
  var celeQueue = [];
  function checkRoom(z) {
    var ws = zoneWords(z); if (!ws.length || stickers[z]) return;
    if (ws.every(function (w) { return found[w.id]; })) {
      stickers[z] = 1; saveAll();
      celeQueue.push({ kind: 'sticker', z: z });
      if (!HUNT.on) setTimeout(flushCele, 900);
    }
  }
  function flushCele() {
    if (!$('cele').hidden || HUNT.on || !celeQueue.length) return;
    var c = celeQueue.shift();
    if (c.kind === 'sticker') {
      var z = ZBY[c.z];
      addStars(5, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      showCele(z[3], F('house.sticker.got', '获得新贴纸：{s}！', { s: zoneShort(c.z) }),
        T('house.sticker.gotSub', '这个房间的单词全部找到了，奖励 5 ⭐'), z[4]);
      fanfare(); speak('Hooray! You found them all!', 0.95);
    }
  }
  function showCele(icon, title, sub, color, acts) {
    var card = $('celeCard'); while (card.firstChild) card.removeChild(card.firstChild);
    var d = document.createElement('div'); d.className = 'stk on'; d.style.background = 'transparent';
    var disc = document.createElement('div'); disc.className = 'disc'; disc.style.setProperty('--c', color || '#FFC93C'); disc.style.width = disc.style.height = '110px'; disc.style.fontSize = '60px';
    var sp = document.createElement('span'); sp.textContent = icon; disc.appendChild(sp); d.appendChild(disc); card.appendChild(d);
    var h = document.createElement('h2'); h.textContent = title; card.appendChild(h);
    if (sub) { var p = document.createElement('p'); p.textContent = sub; card.appendChild(p); }
    var a = document.createElement('div'); a.className = 'acts';
    (acts || [[T('house.ok', '太好了！'), 'primary', null]]).forEach(function (x) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip ' + x[1]; b.textContent = x[0];
      b.addEventListener('click', function () { $('cele').hidden = true; if (x[2]) x[2](); setTimeout(flushCele, 300); });
      a.appendChild(b);
    });
    card.appendChild(a);
    $('cele').hidden = false; confetti(null, null, 120);
    setTimeout(function () { var b = a.querySelector('button'); if (b) b.focus(); }, 50);
  }
  function openStickers() {
    var g = $('stkGrid'); while (g.firstChild) g.removeChild(g.firstChild);
    var have = 0, tot = 0;
    ZONES.forEach(function (z) {
      var ws = zoneWords(z[0]); if (!ws.length) return; tot++;
      var f = ws.filter(function (w) { return found[w.id]; }).length, on = !!stickers[z[0]]; if (on) have++;
      var d = document.createElement('button'); d.type = 'button'; d.className = 'stk' + (on ? ' on' : ''); d.style.border = '0'; d.style.cursor = 'pointer';
      var disc = document.createElement('div'); disc.className = 'disc'; disc.style.setProperty('--c', z[4]);
      var sp = document.createElement('span'); sp.textContent = z[3]; disc.appendChild(sp); d.appendChild(disc);
      d.appendChild(document.createTextNode(zoneShort(z[0])));
      var sm = document.createElement('small'); sm.textContent = on ? '★ ' + ws.length + '/' + ws.length : f + ' / ' + ws.length; d.appendChild(sm);
      d.addEventListener('click', function () { $('stk').hidden = true; if (api3d) api3d.go(z[0]); });
      g.appendChild(d);
    });
    $('stkHint').textContent = F('house.sticker.hint', '已集齐 {n} / {t} 张 · 一共 {s} ⭐。把一个房间的单词全部找到，就能得到这个房间的贴纸！', { n: have, t: tot, s: STARS });
    $('stk').hidden = false;
  }

