  /* ================= word card ================= */
  function fillExample(node, text, word) {
    while (node.firstChild) node.removeChild(node.firstChild);
    var esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var m = new RegExp(esc, 'i').exec(text);
    if (!m) { node.appendChild(document.createTextNode(text)); return; }
    node.appendChild(document.createTextNode(text.slice(0, m.index)));
    var b = document.createElement('b'); b.textContent = m[0]; node.appendChild(b);
    node.appendChild(document.createTextNode(text.slice(m.index + m[0].length)));
  }
  /* 第一次发现某个单词：+1 星，检查房间是否集齐 */
  function discover(id) {
    if (found[id]) return false;
    found[id] = 1; saveAll(); ding(); addStars(1);
    var w = BYID[id]; if (w) checkRoom(wZone(w));
    return true;
  }
  function openWord(id, focus, say_) {
    var w = BYID[id]; if (!w) return;
    cur = id;
    var fresh = discover(id);
    $('cZone').textContent = ZBY[wZone(w)][3] + ' ' + zoneName(w.zone);
    $('cEmo').textContent = emo(w.id);
    $('cWord').textContent = w.word;
    $('cIpa').textContent = w.ipa + ' · ' + w.pos;
    $('cZh').textContent = w.zh; $('cZh').hidden = !w.zh;
    $('cDef').textContent = w.def;
    fillExample($('cEx'), w.ex, w.word);
    $('cExZh').textContent = w.exZh; $('cExZh').hidden = !w.exZh;
    $('cTip').textContent = w.tip; $('cTip').hidden = !w.tip;
    $('cNew').hidden = !fresh;
    showSide('card');
    var c = $('card'); c.classList.remove('fresh'); void c.offsetWidth; c.classList.add('fresh');
    setProgress();
    if (fresh) { pipDo('jump'); say(emo(w.id) + ' ' + w.word + '!', T('house.pip.newWord', '找到一个新单词，+1 ⭐'), 2600); }
    if (focus && api3d) api3d.lookAt(id);
    if (say_) speakWord(w);
  }
  function nextWord() {
    var order = WORDS.filter(function (w) { return !found[w.id] && inHere(w); });
    if (!order.length) order = WORDS.filter(function (w) { return w.id !== cur && inHere(w); });
    if (!order.length) return;
    openWord(order[0].id, true, true);
  }
  function buildList() {
    var ul = $('listUl'); while (ul.firstChild) ul.removeChild(ul.firstChild);
    ZONES.forEach(function (grp) {
      var ws = zoneWords(grp[0]); if (!ws.length) return;
      var h = document.createElement('h3'), f = ws.filter(function (w) { return found[w.id]; }).length;
      var hl = document.createElement('span'); hl.textContent = grp[3] + ' ' + zoneName(grp[0]);
      var hr = document.createElement('span'); hr.textContent = f + ' / ' + ws.length;
      h.appendChild(hl); h.appendChild(hr); ul.appendChild(h);
      ws.forEach(function (w) {
        var li = document.createElement('li');
        var b = document.createElement('button'); b.type = 'button'; b.className = 'row' + (found[w.id] ? ' seen' : '');
        var left = document.createElement('span');
        var e = document.createElement('span'); e.className = 'e'; e.textContent = emo(w.id); left.appendChild(e);
        left.appendChild(document.createTextNode(w.word + ' '));
        var sm = document.createElement('small'); sm.textContent = w.zh; left.appendChild(sm);
        var tk = document.createElement('span'); tk.className = 'tick'; tk.textContent = mastered[w.id] ? '🏆' : found[w.id] ? '✓' : '';
        b.appendChild(left); b.appendChild(tk);
        b.addEventListener('click', function () {
          if (api3d && !inHere(w) && mode !== 'entering' && mode !== 'exiting') { pendingOpen = w.id; showSide(null); api3d.go(wZone(w)); return; }
          openWord(w.id, true, true);
        });
        li.appendChild(b); ul.appendChild(li);
      });
    });
  }

