#!/usr/bin/env node
/**
 * Export pre web: zapise out/web/manifest.json, podla ktoreho si produktova
 * stranka na assetin.sk (repo Assetin.sk, `npm run sync:archives`) stiahne
 * video, klipy, stills, nazvy krokov a prepis nahovoru.
 *
 * Pouzitie (po `npm run render`, `node scripts/mix-music.mjs` a `npm run stills`):
 *   npm run export:web
 *   npm run export:web -- --lang cs   # CZ/EN verzia: out/mp4/<lang>/, out/stills/<lang>/ (VIDEO_LANG=cs NAMED=1
 *                                      # node scripts/stills-fast.mjs), vo.<lang>.json -> out/web/manifest.<lang>.json
 *
 * Manifest neobsahuje kopie suborov, len cesty (relativne k video/), velkost
 * a SHA-256. Web tak vie overit, ze stiahol presne to, co manifest popisuje,
 * a ze manifest nie je starsi ako render (sha nesedi -> treba znova exportovat).
 *
 * Zdroje pravdy:
 *   src/scenesList.ts   poradie klipov (SCENE_LIST) a pocet stills
 *   out/mp4/<klip>.mp4  dlzka klipu (z hlavicky MP4, vratane pauz Paced)
 *   src/scenes/*.tsx    nazvy krokov v obraze (polia `{ from, title }`)
 *   src/copy/vo.json    nahovor (vety po klipoch) - ak chyba, video je bez hlasu
 *   src/theme.ts        rozmery a fps
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argLang = process.argv.includes('--lang') ? process.argv[process.argv.indexOf('--lang') + 1] : 'sk';
if (!['sk', 'cs', 'en'].includes(argLang)) {
  console.error(`export-web: neznamy jazyk ${argLang} (sk, cs, en)`);
  process.exit(1);
}
const LANG = argLang;
/** Podpriecinok vystupov CZ/EN verzie (`out/mp4/cs/...`); slovencina bez neho. */
const SUB = LANG === 'sk' ? '' : `/${LANG}`;
const OUT = join(ROOT, `out/web/manifest${LANG === 'sk' ? '' : `.${LANG}`}.json`);
const SCHEMA = 1;

const fail = (msg) => {
  console.error(`export-web: ${msg}`);
  process.exit(1);
};

// --- rozmery a fps (src/theme.ts) ---
const theme = readFileSync(join(ROOT, 'src/theme.ts'), 'utf8');
const num = (name) => {
  const m = theme.match(new RegExp(`export const ${name} = (\\d+)`));
  if (!m) fail(`v src/theme.ts chyba ${name}`);
  return Number(m[1]);
};
const W = num('W');
const H = num('H');
const FPS = num('FPS');

// --- klipy (src/scenesList.ts: SCENE_LIST = jadro videa + WEB_EXTRA_LIST = klipy len pre web) ---
// Zaznam je na jednom riadku: `['C1-Intro', { component: C1_Intro, ... stills: [..] }]`
// alebo `paced('C2-Hladanie', { scene: C2_Hladanie, ... stills: [..] })`.
const listSrc = readFileSync(join(ROOT, 'src/scenesList.ts'), 'utf8');
const list = listSrc.split('V1_LIST')[0];
const re = /(?:\['|paced\(')([A-Za-z0-9-]+)',\s*\{[^\n]*?(?:component|scene): (\w+)[^\n]*?stills: \[([0-9, ]+)\]/g;
const scenes = [];
for (let m; (m = re.exec(list)); ) {
  scenes.push({ id: m[1], symbol: m[2], stillCount: m[3].split(',').length });
}
if (scenes.length === 0) fail('v src/scenesList.ts sa nenasiel ziaden klip');

// --- nazvy krokov v obraze (pole `{ from: ..., title: '...' }` v scene) ---
/** Subor sceny podla importu v scenesList (`import { C5_Teren } from './scenes/C5_Teren'`). */
const sceneFile = (symbol) => {
  const m = listSrc.match(new RegExp(`import \\{[^}]*\\b${symbol}\\b[^}]*\\} from '\\./scenes/([^']+)'`));
  return m ? join(ROOT, 'src/scenes', `${m[1]}.tsx`) : null;
};
// preklady textov v obraze (src/copy/i18n.ts, kluc = slovensky text): nazvy krokov v CZ/EN
const UI = {};
for (const m of readFileSync(join(ROOT, 'src/copy/i18n.ts'), 'utf8').matchAll(/^\s*(?:'((?:[^'\\]|\\.)*)'|"([^"]*)"|([A-Za-z\u00C0-\u017F]+)):\s*\{\s*cs:\s*(?:'((?:[^'\\]|\\.)*)'|"([^"]*)"),\s*en:\s*(?:'((?:[^'\\]|\\.)*)'|"([^"]*)")\s*\}/gm)) {
  UI[m[1] ?? m[2] ?? m[3]] = { cs: m[4] ?? m[5], en: m[6] ?? m[7] };
}
const tr = (sk) => (LANG === 'sk' ? sk : UI[sk]?.[LANG] ?? sk);

const stepsOf = (symbol) => {
  const file = sceneFile(symbol);
  if (!file || !existsSync(file)) return [];
  const src = readFileSync(file, 'utf8');
  const steps = [];
  for (const m of src.matchAll(/\{\s*from: [^{}]*?title: (?:tr\()?'([^']+)'\)?(?:[^{}]*?line: (?:tr\()?'([^']*)')?[^{}]*\}/g)) {
    steps.push({ title: tr(m[1]), line: m[2] ? tr(m[2]) : '' });
  }
  return steps;
};

// --- subory ---
/** Datum posledneho commitu suboru; necommitnuta zmena = dnes. */
const changed = (rel) => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const dirty = execFileSync('git', ['status', '--porcelain', '--', rel], { cwd: ROOT, encoding: 'utf8' }).trim();
    if (dirty) return today;
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', rel], { cwd: ROOT, encoding: 'utf8' }).trim();
    return d || today;
  } catch {
    return today;
  }
};

const file = (rel, { optional = false } = {}) => {
  const abs = join(ROOT, rel);
  if (!existsSync(abs)) {
    if (optional) return null;
    fail(`chyba subor ${rel} (spusti npm run render / npm run stills)`);
  }
  const buf = readFileSync(abs);
  return {
    path: rel,
    bytes: buf.length,
    sha256: createHash('sha256').update(buf).digest('hex'),
    changed: changed(rel),
  };
};

/**
 * Dlzka MP4 v sekundach z hlavicky `moov/mvhd` (timescale + duration),
 * bez ffprobe. Klip s pauzami (Paced) je dlhsi ako `seconds` v scenesList,
 * preto sa dlzka meria z vyrenderovaneho suboru.
 */
const mp4Seconds = (rel) => {
  const buf = readFileSync(join(ROOT, rel));
  const walk = (start, end) => {
    let p = start;
    while (p + 8 <= end) {
      let size = buf.readUInt32BE(p);
      const type = buf.toString('latin1', p + 4, p + 8);
      let head = 8;
      if (size === 1) {
        size = Number(buf.readBigUInt64BE(p + 8));
        head = 16;
      } else if (size === 0) size = end - p;
      if (type === 'moov') return walk(p + head, p + size);
      if (type === 'mvhd') {
        const version = buf[p + head];
        if (version === 1) {
          return Number(buf.readBigUInt64BE(p + head + 24)) / buf.readUInt32BE(p + head + 20);
        }
        return buf.readUInt32BE(p + head + 16) / buf.readUInt32BE(p + head + 12);
      }
      p += size;
    }
    return null;
  };
  const s = walk(0, buf.length);
  if (!s) fail(`${rel}: v MP4 sa nenasla hlavicka mvhd`);
  return Math.round(s * 100) / 100;
};

// --- nahovor (src/copy/vo.json: klip -> vety s casmi) ---
const voPath = join(ROOT, `src/copy/vo${LANG === 'sk' ? '' : `.${LANG}`}.json`);
const vo = existsSync(voPath) ? JSON.parse(readFileSync(voPath, 'utf8')) : {};
const sentencesOf = (id) =>
  (Array.isArray(vo[id]) ? vo[id] : [])
    .map((s) => (typeof s?.text === 'string' ? s.text.trim() : ''))
    .filter(Boolean);
/** Nazvy klipov pre prepis (v obraze ich nie je, video ich nepotrebuje). */
const TITLES = {
  'C1-Intro': ['Intro', 'Úvod', 'Intro'],
  'C2-Hladanie': ['Hľadanie', 'Hledání', 'Searching'],
  'C4-Cena': ['Cena problému', 'Cena problému', 'The cost of the problem'],
  'C5-Teren': ['V teréne', 'V terénu', 'On site'],
  'F1-Sken': ['V mobile', 'V mobilu', 'On the phone'],
  'C6-Spracovanie': ['Spracovanie', 'Zpracování', 'Processing'],
  'F2-Metadata': ['Návrh metadát', 'Návrh metadat', 'Suggested metadata'],
  'F4-Kontrola': ['Kontrola', 'Kontrola', 'Review'],
  'C10-Databaza': ['Práca s databázou', 'Práce s databází', 'Working with the database'],
  'F3-Vyhladavanie': ['Vyhľadávanie', 'Vyhledávání', 'Search'],
  'C8-Pilot': ['Ako začať', 'Jak začít', 'How to start'],
  'C9-Outro': ['Záver', 'Závěr', 'Conclusion'],
}; // sk, cs, en

// --- manifest ---
const missing = [];
const clips = scenes.filter((s) => {
  // CZ/EN: klip, ktory sa v jazyku nerenderuje (napr. C10-Databaza), v manifeste nie je
  if (SUB && !existsSync(join(ROOT, `out/mp4${SUB}/${s.id}.mp4`))) return missing.push(s.id), false;
  return true;
}).map((s, i) => {
  const rel = `out/mp4${SUB}/${s.id}.mp4`;
  return {
    id: s.id,
    order: i + 1,
    title: TITLES[s.id]?.[['sk', 'cs', 'en'].indexOf(LANG)] ?? s.id,
    seconds: mp4Seconds(rel),
    file: file(rel),
    stills: Array.from({ length: s.stillCount }, (_, k) => file(`out/stills${SUB}/${s.id}_${k + 1}.png`)),
    steps: stepsOf(s.symbol),
  };
});
const transcript = clips
  .map((c) => ({ clip: c.id, title: c.title, text: sentencesOf(c.id).join(' ') }))
  .filter((t) => t.text);

const FULL = LANG === 'sk' ? 'Full' : `Full_${LANG.toUpperCase()}`; // out/mp4/cs/Full_CS_1080p.mp4
const full = {
  '1080p': file(`out/mp4${SUB}/${FULL}_1080p.mp4`),
  '540p': file(`out/mp4${SUB}/${FULL}_preview_540p.mp4`, { optional: true }),
};
const manifest = {
  $comment: 'Generuje `npm run export:web` (video/scripts/export-web.mjs) - needitovat rucne.',
  schema: SCHEMA,
  lang: LANG,
  updated: [full['1080p'], ...clips.flatMap((c) => [c.file, ...c.stills])]
    .map((f) => f.changed)
    .sort()
    .at(-1),
  video: { width: W, height: H, fps: FPS, sound: transcript.length > 0 },
  full: {
    seconds: mp4Seconds(full['1080p'].path),
    files: Object.fromEntries(Object.entries(full).filter(([, f]) => f)),
  },
  clips,
  transcript,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `export-web: ${clips.length} klipov, plne video ${manifest.full.seconds} s${manifest.video.sound ? ' s nahovorom' : ''}, ` +
    `${transcript.length} sekcii prepisu -> ${OUT.slice(ROOT.length + 1)}`,
);
if (missing.length) console.log(`  bez klipu v jazyku ${LANG}: ${missing.join(', ')}`);
for (const c of clips) {
  console.log(`  ${String(c.order).padStart(2)}. ${c.id.padEnd(16)} ${String(c.seconds).padStart(6)} s  stills ${c.stills.length}  kroky ${c.steps.length}`);
}
