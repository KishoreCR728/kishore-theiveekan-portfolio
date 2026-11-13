#!/usr/bin/env bash
# Rebuilds the two self-hosted fonts from fonts-source/ with only the weights and characters the site uses.
# The full DM Sans is 62 KB; the subset is ~23 KB, which is most of the difference between a 9x and a 100 mobile Lighthouse score.
# If qa/run.mjs reports a character outside the font subset, add it to U below (and to FONT_CHARS in qa/run.mjs) and re-run.
# Needs fonttools: pip install fonttools brotli
set -euo pipefail
cd "$(dirname "$0")/.."
U="U+0020-007E,U+00A0,U+00A9,U+00B0,U+00B7,U+00E7,U+00F7,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,U+2190-2193,U+2197,U+2265,U+2713,U+2715"
tmp=$(mktemp -d)
python3 -m fontTools.varLib.instancer fonts-source/dm-sans-latin-opsz-normal.woff2 wght=400:600 -o "$tmp/dm.ttf" -q
pyftsubset "$tmp/dm.ttf" --unicodes="$U" --layout-features='kern,liga,calt,tnum,lnum' --flavor=woff2 --output-file=src/fonts/dm-sans-latin-opsz-normal.woff2
pyftsubset fonts-source/instrument-serif-latin-400-italic.woff2 --unicodes="$U" --layout-features='kern,liga' --flavor=woff2 --output-file=src/fonts/instrument-serif-latin-400-italic.woff2
rm -rf "$tmp"; ls -la src/fonts
