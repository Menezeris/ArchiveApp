// Zostrih footage podla src/footage/cuts.json: orez (crop / vf), zrychlenie, zmrazeny prvy/posledny
// obraz segmentu, spojenie; `fade` = prelinacka z predosleho segmentu (s, kolo 33). Zdroj: public/footage/src/*.mp4.
// Pouzitie: node scripts/cut-footage.mjs [f2-metadata f3-search f4-review]
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const FF = process.env.FFMPEG ?? execFileSync('python3', ['-c', 'import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())']).toString().trim();
const cuts = JSON.parse(readFileSync('src/footage/cuts.json', 'utf8'));
/** Namerana dlzka videa (s). */
const measure = (file) => {
  const probe = spawnSync(FF, ['-i', file, '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const t = [...probe.matchAll(/time=(\d+):(\d+):([\d.]+)/g)].pop();
  return t ? Number(t[1]) * 3600 + Number(t[2]) * 60 + Number(t[3]) : 0;
};
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(cuts).filter((k) => typeof cuts[k] === 'object');
for (const id of ids) {
  const { src, segs } = cuts[id]; // vf: vlastny filter (mobil: scale=884:1920), inak orez desktopu
  const tmp = mkdtempSync(join(tmpdir(), 'cut-'));
  const parts = [];
  segs.forEach((s, i) => {
    const out = join(tmp, `${i}.mp4`);
    const speed = s.speed ?? 1;
    if (s.smooth) {
      // kolo 57: plynuly posun stranky (scripts/smooth-scroll.py), korekcia vyrezu do src/footage/<id>.scroll.json
      const t0 = segs.slice(0, i).reduce((acc, q, j) => acc + (q.smooth ? q.smooth.dur + (q.after ?? 0) : (q.before ?? 0) + (q.to - q.from) / (q.speed ?? 1) + (q.after ?? 0)) - (j > 0 ? q.fade ?? 0 : 0), 0);
      execFileSync('python3', ['scripts/smooth-scroll.py', `public/footage/${src}`, String(s.from), String(s.to), String(s.smooth.dur), out, '--vf', cuts[id].vf ?? `crop=${cuts.crop}`, '--stop-early', String(s.smooth.stopEarly ?? 0), '--after', String(s.after ?? 0), '--t0', t0.toFixed(4), '--json', `src/footage/${id}.scroll.json`], { stdio: 'inherit' });
      parts.push(`file '${out}'`);
      return;
    }
    // fps pred tpad: po setpts nema stream snimkovu frekvenciu a tpad by zmrazenie ticho vynechal (ffmpeg 7, kolo 32)
    // kolo 53: `up` = vystup v nasobnom rozliseni (lanczos + jemny unsharp), okno aplikacie sa v Remotion len zmensuje (ostrejsi text)
    const up = cuts[id].up ? [`scale=iw*${cuts[id].up}:ih*${cuts[id].up}:flags=lanczos`, 'unsharp=5:5:0.6:5:5:0'] : [];
    const vf = [cuts[id].vf ?? `crop=${cuts.crop}`, ...up, `setpts=PTS/${speed}`, 'fps=30', `tpad=start_duration=${s.before ?? 0}:start_mode=clone:stop_duration=${s.after ?? 0}:stop_mode=clone`].join(',');
    execFileSync(FF, ['-v', 'error', '-y', '-ss', String(s.from), '-to', String(s.to), '-i', `public/footage/${src}`, '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-pix_fmt', 'yuv420p', out], { stdio: 'inherit' });
    parts.push(`file '${out}'`);
  });
  // kolo 57: skutocny zaciatok plynuleho posunu (dlzky usekov su po zaokruhleni na snimky ine ako nominalne) do <id>.scroll.json
  const si = segs.findIndex((q) => q.smooth);
  if (si >= 0) {
    const files = parts.map((p) => p.slice(6, -1));
    const t0 = files.slice(0, si).reduce((acc, f) => acc + measure(f), 0);
    const jf = `src/footage/${id}.scroll.json`;
    const j = JSON.parse(readFileSync(jf, 'utf8'));
    j.t0 = Math.round(t0 * 10000) / 10000;
    writeFileSync(jf, JSON.stringify(j));
    console.log(`plynuly posun zacina v ${j.t0} s zostrihu (namerane)`);
  }
  const out = `public/footage/${id}.mp4`;
  const enc = ['-c:v', 'libx264', '-crf', cuts[id].up ? '14' : '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-an', out];
  if (segs.some((s, i) => i > 0 && s.fade)) {
    // prelinacky: xfade medzi segmentmi s fade, inak concat; offsety z nameranych dlzok usekov
    const files = parts.map((p) => p.slice(6, -1));
    const lens = files.map(measure);
    const graph = files.map((_, i) => `[${i}:v]setpts=PTS-STARTPTS,fps=30,format=yuv420p[s${i}]`);
    let cur = '[s0]';
    let t = lens[0];
    segs.slice(1).forEach((s, k) => {
      const i = k + 1;
      const next = `[v${i}]`;
      if (s.fade) {
        graph.push(`${cur}[s${i}]xfade=transition=fade:duration=${s.fade}:offset=${(t - s.fade).toFixed(4)},fps=30${next}`);
        t += lens[i] - s.fade;
      } else {
        graph.push(`${cur}[s${i}]concat=n=2:v=1:a=0,fps=30${next}`);
        t += lens[i];
      }
      cur = next;
    });
    execFileSync(FF, ['-v', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex', graph.join(';'), '-map', cur, ...enc], { stdio: 'inherit' });
  } else {
    writeFileSync(join(tmp, 'list.txt'), parts.join('\n'));
    execFileSync(FF, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', join(tmp, 'list.txt'), ...enc], { stdio: 'inherit' });
  }
  rmSync(tmp, { recursive: true, force: true });
  const dur = segs.reduce((a, s, i) => a + (s.smooth ? s.smooth.dur + (s.after ?? 0) : (s.before ?? 0) + (s.to - s.from) / (s.speed ?? 1) + (s.after ?? 0)) - (i > 0 ? s.fade ?? 0 : 0), 0);
  const real = measure(out);
  const warn = Math.abs(real - dur) > 0.3 ? `  <-- POZOR: namerane ${real.toFixed(2)} s` : '';
  console.log(`${id}: ${segs.length} segmentov, ${dur.toFixed(2)} s -> public/footage/${id}.mp4${warn}`);
}
