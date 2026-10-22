#!/usr/bin/env bash
# Mosaic every GeoTIFF in source/ and tile it to XYZ WebP under tiles/{z}/{x}/{y}.webp.
#
# Works for both the sample chunks from vivid_fetch.py and the full dataset from the state: gdal2tiles
# reprojects to Web Mercator as needed. Black (0,0,0) is declared nodata because that is what the
# Vivid service returns outside its footprint, and the VRT reports areas no source covers the same
# way. Tiles that are entirely nodata are not written; tiles that straddle the footprint edge get an
# alpha channel there, so the globe's base color shows through instead of a black wedge.
#
# WebP rather than JPEG: same size at the same quality, but it carries alpha. GDAL's tiler decides a
# tile is blank by its alpha/nodata, so with JPEG output every ocean tile would be written as a black
# square (verified with GDAL 3.13; gdal2tiles.py is now a wrapper around `gdal raster tile`).
#
# Sources of different resolutions can be mosaicked together (the Big Island at 1 m and the other
# islands at 8 m); the VRT takes the finest, so the 1 m data is never averaged down.
#
# Usage: ./build-tiles.sh [MIN_ZOOM-MAX_ZOOM [OUT_DIR [SOURCE_DIR...]]]
#        Defaults: 7-17, tiles, source. Use 12-17 for small samples so the low-zoom tiles are not
#        mostly empty. See the README for the split build that adds the other islands.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p data && cd data   # all inputs and outputs live in data/ (gitignored)

ZOOM="${1:-7-17}"
OUT="${2:-tiles}"
SOURCES=("${@:3}")
[[ ${#SOURCES[@]} -eq 0 ]] && SOURCES=(source)
PROCESSES="$(sysctl -n hw.ncpu 2>/dev/null || nproc)"

FILES=()
for dir in "${SOURCES[@]}"; do FILES+=("$dir"/*.tif); done
VRT="build/$(basename "$OUT").vrt"

mkdir -p build "$OUT"
echo "Building VRT from ${#FILES[@]} source files in ${SOURCES[*]}"
gdalbuildvrt -q -overwrite -resolution highest -srcnodata 0 -vrtnodata 0 "$VRT" "${FILES[@]}"

echo "Tiling zoom $ZOOM with $PROCESSES processes"
gdal2tiles.py \
  --xyz \
  --tiledriver=WEBP --webp-quality=80 \
  --zoom="$ZOOM" \
  --resampling=average \
  --exclude \
  --webviewer=none \
  --processes="$PROCESSES" \
  --resume \
  "$VRT" "$OUT"

echo "Done: $(find "$OUT" -name '*.webp' | wc -l | tr -d ' ') tiles, $(du -sh "$OUT" | cut -f1)"
