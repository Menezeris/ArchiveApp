import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ArchiveBox } from './ArchiveBox';
import { FreePill } from './ArchivesBrand';
import { OfferIcon, OfferIconKind } from './ArchivesIcons';
import { pop, settle } from '../lib/anim';
import { sk } from '../copy';
import { BRAND, FONT, INK, NAVY } from '../theme';
import { tr } from '../copy/i18n';

/**
 * Zaverecne prvky kratkej verzie K46 (kola 34 az 54, scenes/kratka/LinkedIn.tsx: VysRow, VysTile, VysIcon, KtoCard,
 * C8FirstStep) prenesene na 16:9 pre dlhu verziu (kolo 54). Kratka verzia si kresli svoje, tu su len kopie s inymi
 * rozmermi. Tmavomodre zavery (kolo 43 tam): vyplnena karta NAVY[800] s bielym textom, zeleny kruh s fajkou alebo ikonou.
 * Casy (`at`, `showAt`) su v ms klipu.
 */

/** Riadok vysledku: v obrysoch od `showAt`, pri `at` (slovo) sa vyplni tmavomodrou so zelenym kruhom a fajkou. */
export const VysRow: React.FC<{ text: string; at: number; showAt: number; left: number; top: number; w: number; h?: number }> = ({ text, at, showAt, left, top, w, h = 150 }) => {
  const frame = useCurrentFrame();
  const t = settle(frame, showAt);
  const tick = pop(frame, at + 60);
  const on = tick > 0.5;
  return (
    <div style={{ position: 'absolute', left, top, width: w, height: h, boxSizing: 'border-box', borderRadius: 26, background: on ? NAVY[800] : '#fff', border: `2px solid ${on ? NAVY[800] : NAVY[200]}`, boxShadow: on ? '0 16px 36px rgba(8,17,31,0.26)' : '0 12px 30px rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center', gap: 34, padding: '0 44px', opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>
      <div style={{ width: 84, height: 84, borderRadius: 42, background: BRAND[500], display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', opacity: Math.min(1, tick * 1.4), transform: `scale(${0.4 + 0.6 * tick})`, boxShadow: '0 6px 16px rgba(31,122,51,0.35)' }}>
        <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5 L10 17 L19 7" />
        </svg>
      </div>
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.02em', color: on ? '#fff' : INK[900], whiteSpace: 'nowrap' }}>{text}</div>
    </div>
  );
};

export type VysKind = 'keep' | 'shred' | 'scan';
export const VysIcon: React.FC<{ kind: VysKind; light?: boolean; size?: number }> = ({ kind, light = false, size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={light ? '#fff' : NAVY[700]} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {kind === 'keep' ? (
      <>
        <path d="M3 7h18v3H3zM5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
        <path d="M10 14h4" />
      </>
    ) : kind === 'shred' ? (
      <>
        <path d="M7 10V4a1 1 0 0 1 1-1h6l3 3v4" />
        <path d="M4 10h16v4H4z" />
        <path d="M7 14v6M10 14v5M13 14v6M16 14v5" />
      </>
    ) : (
      <>
        <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
        <path d="M4 12h16" />
        <path d="M9 8h6M9 16h6" />
      </>
    )}
  </svg>
);

/** Dlazdica dalsieho postupu: v obrysoch od `showAt`, pri `at` sa rozsvieti (zeleny kruh s bielou ikonou, tmavomodry obrys). */
export const VysTile: React.FC<{ kind: VysKind; label: string; sub: string; at: number; showAt: number; left: number; top: number; w: number; h: number }> = ({ kind, label, sub, at, showAt, left, top, w, h }) => {
  const frame = useCurrentFrame();
  const t = settle(frame, showAt);
  const on = pop(frame, at, { damping: 16 });
  const lit = on > 0.5;
  return (
    <div style={{ position: 'absolute', left, top, width: w, height: h, boxSizing: 'border-box', borderRadius: 26, background: '#fff', border: `3px solid ${lit ? NAVY[800] : NAVY[200]}`, boxShadow: lit ? '0 14px 34px rgba(8,17,31,0.14)' : '0 12px 30px rgba(15,23,42,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 16px', textAlign: 'center', opacity: t * (0.55 + 0.45 * Math.min(1, on)), transform: `translateY(${(1 - t) * 24}px)` }}>
      <div style={{ width: 112, height: 112, borderRadius: 56, background: lit ? BRAND[500] : '#fff', border: `2px solid ${lit ? BRAND[500] : NAVY[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.8 + 0.2 * Math.min(1, on)})`, boxShadow: lit ? '0 8px 18px rgba(31,122,51,0.3)' : 'none' }}>
        <VysIcon kind={kind} light={lit} size={68} />
      </div>
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 38, lineHeight: 1.05, letterSpacing: '-0.02em', color: NAVY[800] }}>{label}</div>
      <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 27, lineHeight: 1.15, color: INK[600] }}>{sub}</div>
    </div>
  );
};

/**
 * Karta "kto to urobi" (KtoCard v kratkej): ikona v kruhu vlavo, vpravo nazov a podtitulky; `dark` = tmavomodra vyplnena
 * (Sluzba na kluc, nasa ponuka), inak biela s obrysom, ktory pri `at` stmavne. `dim` = stlmenie, ked sa hovori o inom.
 */
export const KtoCard: React.FC<{ kind: OfferIconKind; title: string; subs: string[]; at: number; left: number; top: number; w: number; h: number; dark?: boolean; dim?: number }> = ({ kind, title, subs, at, left, top, w, h, dark = false, dim = 0 }) => {
  const frame = useCurrentFrame();
  const t = settle(frame, at);
  const on = pop(frame, at + 120, { damping: 16 });
  const lit = on > 0.5;
  return (
    <div style={{ position: 'absolute', left, top, width: w, height: h, boxSizing: 'border-box', borderRadius: 28, background: dark ? NAVY[800] : '#fff', border: `3px solid ${dark ? NAVY[800] : lit ? NAVY[700] : NAVY[200]}`, boxShadow: dark ? '0 18px 40px rgba(8,17,31,0.28)' : '0 14px 36px rgba(15,23,42,0.08)', display: 'flex', alignItems: 'center', gap: 36, padding: '0 44px', opacity: t * (1 - 0.45 * dim), transform: `translateY(${(1 - t) * 24}px)` }}>
      <OfferIcon kind={kind} on={lit} size={140} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.02em', color: dark ? '#fff' : NAVY[800], whiteSpace: 'nowrap' }}>{title}</div>
        {subs.map((s) => (
          <div key={s} style={{ marginTop: 10, fontFamily: FONT.body, fontWeight: 500, fontSize: 32, lineHeight: 1.2, color: dark ? NAVY[200] : INK[600], whiteSpace: 'nowrap' }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Prvy krok (C8FirstStep v kratkej): vlavo krabica, nalepka QR pri "krabicou", vpravo "Zacnime jednou krabicou", pilulka
 * "Zadarmo a nezavazne" pri "zadarmo" a web 0,45 s po nej. `lineAt` = zaciatok vety (ms klipu), `w` = casy slov (ms od vety).
 */
export const FirstStep: React.FC<{ lineAt: number; w: { krabicou: number; zadarmo: number } }> = ({ lineAt, w }) => {
  const frame = useCurrentFrame();
  const box = settle(frame, 0);
  const head = settle(frame, lineAt - 100);
  const sticker = pop(frame, lineAt + w.krabicou - 100);
  const free = pop(frame, lineAt + w.zadarmo - 150, { damping: 16 });
  const web = settle(frame, lineAt + w.zadarmo + 450);
  return (
    <>
      <ArchiveBox state={{ lid: 0, binders: [0, 0, 0], qr: [0, 0, 0, sticker] }} size={640} style={{ position: 'absolute', left: 230, top: 170, opacity: box, transform: `translateY(${(1 - box) * 30}px)` }} />
      <div style={{ position: 'absolute', left: 980, top: 250, fontFamily: FONT.display, fontWeight: 800, fontSize: 92, lineHeight: 1.04, letterSpacing: '-0.02em', color: INK[900], opacity: head, transform: `translateY(${(1 - head) * 24}px)` }}>
        {tr('Začnime')}
        <br />
        <span style={{ color: BRAND[600] }}>{tr('jednou krabicou')}</span>
      </div>
      <div style={{ position: 'absolute', left: 980, top: 500, display: 'flex', opacity: Math.min(1, free * 1.5), transform: `scale(${0.85 + 0.15 * free})`, transformOrigin: 'left center' }}>
        <FreePill text={tr('Zadarmo a nezáväzne')} />
      </div>
      <div style={{ position: 'absolute', left: 980, top: 650, display: 'flex', opacity: web, transform: `translateY(${(1 - web) * 12}px)` }}>
        <div style={{ padding: '12px 32px', borderRadius: 40, border: `2px solid ${INK[200]}`, fontFamily: FONT.display, fontWeight: 700, fontSize: 44, letterSpacing: '0.01em', color: INK[800] }}>{sk.S12.web}</div>
      </div>
    </>
  );
};
