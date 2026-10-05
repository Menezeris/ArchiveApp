import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CORNER, Lockup } from '../components/ArchivesBrand';
import { StepLabel } from '../components/Frame16';
import { PriceTag, Sheet } from '../components/Illustrations';
import { voAt, voLines } from '../components/Subtitles';
import { ARCHIVES_LOGO } from './kratka/archivesLogo';
import { C4Promise, LOGO_H, LOGO_TOP, SLOGAN_GAP } from './C4_Cena';
import { easeInOut, pop, settle, tween } from '../lib/anim';
import { captions } from '../copy/sk';
import { BRAND, FONT, FPS, INK } from '../theme';

/**
 * C4b - hacik (kolo 54, Samuel: dlhu verziu zladit s hotovou kratkou K-LinkedIn-46). Prenesene z `LI_Hook`
 * (scenes/kratka/LinkedIn.tsx, kola 34 az 52 tam) na 16:9, hlas tie iste nahravky (K46-Hook-0 a -1).
 * "Naskenovat cely archiv moze byt drahe.": stoh listov, cez ktory prebieha skenovacia ciara, pocitadlo 0 az 328 stran,
 * pri "drahe" cenovka EUR EUR EUR; "Nasa aplikacia foti len identifikacnu stranu.": stoh sa odsunie dolava a zbledne, vrchny
 * list (identifikacna strana: nazov projektu, autor, rok, typ, peciatka, QR vlavo dole) ide doprava, pri "foti" zeleny ramik
 * a blesk, pri "identifikacnu" zelena cenovka s jednym EUR na rohu listu a "1 strana".
 * Logo z konca C4 (C4_CenaMain) je na tom istom mieste a za 450 ms sa zmensi presne do rohoveho loga (CornerBrand), slogan
 * a ikony Vas archiv -> Digitalny katalog zblednu. Na konci klipu obsah zbledne do bielej, C5 zacne krabicou zdola.
 */
const CLIP = 'C4b-Hacik';
const W = { drahe: 2.32, foti: 1.0, identifikacnu: 1.5 }; // s od zaciatku viet (K46-Hook-0 a -1, ako HOOK_W v kratkej)
const L0 = voAt(CLIP, 0);
const L1 = voAt(CLIP, 1);
const FADE = 300; // dobeh do bielej pred C5
export const C4B_SECONDS = (L1 + (voLines(CLIP)[1].dur ?? 3010) + 250 + FADE) / 1000;
const STEPS = [
  { from: 0, title: 'Skenovať všetko je drahé' },
  { from: L1 - 100, title: 'Katalogizácia: len identifikačná strana' },
];
const PAGES = 328;
const fmtPages = (n: number) => {
  const k = Math.round(n);
  return `${k.toLocaleString('sk-SK').replace(/ /g, ' ')} ${k === 1 ? 'strana' : k >= 2 && k <= 4 ? 'strany' : 'strán'}`; // kolo 54: sklonovanie pocas pocitania
};
const LOGO = { at: 100, ms: 450 };
/** Javisko v suradniciach kratkej verzie (stred stohu 540, 560), na 16:9 zvacsene STAGE_K a posunute na (960, STAGE_Y). */
const STAGE_K = 1.2;
const STAGE_Y = 470;
const SPREAD = { stack: -300, sheet: 560 }; // kolo 54: na sirku viac miesta nez v 4:5 (-230 / +420)

export const C4b_Hacik: React.FC = () => {
  const frame = useCurrentFrame();
  const ms = (frame / FPS) * 1000;
  const endAt = C4B_SECONDS * 1000 - FADE;
  const fade = 1 - tween(frame, endAt, FADE);
  // logo: z C4 (vyska LOGO_H, hore LOGO_TOP, v strede) do rohu (CornerBrand: vyska CORNER.h, vpravo CORNER.right)
  const [VW, VH] = ARCHIVES_LOGO.two.view;
  const lt = tween(frame, LOGO.at, LOGO.ms, easeInOut);
  const h0 = LOGO_H,
    h1 = CORNER.h;
  const lh = h0 + (h1 - h0) * lt;
  const x0 = 960 - (VW * h0) / VH / 2,
    x1 = 1920 - CORNER.right - (VW * h1) / VH;
  const y0 = LOGO_TOP,
    y1 = 1080 - CORNER.base - VH * (h1 / VH); // vrch svg rohoveho loga (bottom CORNER.base - 0,6 k, vyska (VH + 0,6) k)
  const sloganTop = LOGO_TOP + ((VH + 0.6) * h0) / VH + SLOGAN_GAP;
  // stoh a list (ako LI_Hook)
  const stackIn = settle(frame, 450);
  const scanFrom = L0 + 150;
  const count = tween(frame, scanFrom, W.drahe * 1000 + 300, easeInOut);
  const tag = pop(frame, L0 + W.drahe * 1000 - 120, { damping: 15 });
  const split = tween(frame, L1 + 100, 650, easeInOut);
  const frameT = settle(frame, L1 + W.foti * 1000 - 250);
  const flash = tween(frame, L1 + W.foti * 1000 - 50, 420);
  const cheapAt = L1 + W.identifikacnu * 1000 - 150;
  const tagOut = tween(frame, cheapAt, 350);
  const cheap = pop(frame, cheapAt + 120, { damping: 15 });
  const one = settle(frame, cheapAt + 200);
  const scanning = ms >= scanFrom && split < 0.5;
  const scanY = ((ms - scanFrom) % 520) / 520;
  const cx = 540,
    cy = 560,
    w = 300,
    h = 400;
  const stackDx = SPREAD.stack * split;
  const stackDim = 0.55 * split;
  const sheetCx = cx + SPREAD.stack + SPREAD.sheet; // stred listu po odsune
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <StepLabel frame={frame} steps={STEPS} opacity={fade} />
      {/* slogan a ikony z konca C4 zblednu */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: sloganTop, textAlign: 'center', fontFamily: FONT.body, fontWeight: 500, fontSize: 40, color: INK[600], opacity: Math.max(0, 1 - lt * 2.5), whiteSpace: 'nowrap' }}>{captions.C4brand}</div>
      <C4Promise out={tween(frame, 0, 300)} full />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: fade }}>
        <div style={{ position: 'absolute', left: 960 - cx * STAGE_K, top: STAGE_Y - cy * STAGE_K, width: 1080, height: 1000, transform: `scale(${STAGE_K})`, transformOrigin: '0 0' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: stackIn, transform: `translateY(${(1 - stackIn) * 20}px)` }}>
            {Array.from({ length: 6 }, (_, i) => i).map((i) => {
              const top = i === 5;
              const rot = (i - 2.5) * 2.2;
              const dx = (i - 2.5) * 9,
                dy = -i * 14;
              const lx = top ? SPREAD.sheet * split : 0;
              const ly = top ? 30 * split : 0;
              const sc = top ? 1 + 0.05 * split : 1;
              return (
                <div key={i} style={{ position: 'absolute', left: cx - w / 2 + dx + stackDx + lx, top: cy - h / 2 + dy + ly, width: w, height: h, opacity: top ? 1 : 1 - stackDim, transform: `rotate(${rot * (1 - (top ? split : 0))}deg) scale(${sc})`, transformOrigin: 'center', filter: 'drop-shadow(0 10px 22px rgba(15,23,42,0.14))' }}>
                  {top ? (
                    <>
                      <Sheet w={w} h={h} lines={0} title={false} qr stamp qrAt={[0.16, 0.72]} />
                      <div style={{ position: 'absolute', left: w * 0.12, top: h * 0.09, width: w * 0.76 }}>
                        <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', color: INK[400] }}>NÁZOV PROJEKTU</div>
                        <div style={{ marginTop: 6, padding: '6px 8px', borderRadius: 6, background: `rgba(234,245,235,${Math.min(1, frameT * 1.5)})`, fontFamily: FONT.display, fontWeight: 800, fontSize: 24, lineHeight: 1.12, letterSpacing: '-0.01em', color: INK[900] }}>
                          Novostavba bytového domu
                          <br />
                          SLNEČNÁ 12
                        </div>
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {[
                            ['Autor', 'DOMINIS PROJEKT, s.r.o.'],
                            ['Rok', '2018'],
                            ['Typ', 'Projekt pre stavebné povolenie'],
                          ].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', gap: 8, fontFamily: FONT.body, fontSize: 14, lineHeight: 1.2 }}>
                              <span style={{ width: 44, flex: 'none', fontWeight: 500, color: INK[400] }}>{k}</span>
                              <span style={{ fontWeight: 600, color: INK[800] }}>{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Sheet w={w} h={h} lines={8} title />
                  )}
                  {top && frameT > 0 ? <div style={{ position: 'absolute', inset: -14, borderRadius: 10, border: `5px solid ${BRAND[500]}`, opacity: Math.min(1, frameT * 1.5), transform: `scale(${1.08 - 0.08 * frameT})` }} /> : null}
                  {top && flash > 0 && flash < 1 ? <div style={{ position: 'absolute', inset: -14, borderRadius: 10, background: '#fff', opacity: 0.9 * (1 - flash) }} /> : null}
                </div>
              );
            })}
            {scanning ? <div style={{ position: 'absolute', left: cx - w / 2 - 40 + stackDx, top: cy - h / 2 - 70 + scanY * (h + 60), width: w + 80, height: 6, borderRadius: 3, background: INK[500], opacity: 0.75 * (1 - split * 2), boxShadow: '0 0 18px 6px rgba(71,85,105,0.35)' }} /> : null}
          </div>
          {count > 0 ? <div style={{ position: 'absolute', left: cx - 220 + stackDx, top: 800, width: 440, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 48, letterSpacing: '-0.01em', color: INK[500], opacity: 1 - stackDim, whiteSpace: 'nowrap' }}>{fmtPages(PAGES * count)}</div> : null}
          {one > 0 ? <div style={{ position: 'absolute', left: sheetCx - 220, top: 800, width: 440, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 48, letterSpacing: '-0.01em', color: BRAND[600], opacity: one, transform: `translateY(${(1 - one) * 12}px)`, whiteSpace: 'nowrap' }}>1 strana</div> : null}
          {tag > 0 && tagOut < 1 ? (
            <div style={{ position: 'absolute', left: 690 + 1.6 * stackDx, top: 300, opacity: 1 - tagOut, transform: `rotate(8deg) scale(${1.9 * (0.7 + 0.3 * Math.min(1, tag))})`, transformOrigin: 'left center' }}>
              <PriceTag text="€€€" s={Math.min(1, tag)} size={26} />
            </div>
          ) : null}
          {cheap > 0 ? (
            <div style={{ position: 'absolute', left: sheetCx + 128, top: 292, opacity: Math.min(1, cheap * 1.4), transform: `rotate(8deg) scale(${1.9 * (0.7 + 0.3 * Math.min(1, cheap))})`, transformOrigin: 'left center' }}>
              <PriceTag text="€" s={Math.min(1, cheap)} color={BRAND[600]} size={26} />
            </div>
          ) : null}
        </div>
      </div>
      {/* logo z C4 -> rohove logo (ostava do konca klipu, C5 ma CornerBrand na tom istom mieste) */}
      <div style={{ position: 'absolute', left: x0 + (x1 - x0) * lt, top: y0 + (y1 - y0) * lt }}>
        <Lockup height={lh} />
      </div>
    </div>
  );
};
