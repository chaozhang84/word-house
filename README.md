# 🏠 Word House

**English** | [简体中文](README.zh-CN.md)

A 3D house where kids learn English words by tapping the things around them.
Walk from the front yard through ten rooms, tap the sofa, the kettle or the cow,
hear the word, read an example sentence, then prove it in a treasure hunt.

Built with [Three.js](https://threejs.org/) and plain JavaScript. There is no backend and no
framework: the whole app builds into **one self-contained `index.html`** that you can drop on
any static host.

**Live demo:** <https://www.logicobs.xyz/gachaLex/en/house>

![Front yard](docs/screenshots/front-yard.png)

| Word card | Treasure hunt |
| --- | --- |
| ![Living room with a word card open](docs/screenshots/living-room.png) | ![Treasure hunt in the living room](docs/screenshots/treasure-hunt.png) |

| Listen & pick (Chinese UI) | Phone (Japanese UI) |
| --- | --- |
| ![Listen and pick quiz on the farm](docs/screenshots/listen-quiz.png) | <img src="docs/screenshots/mobile.png" alt="Kids room on a phone" width="300"> |

## Features

- **84 words in 10 places**: front yard, living room, kitchen, hall, bathroom, upstairs landing,
  bedroom, study, kids room and a farm out the back. Every object is modelled in code; there are
  no model or texture files.
- **Word cards**: IPA, part of speech, a child-level definition, an example sentence and
  text-to-speech for both the word and the sentence (Web Speech API).
- **Treasure hunt**: hear a word and find the object in the room. A "sound only" mode hides the
  spelling.
- **Listen & pick**: an audio quiz that does not need WebGL, so it still works where 3D does not.
- **Stars, stickers and streaks**: one sticker per room, a daily streak counter, confetti.
  Progress is kept in `localStorage`; nothing leaves the browser.
- **Six interface languages**: 简体中文, English, 日本語, 한국어, ไทย and 繁體中文, with word
  glosses and sentence translations for each.
- **Touch first**: drag to look around, large tap targets, a phone layout, and
  `prefers-reduced-motion` is respected.

## Requirements

| Tool | Version | Notes |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 18 or newer (20 LTS recommended) | `.nvmrc` pins 20; run `nvm use` if you use nvm |
| npm | 9 or newer | ships with Node.js |

Check what you have:

```bash
node -v
```

```bash
npm -v
```

## Quick start

```bash
git clone https://github.com/chaozhang84/word-house.git
```

```bash
cd word-house
```

```bash
npm install
```

```bash
npm run dev
```

Open <http://localhost:3000>. The page reloads whenever a file under `src/` changes.

Gulp is installed locally by `npm install`, so there is no need for a global install. If you
prefer calling it directly, use `npx gulp <task>`.

## Commands

| npm script | Gulp task | What it does |
| --- | --- | --- |
| `npm run dev` | `gulp serve` | Development build, local server, watch and live reload |
| `npm run build` | `gulp build` | Production build into `dist/index.html` (CSS and JS minified) |
| `npm run build:dev` | `gulp build:dev` | Same output, nothing minified, easy to read and debug |
| `npm run preview` | `gulp preview` | Production build, then serve `dist/` exactly as it would be deployed |
| `npm run clean` | `gulp clean` | Remove `dist/` and `.tmp/` |

The server listens on port 3000. Pick another one with `PORT`:

```bash
PORT=8080 npm run dev
```

## Build and deploy

```bash
npm run build
```

The result is a single file, `dist/index.html` (about 185 kB, 65 kB gzipped). Styles, scripts and
all six languages are inlined, so deploying means copying that one file to GitHub Pages, Netlify,
Vercel, S3, nginx, or anywhere else that serves static files. It can sit at any path.

At runtime the page loads two things from CDNs: Three.js r128 from cdnjs and two web fonts from
Google Fonts. Speech uses the voices installed in the visitor's browser.

## How the build works

```
src/css/*.css       ── styles  ──▶ .tmp/house.css ─┐
src/js/house/*.js   ── scripts ──▶ .tmp/house.js  ─┤
src/js/boot.js      ── boot    ──▶ .tmp/boot.js   ─┼─ html ──▶ dist/index.html
src/i18n/*.json     ── i18n    ──▶ .tmp/i18n.js   ─┤
src/index.html      ───────────────────────────────┘
```

- **styles** concatenates the stylesheets and, in production, minifies them with clean-css.
- **scripts** joins the app modules in file-name order and wraps them in one IIFE, then minifies
  with Terser in production. The modules share that one scope, which is why they are numbered and
  not ES modules.
- **boot** handles the small script that picks the language before the app starts.
- **i18n** merges one JSON file per language into a single `WH_DATA` object.
- **html** replaces the `<!-- inline:… -->` markers in `src/index.html` with the four files above.

## Project structure

```
word-house/
├── gulpfile.js              build pipeline
├── package.json
├── src/
│   ├── index.html           markup and the inline markers
│   ├── css/house.css        all styles
│   ├── i18n/                one file per language: zh en ja ko th hant
│   └── js/
│       ├── boot.js          language detection, static labels, links to the main site
│       └── house/           app modules, concatenated in this order
│           ├── 00-core.js             DOM and i18n helpers, storage
│           ├── 10-words.js            the word list, emoji, rooms
│           ├── 20-progress.js         saved progress, stars, streak
│           ├── 30-speech.js           text-to-speech and voice picking
│           ├── 31-sfx.js              sound effects (Web Audio, no files)
│           ├── 32-effects.js          confetti and flying stars
│           ├── 40-guide.js            the guide and its speech bubble
│           ├── 50-ui-state.js         mode, hints, buttons
│           ├── 51-word-card.js        the word card
│           ├── 52-stickers.js         sticker book and celebrations
│           ├── 60-treasure-hunt.js    find-the-object game
│           ├── 61-listen-quiz.js      listen-and-pick quiz
│           ├── 70-controls.js         button wiring, static labels
│           ├── 80-scene3d.js          the Three.js scene: house, rooms, camera, picking
│           └── 90-main.js             start-up and the no-WebGL fallback
├── docs/screenshots/
└── dist/                    build output (git-ignored)
```

## Languages

The language is chosen in this order: the `?lang=` query parameter, the last language picked in
the menu, then the browser language. Valid codes are `zh`, `en`, `ja`, `ko`, `th` and `hant`,
for example `index.html?lang=ja`.

Each `src/i18n/<code>.json` has the same shape:

| Key | Content |
| --- | --- |
| `htmlLang` | value for `<html lang>` |
| `title`, `desc` | page title and meta description |
| `text` | labels that sit in the markup (`data-k="…"` in `index.html`) |
| `i18n` | strings used from JavaScript through `T('house.…')` and `F('house.…')` |
| `words` | per word id: `[gloss, sentence translation, tip]`; empty for English |

To add a language, copy `en.json`, translate it, and add an `<option>` to the `#whLang` menu in
`src/index.html`.

## Adding a word

1. Add the entry to the `WORDS` list in `src/js/house/10-words.js` and give it an emoji in `EMO`.
2. Build the object and register its label position in `src/js/house/80-scene3d.js`.
3. Add the gloss to `words` in each `src/i18n/*.json`.

## Links to the main site

Word House is one scene of [GachaLex](https://www.logicobs.xyz/gachaLex/en). The **Back to Home**
button and the **School** tab are not part of this repository; they link to the hosted site and
keep the current language in the path:

| Link | Target |
| --- | --- |
| Back to Home | `https://www.logicobs.xyz/gachaLex/{lang}` |
| School | `https://www.logicobs.xyz/gachaLex/{lang}/school` |

The base URL is the `SITE` constant at the top of `src/js/boot.js`.

## Browser support

Current Chrome, Edge, Safari and Firefox on desktop and mobile. WebGL is needed for the 3D
scene; without it the page falls back to the word list and the audio quiz. Text-to-speech depends
on the voices the browser provides.

For debugging, `window.__wordHouse()` returns the scene API in the console, for example
`__wordHouse().go('kitchen')`.

## Contributing

Issues and pull requests are welcome. Please run `npm run build` before opening a pull request
and check the page in at least one desktop and one mobile browser.

## License

[MIT](LICENSE)
