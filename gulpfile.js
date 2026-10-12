/**
 * Word House build pipeline.
 *
 *   gulp build       production build   -> dist/index.html (one self-contained, minified file)
 *   gulp build:dev   readable build     -> dist/index.html (nothing minified)
 *   gulp serve       dev server: build:dev, watch src/, live reload   (PORT=3000 by default)
 *   gulp preview     production build, then serve dist/ as it would be deployed
 *   gulp clean       remove dist/ and .tmp/
 *
 * Stages (each writes an intermediate file to .tmp/, the last one assembles the page):
 *
 *   src/css/*.css         -> styles   -> .tmp/house.css
 *   src/js/house/*.js     -> scripts  -> .tmp/house.js   (concatenated in file-name order, wrapped in one IIFE)
 *   src/js/boot.js        -> boot     -> .tmp/boot.js
 *   src/i18n/*.json       -> i18n     -> .tmp/i18n.js    (var WH_DATA = { zh: …, en: …, … })
 *   src/index.html        -> html     -> dist/index.html (the <!-- inline:… --> markers replaced by the files above)
 */
const { src, dest, series, parallel, watch } = require('gulp');
const { Transform } = require('node:stream');
const fs = require('node:fs/promises');
const path = require('node:path');
const zlib = require('node:zlib');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const pkg = require('./package.json');

const paths = {
  html: 'src/index.html',
  css: 'src/css/*.css',
  modules: 'src/js/house/*.js',
  boot: 'src/js/boot.js',
  i18n: 'src/i18n',
  tmp: '.tmp',
  dist: 'dist',
};
const PORT = Number(process.env.PORT) || 3000;
let production = false;

/** Stream stage that rewrites each file's text with fn(text, file) */
function edit(fn) {
  return new Transform({
    objectMode: true,
    async transform(file, _enc, done) {
      try {
        if (file.isBuffer()) file.contents = Buffer.from(await fn(file.contents.toString('utf8'), file));
        done(null, file);
      } catch (err) {
        done(err);
      }
    },
  });
}
/** Stream stage that does nothing; stands in for a minifier in dev builds */
const noop = () => new Transform({ objectMode: true, transform: (file, _enc, done) => done(null, file) });
const minifyJs = () => (production ? terser({ format: { comments: false } }) : noop());

function clean() {
  return Promise.all([paths.dist, paths.tmp].map(dir => fs.rm(dir, { recursive: true, force: true })));
}

function styles() {
  return src(paths.css)
    .pipe(concat('house.css'))
    .pipe(production ? cleanCSS({ level: 1 }) : noop())
    .pipe(dest(paths.tmp));
}

/* The app modules share one scope: they are plain script fragments, joined in file-name order
   and wrapped in a single IIFE, so nothing leaks to window except the debug handle. */
function scripts() {
  return src(paths.modules)
    .pipe(concat('house.js'))
    .pipe(edit(code => `(function () {\n${code}})();\n`))
    .pipe(minifyJs())
    .pipe(dest(paths.tmp));
}

function boot() {
  return src(paths.boot).pipe(minifyJs()).pipe(dest(paths.tmp));
}

/* One JSON file per language -> a single WH_DATA object keyed by language code */
async function i18n() {
  const data = {};
  for (const name of (await fs.readdir(paths.i18n)).filter(f => f.endsWith('.json')).sort()) {
    data[path.basename(name, '.json')] = JSON.parse(await fs.readFile(path.join(paths.i18n, name), 'utf8'));
  }
  await fs.mkdir(paths.tmp, { recursive: true });
  await fs.writeFile(path.join(paths.tmp, 'i18n.js'), `var WH_DATA = ${JSON.stringify(data, null, production ? 0 : 2)};\n`);
}

/** Text that is about to sit inside an inline <script> or <style> must not close the tag early */
const inlineSafe = code => code.replace(/<\/(script|style)/gi, '<\\/$1').replace(/<!--/g, '<\\!--');

function html() {
  const banner = `<!-- ${pkg.name} v${pkg.version} | ${pkg.license} | ${pkg.homepage} -->`;
  return src(paths.html)
    .pipe(edit(async page => {
      const part = async file => (await fs.readFile(path.join(paths.tmp, file), 'utf8')).trim();
      const inline = {
        'css/house.css': `<style>\n${await part('house.css')}\n</style>`,
        'i18n': `<script>\n${inlineSafe(await part('i18n.js'))}\n</script>`,
        'boot.js': `<script>\n${inlineSafe(await part('boot.js'))}\n</script>`,
        'house.js': `<script>\n${inlineSafe(await part('house.js'))}\n</script>`,
      };
      const seen = new Set();
      const out = page.replace(/<!-- inline:([\w./-]+) -->/g, (_m, name) => {
        if (!(name in inline)) throw new Error(`src/index.html: unknown marker <!-- inline:${name} -->`);
        seen.add(name);
        return inline[name];
      });
      const missing = Object.keys(inline).filter(name => !seen.has(name));
      if (missing.length) throw new Error(`src/index.html is missing the marker(s): ${missing.join(', ')}`);
      return out.replace(/<!DOCTYPE html>\n/i, m => m + banner + '\n');
    }))
    .pipe(dest(paths.dist));
}

async function report() {
  const file = path.join(paths.dist, 'index.html');
  const buf = await fs.readFile(file);
  const kb = n => (n / 1024).toFixed(1) + ' kB';
  console.log(`  ${file}  ${kb(buf.length)}  (gzip ${kb(zlib.gzipSync(buf).length)})  ${production ? 'production' : 'development'}`);
}

const compile = series(parallel(styles, scripts, boot, i18n), html);
const setMode = prod => {
  const fn = done => { production = prod; done(); };
  fn.displayName = prod ? 'mode:production' : 'mode:development';
  return fn;
};

const build = series(setMode(true), clean, compile, report);
const buildDev = series(setMode(false), clean, compile, report);

function server(done) {
  browserSync.init({ server: paths.dist, port: PORT, open: false, notify: false, ghostMode: false, ui: false }, done);
}
function reload(done) {
  browserSync.reload();
  done();
}
function watching() {
  watch('src/**/*', series(compile, reload));
}

exports.clean = clean;
exports.build = build;
exports['build:dev'] = buildDev;
exports.serve = series(buildDev, server, watching);
exports.preview = series(build, server);
exports.default = build;
