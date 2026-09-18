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

Do **not** use it to pull the whole island — the service's terms say the original data is not for
bulk public download. Run `/opt/homebrew/bin/python3 -m unittest` here to test it.

## Build

    ./build-tiles.sh          # zoom 7-17, full island
    ./build-tiles.sh 12-17    # small samples: skips low zooms that would be mostly empty

Output: `tiles/{z}/{x}/{y}.webp`. Black (0,0,0) is treated as nodata; empty tiles are not written and
coverage edges are transparent. The sample (two ~6 km boxes) is ~2,300 tiles / 24 MB at z12–17;
expect on the order of 150k tiles / 2 GB for the full island at z17 once ocean tiles are skipped.

WebP rather than JPEG: GDAL's tiler decides a tile is blank by its alpha/nodata, which JPEG cannot
carry, so JPEG output writes every uncovered tile as a black square. WebP is the same size at the
same quality.

## Upload

    aws login
    ./upload.sh               # -> s3://models-resources/geocode-imagery/vivid-2020/

Tiles are cached for a year, so a refreshed dataset goes to a **new prefix** (`./upload.sh
geocode-imagery/vivid-2024`) and `kVividTileUrl` in `src/hooks/lava-coder/use-world-imagery.ts` is
updated to match. The sync is idempotent; re-running after a partial upload finishes it.

## Rebuilding from scratch

`rm -rf build tiles` and rerun. `build-tiles.sh` passes `--resume`, so an interrupted run continues
where it stopped. Avoid running GDAL statistics on the output tiles: `ComputeStatistics` writes
`.aux.xml` sidecars next to them (the upload excludes those anyway).
