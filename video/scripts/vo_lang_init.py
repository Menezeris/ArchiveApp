#!/usr/bin/env python3
"""CZ a EN verzia (oktober 2026): vyrobi src/copy/vo.<lang>.json a vo_kratka.<lang>.json zo slovenskeho scenara
a prekladov nizsie (navrh na schvalenie rodenymi hovorcami). Casy `at` ostavaju slovenske (obraz sa nemeni);
`dur` a `partAt` su do vygenerovania hlasu len zastupne slovenske hodnoty (`_voice: false`), potom ich prepise
`node scripts/vo.mjs --engine gemini --script src/copy/vo.cs.json --dir public/vo-cs`.
Vety vystrihnute zo starsich nahravok (`src`) sa v CZ/EN generuju cele. Kratka verzia: len klipy K-LinkedIn-46.

Pouzitie: python3 scripts/vo_lang_init.py [--force]   (bez --force neprepise existujuci subor, aby sa nestratili
schvalene upravy; preklad sa potom upravuje priamo v src/copy/vo.<lang>.json)
"""
import json, os, sys

T = {
  # klucom je slovensky `text` vety; hodnota: (cs, en), pripadne s castami titulkov ako zoznam
  "Kedy ste naposledy nevedeli nájsť nejaký dokument? Či už správu, výkres alebo protokol?": (
    ["Kdy jste naposledy nemohli najít nějaký dokument?", "Ať už zprávu, výkres, nebo protokol?"],
    ["When did you last struggle to find a document?", "A report, a drawing or a certificate?"]),
  "Kedy ste naposledy nevedeli nájsť nejaký dokument?": (
    "Kdy jste naposledy nemohli najít nějaký dokument?",
    "When did you last struggle to find a document?"),
  "V sklade, na polici, v krabici alebo v zložke.": (
    "Ve skladu, na polici, v krabici, nebo ve složce.",
    "In storage, on a shelf, in a box or in a folder."),
  "Hľadanie môže trvať hodiny.": ("Hledání může trvat hodiny.", "Searching can take hours."),
  "Niekedy je rýchlejšie dať dokumentáciu vyhotoviť nanovo. A tak sa môže stať, že zaplatíte dvakrát za to isté.": (
    ["Někdy je rychlejší nechat dokumentaci vyhotovit znovu.", "A tak se může stát, že zaplatíte dvakrát za totéž."],
    ["Sometimes it is faster to have the documentation made again.", "So you may end up paying twice for the same thing."]),
  "S nami ho nájdete za pár sekúnd.": ("S námi ho najdete za pár sekund.", "With us, you find it in seconds."),
  "Predstavujeme Assetin Archives.": ("Představujeme Assetin Archives.", "Introducing Assetin Archives."),
  "Z vášho archívu urobíme prehľadný digitálny katalóg.": (
    "Z vašeho archivu vytvoříme přehledný digitální katalog.",
    "We turn your archive into a clear digital catalogue."),
  "Naskenovať celý archív môže byť drahé.": ("Naskenovat celý archiv může být drahé.", "Scanning an entire archive can be expensive."),
  "Naša aplikácia fotí len identifikačnú stranu.": ("Naše aplikace fotí jen identifikační stranu.", "Our app photographs only the title page."),
  "Riešenie začína fyzickými dokumentami.": ("Řešení začíná u fyzických dokumentů.", "The solution starts with the physical documents."),
  "Každá položka, či už polica, krabica, šanón alebo zložka, dostane QR kód, podľa toho, ako máte archív usporiadaný.": (
    ["Každá položka, ať už police, krabice, šanon, nebo složka,", "dostane QR kód, podle toho, jak máte archiv uspořádaný."],
    ["Every item, whether a shelf, a box, a binder or a folder,", "gets a QR code, matching how your archive is organised."]),
  "Stačí bežný mobil.": ("Stačí běžný mobil.", "An ordinary phone is all you need."),
  "V mobile vyberieme typ položky, ako napríklad zložka alebo dokument, a zaradíme ju do hierarchie podľa skutočnosti. Potom odfotíme jej identifikačnú stranu. Položka tým dostane svoj digitálny záznam.": (
    ["V mobilu vybereme typ položky,", "například složku nebo dokument,", "a zařadíme ji do hierarchie podle skutečnosti.", "Pak vyfotíme její identifikační stranu.", "Položka tím získá svůj digitální záznam."],
    ["On the phone, we choose the item type,", "for example a folder or a document,", "and place it in the hierarchy as it really is.", "Then we photograph its title page.", "This gives the item its own digital record."]),
  "Každá položka má presné miesto v hierarchii, ako napríklad polica, krabica, zložka alebo dokument.": (
    ["Každá položka má přesné místo v hierarchii,", "například police, krabice, složka nebo dokument."],
    ["Every item has an exact place in the hierarchy,", "such as a shelf, a box, a folder or a document."]),
  "Fotku ďalej spracuje aplikácia.": ("Fotku dál zpracuje aplikace.", "The app then processes the photo."),
  "Aplikácia z fotky sama prečíta text a navrhne údaje, ktoré na nej nájde, napríklad názov projektu, autora alebo rok.": (
    ["Aplikace z fotky sama přečte text", "a navrhne údaje, které na ní najde,", "například název projektu, autora nebo rok."],
    ["The app reads the text from the photo by itself", "and suggests the data it finds,", "for example the project name, the author or the year."]),
  "Návrh ale nie je finálny záznam.": ("Návrh ale není konečný záznam.", "But a suggestion is not a final record."),
  "Človek každú hodnotu overí a potvrdí. Fotka je dôkaz a ostáva pri zázname.": (
    ["Člověk každou hodnotu ověří a potvrdí.", "Fotka je důkaz a zůstává u záznamu."],
    ["A person checks and confirms every value.", "The photo is the evidence and stays with the record."]),
  "Prípadné opravy a doplnenia prebiehajú priamo v návrhu.": (
    "Případné opravy a doplnění probíhají přímo v návrhu.",
    "Any corrections or additions are made right in the suggestion."),
  "Tým vznikne overený a dohľadateľný záznam fyzického dokumentu.": (
    "Tím vznikne ověřený a dohledatelný záznam fyzického dokumentu.",
    "The result is a verified, traceable record of the physical document."),
  "Vytvorenú databázu katalógu archívu vieme exportovať, analyzovať alebo prehľadávať. Najjednoduchšie je vyhľadávanie.": (
    ["Vytvořenou databázi katalogu archivu můžeme exportovat, analyzovat nebo prohledávat.", "Nejjednodušší je vyhledávání."],
    ["The archive catalogue database can be exported, analysed or searched.", "The simplest way is search."]),
  "Potom stačí napísať kľúčové slovo. Aplikácia ukáže cestu k položke aj všetky vyčítané údaje.": (
    ["Pak stačí napsat klíčové slovo.", "Aplikace ukáže cestu k položce", "i všechny vyčtené údaje."],
    ["Then just type a keyword.", "The app shows the path to the item", "and all the extracted data."]),
  "Kľúčové slovo sa zvýrazní v metadátach záznamu.": (
    "Klíčové slovo se zvýrazní v metadatech záznamu.",
    "The keyword is highlighted in the record's metadata."),
  "Výsledok: spoľahlivo viete, aké dokumenty máte a kde presne sa nachádzajú.": (
    ["Výsledek: spolehlivě víte,", "jaké dokumenty máte a kde přesně se nacházejí."],
    ["The result: you know for certain", "which documents you have and exactly where they are."]),
  "Výsledok: spoľahlivo viete, aké dokumenty máte a kde sa nachádzajú.": (
    ["Výsledek: spolehlivě víte,", "jaké dokumenty máte a kde se nacházejí."],
    ["The result: you know for certain", "which documents you have and where they are."]),
  "Potom viete rozhodnúť, čo uchovať, skartovať alebo plnohodnotne skenovať.": (
    ["Pak se můžete rozhodnout,", "co uchovat, co skartovat", "a co plně naskenovat."],
    ["Then you can decide", "what to keep, what to shred", "and what to fully scan."]),
  "Buď katalogizujete sami, alebo vám archív spracujeme na kľúč.": (
    ["Buď katalogizujete sami,", "nebo vám archiv zpracujeme na klíč."],
    ["Either you catalogue it yourselves,", "or we process your archive for you, turnkey."]),
  "Aplikácia funguje v súlade s vašimi bezpečnostnými požiadavkami, online u nás alebo na vašej infraštruktúre.": (
    ["Aplikace funguje v souladu", "s vašimi bezpečnostními požadavky,", "online u nás nebo na vaší infrastruktuře."],
    ["The app works in line", "with your security requirements,", "online with us or on your own infrastructure."]),
  "Začnime jednou krabicou, zadarmo a nezáväzne.": (
    ["Začněme jednou krabicí,", "zdarma a nezávazně."],
    ["Let's start with one box,", "free and with no obligation."]),
  "Assetin Archives.": ("Assetin Archives.", "Assetin Archives."),
  "Každá položka dostane QR kód.": ("Každá položka dostane QR kód.", "Every item gets a QR code."),
  "Aplikácia z fotky sama vyčíta údaje a človek ich potvrdí alebo upraví.": (
    ["Aplikace z fotky sama vyčte údaje", "a člověk je potvrdí nebo upraví."],
    ["The app reads the data from the photo by itself", "and a person confirms or corrects it."]),
}

STYLE = {
  "cs": "klidný, věcný firemní vypravěč, rodilý mluvčí češtiny; plynulý, souvislý projev, o něco svižnější tempo; u čárek jen krátký nádech, delší pauza až na konci věty; zřetelná výslovnost; bez emocí navíc. "
        "Language: Czech, native Czech pronunciation, no Slovak accent. Pace: fluent and connected, a bit brisker than a documentary narrator, no long pauses inside a sentence. "
        "Pronunciation: the brand name Assetin is read as written with a HARD t (a-se-tyn), never esetin; Archives is English: árkajvs. "
        "Say the abbreviation QR in English, like 'cue are' (kjú ár). "
        "Codes like PL_01, KR_01, ZL_03 are read as Czech letter names plus the plain number, without the underscore and without the leading zero (never say 'nula' or 'podtržítko'): 'pé el jedna, ká er jedna, zet el tři'.",
  "en": "calm, matter-of-fact corporate narrator; neutral, clear British English; fluent and connected, a bit brisker than a documentary narrator; only a short breath at commas, a longer pause only at the end of a sentence; no extra emotion. "
        "Pronunciation: the brand name Assetin is read as written, a-se-tin with a hard t; Archives as in English. Say QR as 'cue are'. "
        "Codes like PL_01, KR_01, ZL_03 are read as English letter names plus the plain number, without the underscore and the leading zero: 'P L one, K R one, Z L three'.",
}

# doplnky pokynu ku konkretnym vetam (slovenske `styleExtra` hovoria o slovenskych slovach, preto vlastne)
EXTRA = {
  "Každá položka dostane QR kód.": {
    "cs": "Calm, clear, falling intonation at the end; QR is English (kjú ár), kód with a long ó.",
    "en": "Calm, clear, falling intonation at the end."},
  "Stačí bežný mobil.": {
    "cs": "Calm, clear, short statement in one breath; a gentle emphasis on běžný; falling intonation at the end.",
    "en": "Calm, clear, short statement in one breath; a gentle emphasis on ordinary; falling intonation at the end."},
  "Predstavujeme Assetin Archives.": {
    "cs": "Warm, confident introduction, falling intonation at the end.",
    "en": "Warm, confident introduction, falling intonation at the end."},
  "Začnime jednou krabicou, zadarmo a nezáväzne.": {
    "cs": "Tone for this sentence: warm, confident and inviting, a clear call to action.",
    "en": "Tone for this sentence: warm, confident and inviting, a clear call to action."},
  "Naskenovať celý archív môže byť drahé.": {
    "cs": "Calm, matter-of-fact statement; a gentle emphasis on drahé; falling intonation at the end.",
    "en": "Calm, matter-of-fact statement; a gentle emphasis on expensive; falling intonation at the end."},
  "Každá položka, či už polica, krabica, šanón alebo zložka, dostane QR kód, podľa toho, ako máte archív usporiadaný.": {
    "cs": "Pace for this sentence: calm and unhurried; a short clear pause after each item of the list and after QR kód.",
    "en": "Pace for this sentence: calm and unhurried; a short clear pause after each item of the list and after QR code."},
}

def tr_line(l, lang):
    sk = l["text"]
    if sk not in T:
        sys.exit(f"chyba preklad: {sk}")
    v = T[sk][0 if lang == "cs" else 1]
    out = {"at": l["at"]}
    if isinstance(v, list):
        out["text"] = " ".join(v)
        out["parts"] = v
        if l.get("parts") and len(l["parts"]) != len(v):
            sys.exit(f"pocet casti nesedi (kroky v obraze su viazane na casti): {sk}")
    else:
        out["text"] = v
    out["sk"] = sk
    if sk in EXTRA:
        out["styleExtra"] = EXTRA[sk][lang]
    # zastupne casy zo slovenciny (do vygenerovania hlasu)
    if "dur" in l: out["dur"] = l["dur"]
    if "partAt" in l and "parts" in out: out["partAt"] = l["partAt"]
    return out

def build(src, lang, keep):
    d = json.load(open(src))
    out = {
        "_": f"Scenar nahovoru {lang.upper()} (src/copy/vo{'_kratka' if 'kratka' in src else ''}.{lang}.json), vyrobeny scripts/vo_lang_init.py z {src}. "
             "Casy `at` su slovenske (obraz sa nemeni); `sk` = povodna veta (len pre kontrolu). Kym je `_voice` false, `dur` a `partAt` su zastupne "
             "slovenske hodnoty a video sa renderuje bez hlasu. Hlas: node scripts/vo.mjs --engine gemini --script <tento subor> --dir public/<vo|vo-kratka>-" + lang + ", potom `_voice: true`.",
        "_voice": False,
        "_lang": lang,
        "_style": STYLE[lang],
    }
    for k, v in d.items():
        if not isinstance(v, list) or (keep and not keep(k)):
            continue
        out[k] = [tr_line(l, lang) for l in v]
    return out

force = "--force" in sys.argv
jobs = [("src/copy/vo.json", "vo", None), ("src/copy/vo_kratka.json", "vo_kratka", lambda k: k.startswith("K46-") or k == "K-C9-Outro")]
for lang in ("cs", "en"):
    for src, base, keep in jobs:
        dst = f"src/copy/{base}.{lang}.json"
        if os.path.exists(dst) and not force:
            print(f"{dst} existuje, preskakujem (--force prepise)")
            continue
        json.dump(build(src, lang, keep), open(dst, "w"), ensure_ascii=False, indent=2)
        open(dst, "a").write("\n")
        print("zapisane", dst)
