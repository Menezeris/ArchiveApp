import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Scene } from '../components/Scene';
import { StepLabel } from '../components/Frame16';
import { VysKind, VysRow, VysTile } from '../components/ArchivesClose';
import { voAt, voLines } from '../components/Subtitles';
import { tween } from '../lib/anim';
import { tr } from '../copy/i18n';
import { cue } from '../lib/lang';

/**
 * C8a - Vysledok katalogizacie (kolo 54, Samuel: dlhu verziu zladit s kratkou K46; scena LI_Vysledok tam, kola 34 az 53).
 * Hlas kratkej: "Vysledok: spolahlivo viete, co presne mate a kde to je." a "Potom viete rozhodnut, co uchovat, skartovat alebo
 * plnohodnotne skenovat." (K46-Vysledok-0 a -1). Hore dva riadky Ake dokumenty mate / Kde sa nachadzaju v obrysoch od zaciatku
 * vety, pri "co" a "kde" sa vyplnia tmavomodrou so zelenou fajkou; pod nimi tri dlazdice Uchovat (dlhodobo), Skartovat (mensi
 * sklad), Plnohodnotne skenovat (fulltextove vyhladavanie) v obrysoch od druhej vety, rozsvietia sa pri slovach.
 * F3 konci do bielej, Vysledok z bielej nabieha a na konci do bielej odide (C8 nabieha z bielej).
 */
const CLIP = 'C8a-Vysledok';
const L0 = voAt(CLIP, 0);
const L1 = voAt(CLIP, 1);
const W = cue('C8A_W', { co: 2.22, kde: 3.86, // kolo 56: nova veta "...ake dokumenty mate a kde presne sa nachadzaju." (slova ake a kde, faster-whisper)
  uchovat: 1.48, skartovat: 2.2, skenovat: 3.86 }); // s od zaciatku viet (ako VYS_W v kratkej)
const FADE = 300;
export const C8A_SECONDS = (L1 + (voLines(CLIP)[1].dur ?? 4760) + 300 + FADE) / 1000;
const STEPS = [
  { from: 0, title: tr('Výsledok katalogizácie') },
  { from: L1 - 150, title: tr('Čo ďalej') },
];
// 16:9: riadky vedla seba hore (stlpce ako karty C8), dlazdice pod nimi na celu sirku ramca (120 az 1800 px)
const ROWS = { lefts: [120, 990], w: 810, h: 150, top: 230 };
const TILES = { left: 120, w: 544, gap: 24, top: 450, h: 310 };
const TILE_LIST: { kind: VysKind; label: string; sub: string; at: number }[] = [
  { kind: 'keep', label: tr('Uchovať'), sub: tr('dlhodobo'), at: W.uchovat },
  { kind: 'shred', label: tr('Skartovať'), sub: tr('menší sklad'), at: W.skartovat },
  { kind: 'scan', label: tr('Plnohodnotne skenovať'), sub: tr('fulltextové vyhľadávanie'), at: W.skenovat },
];

export const C8a_Vysledok: React.FC = () => {
  const frame = useCurrentFrame();
  const out = tween(frame, C8A_SECONDS * 1000 - FADE, FADE);
  return (
    <Scene mode="light">
      <StepLabel frame={frame} steps={STEPS} />
      <VysRow text={tr('Aké dokumenty máte')} at={L0 + W.co * 1000 - 100} showAt={L0 + 150} left={ROWS.lefts[0]} top={ROWS.top} w={ROWS.w} h={ROWS.h} />
      <VysRow text={tr('Kde sa nachádzajú')} at={L0 + W.kde * 1000 - 100} showAt={L0 + 240} left={ROWS.lefts[1]} top={ROWS.top} w={ROWS.w} h={ROWS.h} />
      {TILE_LIST.map((t, i) => (
        <VysTile key={t.kind} kind={t.kind} label={t.label} sub={t.sub} at={L1 + t.at * 1000 - 120} showAt={L1 - 100 + i * 90} left={TILES.left + i * (TILES.w + TILES.gap)} top={TILES.top} w={TILES.w} h={TILES.h} />
      ))}
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: out, pointerEvents: 'none' }} />
    </Scene>
  );
};
