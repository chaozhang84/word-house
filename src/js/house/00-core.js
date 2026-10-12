  var $ = function (id) { return document.getElementById(id); };

  /* UI 文案本地化：上面的启动脚本按语言把文案 JSON 写进 #app 的 data-i18n；
     缺失（或回退成键名）时用这里的中文兜底。{n} {t} {s} 等占位符由 F() 替换。 */
  var I18N = {};
  try { I18N = JSON.parse($('app').getAttribute('data-i18n') || '{}') || {}; } catch (e) { I18N = {}; }
  function T(k, fb) { var v = I18N[k]; if (v == null || v === '' || v === k) return fb == null ? '' : fb; return v; }
  function F(k, fb, args) { var s = T(k, fb); for (var a in args) s = s.split('{' + a + '}').join(args[a]); return s; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }

