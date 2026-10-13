// CZ a EN verzia: zmesti sa nahovor do klipov? Pre kazdy klip dlzka kompozicie (s danym jazykom) a koniec poslednej vety
// (at + dur zo scenara). Rezerva < 250 ms = veta zasahuje do konca klipu (zvuk by sa orezal alebo titulok zmizol).
// Pouzitie: node scripts/clip-fit.mjs cs [ID ...]   (sk = slovenska referencia)
import { bundle } from '@remotion/bundler';
import { selectComposition } from '@remotion/renderer';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const [lang = 'sk', ...only] = process.argv.slice(2);
const script = JSON.parse(readFileSync(lang === 'sk' ? 'src/copy/vo.json' : `src/copy/vo.${lang}.json`, 'utf8'));
const list = readFileSync('src/scenesList.ts', 'utf8').split('V1_LIST')[0];
const ids = only.length ? only : [...list.matchAll(/(?:\[|paced\()'([A-Za-z0-9-]+)'/g)].map((m) => m[1]);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const browserExecutable = process.env.REMOTION_CHROME ?? null;
const inputProps = lang === 'sk' ? {} : { lang };
let bad = 0;
for (const id of [...new Set(ids)]) {
  const lines = script[id];
  if (!Array.isArray(lines) || !lines.length) continue;
  const c = await selectComposition({ serveUrl, id, browserExecutable, inputProps });
  const clipMs = (c.durationInFrames / c.fps) * 1000;
  const last = lines[lines.length - 1];
  const end = last.at + (last.dur ?? 0);
  const margin = Math.round(clipMs - end);
  if (margin < 250) bad++;
  console.log(`${id.padEnd(22)} klip ${(clipMs / 1000).toFixed(2)} s  koniec hlasu ${(end / 1000).toFixed(2)} s  rezerva ${margin} ms${margin < 250 ? '  <-- MALO' : ''}`);
}
console.log(bad ? `${bad} klip(y) s malou rezervou` : 'OK');
