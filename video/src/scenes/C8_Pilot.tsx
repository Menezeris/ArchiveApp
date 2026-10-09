import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Scene } from '../components/Scene';
import { StepLabel } from '../components/Frame16';
import { KtoCard } from '../components/ArchivesClose';
import { voAt, voLines } from '../components/Subtitles';
import { tr } from '../copy/i18n';
import { cue } from '../lib/lang';

/**
 * C8 - Kto archiv spracuje a v akom rozsahu (kolo 54, Samuel: dlhu verziu zladit s kratkou K46; veta kratkej, licencia na
 * karte, obhliadka a pilot vypadli, zaciatok riesi vyzva C8c).
 * Hore dve karty ako scena Kto v kratkej (KtoCard, tmavomodre zavery): Vlastnymi silami (biela s obrysom; s nasou aplikaciou,
 * od par sanonov; licencia podla rozsahu) pri "sami" a Sluzba na kluc (tmavomodra vyplnena; archiv spracujeme my, aj cely
 * sklad) pri "alebo". Dole riadok Rozsah nasadenia (v oboch pripadoch) s kartami Identifikacne strany a Cele dokumenty pri
 * slovach "len" a "alebo", stitky pri "strany" a "fulltextovym"; horny riadok je vtedy stlmeny.
 * Hlas: 400 "Bud katalogizujete sami, alebo vam archiv spracujeme na kluc." (K46-Kto-0), 5300 "V oboch pripadoch urcite
 * rozsah nasadenia: len identifikacne strany, alebo skenovanie celych dokumentov s fulltextovym vyhladavanim.".
 * Kolo 45 a 52: riadok rozsahu ako karty na sirku ramca (120 az 1800 px).
 * Kolo 56 (Samuel: veta o rozsahu nesedi, skenovanie celych dokumentov pride az na zaklade katalogizacie pomocou identifikacnych
 * stran, co hovori uz Vysledok): veta o rozsahu nasadenia a riadok Identifikacne strany / Cele dokumenty vypadli (ako v kratkej),
 * ostali dve karty Kto v strede plochy.
 */
const COL = { w: 810, gap: 60 };
const LEFT = 120;
const RIGHT = LEFT + COL.w + COL.gap;
const TOP = 330; // kolo 56: karty v strede plochy (bez riadku rozsahu pod nimi)
const L0 = voAt('C8-Pilot', 0);
const W0 = cue('C8_W0', { alebo: 2.0 }); // K46-Kto-0 words
export const C8_SECONDS = (L0 + (voLines('C8-Pilot')[0].dur ?? 4400) + 900) / 1000; // karty este 0,9 s po vete

export const C8_Pilot: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Scene mode="light">
      <StepLabel frame={frame} steps={[{ from: 0, title: tr('Vlastnými silami, alebo na kľúč') }]} />
      <KtoCard kind="app" title={tr('Vlastnými silami')} subs={[tr('s našou aplikáciou, od pár šanónov'), tr('licencia podľa rozsahu')]} at={L0 - 150} left={LEFT} top={TOP} w={COL.w} h={270} />
      <KtoCard kind="catalog" title={tr('Služba na kľúč')} subs={[tr('archív spracujeme my, aj celý sklad')]} at={L0 + W0.alebo * 1000 - 150} left={RIGHT} top={TOP} w={COL.w} h={270} dark />
    </Scene>
  );
};
