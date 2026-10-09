import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Scene } from '../components/Scene';
import { StepLabel } from '../components/Frame16';
import { FirstStep } from '../components/ArchivesClose';
import { voAt, voLines } from '../components/Subtitles';
import { tr } from '../copy/i18n';
import { cue } from '../lib/lang';

/**
 * C8c - Prvy krok (kolo 54, Samuel: vyzva ako v kratkej K46, aj so "zadarmo a nezavazne"; meni rozhodnutie kola 52 o pilulke).
 * Hlas "Zacnime jednou krabicou, zadarmo a nezavazne." (K-C8-Ponuka-3); vlavo krabica s nalepkou QR pri "krabicou", vpravo
 * nadpis, zelena pilulka Zadarmo a nezavazne pri "zadarmo" a web. Za nou C9 (zeleny zaver).
 */
const CLIP = 'C8c-Vyzva';
const L0 = voAt(CLIP, 0);
const C8C_W = cue('C8C_W', { krabicou: 1120, zadarmo: 2040 }); // ms od vety (CZ/EN: src/copy/cues.json)
export const C8C_SECONDS = (L0 + (voLines(CLIP)[0].dur ?? 3800)) / 1000 + 0.5; // ako K46: vyzva drzi 0,5 s po vete
export const C8c_Vyzva: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Scene mode="light">
      <StepLabel frame={frame} steps={[{ from: 0, title: tr('Prvý krok') }]} />
      <FirstStep lineAt={L0} w={C8C_W} />
    </Scene>
  );
};
