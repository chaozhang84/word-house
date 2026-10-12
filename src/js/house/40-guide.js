  /* ================= pet guide: speech bubble ================= */
  var hintMain = '', hintSub = '', flashTimer = null;
  function bubbleSet(a, b) { $('bubbleTxt').textContent = a; $('bubbleSub').textContent = b || ''; $('bubbleSub').hidden = !b; }
  function say(a, b, ms) {
    clearTimeout(flashTimer); bubbleSet(a, b);
    var el = $('bubble'); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    flashTimer = setTimeout(function () { flashTimer = null; bubbleSet(hintMain, hintSub); }, ms || 3500);
  }
  function pipDo(cls) { var s = $('pipSvg'); s.classList.remove('jump', 'shake'); void s.getBoundingClientRect(); s.classList.add(cls); setTimeout(function () { s.classList.remove(cls); }, 800); }
  /* ================= 向导 =================
     静态版不连后端，向导固定是 🐣（线上版这里会换成用户自己的宠物形象）。 */
  var PET_NAME = T('house.pet.defaultName', '小宠物');
  $('pipSvg').setAttribute('aria-label', PET_NAME);
  $('pipSvg').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); } });
  $('pipSvg').addEventListener('click', function () {
    pipDo('jump');
    if (!zoneNow || mode === 'entering' || mode === 'exiting') return;
    var left = zoneWords(zoneNow).filter(function (w) { return !found[w.id]; }).length;
    if (zoneNow === 'out' && !found.door) { say(T('house.pip.tapDoor', '先点那扇大门，我们进屋吧！🚪')); return; }
    if (left) say(F('house.pip.left', '这个房间还有 {n} 个单词没找到，加油！', { n: left }));
    else say(T('house.pip.tryHunt', '这里全找到啦！点「寻宝游戏」考考自己吧 🎯'));
  });

