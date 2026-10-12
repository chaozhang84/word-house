  /* ================= buttons ================= */
  $('cClose').addEventListener('click', function () { showSide(null); });
  $('dClose').addEventListener('click', function () { showSide(null); });
  $('listBtn').addEventListener('click', function () { showSide($('drawer').hidden ? 'drawer' : null); });
  $('stkBtn').addEventListener('click', openStickers);
  $('stkX').addEventListener('click', function () { $('stk').hidden = true; });
  $('cSpeak').addEventListener('click', function () { if (cur) speakWord(BYID[cur]); });
  $('cSent').addEventListener('click', function () { if (cur) speak(BYID[cur].ex, 0.9); });
  $('cNext').addEventListener('click', nextWord);
  $('sndTipX').addEventListener('click', function () { $('sndTip').hidden = true; });
  $('voiceSel').addEventListener('change', function () { pickedURI = this.value; store('wordhouse.voice.v2', pickedURI); speak('Hello! Let us learn English!', 0.9); });
  $('voiceTest').addEventListener('click', function () { speak('Hello! Let us learn English!', 0.9); });
  var resetArm = false;
  $('resetBtn').addEventListener('click', function () {
    if (!resetArm) { resetArm = true; $('resetBtnT').textContent = T('house.resetConfirm', '再点一次确认：清空进度和星星'); setTimeout(function () { resetArm = false; $('resetBtnT').textContent = T('house.startOver', '重新开始'); }, 4000); return; }
    resetArm = false; found = {}; mastered = {}; stickers = {}; STARS = 0; saveAll();
    /* 星星是两个场景共用的，所以「重新开始」把另一个场景的进度也一起清掉 */
    try { ['found.v1', 'mastered.v1', 'stickers.v1'].forEach(function (k) { localStorage.removeItem('word' + OTHER + '.' + k); }); localStorage.removeItem('wordworld.' + OTHER + '.v1'); } catch (e) {}
    $('resetBtnT').textContent = T('house.startOver', '重新开始'); setProgress(); buildList();
  });
  $('lblBtn').addEventListener('click', function () { labelsOn = !labelsOn; this.setAttribute('aria-pressed', labelsOn ? 'true' : 'false'); });
  $('goBtn').addEventListener('click', function () {
    if (!api3d) return;
    if (HUNT.on) stopHunt(true);
    if (zoneNow === 'out') api3d.enter(); else api3d.go('out');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('cele').hidden) { $('cele').hidden = true; return; }
    if (!$('quiz').hidden) { $('quiz').hidden = true; return; }
    if (!$('stk').hidden) { $('stk').hidden = true; return; }
    if (HUNT.on) { stopHunt(false); return; }
    showSide(null);
  });

  /* ================= static text from i18n ================= */
  (function applyI18n() {
    [['hudEyebrow', 'house.eyebrow', '学英语单词'], ['listBtnT', 'house.words', '单词表'], ['stkBtnT', 'house.stickers', '贴纸册'],
     ['huntBtnT', 'house.hunt.btn', '寻宝游戏'], ['quizBtnT', 'house.quiz.btn', '听音选图'], ['huntEarT', 'house.hunt.ear', '只听声音'],
     ['huntSkipT', 'house.hunt.skip', '跳过'], ['cSentT', 'house.hearSentence', '听句子'], ['cNextT', 'house.nextWord', '下一个'],
     ['cNote', 'house.noSpeech', '这个浏览器不能朗读。'], ['dEyebrow', 'house.allWords', '所有单词'], ['lblBtnT', 'house.labels', '标签'],
     ['voiceLabel', 'house.voiceLabel', '声音'], ['voiceTestT', 'house.test', '试听'], ['resetBtnT', 'house.startOver', '重新开始'],
     ['fbText', 'house.fallback', '这个浏览器无法显示 3D，仍可用单词表和听音测验学习。'], ['sndTipTxt', 'house.soundTip', $('sndTipTxt').textContent]
    ].forEach(function (k) { var el = $(k[0]); if (el) el.textContent = T(k[1], k[2]); });
    $('stkTitle').textContent = '🏅 ' + T('house.sticker.title', '我的贴纸册');
    $('quizTitle').textContent = '🎧 ' + T('house.quiz.title', '听音选图');
    $('fireTxt').textContent = streak; $('firePill').hidden = false;
    $('firePill').title = F('house.streak', '连续学习 {n} 天', { n: streak });
  })();

