import React from 'react';
import { C1_Intro } from './scenes/C1_Intro';
import { C2_Hladanie, C2_SECONDS } from './scenes/C2_Hladanie';
import { C2_Kancelaria } from './scenes/C2_Kancelaria';
import { C3_Sklad } from './scenes/C3_Sklad';
import { C4_CenaMain, C4_WIPE_AT } from './scenes/C4_Cena';
import { C4B_SECONDS, C4b_Hacik } from './scenes/C4b_Hacik';
import { C5_TerenMain } from './scenes/C5_Teren';
import { C8B_SECONDS, C8b_Technika } from './scenes/C8b_Technika';
import { F1_SECONDS, F1_Sken } from './scenes/F1_Sken';
import { C6_Spracovanie } from './scenes/C6_Spracovanie';
import { F2_Metadata } from './scenes/F2_Metadata';
import { F3_Vyhladavanie } from './scenes/F3_Vyhladavanie';
import { F4_Kontrola } from './scenes/F4_Kontrola';
import { C7_Hierarchia } from './scenes/C7_Hierarchia';
import { F4_Navrh, F4_NAVRH_SECONDS } from './scenes/F4_Navrh';
import { F3_VyhladavanieWeb, F3_WEB_SECONDS } from './scenes/web/F3_VyhladavanieWeb';
import { F4_KontrolaWeb, F4_WEB_SECONDS, F4_WEB_SKIP } from './scenes/web/F4_KontrolaWeb';
import { C8_Pilot, C8_SECONDS } from './scenes/C8_Pilot';
import { C8A_SECONDS, C8a_Vysledok } from './scenes/C8a_Vysledok';
import { C8C_SECONDS, C8c_Vyzva } from './scenes/C8c_Vyzva';
import { C9_Outro } from './scenes/C9_Outro';
import { S04_Pokusy } from './scenes/optional/S04_Pokusy';
import { S10_Nasadenie } from './scenes/optional/S10_Nasadenie';
import { BrandDef, Hold, Paced, holdsSeconds } from './components/Paced';
import { F2_SECONDS } from './scenes/F2_Metadata';
import { F3_SECONDS } from './scenes/F3_Vyhladavanie';
import { F4_SECONDS } from './scenes/F4_Kontrola';

export type SceneDef = { component: React.FC; seconds: number; stills: number[] };
/** Klip s pauzami (holds, ms v case sceny), nahovorom (vo) a titulkami; seconds = dlzka sceny bez pauz. */
type PacedDef = { scene: React.FC; seconds: number; stills: number[]; holds?: Hold[]; skip?: number; vo?: boolean; dark?: boolean; darkUntil?: number; subtitleLeft?: number; brand?: BrandDef };
const paced = (id: string, d: PacedDef): [string, SceneDef] => {
  const Scene = d.scene;
  const component: React.FC = () =>
    React.createElement(Paced, { id, holds: d.holds, skip: d.skip, vo: d.vo, dark: d.dark, darkUntil: d.darkUntil, subtitleLeft: d.subtitleLeft, brand: d.brand, children: React.createElement(Scene) });
  return [id, { component, seconds: d.seconds + holdsSeconds(d.holds) - (d.skip ?? 0) / 1000, stills: d.stills }];
};

/**
 * Klipy (kolo 29; kolo 33: pauzy podla casov slov hlasu Gemini, plynule spomalenie okolo pauz v Paced): dlzka sceny v sekundach + pauzy (Paced), frame-y pre stills (vo vystupnom case).
 * Pravidlo: text kroku nastupi, obraz sa zastavi (hold), az potom dej; vetu hovori nahovor a titulok.
 * Kolo 49: `brand` = logo Assetin Archives v pravom dolnom rohu (ako v kratkej verzii), okrem intra a zaveru.
 */
export const SCENE_LIST: [string, SceneDef][] = [
  ['C1-Intro', { component: C1_Intro, seconds: 3.6, stills: [30, 55, 95] }],
  paced('C2-Hladanie', { scene: C2_Hladanie, seconds: C2_SECONDS, vo: true, dark: true, brand: { dark: true }, stills: [80, 150, 260, 340] }), // kolo 55: bez zastavenia obrazu (predtym holds 1700/2420 a 3600/500)
  // kolo 54: logo s tvrdym t "Predstavujeme Assetin Archives." + veta o katalogu, logo ostava a prevezme ho hacik (bez krabice);
  // klip konci 0,3 s po vete (vystup 19,55 s = scena 15,28 s + pauzy 4,27 s)
  paced('C4-Cena', { scene: C4_CenaMain, seconds: 15.28, vo: true, darkUntil: 11400, brand: { darkUntil: C4_WIPE_AT, hide: [C4_WIPE_AT, 1e9] }, holds: [{ at: 3000, hold: 2500 }, { at: 4390, hold: 1770 }], stills: [80, 170, 280, 370, 500] }),
  // kolo 54: hacik z kratkej K46 (drahy sken celeho archivu proti 1 identifikacnej strane), rohove logo kresli scena sama
  paced('C4b-Hacik', { scene: C4b_Hacik, seconds: C4B_SECONDS, vo: true, stills: [20, 80, 150, 200] }),
  // kolo 51: dlhsia veta o QR (nalepky pri "sanon alebo zlozka, dostane QR kod"); kolo 54: "Staci bezny mobil." (blesk pri "mobil", bez pauzy na konci)
  paced('C5-Teren', { scene: C5_TerenMain, seconds: 8.4, vo: true, brand: {}, holds: [{ at: 1400, hold: 3800 }, { at: 4300, hold: 4350 }], stills: [70, 200, 300, 400] }),
  paced('F1-Sken', { scene: F1_Sken, seconds: F1_SECONDS, vo: true, brand: {}, subtitleLeft: 900, stills: [20, 170, 310] }),
  // kolo 41: C7-Hierarchia vypadlo (Samuel: navyse; hierarchiu povie F1 "zaradime ju do hierarchie" a ukaze F3 cesta v hierarchii)
  paced('C6-Spracovanie', { scene: C6_Spracovanie, seconds: 2, vo: false, // kolo 52: 2 s (predtym 3 s bez hlasu)
    // kolo 51: bez vety (F2 hned "Aplikacia z fotky sama precita text...")
    brand: {}, stills: [10, 30, 55] }),
  paced('F2-Metadata', { scene: F2_Metadata, seconds: F2_SECONDS, vo: true, // kolo 56: bez zastavenia obrazu (predtym hold 7400/900), spracovanie pomalsie v zostrihu
    // kolo 51: veta z kratkej verzie je o 0,3 s dlhsia
    brand: {}, stills: [10, 100, 240] }),
  paced('F4-Kontrola', { scene: F4_Kontrola, seconds: F4_SECONDS, vo: true, brand: {}, stills: [10, 150, 400] }),
  // kolo 53 (Samuel: export a analyzu vyhodit, hned klucove slovo a vyhladavanie): C10-Databaza vypadol, F3 ide hned po F4
  paced('F3-Vyhladavanie', { scene: F3_Vyhladavanie, seconds: F3_SECONDS, vo: true, brand: {}, stills: [30, 120, 220, 320] }),
  // kolo 54: Vysledok katalogizacie z kratkej K46 (dva riadky, tri dlazdice)
  paced('C8a-Vysledok', { scene: C8a_Vysledok, seconds: C8A_SECONDS, vo: true, brand: {}, stills: [40, 120, 200, 280] }),
  // kolo 42: dve ponuky, kolo 45: riadok rozsahu nasadenia; kolo 54: veta kratkej "Bud katalogizujete sami, alebo..." + rozsah
  paced('C8-Pilot', { scene: C8_Pilot, seconds: C8_SECONDS, vo: true, brand: {}, stills: [40, 70, 100, 135, 165] }),
  paced('C8b-Technika', { scene: C8b_Technika, seconds: C8B_SECONDS, vo: true, brand: {}, stills: [40, 160, 220] }), // kolo 52: slide Technicke riesenie z kratkej verzie
  // kolo 54: vyzva z kratkej K46 "Zacnime jednou krabicou, zadarmo a nezavazne."
  paced('C8c-Vyzva', { scene: C8c_Vyzva, seconds: C8C_SECONDS, vo: true, brand: {}, stills: [20, 60, 100] }),
  // kolo 53: po poslednom slove zaverecny akord hudby doznie na logu; kolo 54: hlas len "Assetin Archives.", 4,8 s
  paced('C9-Outro', { scene: C9_Outro, seconds: 4.8, vo: true, dark: true, stills: [40, 120] }),
];

/**
 * Klipy len pre web (nie su vo Full): C7-Hierarchia vypadlo z videa v kole 41,
 * ale produktova stranka ho pouziva ako ilustraciu kroku "Zaradenie do
 * hierarchie" (strom polica - krabica - zlozka - dokument); F4-Navrh je prvy
 * usek kontroly (navrh udajov vedla fotky) pre krok 3. export-web.mjs
 * ho berie ako kazdy iny klip (musi stat pred zoznamom verzie 1).
 * Po zluceni s dlhou verziou (kola 49 az 56): F3 a F4 pre web maju vlastne zostrihy (f3-search-web, f4-review-web)
 * a zmrazeny DesktopFootageClip (scenes/web/WebFootage.tsx), takze sa nemenia s dlhym videom.
 */
export const WEB_EXTRA_LIST: [string, SceneDef][] = [
  paced('C7-Hierarchia', { scene: C7_Hierarchia, seconds: 5.6, vo: true, stills: [15, 75, 165] }),
  paced('F4-Navrh', { scene: F4_Navrh, seconds: F4_NAVRH_SECONDS, stills: [5, 60, 150] }),
  paced('F4-Kontrola-Web', { scene: F4_KontrolaWeb, seconds: F4_WEB_SECONDS, skip: F4_WEB_SKIP, stills: [10, 150, 400] }),
  paced('F3-Vyhladavanie-Web', { scene: F3_VyhladavanieWeb, seconds: F3_WEB_SECONDS, stills: [30, 170, 330, 440] }),
];

/** Verzia 1 (dlha): samostatna kancelaria a sklad, nahradene klipom C2-Hladanie. */
export const V1_LIST: [string, SceneDef][] = [
  ['C2-Kancelaria', { component: C2_Kancelaria, seconds: 8, stills: [50, 110, 230] }],
  ['C3-Sklad', { component: C3_Sklad, seconds: 13, stills: [90, 230, 380] }],
];

/** Volitelne sceny v starom layoute (nie su v jadre videa). */
export const OPTIONAL_LIST: [string, SceneDef][] = [
  ['S04-Pokusy', { component: S04_Pokusy, seconds: 6, stills: [60, 160] }],
  ['S10-Nasadenie', { component: S10_Nasadenie, seconds: 6, stills: [60, 150] }],
];
