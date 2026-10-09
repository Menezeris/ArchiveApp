#!/usr/bin/env python3
"""Hodnotenie prednesu viet nahovoru (CZ a EN verzia, oktober 2026): gemini-3.8-flash pocuva kazdu vetu a da skore 1-5
za prirodzenost (intonacia, prizvuk, vyslovnost, pauzy, useknutie). Dopln k vo_check.py, ktory kontroluje len slova.

Pouzitie:
  python3 scripts/vo_judge.py --script src/copy/vo_kratka.cs.json --dir public/vo-kratka-cs [klip-index ...]
  python3 scripts/vo_judge.py ... --files a.wav b.wav --text "Veta."   # porovnanie kandidatov jednej vety
Vystup: riadok na vetu "kluc skore | problemy"; --json zapise vysledky do suboru.
"""
import argparse
import json
import os
import re
import sys
import time

from google import genai
from google.genai import types

MODEL = "gemini-3.8-flash"
LANG_NAME = {"sk": "Slovak", "cs": "Czech", "en": "British English"}


def prompt(lang: str, text: str) -> str:
    return (
        f"You are a strict voice-over director. The recording is a corporate explainer narration in {LANG_NAME[lang]}. "
        f"Intended text: \"{text}\".\n"
        "Rate how natural and correct the delivery is, from 1 (unusable) to 5 (broadcast quality). Check: "
        "sentence intonation (questions rise where natural, statements fall at the end, no sing-song melody), "
        f"accent (must sound like a native {LANG_NAME[lang]} speaker, e.g. no Slovak accent in Czech), mispronounced or "
        "swallowed words, odd stress, unnatural pauses or rushing, cut-off start or end, glitches or noise. "
        "Brand names are intentional: 'Assetin' is pronounced a-se-tin with a hard t, 'Archives' in English, "
        "'QR' as 'cue are'. Do not penalise wording, only delivery.\n"
        'Answer with JSON only: {"score": <1-5>, "problems": "<short list in English, empty if none>"}'
    )


def judge(client, path: str, lang: str, text: str) -> dict:
    data = open(path, "rb").read()
    for _ in range(6):
        try:
            r = client.models.generate_content(
                model=MODEL,
                contents=[types.Part.from_bytes(data=data, mime_type="audio/wav"), prompt(lang, text)],
                config=types.GenerateContentConfig(temperature=0, response_mime_type="application/json"),
            )
            out = json.loads(r.text)
            return {"score": int(out.get("score", 0)), "problems": out.get("problems", "")}
        except Exception as e:  # kvota alebo docasna chyba
            m = re.search(r"retry in ([\d.]+)s", str(e))
            time.sleep(float(m.group(1)) + 2 if m else 15)
    return {"score": 0, "problems": "hodnotenie zlyhalo"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("keys", nargs="*")
    ap.add_argument("--script")
    ap.add_argument("--dir")
    ap.add_argument("--files", nargs="*")
    ap.add_argument("--text")
    ap.add_argument("--lang")
    ap.add_argument("--json")
    a = ap.parse_args()
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY") or "proxy-injected")
    res = {}
    if a.files:
        for f in a.files:
            res[f] = judge(client, f, a.lang or "sk", a.text)
            print(f"{f}  {res[f]['score']} | {res[f]['problems']}", flush=True)
    else:
        vo = json.load(open(a.script))
        lang = a.lang or vo.get("_lang", "sk")
        for clip, lines in vo.items():
            if not isinstance(lines, list):
                continue
            for i, l in enumerate(lines):
                key = f"{clip}-{i}"
                if (a.keys and key not in a.keys) or l.get("src"):
                    continue
                res[key] = judge(client, f"{a.dir}/lines/{key}.wav", lang, l["text"])
                print(f"{key:22} {res[key]['score']} | {res[key]['problems']}", flush=True)
    if a.json:
        json.dump(res, open(a.json, "w"), ensure_ascii=False, indent=2)
    sys.exit(0)


if __name__ == "__main__":
    main()
