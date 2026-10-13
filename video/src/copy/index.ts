import * as raw from './sk';
import { tr, trDeep } from './i18n';

/**
 * Texty v obraze v jazyku videa (prop `lang`, src/lib/lang.ts): rovnake mena ako v sk.ts, preklad cez src/copy/i18n.ts.
 * Sceny importuju odtialto; sk.ts ostava zdrojom slovenskeho textu. Volitelne sceny (S04, S10) ostavaju po slovensky.
 */
export const captions = trDeep(raw.captions);
export const phases = trDeep(raw.phases);
export const pilot = trDeep(raw.pilot);
export const offer = trDeep(raw.offer);
export const sk = { ...raw.sk, S12: { ...raw.sk.S12, web: tr(raw.sk.S12.web) } };
