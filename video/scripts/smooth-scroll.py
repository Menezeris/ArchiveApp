#!/usr/bin/env python3
"""Kolo 57 (Samuel: v hladani sa stranka nascrolluje sekane): plynuly posun stranky zo zaznamu obrazovky.

Zdroj posuva stranku v davkach (prehliadac skroluje plynulo, ale s pauzami), zrychlenie davalo "rozbeh, stop, rozbeh".
Skript zmeria vertikalny posun obsahu po snimkach (korelacia profilu riadkov v oblasti `--roi`), zlozi novy usek s dlzkou
`--dur`, v ktorom posun ide po krivke ease-in-out od 0 po (celkovy posun - `--stop-early` px), a pre kazdu vystupnu snimku
vyberie zdrojovu snimku s najblizsim posunom. Zvysnu odchylku (najviac pol kroku zdroja) zapise do JSON ako `dy` (px zdroja),
o ktore sa ma v scene posunut vyrez, aby bol pohyb presny. Po posune posledna snimka drzi `--after` s.
Pouzitie (vola ho scripts/cut-footage.mjs pre segment so `smooth`):
  python3 scripts/smooth-scroll.py SRC FROM TO DUR OUT.mp4 --vf CROP --stop-early 90 --after 1.6 --t0 4.65 --json OUT.json
"""
import argparse
import json
import subprocess

import imageio_ffmpeg
import numpy as np

FF = imageio_ffmpeg.get_ffmpeg_exe()
FPS = 30


def ease(t):
    return 0.5 - 0.5 * np.cos(np.pi * t)  # ease-in-out (sinus): najvacsia rychlost 1,57x priemeru (kubicka mala 3x)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src"), ap.add_argument("t_from", type=float), ap.add_argument("t_to", type=float)
    ap.add_argument("dur", type=float), ap.add_argument("out")
    ap.add_argument("--vf", required=True)
    ap.add_argument("--size", default="1764x882")
    ap.add_argument("--roi", default="750,250,1650,880", help="x0,y0,x1,y1 oblasti, ktora sa posuva")
    ap.add_argument("--stop-early", type=float, default=0)
    ap.add_argument("--after", type=float, default=0)
    ap.add_argument("--t0", type=float, default=0, help="cas zaciatku useku vo vyslednom zostrihu (pre JSON)")
    ap.add_argument("--json", required=True)
    a = ap.parse_args()
    W, H = map(int, a.size.split("x"))
    x0, y0, x1, y1 = map(int, a.roi.split(","))
    common = ["-ss", str(a.t_from), "-to", str(a.t_to), "-i", a.src, "-vf", f"{a.vf},fps={FPS}"]
    gray = subprocess.run([FF, "-v", "error", *common[:-1], f"{a.vf},fps={FPS},format=gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    g = np.frombuffer(gray, dtype=np.uint8).reshape(-1, H, W).astype(np.float32)
    rgb = subprocess.run([FF, "-v", "error", *common[:-1], f"{a.vf},fps={FPS},format=rgb24", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    c = np.frombuffer(rgb, dtype=np.uint8).reshape(-1, H, W, 3)
    n = min(len(g), len(c))
    # kolo 57: absolutna poloha kazdej snimky voci kotve (2D porovnanie celej plochy, kazdy druhy stlpec). Riadky tabulky maju
    # rovnaku vysku, preto (a) sa neporovnava priemer riadkov, ale cela plocha s textom, (b) poloha sa nescituva z krokov medzi
    # susednymi snimkami (chyby by sa nascitali), ale meria sa voci kotve; kotva sa posunie, ked je posun voci nej nad 250 px,
    # a hlada sa len v okne od predoslej polohy (-5 az +90 px), aby sa nepreskocilo o riadok.
    reg = lambda im: im[y0:y1, x0:x1:2]
    h = y1 - y0
    offs, aoff, aref = [0.0], 0, reg(g[0])
    for i in range(1, n):
        a1 = reg(g[i])
        rel = int(offs[-1]) - aoff
        cand = range(max(0, rel - 5), min(rel + 90, h - 80))
        errs = [((aref[d:] - a1[: h - d]) ** 2).mean() for d in cand]
        d = cand[int(np.argmin(errs))]
        offs.append(float(aoff + d))
        if d > 250:
            aoff, aref = aoff + d, a1
    offs = np.array(offs)
    target = offs[-1] - a.stop_early
    m = int(round(a.dur * FPS))
    pick, dy = [], []
    for k in range(m):
        d = target * ease(k / (m - 1))
        i = int(np.argmin(np.abs(offs - d)))
        pick.append(i)
        dy.append(round(float(d - offs[i]), 2))
    hold = int(round(a.after * FPS))
    pick += [pick[-1]] * hold
    dy += [dy[-1]] * hold
    enc = subprocess.Popen([FF, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "14", "-preset", "fast", "-pix_fmt", "yuv420p", a.out], stdin=subprocess.PIPE)
    for i in pick:
        enc.stdin.write(c[i].tobytes())
    enc.stdin.close()
    enc.wait()
    json.dump({"t0": a.t0, "fps": FPS, "dy": dy, "note": f"posun {a.t_from}-{a.t_to} s zdroja ({offs[-1]:.0f} px, zastavi {a.stop_early:.0f} px skor), {a.dur} s ease-in-out, drzi {a.after} s; dy = korekcia vyrezu v px zdroja"}, open(a.json, "w"))
    print(f"plynuly posun: {n} zdrojovych snimok, {offs[-1]:.0f} px, ciel {target:.0f} px, {len(pick)} snimok, max |dy| {max(abs(v) for v in dy):.1f} px")


if __name__ == "__main__":
    main()
