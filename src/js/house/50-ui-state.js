  /* ================= UI state ================= */
  var mode = 'out';          /* out | entering | in | exiting */
  var zoneNow = 'out';
  var labelsOn = true;
  var cur = null;            /* current word id */
  var LABELS = [];           /* filled by 3D setup */
  var api3d = null;          /* set when 3D works */

  function setHint() {
    var a, b = T('house.hintSub', '拖动屏幕可以环顾四周 · 底部按钮可以换房间');
    if (mode === 'entering' || mode === 'exiting') { a = T('house.hintWalking', '走呀走…'); b = ''; }
    else if (HUNT.on) { a = T('house.hunt.find', '听一听，找到它！'); b = T('house.hunt.findSub', '点 3D 里的物品或 ❓ 标签'); }
    else if (zoneNow === 'out') { a = F('house.hintOut', '嗨，我是{name}！点那扇大门，我们进屋找单词吧 🚪', { name: PET_NAME }); }
    else if (zoneNow === 'back') { a = T('house.hintBack', '欢迎来到农场！点点小动物，听听它们的英文名 🐄'); }
    else { a = T('house.hintInside', '点一点屋里的东西，就能学会它的英文！'); }
    hintMain = a; hintSub = b;
    if (!flashTimer) bubbleSet(a, b);
  }
  function setButtons() {
    var t = zoneNow === 'out' ? T('house.goInside', '进屋') : zoneNow === 'back' ? zoneShort('out') : T('house.backOutside', '回到屋外');
    $('goBtnT').textContent = t;
    $('goBtn').querySelector('.e').textContent = zoneNow === 'out' ? '🚪' : '🏡';
    $('goBtn').disabled = (mode === 'entering' || mode === 'exiting') || !api3d;
    $('huntBtn').disabled = HUNT.on || mode === 'entering' || mode === 'exiting';
  }
  function setProgress() {
    var n = foundCount(), t = WORDS.length;
    $('progTxt').textContent = n + ' / ' + t;
    $('progBar').style.width = Math.round(100 * n / t) + '%';
    $('starTxt').textContent = STARS;
    saveSummary(); sceneTabs();
    LABELS.forEach(function (L) { if (L.id.indexOf('nav:') === 0) return; if (found[L.id]) L.el.classList.add('seen'); else L.el.classList.remove('seen'); });
    markZone();
    if (!$('drawer').hidden) buildList();
  }
  function showSide(which) {
    $('card').hidden = which !== 'card';
    $('drawer').hidden = which !== 'drawer';
    if (which === 'drawer') buildList();
  }

  /* room bar */
  var zoneBtns = {};
  function markZone() {
    ZONES.forEach(function (z) {
      var b = zoneBtns[z[0]]; if (!b) return;
      b.classList.toggle('primary', z[0] === zoneNow);
      var ws = zoneWords(z[0]), f = ws.filter(function (w) { return found[w.id]; }).length, sm = b.querySelector('small');
      if (sm) { sm.textContent = ws.length && f === ws.length ? '★' : f + '/' + ws.length; b.classList.toggle('done', !!ws.length && f === ws.length); }
    });
  }
  ZONES.forEach(function (z) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'chip';
    var e = document.createElement('span'); e.className = 'e'; e.textContent = z[3]; b.appendChild(e);
    b.appendChild(document.createTextNode(zoneShort(z[0])));
    if (zoneWords(z[0]).length) { var sm = document.createElement('small'); b.appendChild(sm); }
    b.addEventListener('click', function () { if (api3d) { if (HUNT.on) stopHunt(true); api3d.go(z[0]); } });
    $('zonebar').appendChild(b); zoneBtns[z[0]] = b;
  });
  /* 3D 场景每次进入新房间时调用 */
  var pendingOpen = null;
  function onZone(z) {
    if (!z) return;
    if (pendingOpen) { var p = pendingOpen; pendingOpen = null; setTimeout(function () { openWord(p, true, true); }, 120); return; }
    if (HUNT.on && HUNT.zone !== z) stopHunt(true);
    var ws = zoneWords(z), left = ws.filter(function (w) { return !found[w.id]; }).length;
    if (z === 'out' && !found.door) return;
    if (ws.length && left) say(zoneShort(z) + ' ' + ZBY[z][3], F('house.pip.roomLeft', '这里有 {n} 个新单词等你发现！', { n: left }), 3000);
    else if (ws.length) say(zoneShort(z) + ' ' + ZBY[z][3] + ' ★', T('house.pip.roomDoneSub', '这个房间你已经全部找到啦，玩寻宝游戏挑战一下？'), 3000);
  }

