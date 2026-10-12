  /* ================= saved progress (all per-browser) =================
     单词屋（house）和单词校园（school）是同一个模块的两个场景：
     - 共用：星星、连续天数、朗读声音、寻宝的「只听声音」开关（键名沿用 wordhouse.*，老用户数据不丢）；
     - 各存各的：已发现 / 已掌握 / 贴纸（两边有同名单词，如 desk、chair，不能混在一起）；
     - 每个场景把自己的进度摘要写到 wordworld.<场景>.v1，另一个场景的切换按钮和贴纸册读它。 */
  var SCENE = 'house', OTHER = 'school';
  var found = load('wordhouse.found.v1', {}); if (!found || typeof found !== 'object') found = {};
  /* 旧版单词屋用的是 found.v2，合并进来，老用户的进度不丢 */
  (function () { var old = load('wordhouse.found.v2', null); if (old && typeof old === 'object') for (var k in old) if (old[k] && BYID[k]) found[k] = 1; })();
  var mastered = load('wordhouse.mastered.v1', {}); if (!mastered || typeof mastered !== 'object') mastered = {};
  var stickers = load('wordhouse.stickers.v1', {}); if (!stickers || typeof stickers !== 'object') stickers = {};
  var STARS = +load('wordhouse.stars.v1', 0) || 0;
  function saveAll() { store('wordhouse.found.v1', found); store('wordhouse.mastered.v1', mastered); store('wordhouse.stickers.v1', stickers); store('wordhouse.stars.v1', STARS); }
  function saveSummary() {
    var zs = 0, got = 0;
    ZONES.forEach(function (z) { if (zoneWords(z[0]).length) { zs++; if (stickers[z[0]]) got++; } });
    store('wordworld.' + SCENE + '.v1', { found: foundCount(), total: WORDS.length, stickers: got, zones: zs });
  }
  function sceneTabs() {
    var o = load('wordworld.' + OTHER + '.v1', null), a = $('scSelfN'), b = $('scOtherN'), c = $('stkOtherN');
    if (a) a.textContent = foundCount() + '/' + WORDS.length;
    if (b) b.textContent = o && o.total ? o.found + '/' + o.total : '';
    if (c) c.textContent = o && o.zones ? '★ ' + o.stickers + ' / ' + o.zones : '';
  }
  function foundCount() { var n = 0; WORDS.forEach(function (w) { if (found[w.id]) n++; }); return n; }
  /* 连续天数 */
  var streak = (function () {
    function day(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    var now = new Date(), today = day(now), y = new Date(now.getTime() - 864e5), s = load('wordhouse.streak.v1', null);
    if (!s || typeof s !== 'object') s = { last: today, n: 1 };
    else if (s.last !== today) { s = { last: today, n: s.last === day(y) ? (s.n || 0) + 1 : 1 }; }
    store('wordhouse.streak.v1', s); return s.n;
  })();

