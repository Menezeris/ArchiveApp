#!/usr/bin/env bash
# Vyrenderuje MP4 (1920x1080, 30 fps, H.264) pre vsetky klipy alebo vybrane ID.
# Pouzitie: npm run render                    # vsetky klipy bez textu v obraze -> out/mp4/
#           npm run render -- C5-Teren        # jeden klip
#           CAP=1 npm run render              # s titulkami v obraze -> out/mp4/cap/
#           PREVIEW=1 npm run render -- Full  # polovicne rozlisenie -> out/preview/
#           VIDEO_LANG=cs npm run render      # cesky / anglicky (en) preklad -> out/mp4/cs/ (props lang, src/lib/lang.ts)
set -euo pipefail
cd "$(dirname "$0")/.."
ids=("$@")
if [ ${#ids[@]} -eq 0 ]; then
  mapfile -t ids < <(sed -n '/SCENE_LIST/,/^];/p' src/scenesList.ts | grep -o "^  \(\[\|paced(\)'[A-Za-z0-9-]*'" | sed "s/.*'\([A-Za-z0-9-]*\)'/\1/")
fi
L="${VIDEO_LANG:-sk}"
case "$L" in sk) SUB=""; LP="" ;; cs|en) SUB="/$L"; LP="\"lang\":\"$L\"" ;; *) echo "VIDEO_LANG: sk, cs alebo en"; exit 1 ;; esac
props() { local p="$LP"; [ -n "${1:-}" ] && p="${p:+$p,}$1"; echo "{$p}"; }
for id in "${ids[@]}"; do
  if [ "${PREVIEW:-}" = "1" ]; then
    mkdir -p "out/preview$SUB"
    npx remotion render "$id" "out/preview$SUB/${id}.mp4" --scale=0.5 --image-format=jpeg --props="$(props)" --log=error
  elif [ "${CAP:-}" = "1" ]; then
    mkdir -p "out/mp4$SUB/cap"
    npx remotion render "$id" "out/mp4$SUB/cap/${id}.mp4" --props="$(props '"captions":true')" --log=error
  else
    mkdir -p "out/mp4$SUB"
    npx remotion render "$id" "out/mp4$SUB/${id}.mp4" --props="$(props)" --log=error
  fi
done
