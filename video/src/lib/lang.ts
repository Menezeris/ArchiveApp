import { getInputProps } from 'remotion';
import localized from '../footage/localized.json';
import cues from '../copy/cues.json';

/**
 * Jazyk videa (CZ a EN verzia, oktober 2026): prop `lang` kompozicie, napr. `--props='{"lang":"cs"}'`.
 * Bez neho slovencina (povodne spravanie sa nemeni). Texty v obraze: src/copy/i18n.ts, hlas a titulky:
 * src/copy/vo.<lang>.json a vo_kratka.<lang>.json, hlas v public/vo-<lang>/ a public/vo-kratka-<lang>/.
 */
export type Lang = 'sk' | 'cs' | 'en';
export const LANGS: Lang[] = ['sk', 'cs', 'en'];
const raw = (getInputProps() as { lang?: string }).lang;
export const LANG: Lang = raw === 'cs' || raw === 'en' ? raw : 'sk';

/** Priecinok hlasu v public/: `vo` -> `vo-cs`, `vo-kratka` -> `vo-kratka-cs` (slovencina bez pripony). */
export const voDir = (base: 'vo' | 'vo-kratka') => (LANG === 'sk' ? base : `${base}-${LANG}`);

/**
 * Footage z aplikacie v danom jazyku: `footage/f3-search.mp4` -> `footage/cs/f3-search.mp4`, ale len ak je subor
 * zapisany v src/footage/localized.json (po dodani prelozenych zaznamov); inak ostava slovensky zaznam.
 */
export const footageSrc = (path: string) => {
  if (LANG === 'sk') return path;
  const name = path.replace(/^footage\//, '');
  return ((localized as unknown as Record<string, string[]>)[LANG] ?? []).includes(name) ? `footage/${LANG}/${name}` : path;
};

/** Hodnota podla jazyka (cisla, casy slov a pod.); chybajuci jazyk = slovenska hodnota. */
export const byLang = <T,>(v: { sk: T } & Partial<Record<Lang, T>>): T => v[LANG] ?? v.sk;

/**
 * Casy slov, na ktore su viazane animacie (karta, ikona, nalepka pri vyslovenom slove): slovenske hodnoty v kode,
 * pre cs/en prepis zo src/copy/cues.json (scripts/vo_cues.py z nahravok daneho jazyka). Chybajuci kluc = slovenska hodnota.
 */
export const cue = <T extends Record<string, number>>(name: string, sk: T): T => {
  if (LANG === 'sk') return sk;
  const over = (cues as unknown as Record<string, Record<string, Partial<T>> | string>)[LANG];
  return { ...sk, ...(typeof over === 'object' ? over[name] ?? {} : {}) };
};
