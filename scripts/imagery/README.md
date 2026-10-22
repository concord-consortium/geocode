# LavaCoder Imagery Tiles

Builds the self-hosted basemap LavaCoder uses instead of Bing/Cesium Ion. Background and decisions:
[docs/plans/2026-09-16-vivid-imagery-design.md](../../docs/plans/2026-09-16-vivid-imagery-design.md).

## Requirements

- GDAL 3.13+ with Python bindings and numpy: `brew install gdal numpy`. Note that `brew install` may
  upgrade many other formulae; if GDAL binaries then abort with a missing `libabsl` dylib, run
  `brew upgrade re2`, and if `gdal2tiles.py` cannot import numpy, run `brew link numpy`.
- Homebrew's `python3` (`/opt/homebrew/bin/python3`) for the fetch script. It is the interpreter GDAL's
  tools use, and unlike the python.org build it ships with CA certificates.
- AWS CLI v2 with write access to `s3://models-resources/geocode-imagery/`.

## Source data

Put GeoTIFFs in `source/`. Any projection works; `build-tiles.sh` reprojects to Web Mercator.

Until the state delivers the Vivid 2020 files, `vivid_fetch.py` pulls native-resolution chunks of a
small area from the public ImageServer so the pipeline can be exercised:

    /opt/homebrew/bin/python3 vivid_fetch.py --bbox WEST SOUTH EAST NORTH

It requests each 2 km chunk in the two-step form (`f=json`, then download the returned `href`)
because the server returns HTTP 500 when asked to stream a 50 MB TIFF directly. Re-running skips
chunks already on disk.

Run `/opt/homebrew/bin/python3 -m unittest` here to test it.

### Whole island

    /opt/homebrew/bin/python3 vivid_fetch.py --island --dry-run   # counts and sizes only
    /opt/homebrew/bin/python3 vivid_fetch.py --island --out source-island

`--island` covers `IMAGERY_EXTENT` — LavaCoder's AOI (the lava simulation's elevation grid) plus
margins, since land reaches past the AOI (Keāhole Point is at −156.06, west of its −156.0 edge) — at **1 m/px** (zoom 17 is 1.2 m/px,
so nothing is lost) in 4 km chunks. It asks the service catalog for its raster footprints so
open-ocean chunks are never requested: 1,058 chunks, ~32 GB on disk (the dry run's size estimate is
conservative). The October 2026 run took **~6¾ hours**, ~24 s per chunk on average — the dry-run
time estimate assumes 8 s, which only holds for the mostly-ocean edge chunks; full chunks over the
island take the server far longer. The app's provider `rectangle` (`kVividRectangle`) must match
`IMAGERY_EXTENT`. It is deliberately gentle on the state's server —
one request at a time, a 2 s pause between them (`--delay`), exponential backoff on errors, and an
identifying `User-Agent` — and it resumes where it left off, so it can be stopped and restarted
freely. Running it overnight Hawaii time is the considerate choice.

`build-tiles.sh` mosaics everything in `source/`, so move the sample chunks aside before an island
run (or fetch to a separate `--out` and swap directories); chunk filenames include the pixel size to
keep the two from colliding.

**Licensing:** the service metadata says the original data "cannot be downloaded via public access"
and to contact USDA-FPAC-BC-GEO for license terms. Permission for LavaCoder's use was received in
October 2026.

**Why not the USDA Box share?** NRCS publishes Hawaii mosaics on Box, but only up to 2016–2018 for
satellite imagery: per its readme, USDA "deploys satellite-based Web Map Services ... instead of
creating Compressed Mosaics" after that, so Vivid 2020 is not there. Its `2022` folder is NAIP
(aerial, 60 cm, public domain) — a different dataset from the state's Maxar `Vivid_2022`. Every file
there is MrSID, which Homebrew's GDAL cannot read.

## Remove the water

    /opt/homebrew/bin/python3 osm_coastline.py                                      # -> build/osm-land.geojson
    /opt/homebrew/bin/python3 mask_water.py source source-masked                    # seconds
    /opt/homebrew/bin/python3 mask_water.py source-islands source-islands-masked

The Vivid mosaic's water (seams, glint, a hard rectangular edge a few km offshore) looks bad against
the app's flat ocean layer, so the tiles contain land only. `osm_coastline.py` builds land polygons for
every island (117, including islets) from the OpenStreetMap coastline in one Overpass query;
`mask_water.py` sets every pixel outside them to no-data, so water tiles are transparent or not written
at all. Build from the `-masked` directories.

Why OSM: the state's official coastline (and NOAA's copy) is from 1983 USGS maps and misses decades of
new lava coast — it would erase the whole 2018 Kapoho delta. OSM is traced from modern imagery and
matched the 2020 mosaic at every spot checked.

Limits: breakwaters disappear (OSM maps them apart from the coastline); coastal ponds inside the
coastline keep their water; a thin surf line stays where whitewater is just inside the mapped coast;
and at z16–17 the line can be a few meters off. The data is © OpenStreetMap contributors (ODbL), so
`kVividCredit` credits it.

## Build

    ./build-tiles.sh          # zoom 7-17, full island
    ./build-tiles.sh 12-17    # small samples: skips low zooms that would be mostly empty

Output: `tiles/{z}/{x}/{y}.webp`. Black (0,0,0) is treated as nodata; empty tiles are not written and
coverage edges are transparent. The sample (two ~6 km boxes) is ~2,300 tiles / 24 MB at z12–17.
The full island is **222,046 tiles / 2.3 GB** at z7–17, built in ~2¼ hours on a 10-core Mac; median
tile 9–10 KB, max 26 KB.

### Other islands (split build)

    /opt/homebrew/bin/python3 vivid_fetch.py --other-islands      # 38 chunks, 8 m/px, ~400 MB, ~4 min
    ./build-tiles.sh 7-14 tiles-low source source-islands         # both sources, ~1 hour
    for z in 7 8 9 10 11 12 13 14; do rm -rf tiles/$z && mv tiles-low/$z tiles/$z; done

LavaCoder is about the Big Island, so as a cost trade-off Niʻihau through Maui are fetched at 8 m/px
into `source-islands/` and tiled only to zoom 14 (~9.5 m/px). Students can pan to them and zoom in,
where that is soft; fetch them finer (`--pixel-size`) and extend the build's zoom if it matters. Zooms 7–14 are built from a VRT of both sources (the
script uses `-resolution highest`, so the Big Island stays at 1 m) into a fresh directory and swapped
in; `--resume` would otherwise keep the old low-zoom tiles that lack the other islands. The Big
Island's z15–17 tiles are untouched. Where Cesium asks for a z15+ tile over another island it gets a
404 and uses the z14 tile.

With water masking, the full build from scratch (~2½ hours) is:

    ./build-tiles.sh 15-17 tiles source-masked
    ./build-tiles.sh 7-14 tiles-low source-masked source-islands-masked   # then swap z7-14 in as above

Result: 173,081 tiles, ~2 GB (water-only tiles are not written).

Builds are not bit-for-bit reproducible: rebuilding unchanged source re-encodes ~8% of the
lower-zoom tiles with differences of a few levels per pixel. Harmless, but it means "what changed"
between builds is always larger than what actually changed.

WebP rather than JPEG: GDAL's tiler decides a tile is blank by its alpha/nodata, which JPEG cannot
carry, so JPEG output writes every uncovered tile as a black square. WebP is the same size at the
same quality.

## Upload

    aws login
    ./upload.sh               # -> s3://models-resources/geocode-imagery/vivid-2020/

Tiles are cached for a year, so a refreshed dataset goes to a **new prefix** (`./upload.sh
geocode-imagery/vivid-2024`) and `kVividTileUrl` in `src/hooks/lava-coder/use-world-imagery.ts` is
updated to match. The sync is idempotent; re-running after a partial upload finishes it.

`--size-only` assumes a prefix is only ever filled from one build: it skips a rebuilt tile that kept
its byte size (9 of 64 such tiles were stale when the island went over the Part 1 sample). To
refresh a prefix in place, use `upload_changed.py` instead, which compares MD5s with the S3 ETags
and uploads only changed and new tiles (listing the prefix takes ~20 minutes):

    /opt/homebrew/bin/python3 upload_changed.py --dry-run   # counts only
    /opt/homebrew/bin/python3 upload_changed.py

If the new build no longer writes some tiles (masking the water dropped 53,080), add `--delete` to
remove them from S3 too, or the old ones keep being served. `--max-delete N` aborts before changing
anything if more than N would go; work out the expected number locally first by comparing the old
and new tile directories (`comm -23` on sorted `find` listings).

Then invalidate the prefix in CloudFront so edge caches drop the old versions, and clear your own
browser cache (or load with DevTools' "Disable cache"):

    aws cloudfront create-invalidation --distribution-id E1QHTGVGYD1DWZ \
      --paths "/geocode-imagery/vivid-2020/*"

## Rebuilding from scratch

`rm -rf build tiles` and rerun. `build-tiles.sh` passes `--resume`, so an interrupted run continues
where it stopped. Avoid running GDAL statistics on the output tiles: `ComputeStatistics` writes
`.aux.xml` sidecars next to them (the upload excludes those anyway).
