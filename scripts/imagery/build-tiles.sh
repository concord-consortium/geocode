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
# Usage: ./build-tiles.sh [MIN_ZOOM-MAX_ZOOM]   (default 7-17; use 12-17 for small samples so the
#        low-zoom tiles are not mostly empty)
set -euo pipefail
cd "$(dirname "$0")"

ZOOM="${1:-7-17}"
PROCESSES="$(sysctl -n hw.ncpu 2>/dev/null || nproc)"

mkdir -p build tiles
echo "Building VRT from $(ls source/*.tif | wc -l | tr -d ' ') source files"
gdalbuildvrt -q -overwrite -srcnodata 0 -vrtnodata 0 build/source.vrt source/*.tif

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
  build/source.vrt tiles

echo "Done: $(find tiles -name '*.webp' | wc -l | tr -d ' ') tiles, $(du -sh tiles | cut -f1)"
