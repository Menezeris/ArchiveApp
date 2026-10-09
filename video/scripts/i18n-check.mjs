// CZ a EN verzia: kontrola prekladov.
//  1. kazde tr('...') v src/ ma preklad cs aj en v src/copy/i18n.ts (inak by v obraze ostala slovencina),
//  2. v i18n.ts nie su nepouzite kluce (pouzite = tr(...) v kode alebo retazec v src/copy/sk.ts),
//  3. scenare src/copy/vo.<lang>.json a vo_kratka.<lang>.json maju tie iste klipy, pocty viet a casti ako slovensky,
//     ziadna veta nie je bez prekladu a `sk` sedi so slovenskym textom (po zmene SK vety treba upravit aj preklad).
// Pouzitie: node scripts/i18n-check.mjs   (kod 1 pri chybe)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const i18n = readFileSync('src/copy/i18n.ts', 'utf8');
const body = i18n.split('export const UI')[1].split('\n};')[0];
const keys = new Map();
for (const m of body.matchAll(/^\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|([^\s:'"]+)):\s*\{\s*cs:\s*(['"])(.*?)\4,\s*en:\s*(['"])(.*?)\6\s*\}/gm)) {
  keys.set(m[1] ?? m[2] ?? m[3], { cs: m[5], en: m[7] });
}
let bad = 0;
const err = (s) => {
  bad++;
  console.log('CHYBA', s);
};
const used = new Set();
for (const f of walk('src').filter((f) => /\.tsx?$/.test(f) && !f.endsWith('i18n.ts'))) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\btr\((?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")\)/g)) {
    const k = m[1] ?? m[2];
    used.add(k);
    if (!keys.has(k)) err(`${f}: bez prekladu: ${k}`);
  }
}
const skTs = readFileSync('src/copy/sk.ts', 'utf8');
for (const k of keys.keys()) if (!used.has(k) && !skTs.includes(`'${k}'`)) console.log('nepouzity kluc:', k);

for (const base of ['vo', 'vo_kratka']) {
  const sk = JSON.parse(readFileSync(`src/copy/${base}.json`, 'utf8'));
  for (const lang of ['cs', 'en']) {
    const file = `src/copy/${base}.${lang}.json`;
    const tr = JSON.parse(readFileSync(file, 'utf8'));
    for (const [clip, lines] of Object.entries(tr)) {
      if (!Array.isArray(lines)) continue;
      const orig = sk[clip];
      if (!Array.isArray(orig)) {
        err(`${file}: klip ${clip} nie je v ${base}.json`);
        continue;
      }
      if (orig.length !== lines.length) err(`${file}: ${clip} ma ${lines.length} viet, slovensky ${orig.length}`);
      lines.forEach((l, i) => {
        const o = orig[i];
        if (!o) return;
        if (l.sk !== o.text) err(`${file}: ${clip}[${i}] slovenska veta sa zmenila: "${o.text}" (preklad je k "${l.sk}")`);
        if (l.at !== o.at) console.log(`pozor ${file}: ${clip}[${i}] at ${l.at} (SK ${o.at})`);
        if ((o.parts?.length ?? 0) !== (l.parts?.length ?? 0)) err(`${file}: ${clip}[${i}] ${l.parts?.length ?? 0} casti titulkov, slovensky ${o.parts?.length ?? 0} (kroky v obraze su viazane na casti)`);
        if (!l.text || l.text === o.text && /[áäčďéíľĺňóôŕšťúýž]/i.test(o.text) && lang === 'en') err(`${file}: ${clip}[${i}] bez prekladu`);
      });
    }
    if (base === 'vo') for (const clip of Object.keys(sk)) if (Array.isArray(sk[clip]) && !tr[clip]) err(`${file}: chyba klip ${clip}`);
  }
}
console.log(bad ? `${bad} chyb` : `OK: ${keys.size} textov v obraze, scenare CZ/EN sedia so slovenskymi`);
process.exit(bad ? 1 : 0);
