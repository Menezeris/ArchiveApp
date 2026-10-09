#!/usr/bin/env python3
"""CZ a EN verzia: casy slov, na ktore su viazane animacie (karty, ikony, nalepka QR ...), z nahravok daneho jazyka.

V scenach su to slovenske konstanty, napr. `const KTO_W = cue('KTO_W', { sami: 1.3, alebo: 2.0, archiv: 2.62 })`
(src/lib/lang.ts); pre cs/en ich prepisu hodnoty zo src/copy/cues.json, ktore vyrobi tento skript.
Mapa nizsie: konstanta -> (klip, veta, {kluc: slovo alebo (slovo, n-ty vyskyt)}), jednotka 's' alebo 'ms'.
Casy slov: faster-whisper (scripts/vo_words.py), rovnako ako slovenske hodnoty (s od zaciatku nahravky vety).

Pouzitie: python3 scripts/vo_cues.py [--lang cs en]   (po vygenerovani hlasu, vety v public/vo-kratka-<lang>/lines)
"""
import argparse
import json
import re
import sys
import unicodedata

from faster_whisper import WhisperModel

# konstanta: (klip, veta, jednotka, {kluc: {jazyk: slovo | (slovo, n)}})
MAP = {
    "HOOK_W": [("K46-Hook", 0, "s", {"drahe": {"cs": "drahé", "en": "expensive"}}),
               ("K46-Hook", 1, "s", {"foti": {"cs": "fotí", "en": "photographs"}, "identifikacnu": {"cs": "identifikační", "en": "title"}})],
    "C5_46_W0": [("K46-C5-Teren", 0, "s", {"kod": {"cs": "kód", "en": "code"}})],
    "C5_46_W1": [("K46-C5-Teren", 1, "s", {"mobil": {"cs": "mobil", "en": "phone"}})],
    "F24_46_W": [("K46-F24-Aplikacia", 0, "s", {"udaje": {"cs": "údaje", "en": "data"}, "clovek": {"cs": "člověk", "en": "person"},
                                                 "potvrdi": {"cs": "potvrdí", "en": "confirms"}, "upravi": {"cs": "upraví", "en": "corrects"}})],
    "F3_46_W": [("K46-F3-Vyhladavanie", 0, "s", {"aplikacia": {"cs": "aplikace", "en": "the"}, "cestu": {"cs": "cestu", "en": "path"},
                                                  "udaje": {"cs": "údaje", "en": "data"}})],
    "KTO_W": [("K46-Kto", 0, "s", {"sami": {"cs": "sami", "en": "yourselves"}, "alebo": {"cs": "nebo", "en": "or"}, "archiv": {"cs": "archiv", "en": "archive"}})],
    "VYS_W": [("K46-Vysledok", 0, "s", {"co": {"cs": "jaké", "en": "which"}, "kde": {"cs": "kde", "en": "where"}}),
              ("K46-Vysledok", 1, "s", {"uchovat": {"cs": "uchovat", "en": "keep"}, "skartovat": {"cs": "skartovat", "en": "shred"},
                                        "skenovat": {"cs": "naskenovat", "en": "scan"}})],
    "C8_W3": [("K46-C8-Ponuka", 0, "ms", {"krabicou": {"cs": "krabicí", "en": "box"}, "zadarmo": {"cs": "zdarma", "en": "free"}})],
}


def norm(w: str) -> str:
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def find(words, target, n=0):
    t = norm(target)
    hits = [s for w, s, _ in words if norm(w) == t]
    return hits[n] if len(hits) > n else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", nargs="*", default=["cs", "en"])
    a = ap.parse_args()
    model = WhisperModel("small", device="cpu", compute_type="int8")
    try:
        out = json.load(open("src/copy/cues.json"))
    except FileNotFoundError:
        out = {}
    out["_"] = "Casy slov pre animacie v CZ/EN (scripts/vo_cues.py, src/lib/lang.ts cue). Neupravovat rucne, vyrobit znova po novom hlase."
    bad = 0
    for lang in a.lang:
        script = json.load(open(f"src/copy/vo_kratka.{lang}.json"))
        cache = {}
        res = {}
        for name, specs in MAP.items():
            vals = {}
            for clip, i, unit, keys in specs:
                f = f"public/vo-kratka-{lang}/lines/{clip}-{i}.wav"
                if f not in cache:
                    text = script[clip][i]["text"]
                    segs, _ = model.transcribe(f, language=lang, word_timestamps=True, initial_prompt=text, beam_size=5)
                    ws = [[w.word.strip(), w.start, w.end] for s in segs for w in s.words]
                    if len(ws) < len(text.split()) - 1:  # prompt obcas zahodi zaciatok vety, druhy pokus bez neho
                        segs, _ = model.transcribe(f, language=lang, word_timestamps=True, beam_size=5)
                        ws = [[w.word.strip(), w.start, w.end] for s in segs for w in s.words]
                    cache[f] = ws
                for k, spec in keys.items():
                    word, n = spec[lang] if isinstance(spec[lang], tuple) else (spec[lang], 0)
                    t = find(cache[f], word, n)
                    if t is None:
                        print(f"CHYBA {lang} {name}.{k}: slovo '{word}' nie je v {f}: {' '.join(w for w, _, _ in cache[f])}", file=sys.stderr)
                        bad += 1
                        continue
                    vals[k] = int(round(float(t) * 1000)) if unit == "ms" else round(float(t), 2)
            res[name] = vals
            print(lang, name, vals)
        out[lang] = res
    json.dump(out, open("src/copy/cues.json", "w"), ensure_ascii=False, indent=2)
    open("src/copy/cues.json", "a").write("\n")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
