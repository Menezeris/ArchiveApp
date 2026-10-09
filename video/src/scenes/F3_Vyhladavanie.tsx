import React from 'react';
import { Step } from '../components/Steps';
import { voAt } from '../components/Subtitles';
import type { FootView } from '../components/Frame16';
import { DesktopFootageClip, Mark, Panel, Tap, markAt } from './F2_Metadata';
import { DocPath, ItemCard, SearchCard } from '../components/AppCards';
import { cutDuration, segStart } from '../lib/cuts';
import { tr } from '../copy/i18n';

/**
 * F3 - Vyhladavanie: zostrih noveho zaznamu (search2.mp4) podla src/footage/cuts.json.
 * Kolo 33: orez 1764 x 882 od (96, 150) = cely obsah appky v sirsom okne (vlavo vysledok s odznakmi
 * "Najdene v: Metadata | OCR", vpravo detail). Kolo 35: zvyraznenia su spoty (ramik + stmavene okolie).
 * Kolo 54 (Samuel: dlhu verziu zladit s kratkou K46): veta kratkej "Potom staci napisat klucove slovo. Aplikacia ukaze cestu
 * k polozke aj vsetky vycitane udaje." a veta dlhej "Klucove slovo sa zvyrazni v metadatach zaznamu.". Poradie ako v K46
 * (kola 43 az 48 tam): pole Hladat pocas pisania, pri "Aplikacia ukaze" vysledok a karta Cesta k polozke (ikony pri "cestu
 * k polozke"), posun stranky k zltej zhode pocas "aj vsetky vycitane", karta Najdena polozka pri "udaje" a drzi do konca.
 * Kamera: celok hore pocas pisania, pri vysledku jeden vyrez (drobcek, ZL_03 a po posune zlta zhoda), ktory pocas posunu stoji;
 * kurzor zakryty (scripts/hide-cursor.py --scale 2).
 */
const ID = 'f3-search';
export const F3_SECONDS = cutDuration(ID);
const L0 = voAt('F3-Vyhladavanie', 0) / 1000;
const L1 = voAt('F3-Vyhladavanie', 1) / 1000;
const W = { aplikacia: 2.6, cestu: 3.82, k: 4.16, polozke: 4.2, aj: 4.68, udaje: 6.14 }; // s od zaciatku vety (K46-F3-Vyhladavanie-0 words)
const at = (w: number) => L0 + w;
const F3_STEPS: Step[] = [
  { from: 0, title: tr('Napísať kľúčové slovo') },
  { from: (at(W.aplikacia) + 0.35) * 1000, title: tr('Cesta k položke') },
  { from: (at(W.udaje) - 0.45) * 1000, title: tr('Vyčítané údaje') },
  { from: L1 * 1000 - 100, title: tr('Zvýraznené v metadátach') },
];
const F3_TAPS: Tap[] = []; // detail zlozky sa otvara sam s vysledkom, klik v zazname nie je
const spot = { spot: true };
const MATCH_AT = segStart(ID, 4); // zlta zhoda v metadatach (koniec posunu)
const F3_MARKS: Mark[] = [
  markAt(ID, 1.1, 2.75, 190, 578, 1638, 62, spot), // pole vyhladavania (pisanie slova 1,4 az 2,5 s)
  markAt(ID, at(W.cestu) - 0.1, segStart(ID, 3) - 0.05, 596, 783, 246, 28, spot), // drobcek PL_01 / KR_01 / ZL_03 pri "cestu k polozke", pred posunom
  markAt(ID, Math.max(MATCH_AT + 0.1, L1), F3_SECONDS - 0.4, 998, 632, 496, 24, { ...spot, pad: 4 }), // zlta zhoda pri vete o metadatach
];
/** Pohlady (px orezu 1764 x 882): hore pole Hladat a nadpis, pri vysledku vyrez s drobcekom a ZL_03, pocas posunu stranky
 * kamera stoji, po nom pomaly dojazd k zltej zhode (y 482). Okno je cely klip zmensene (karty pod nim). */
const F3_VIEWS: FootView[] = [
  { t: 0, x: 0, y: 100, w: 1764 },
  { t: at(W.aplikacia) + 0.2, x: 0, y: 100, w: 1764 },
  { t: at(W.cestu) - 0.1, x: 440, y: 505, w: 1300 }, // drobcek, ZL_03, priloha (pole Hladat uz mimo zaberu)
  { t: segStart(ID, 4) + 0.05, x: 440, y: 505, w: 1300 }, // pocas posunu stranky kamera stoji (ako K46 kolo 47)
  { t: L1 + 0.3, x: 440, y: 405, w: 1300 }, // po posune pomaly dojazd k zltej zhode (y 482) a riadkom okolo
  { t: L1 + 1.6, x: 480, y: 420, w: 1200 }, // pri "v metadatach" pomaly blizsie k zhode, lavy okraj ostava (stlpec popisov cely)
];
/** Karty pod oknom (ako K46): hladane slovo, cesta k polozke od "Aplikacia ukaze", najdena polozka od "udaje" do konca. */
const F3_PANELS: Panel[] = [
  { from: 0.25, to: at(W.aplikacia) + 0.05, node: <SearchCard typeFrom={1.4} typeTo={2.5} /> },
  { from: at(W.aplikacia) + 0.1, to: at(W.udaje) - 0.05, node: <DocPath stepsAt={[at(W.cestu) - 0.06, at(W.k) + 0.12, at(W.polozke) + 0.28]} /> },
  { from: at(W.udaje) - 0.1, to: F3_SECONDS + 1, node: <ItemCard /> },
];
/** Kolo 53: F3 ide hned po F4 (ten konci do bielej), okno sa objavi z bielej (`enter`); na konci do bielej (Vysledok). */
export const F3_Vyhladavanie: React.FC = () => <DesktopFootageClip src="footage/f3-search.mp4" seconds={F3_SECONDS} steps={F3_STEPS} taps={F3_TAPS} marks={F3_MARKS} views={F3_VIEWS} panels={F3_PANELS} enter />;
