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

`--island` covers the LavaCoder AOI at **1 m/px** (zoom 17 is 1.2 m/px, so nothing is lost) in
4 km chunks, and asks the service catalog for its raster footprints so open-ocean chunks are never
requested: 1,005 chunks, 31 GB on disk (the dry run's ~41 GB estimate is conservative). The October
2026 run took **~6¾ hours**, ~24 s per chunk on average — the dry-run estimate assumes 8 s, which
only holds for the mostly-ocean edge chunks; full chunks over the island take the server far longer. It is deliberately gentle on the state's server —
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

## Build

    ./build-tiles.sh          # zoom 7-17, full island
    ./build-tiles.sh 12-17    # small samples: skips low zooms that would be mostly empty

Output: `tiles/{z}/{x}/{y}.webp`. Black (0,0,0) is treated as nodata; empty tiles are not written and
coverage edges are transparent. The sample (two ~6 km boxes) is ~2,300 tiles / 24 MB at z12–17.
The full island is **216,274 tiles / 2.2 GB** at z7–17 (162k of them at z17), built in 2 hours on a
10-core Mac; median tile 9–10 KB, max 26 KB.

WebP rather than JPEG: GDAL's tiler decides a tile is blank by its alpha/nodata, which JPEG cannot
carry, so JPEG output writes every uncovered tile as a black square. WebP is the same size at the
same quality.

## Upload

    aws login
    ./upload.sh               # -> s3://models-resources/geocode-imagery/vivid-2020/

Tiles are cached for a year, so a refreshed dataset goes to a **new prefix** (`./upload.sh
geocode-imagery/vivid-2024`) and `kVividTileUrl` in `src/hooks/lava-coder/use-world-imagery.ts` is
updated to match. The sync is idempotent; re-running after a partial upload finishes it.

`--size-only` assumes a prefix is only ever filled from one build. When the island went over the
Part 1 sample, 9 of the 64 tiles it skipped had the same size but different content and had to be
copied up individually. If you must overwrite a prefix in place, drop `--size-only` for that run.

## Rebuilding from scratch

`rm -rf build tiles` and rerun. `build-tiles.sh` passes `--resume`, so an interrupted run continues
where it stopped. Avoid running GDAL statistics on the output tiles: `ComputeStatistics` writes
`.aux.xml` sidecars next to them (the upload excludes those anyway).
