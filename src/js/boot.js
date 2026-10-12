/*
 * Boot: runs before the app modules.
 *
 * Picks the UI language, publishes that language's strings and word glosses on #app
 * (data-lang / data-i18n / data-words, which is where the app modules read them from),
 * fills in the static labels, and points the "Home" and "School" links at the main site.
 *
 * WH_DATA is generated at build time from src/i18n/*.json (see gulpfile.js).
 */
(function () {
  /* The rest of GachaLex (home page, Word School) lives here. Links keep the language in the path:
     SITE/{lang} and SITE/{lang}/school. */
  var SITE = 'https://www.logicobs.xyz/gachaLex';
  var FALLBACK = 'en';
  var KEY = 'wordhouse.lang';

  function fromBrowser() {
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    for (var i = 0; i < list.length; i++) {
      var tag = String(list[i]).toLowerCase();
      if (/^zh\b/.test(tag)) return /hant|-tw|-hk|-mo/.test(tag) ? 'hant' : 'zh';
      var base = tag.split('-')[0];
      if (WH_DATA[base]) return base;
    }
    return FALLBACK;
  }

  /* ?lang=xx wins, then the last choice, then the browser language */
  var m = /[?&]lang=([\w-]+)/.exec(location.search), lang = m && m[1], saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (!WH_DATA[lang]) lang = WH_DATA[saved] ? saved : fromBrowser();
  try { localStorage.setItem(KEY, lang); } catch (e) {}

  var d = WH_DATA[lang], app = document.getElementById('app');
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  document.documentElement.lang = d.htmlLang;
  document.title = d.title;
  var desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', d.desc);

  app.setAttribute('data-lang', lang);
  app.setAttribute('data-i18n', JSON.stringify(d.i18n));
  app.setAttribute('data-words', JSON.stringify(d.words));

  each('[data-k]', function (el) { var v = d.text[el.getAttribute('data-k')]; if (v) el.textContent = v; });
  each('a[data-site]', function (a) { a.href = SITE + '/' + lang + a.getAttribute('data-site'); });

  var sel = document.getElementById('whLang');
  sel.value = lang;
  sel.addEventListener('change', function () { if (this.value) location.search = '?lang=' + this.value; });
})();
