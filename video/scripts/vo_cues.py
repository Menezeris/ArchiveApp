#!/usr/bin/env python3
"""CZ a EN verzia: casy slov, na ktore su viazane animacie (karty, ikony, nalepka QR ...), z nahravok daneho jazyka.

V scenach su to slovenske konstanty, napr. `const KTO_W = cue('KTO_W', { sami: 1.3, alebo: 2.0, archiv: 2.62 })`
(src/lib/lang.ts); pre cs/en ich prepisu hodnoty zo src/copy/cues.json, ktore vyrobi tento skript.
Mapa nizsie: konstanta -> [(video, klip, veta, jednotka, {kluc: {jazyk: slovo | (slovo, n) | (slovo, n, 'end')}})].
video 'k' = kratka (vo_kratka.<lang>.json, public/vo-kratka-<lang>), 'd' = dlha (vo.<lang>.json, public/vo-<lang>).
n = poradie vyskytu slova vo vete (od 0), 'end' = koniec slova namiesto zaciatku; jednotka 's' alebo 'ms'.
Casy slov: faster-whisper (ako scripts/vo_words.py), rovnako ako slovenske hodnoty (s od zaciatku nahravky vety).

Pouzitie: python3 scripts/vo_cues.py [--lang cs en] [--video k d]   (po vygenerovani hlasu)
"""
import argparse
import json
import os
import re
import sys
import unicodedata

from faster_whisper import WhisperModel

MAP = {
    # --- kratka (K-LinkedIn-46, src/scenes/kratka/LinkedIn.tsx) ---
    "HOOK_W": [("k", "K46-Hook", 0, "s", {"drahe": {"cs": "drahé", "en": "expensive"}}),
               ("k", "K46-Hook", 1, "s", {"foti": {"cs": "fotí", "en": "photographs"}, "identifikacnu": {"cs": "identifikační", "en": "title"}})],
    "C5_46_W0": [("k", "K46-C5-Teren", 0, "s", {"kod": {"cs": "kód", "en": "code"}})],
    "C5_46_W1": [("k", "K46-C5-Teren", 1, "s", {"mobil": {"cs": "mobil", "en": "phone"}})],
    "F24_46_W": [("k", "K46-F24-Aplikacia", 0, "s", {"udaje": {"cs": "údaje", "en": "data"}, "clovek": {"cs": "člověk", "en": "person"},
                                                      "potvrdi": {"cs": "potvrdí", "en": "confirms"}, "upravi": {"cs": "upraví", "en": "corrects"}})],
    "F3_46_W": [("k", "K46-F3-Vyhladavanie", 0, "s", {"aplikacia": {"cs": "aplikace", "en": "the"}, "cestu": {"cs": "cestu", "en": "path"},
                                                       "udaje": {"cs": "údaje", "en": "data"}})],
    "KTO_W": [("k", "K46-Kto", 0, "s", {"sami": {"cs": "sami", "en": "yourselves"}, "alebo": {"cs": "nebo", "en": "or"}, "archiv": {"cs": "archiv", "en": "archive"}})],
    "VYS_W": [("k", "K46-Vysledok", 0, "s", {"co": {"cs": "jaké", "en": "which"}, "kde": {"cs": "kde", "en": "where"}}),
              ("k", "K46-Vysledok", 1, "s", {"uchovat": {"cs": "uchovat", "en": "keep"}, "skartovat": {"cs": "skartovat", "en": "shred"},
                                             "skenovat": {"cs": "naskenovat", "en": "scan"}})],
    "C8_W3": [("k", "K46-C8-Ponuka", 0, "ms", {"krabicou": {"cs": "krabicí", "en": "box"}, "zadarmo": {"cs": "zdarma", "en": "free"}})],
    # --- dlha (src/scenes/*.tsx) ---
    "C2_W0": [("d", "C2-Hladanie", 0, "s", {"spravu": {"cs": "zprávu", "en": "report"}, "vykres": {"cs": "výkres", "en": "drawing"},
                                             "protokol": {"cs": "protokol", "en": "certificate"},
                                             "koniec": {"cs": ("protokol", 0, "end"), "en": ("certificate", 0, "end")}})],
    "C4B_W": [("d", "C4b-Hacik", 0, "s", {"drahe": {"cs": "drahé", "en": "expensive"}}),
              ("d", "C4b-Hacik", 1, "s", {"foti": {"cs": "fotí", "en": "photographs"}, "identifikacnu": {"cs": "identifikační", "en": "title"}})],
    "C5_H": [("d", "C5-Teren", 1, "s", {"polica": {"cs": "police", "en": "shelf"}, "krabica": {"cs": "krabice", "en": "box"},
                                         "sanon": {"cs": "šanon", "en": "binder"}, "zlozka": {"cs": "složka", "en": "folder"},
                                         "qr": {"cs": "dostane", "en": "gets"}})],
    "F3_W": [("d", "F3-Vyhladavanie", 0, "s", {"aplikacia": {"cs": "aplikace", "en": "the"}, "cestu": {"cs": "cestu", "en": "path"},
                                                "k": {"cs": "k", "en": ("to", 0)}, "polozke": {"cs": "položce", "en": "item"},
                                                "aj": {"cs": "i", "en": "and"}, "udaje": {"cs": "údaje", "en": "data"}})],
    "C8_W0": [("d", "C8-Pilot", 0, "s", {"alebo": {"cs": "nebo", "en": "or"}})],
    "C8A_W": [("d", "C8a-Vysledok", 0, "s", {"co": {"cs": "jaké", "en": "which"}, "kde": {"cs": "kde", "en": "where"}}),
              ("d", "C8a-Vysledok", 1, "s", {"uchovat": {"cs": "uchovat", "en": "keep"}, "skartovat": {"cs": "skartovat", "en": "shred"},
                                             "skenovat": {"cs": "naskenovat", "en": "scan"}})],
    "C8B_W": [("d", "C8b-Technika", 0, "ms", {"safe": {"cs": "souladu", "en": "line"}, "online": {"cs": "online", "en": "online"},
                                              "yours": {"cs": "na", "en": "on"}})],
    "C8C_W": [("d", "C8c-Vyzva", 0, "ms", {"krabicou": {"cs": "krabicí", "en": "box"}, "zadarmo": {"cs": "zdarma", "en": "free"}})],
}
FILES = {"k": ("src/copy/vo_kratka.{l}.json", "public/vo-kratka-{l}"), "d": ("src/copy/vo.{l}.json", "public/vo-{l}")}


def norm(w: str) -> str:
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def find(words, target, n=0, end=False):
    t = norm(target)
    hits = [(s, e) for w, s, e in words if norm(w) == t]
    return (hits[n][1] if end else hits[n][0]) if len(hits) > n else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", nargs="*", default=["cs", "en"])
    ap.add_argument("--video", nargs="*", default=["k", "d"])
    a = ap.parse_args()
    model = WhisperModel("small", device="cpu", compute_type="int8")
    try:
        out = json.load(open("src/copy/cues.json"))
    except FileNotFoundError:
        out = {}
    out["_"] = "Casy slov pre animacie v CZ/EN (scripts/vo_cues.py, src/lib/lang.ts cue). Neupravovat rucne, vyrobit znova po novom hlase."
    bad = 0
    for lang in a.lang:
        res = out.get(lang, {})
        cache = {}
        for name, specs in MAP.items():
            if specs[0][0] not in a.video:
                continue
            vals = {}
            for video, clip, i, unit, keys in specs:
                sfile, vdir = (x.format(l=lang) for x in FILES[video])
                f = f"{vdir}/lines/{clip}-{i}.wav"
                if not os.path.exists(f):
                    print(f"CHYBA {lang} {name}: chyba nahravka {f}", file=sys.stderr)
                    bad += 1
                    continue
                if f not in cache:
                    text = json.load(open(sfile))[clip][i]["text"]
                    segs, _ = model.transcribe(f, language=lang, word_timestamps=True, initial_prompt=text, beam_size=5)
                    ws = [[w.word.strip(), w.start, w.end] for s in segs for w in s.words]
                    if len(ws) < len(text.split()) - 1:  # prompt obcas zahodi zaciatok vety, druhy pokus bez neho
                        segs, _ = model.transcribe(f, language=lang, word_timestamps=True, beam_size=5)
                        ws = [[w.word.strip(), w.start, w.end] for s in segs for w in s.words]
                    cache[f] = ws
                for k, spec in keys.items():
                    sp = spec[lang] if isinstance(spec[lang], tuple) else (spec[lang],)
                    word, n, end = sp[0], (sp[1] if len(sp) > 1 else 0), (len(sp) > 2 and sp[2] == "end")
                    t = find(cache[f], word, n, end)
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
