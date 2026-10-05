#!/usr/bin/env python3
"""Kolo 47 (Samuel: v zazname hladania preblikuje mys): najde kurzor (biela sipka s ciernym obrysom) v kazdej snimke zostrihu
a zakryje ho filtrom delogo (dopocita z okolia), vysledok prepise zostrih. Stopa: sablona sipky (binarna, 26 x 19 px) sa
porovna s kazdou snimkou (korelacia cez FFT: tmave body v tele sipky, svetle v obryse, pokuta za tmave v obryse); skore nad
prahom = kurzor v obraze. Susedne snimky s rovnakou polohou su jeden usek (delogo s enable=between).
Pouzitie: python3 scripts/hide-cursor.py public/footage/k46-f3-search.mp4 [--dry] [--scale 2]
Kolo 54 (dlha verzia): `--scale N` pre zostrih v nasobnom rozliseni (cuts.json `up`): stopa sa hlada v snimkach zmensenych
N-krat (sablona je v povodnej velkosti kurzora), box delogo sa N-krat zvacsi; vystup crf 14 ako zostrihy s `up`.
"""
import json
import os
import subprocess
import sys

import imageio_ffmpeg
import numpy as np
from numpy.fft import irfft2, rfft2

FF = os.environ.get("FFMPEG") or imageio_ffmpeg.get_ffmpeg_exe()
FPS = 30
# sablona: src/footage/cursor-template.json (vyrez zo search2.mp4 v 12,95 s): 1 = tmavy obrys sipky, 2 = svetle (vnutro sipky
# a okolie), 0 = prechod. Kurzor macOS je biela sipka s ciernym obrysom.
TPL = json.load(open(os.path.join(os.path.dirname(__file__), "..", "src", "footage", "cursor-template.json")))["rows"]
PAD = 4  # okraj boxu delogo okolo sipky


def main():
    path = sys.argv[1]
    dry = "--dry" in sys.argv
    N = int(sys.argv[sys.argv.index("--scale") + 1]) if "--scale" in sys.argv else 1
    probe = subprocess.run([FF, "-i", path], capture_output=True, text=True).stderr
    import re

    m = re.search(r", (\d+)x(\d+)[, ]", probe)
    W0, H0 = int(m[1]), int(m[2])
    W, H = W0 // N, H0 // N
    scale = f",scale={W}:{H}:flags=area" if N > 1 else ""
    raw = subprocess.run([FF, "-loglevel", "error", "-i", path, "-vf", f"fps={FPS}{scale},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
    fr = np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W)
    tpl = np.array([[int(c) for c in row] for row in TPL])
    dark = (tpl == 1).astype(np.float64)
    light = (tpl == 2).astype(np.float64)
    th, tw = tpl.shape
    base = 0.5 * light.sum()  # skore prazdnej bielej plochy

    def corr(img, k):
        return irfft2(rfft2(img) * rfft2(np.flipud(np.fliplr(k)), s=img.shape), s=img.shape)

    track = []
    for i, img in enumerate(fr):
        d = (img < 80).astype(np.float64)
        l = (img > 200).astype(np.float64)
        score = corr(d, dark) + 0.5 * corr(l, light) - 2 * corr(d, light)
        y, x = np.unravel_index(np.argmax(score), score.shape)
        s = float(score[y, x])
        track.append((i, s, int(x - tw + 1), int(y - th + 1)) if s > base + 0.6 * dark.sum() else (i, s, None, None))
    # useky s rovnakou polohou (tolerancia 2 px)
    runs = []
    for i, s, x, y in track:
        if x is None:
            continue
        if runs and runs[-1]["end"] == i - 1 and abs(runs[-1]["x"] - x) <= 2 and abs(runs[-1]["y"] - y) <= 2:
            runs[-1]["end"] = i
        else:
            runs.append({"start": i, "end": i, "x": x, "y": y})
    n = sum(1 for t in track if t[2] is not None)
    print(f"{path}: {len(fr)} snimok, kurzor v {n}, usekov {len(runs)}")
    for r in runs:
        print(f"  {r['start'] / FPS:.2f}-{(r['end'] + 1) / FPS:.2f} s  x {r['x']} y {r['y']}")
    if dry or not runs:
        return
    filters = []
    for r in runs:
        x0 = max(1, r["x"] + 4 - PAD)  # sipka zacina v stlpci 4 a riadku 3 sablony, 13 x 20 px
        y0 = max(1, r["y"] + 3 - PAD)
        w = 14 + 2 * PAD
        h = 20 + 2 * PAD
        x0 = min(x0, W - w - 1)
        y0 = min(y0, H - h - 1)
        x0, y0, w, h = x0 * N, y0 * N, w * N, h * N
        a = r["start"] / FPS - 0.5 / FPS
        b = (r["end"] + 1) / FPS - 0.5 / FPS
        filters.append(f"delogo=x={x0}:y={y0}:w={w}:h={h}:enable='between(t,{a:.4f},{b:.4f})'")
    out = path + ".nocursor.mp4"
    subprocess.run([FF, "-loglevel", "error", "-y", "-i", path, "-vf", ",".join(filters), "-c:v", "libx264", "-crf", "14" if N > 1 else "16", "-preset", "slow", "-pix_fmt", "yuv420p", "-an", out], check=True)
    os.replace(out, path)
    json.dump({"runs": runs, "fps": FPS}, open(path + ".cursor.json", "w"))
    print(f"-> {path} (kurzor zakryty), stopa v {path}.cursor.json")


if __name__ == "__main__":
    main()
