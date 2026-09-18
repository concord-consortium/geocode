# Vivid 2020 Imagery — Part 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the end-to-end tile pipeline against a small sample of Vivid 2020 imagery, host the sample tiles on `models-resources`, and make a self-hosted `vivid` map type the LavaCoder default — so the full-island build in Part 2 is a re-run, not new work.

**Architecture:** A Python/GDAL pipeline under `scripts/imagery/` pulls native-resolution GeoTIFF chunks from the Hawaii Statewide GIS `Vivid_2020` ImageServer (sample-only stage), mosaics them with `gdalbuildvrt`, tiles them to XYZ JPEG with `gdal2tiles.py`, and syncs the result to `s3://models-resources/geocode-imagery/vivid-2020/`. The app gains a `vivid` `LavaMapType` backed by Cesium's `UrlTemplateImageryProvider` pointed at that prefix, clipped to the existing AOI, and `defaultMapType()` returns it outside localhost/testing.

**Tech Stack:** Python 3.13 stdlib (`urllib`, `unittest`), GDAL 3.11 CLI (`gdalbuildvrt`, `gdal2tiles.py --xyz --tiledriver=JPEG`), AWS CLI v2, `@cesium/engine` 17 (`UrlTemplateImageryProvider`, `Rectangle`), React/MobX-State-Tree app with Jest + ts-jest.

**Design doc:** [2026-09-16-vivid-imagery-design.md](./2026-09-16-vivid-imagery-design.md)

---

## Facts verified while planning (do not re-derive)

- `Vivid_2020/ImageServer/exportImage?...&format=tiff&f=image` returns a **georeferenced EPSG:3857 GeoTIFF at exactly 0.5 m/px**, 3 bands, Byte. A 4000×4000 request took ~5 s and was ~50 MB. Server limits: `maxImageWidth` 15000, `maxImageHeight` 4100.
- Offshore, the imagery is real but very dark water (RGB ≈ 1,6,9) near the coast; beyond the coverage footprint every band is 0 (alpha 0 in `png32`). So "black" already means "no coverage" — treat `0,0,0` as nodata.
- `gdal2tiles.py` in GDAL 3.11 supports `--xyz`, `--tiledriver=JPEG`, `--jpeg-quality`, `-x` (exclude empty tiles), `--resume`, `--processes`. It **fails today with `ModuleNotFoundError: numpy`** under `/opt/homebrew/opt/python@3.13`; `brew install numpy` fixes it.
- **Jest cannot import `@cesium/engine`** (ESM, `SyntaxError: Unexpected token 'export'`) and no existing test does. Therefore no Jest tests touch `ui-store.ts` or `use-world-imagery.ts`; TypeScript verification is `lint` + `tsc` + manual.
- CloudFront for `models-resources.concord.org` already returns `access-control-allow-origin: *`, so local dev can load hosted tiles.
- The AWS CLI session is expired: run `aws login` before Task 5.
- App AOI constants live in `src/simulations/lava-coder/lava-constants.ts`: `minLong=-156`, `maxLong=-154.80533185226327`, `minLat=18.90863649`, `maxLat=20.26825881713135`.
- Initial camera looks at (−155.45, 19.40) from 130 km; the map-type toggle skips `develop` and cycles the rest.

## Sample areas

| Box | Why | lon west | lon east | lat south | lat north |
|---|---|---|---|---|---|
| A — Kīlauea caldera | iconic feature; sharpness check | −155.31 | −155.25 | 19.38 | 19.44 |
| B — Kalapana coast | coastline; answers the ocean/no-data question | −155.08 | −155.02 | 19.30 | 19.36 |

Each is ~6.7 × 7.1 km in Mercator meters (0.06° inflated by 1/cos 19.4°) → 20–25 chunks of 2 km each → ≤ 50 requests, ~2–2.5 GB of source total.

---

### Task 0: Environment check

No code. Confirms the toolchain before anything depends on it.

**Step 1: Install numpy for Homebrew's Python (needed by gdal2tiles)**

Run: `brew install numpy`

**Step 2: Verify gdal2tiles imports**

Run: `gdal2tiles.py --version`
Expected: `GDAL 3.11.0 "Eganville", released 2025/05/06` with **no** `ModuleNotFoundError`.

**Step 3: Verify the JPEG driver is accepted**

Run: `gdal2tiles.py --tiledriver=JPEG --help | head -3`
Expected: usage text, no `JPEG driver is not available`.

**Step 4: Verify Python 3 and GDAL CLI**

Run: `python3 --version && gdalbuildvrt --version`
Expected: `Python 3.13.x` and `GDAL 3.11.0 ...`.

---

### Task 1: Chunk-grid math for the sample fetcher (TDD)

The fetcher must split a lon/lat box into 2 km Web Mercator chunks whose origins sit on the 0.5 m pixel grid, so adjacent exports mosaic without resampling seams.

**Files:**
- Create: `scripts/imagery/vivid_fetch.py`
- Create: `scripts/imagery/test_vivid_fetch.py`
- Create: `scripts/imagery/__init__.py` (empty; lets `unittest` discover the module)

**Step 1: Write the failing tests**

`scripts/imagery/test_vivid_fetch.py`:

```python
import unittest

from vivid_fetch import CHUNK_METERS, PIXEL_METERS, chunk_grid, lonlat_to_mercator


class LonLatToMercator(unittest.TestCase):
    def test_origin(self):
        self.assertEqual(lonlat_to_mercator(0, 0), (0, 0))

    def test_kilauea(self):
        # Independently computed with the standard spherical Mercator formula
        x, y = lonlat_to_mercator(-155.28, 19.41)
        self.assertAlmostEqual(x, -17285690.53, places=1)
        self.assertAlmostEqual(y, 2203266.75, places=1)


class ChunkGrid(unittest.TestCase):
    def setUp(self):
        self.chunks = chunk_grid(west=-155.31, south=19.38, east=-155.25, north=19.44)

    def test_chunks_are_square_and_pixel_aligned(self):
        for x0, y0, x1, y1 in self.chunks:
            self.assertEqual(x1 - x0, CHUNK_METERS)
            self.assertEqual(y1 - y0, CHUNK_METERS)
            self.assertEqual(x0 % PIXEL_METERS, 0)
            self.assertEqual(y0 % PIXEL_METERS, 0)

    def test_chunks_cover_the_box(self):
        wx, sy = lonlat_to_mercator(-155.31, 19.38)
        ex, ny = lonlat_to_mercator(-155.25, 19.44)
        self.assertLessEqual(min(c[0] for c in self.chunks), wx)
        self.assertLessEqual(min(c[1] for c in self.chunks), sy)
        self.assertGreaterEqual(max(c[2] for c in self.chunks), ex)
        self.assertGreaterEqual(max(c[3] for c in self.chunks), ny)

    def test_chunks_do_not_overlap(self):
        origins = [(c[0], c[1]) for c in self.chunks]
        self.assertEqual(len(origins), len(set(origins)))

    def test_a_6km_box_needs_at_most_16_chunks(self):
        self.assertLessEqual(len(self.chunks), 16)
        self.assertGreaterEqual(len(self.chunks), 9)


if __name__ == "__main__":
    unittest.main()
```

**Step 2: Run tests to verify they fail**

Run: `cd scripts/imagery && python3 -m unittest test_vivid_fetch -v`
Expected: `ModuleNotFoundError: No module named 'vivid_fetch'`

**Step 3: Write the minimal implementation**

`scripts/imagery/vivid_fetch.py`:

```python
"""Pull native-resolution Vivid 2020 GeoTIFF chunks from the Hawaii Statewide GIS ImageServer.

SAMPLE-ONLY STAGE. The service does not offer bulk download; this exists so the tile pipeline can be
built and verified on a small area before the state delivers the full dataset. When real files
arrive, drop them in source/ and skip this script. See docs/plans/2026-09-16-vivid-imagery-design.md.
"""
import argparse
import math
import os
import sys
import time
import urllib.request

SERVICE = "https://geodata.hawaii.gov/arcgis/rest/services/SoH_Imagery/Vivid_2020/ImageServer"
EARTH_RADIUS = 6378137.0
PIXEL_METERS = 0.5           # native resolution of Vivid 2020
CHUNK_PIXELS = 4000          # server maxImageHeight is 4100
CHUNK_METERS = CHUNK_PIXELS * PIXEL_METERS


def lonlat_to_mercator(lon, lat):
    """WGS84 degrees -> EPSG:3857 meters (spherical Mercator)."""
    x = math.radians(lon) * EARTH_RADIUS
    y = math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * EARTH_RADIUS
    return x, y


def _snap_down(value, step):
    return math.floor(value / step) * step


def chunk_grid(west, south, east, north):
    """Return (x0, y0, x1, y1) mercator boxes, CHUNK_METERS square, covering the lon/lat box.

    Origins are multiples of CHUNK_METERS, hence also of PIXEL_METERS, so adjacent exports share
    exact pixel edges and mosaic cleanly.
    """
    wx, sy = lonlat_to_mercator(west, south)
    ex, ny = lonlat_to_mercator(east, north)
    chunks = []
    x = _snap_down(wx, CHUNK_METERS)
    while x < ex:
        y = _snap_down(sy, CHUNK_METERS)
        while y < ny:
            chunks.append((x, y, x + CHUNK_METERS, y + CHUNK_METERS))
            y += CHUNK_METERS
        x += CHUNK_METERS
    return chunks
```

**Step 4: Run tests to verify they pass**

Run: `cd scripts/imagery && python3 -m unittest test_vivid_fetch -v`
Expected: `Ran 6 tests ... OK`

**Step 5: Commit**

```bash
git add scripts/imagery/__init__.py scripts/imagery/vivid_fetch.py scripts/imagery/test_vivid_fetch.py
git commit -m "Add chunk-grid math for the Vivid sample fetcher."
```

---

### Task 2: Download chunks and run the sample fetch

**Files:**
- Modify: `scripts/imagery/vivid_fetch.py` (append)
- Modify: `scripts/imagery/test_vivid_fetch.py` (append)
- Modify: `.gitignore`

**Step 1: Write the failing test for chunk filenames and URLs**

Append to `scripts/imagery/test_vivid_fetch.py` (above the `if __name__` block):

```python
from vivid_fetch import chunk_filename, export_url


class ChunkNaming(unittest.TestCase):
    def test_filename_encodes_origin(self):
        self.assertEqual(chunk_filename((-17286000.0, 2202000.0, -17284000.0, 2204000.0)),
                         "vivid-2020_-17286000_2202000.tif")

    def test_export_url(self):
        url = export_url((-17286000.0, 2202000.0, -17284000.0, 2204000.0))
        self.assertTrue(url.startswith(
            "https://geodata.hawaii.gov/arcgis/rest/services/SoH_Imagery/Vivid_2020/ImageServer/exportImage?"))
        self.assertIn("bbox=-17286000,2202000,-17284000,2204000", url)
        self.assertIn("size=4000,4000", url)
        self.assertIn("format=tiff", url)
        self.assertIn("bboxSR=3857", url)
        self.assertIn("imageSR=3857", url)
```

**Step 2: Run to verify failure**

Run: `cd scripts/imagery && python3 -m unittest test_vivid_fetch -v`
Expected: `ImportError: cannot import name 'chunk_filename'`

**Step 3: Implement naming, download, and CLI**

Append to `scripts/imagery/vivid_fetch.py`:

```python
def chunk_filename(chunk):
    x0, y0, _, _ = chunk
    return f"vivid-2020_{int(x0)}_{int(y0)}.tif"


def export_url(chunk):
    x0, y0, x1, y1 = (int(v) for v in chunk)
    return (f"{SERVICE}/exportImage?bbox={x0},{y0},{x1},{y1}&bboxSR=3857&imageSR=3857"
            f"&size={CHUNK_PIXELS},{CHUNK_PIXELS}&format=tiff&f=image")


def download(url, path, attempts=3):
    for attempt in range(1, attempts + 1):
        try:
            with urllib.request.urlopen(url, timeout=120) as response, open(path + ".part", "wb") as out:
                out.write(response.read())
            os.replace(path + ".part", path)
            return
        except Exception as error:  # noqa: BLE001 - retry anything transient, then give up
            print(f"  attempt {attempt} failed: {error}", file=sys.stderr)
            time.sleep(5 * attempt)
    raise RuntimeError(f"gave up on {url}")


def fetch(west, south, east, north, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    chunks = chunk_grid(west, south, east, north)
    print(f"{len(chunks)} chunks of {CHUNK_METERS:.0f} m -> {out_dir}")
    for index, chunk in enumerate(chunks, 1):
        path = os.path.join(out_dir, chunk_filename(chunk))
        if os.path.exists(path):
            print(f"[{index}/{len(chunks)}] exists, skipping {os.path.basename(path)}")
            continue
        print(f"[{index}/{len(chunks)}] fetching {os.path.basename(path)}")
        download(export_url(chunk), path)
        time.sleep(1)  # be polite to a public server


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--bbox", nargs=4, type=float, required=True, metavar=("WEST", "SOUTH", "EAST", "NORTH"),
                        help="lon/lat box in degrees")
    parser.add_argument("--out", default="source", help="output directory (default: source)")
    args = parser.parse_args()
    fetch(*args.bbox, args.out)


if __name__ == "__main__":
    main()
```

**Step 4: Run tests to verify they pass**

Run: `cd scripts/imagery && python3 -m unittest test_vivid_fetch -v`
Expected: `Ran 8 tests ... OK`

**Step 5: Ignore the large generated directories**

Append to `.gitignore`:

```
# Imagery pipeline inputs/outputs (GBs; never commit)
scripts/imagery/source
scripts/imagery/build
scripts/imagery/tiles
```

**Step 6: Fetch both sample boxes**

Run (from `scripts/imagery/`):

```bash
/opt/homebrew/bin/python3 vivid_fetch.py --bbox -155.31 19.38 -155.25 19.44
/opt/homebrew/bin/python3 vivid_fetch.py --bbox -155.08 19.30 -155.02 19.36
```

Use Homebrew's Python explicitly: the python.org build on this machine has no CA certificates and fails
with `CERTIFICATE_VERIFY_FAILED`. Homebrew's is also the interpreter `gdal2tiles.py` uses.

Expected: each prints `N chunks of 2000 m -> source` with 9 ≤ N ≤ 16, then one `fetching ...` line per chunk, ~5–10 s each. Afterwards `ls source | wc -l` is 18–32 and `du -sh source` is ≤ 1.6G.

**Step 7: Sanity-check one chunk**

Run: `gdalinfo source/$(ls source | head -1) | grep -E "Size is|Pixel Size|^Band"`
Expected: `Size is 4000, 4000`, `Pixel Size = (0.5,-0.5)`, three `Band` lines.

**Step 8: Commit**

```bash
git add .gitignore scripts/imagery/vivid_fetch.py scripts/imagery/test_vivid_fetch.py
git commit -m "Add Vivid sample fetcher CLI with retry and resume."
```

---

### Task 3: Build XYZ JPEG tiles from `source/`

**Files:**
- Create: `scripts/imagery/build-tiles.sh`

**Step 1: Write the script**

`scripts/imagery/build-tiles.sh`:

```bash
#!/usr/bin/env bash
# Mosaic every GeoTIFF in source/ and tile it to XYZ JPEG under tiles/{z}/{x}/{y}.jpg.
#
# Works for both the sample chunks from vivid_fetch.py and the full dataset from the state: gdal2tiles
# reprojects to Web Mercator as needed. Black (0,0,0) is treated as nodata because that is what the
# Vivid service returns outside its footprint; tiles that are entirely nodata are not written.
#
# Usage: ./build-tiles.sh [MIN_ZOOM-MAX_ZOOM]   (default 7-17; use 12-17 for small samples so the
#        low-zoom tiles are not mostly black)
set -euo pipefail
cd "$(dirname "$0")"

ZOOM="${1:-7-17}"
PROCESSES="$(sysctl -n hw.ncpu 2>/dev/null || nproc)"

mkdir -p build tiles
echo "Building VRT from $(ls source/*.tif | wc -l | tr -d ' ') source files"
gdalbuildvrt -q -overwrite build/source.vrt source/*.tif

echo "Tiling zoom $ZOOM with $PROCESSES processes"
gdal2tiles.py \
  --xyz \
  --tiledriver=JPEG --jpeg-quality=80 \
  --zoom="$ZOOM" \
  --resampling=average \
  --srcnodata=0,0,0 --exclude \
  --webviewer=none \
  --processes="$PROCESSES" \
  --resume \
  build/source.vrt tiles

echo "Done: $(find tiles -name '*.jpg' | wc -l | tr -d ' ') tiles, $(du -sh tiles | cut -f1)"
```

**Step 2: Make it executable and run on the sample**

Run: `chmod +x scripts/imagery/build-tiles.sh && scripts/imagery/build-tiles.sh 12-17`
Expected: progress bars from gdal2tiles, then `Done: N tiles, S` with N in the low thousands and S well under 100 MB. No Python tracebacks.

If it fails with `JPEG driver is not available` or a numpy import error, Task 0 was not completed.

**Step 3: Check tile layout and weight**

Run: `ls scripts/imagery/tiles && f=$(find scripts/imagery/tiles/16 -name '*.jpg' | head -1) && echo $f && ls -l $f`
Expected: directories `12 13 14 15 16 17`; the z16 file is roughly 8–25 KB (Esri's comparable JPEGs are ~12 KB).

**Step 4: Eyeball a z17 caldera tile and a z15 coast tile**

Open two tiles (e.g. `open <file>` on macOS): one from `tiles/17` inside box A, one from `tiles/15` inside box B. Expected: sharp crater detail; on the coast tile, land, dark water, and (possibly) a hard edge where coverage ends. **Write down what the coast looks like** — it feeds the ocean decision in Task 7.

**Step 5: Commit**

```bash
git add scripts/imagery/build-tiles.sh
git commit -m "Add GDAL tile build script for self-hosted imagery."
```

---

### Task 4: Upload script

**Files:**
- Create: `scripts/imagery/upload.sh`

**Step 1: Write the script**

`scripts/imagery/upload.sh`:

```bash
#!/usr/bin/env bash
# Sync tiles/ to S3. Tiles are immutable: a refreshed dataset gets a new prefix (e.g. vivid-2024),
# never an in-place overwrite, so they can be cached for a year.
#
# Requires an authenticated AWS CLI session with write access to models-resources (run `aws login`).
# Usage: ./upload.sh [PREFIX]   (default geocode-imagery/vivid-2020)
set -euo pipefail
cd "$(dirname "$0")"

BUCKET="models-resources"
PREFIX="${1:-geocode-imagery/vivid-2020}"

aws s3 sync tiles/ "s3://$BUCKET/$PREFIX/" \
  --size-only \
  --content-type image/jpeg \
  --cache-control "public, max-age=31536000, immutable"

echo "Served at https://$BUCKET.concord.org/$PREFIX/{z}/{x}/{y}.jpg"
```

**Step 2: Authenticate and confirm access**

Run: `aws login` (follow the prompt), then `aws s3 ls s3://models-resources/ | head -3`
Expected: a listing. If `AccessDenied`, stop and ask whoever administers `models-resources` for write access to the `geocode-imagery/` prefix — nothing else in Part 1 blocks on this except Task 6's verification.

**Step 3: Upload the sample**

Run: `chmod +x scripts/imagery/upload.sh && scripts/imagery/upload.sh`
Expected: one `upload:` line per tile, then the `Served at` line.

**Step 4: Verify a tile is publicly served with the right headers**

Run (substitute a real path from `scripts/imagery/tiles/16`):

```bash
curl -sI https://models-resources.concord.org/geocode-imagery/vivid-2020/16/<x>/<y>.jpg \
  | grep -iE "^(HTTP|content-type|cache-control|access-control-allow-origin)"
```

Expected:
```
HTTP/2 200
content-type: image/jpeg
cache-control: public, max-age=31536000, immutable
access-control-allow-origin: *
```

**Step 5: Commit**

```bash
git add scripts/imagery/upload.sh
git commit -m "Add S3 upload script for self-hosted imagery tiles."
```

---

### Task 5: Add the `vivid` map type to the app

**Files:**
- Modify: `src/stores/ui-store.ts:9`
- Modify: `src/hooks/lava-coder/use-world-imagery.ts:1-29`
- Modify: `src/components/lava-coder/lava-coder-view.tsx:51-56`

No Jest test is possible here (see "Facts verified"); verification is `tsc` + lint + the app.

**Step 1: Add the map type**

In `src/stores/ui-store.ts` change line 9 to:

```ts
export const LavaMapTypes = ["develop", "vivid", "terrain", "terrainWithLabels", "street"] as const;
```

**Step 2: Confirm TypeScript now fails on the exhaustive label map**

Run: `npx tsc --noEmit --project .`
Expected: an error in `lava-coder-view.tsx` that `Property 'vivid' is missing in type ... Record<LavaMapType, string>`. This proves the label map is exhaustive and will catch future additions.

**Step 3: Add the label**

In `src/components/lava-coder/lava-coder-view.tsx`, the `mapLabels` object becomes:

```ts
  const mapLabels: Record<LavaMapType, string> = {
    develop: "Develop",
    vivid: "Vivid",
    terrain: "Terrain",
    terrainWithLabels: "Labeled",
    street: "Street"
  };
```

(`MapButtonIcon` already falls back to the terrain icon for anything that is not `street`; no change.)

**Step 4: Add the provider**

Replace the top of `src/hooks/lava-coder/use-world-imagery.ts` (imports through the end of `getImageryProvider`) with:

```ts
import {
  CesiumWidget, createWorldImageryAsync, ImageryLayer, ImageryProvider, IonImageryProvider, IonWorldImageryStyle,
  OpenStreetMapImageryProvider, Rectangle, UrlTemplateImageryProvider
} from "@cesium/engine";
import { useCallback } from "react";
import { maxLat, maxLong, minLat, minLong } from "../../simulations/lava-coder/lava-constants";
import { LavaMapType } from "../../stores/ui-store";

// Self-hosted XYZ JPEG pyramid built by scripts/imagery from Maxar Vivid 2020 (0.5 m) imagery provided
// by the Hawaii Statewide GIS Program. See docs/plans/2026-09-16-vivid-imagery-design.md.
const kVividTileUrl = "https://models-resources.concord.org/geocode-imagery/vivid-2020/{z}/{x}/{y}.jpg";
// Zoom 17 is ~1.2 m/px, which is sharp at the camera's 1 km minimum eye height.
const kVividMaximumLevel = 17;

const imageryProviders: Partial<Record<LavaMapType, Promise<ImageryProvider>>> = {};

function getImageryProvider(type: LavaMapType): Promise<ImageryProvider> {
  if (!imageryProviders[type]) {
    if (type === "develop") {
      // Use lower-resolution imagery for development
      const SENTINEL_2_IMAGERY_ASSET_ID = 3954;
      imageryProviders[type] = IonImageryProvider.fromAssetId(SENTINEL_2_IMAGERY_ASSET_ID);
    }
    else if (type === "vivid") {
      imageryProviders[type] = Promise.resolve(new UrlTemplateImageryProvider({
        url: kVividTileUrl,
        // Only request tiles over the area the camera can reach; elsewhere the globe shows its base color.
        rectangle: Rectangle.fromDegrees(minLong, minLat, maxLong, maxLat),
        maximumLevel: kVividMaximumLevel,
        credit: "Maxar Vivid 2020 via State of Hawaii Statewide GIS Program"
      }));
    }
    else if (type === "street") {
      imageryProviders[type] = Promise.resolve(new OpenStreetMapImageryProvider({}));
    }
    else {
      // Bing maps is the default imagery provider in Cesium
      const style: IonWorldImageryStyle = type === "terrainWithLabels"
        ? IonWorldImageryStyle.AERIAL_WITH_LABELS
        : IonWorldImageryStyle.AERIAL;
      imageryProviders[type] = createWorldImageryAsync({ style });
    }
  }
  return imageryProviders[type];
}
```

Leave `useWorldImagery()` below unchanged.

**Step 5: Type-check and lint**

Run: `npx tsc --noEmit --project . && npm run lint`
Expected: both exit 0 with no output about these files.

**Step 6: Try it in the app**

Run: `npm start`, open `https://localhost:8080/?unit=LavaCoder` (or whatever URL `npm start` prints), and click the **Map Type** button until the label reads `Map Type: Vivid`.

Expected: the globe turns to base color (dark blue) except two small patches — Kīlauea caldera and the Kalapana coast — which show Vivid imagery. Zoom to the caldera to the 1 km floor: imagery stays sharp. The browser console shows tile request failures for missing tiles; that is expected until Part 2 and must not throw.

**Step 7: Commit**

```bash
git add src/stores/ui-store.ts src/hooks/lava-coder/use-world-imagery.ts src/components/lava-coder/lava-coder-view.tsx
git commit -m "Add self-hosted Vivid 2020 map type to LavaCoder."
```

---

### Task 6: Make `vivid` the student default

**Files:**
- Modify: `src/stores/ui-store.ts:13-17`

**Step 1: Change the default**

```ts
function defaultMapType(): LavaMapType {
  // Development and testing keep using Ion's low-res Sentinel-2 so they don't depend on hosted tiles
  const isDeveloping = isLocalhost();
  const isTesting = queryValueBoolean("testing");
  return isDeveloping || isTesting ? "develop" : "vivid";
}
```

**Step 2: Type-check and lint**

Run: `npx tsc --noEmit --project . && npm run lint`
Expected: exit 0.

**Step 3: Run the existing Jest suite (regression only)**

Run: `npm test`
Expected: all suites pass (none cover this code, so this only guards against collateral breakage).

**Step 4: Verify the default in a non-localhost context**

Push the branch and wait for CI's S3 deploy, then open
`https://models-resources.concord.org/geocode-app/branch/geocode-158-vivid-imagery/?unit=LavaCoder`.

Expected: on load the Map Type button reads `Map Type: Vivid`, the two sample patches render, and the Network panel shows **no** requests to `dev.virtualearth.net` or `assets.ion.cesium.com/…/imagery` (Ion terrain requests are still expected).

**Step 5: Commit**

```bash
git add src/stores/ui-store.ts
git commit -m "Default LavaCoder to self-hosted Vivid imagery outside development."
```

---

### Task 7: Document the pipeline and record findings

**Files:**
- Create: `scripts/imagery/README.md`
- Modify: `docs/lavacoder/lavacoder-optimizations.md:9-13` (TLDR → Map Imagery)
- Modify: `docs/plans/2026-09-16-vivid-imagery-design.md` (section "3. Ocean and no-data")

**Step 1: Write the README**

`scripts/imagery/README.md`:

```markdown
# LavaCoder Imagery Tiles

Builds the self-hosted basemap LavaCoder uses instead of Bing/Cesium Ion. Background and decisions:
[docs/plans/2026-09-16-vivid-imagery-design.md](../../docs/plans/2026-09-16-vivid-imagery-design.md).

## Requirements

- GDAL 3.9+ with Python bindings: `brew install gdal numpy`
- AWS CLI v2 with write access to `s3://models-resources/geocode-imagery/`

## Source data

Put GeoTIFFs in `source/`. Any projection works; `build-tiles.sh` reprojects to Web Mercator.

Until the state delivers the Vivid 2020 files, `vivid_fetch.py` pulls native-resolution chunks of a
small area from the public ImageServer so the pipeline can be exercised:

    python3 vivid_fetch.py --bbox WEST SOUTH EAST NORTH

Do **not** use it to pull the whole island — the service's terms say the original data is not for
bulk public download. Run `python3 -m unittest` here to test it.

## Build

    ./build-tiles.sh          # zoom 7-17, full island
    ./build-tiles.sh 12-17    # small samples: skips low zooms that would be mostly black

Output: `tiles/{z}/{x}/{y}.jpg`. Black (0,0,0) is treated as nodata; empty tiles are not written.
Expect ~300k tiles / ~4 GB for the full island at z17.

## Upload

    aws login
    ./upload.sh               # -> s3://models-resources/geocode-imagery/vivid-2020/

Tiles are cached for a year, so a refreshed dataset goes to a **new prefix** (`./upload.sh
geocode-imagery/vivid-2024`) and `kVividTileUrl` in `src/hooks/lava-coder/use-world-imagery.ts` is
updated to match.

## Rebuilding from scratch

`rm -rf build tiles` and rerun. `build-tiles.sh` passes `--resume`, so an interrupted run continues
where it stopped.
```

**Step 2: Update the optimizations TLDR**

In `docs/lavacoder/lavacoder-optimizations.md`, replace the "### Map Imagery" paragraph(s) under TLDR with:

```markdown
### Map Imagery

Implementing option B with `SoH_Imagery/Vivid_2020`. The tile pipeline (`scripts/imagery/`) and the
app's `vivid` map type are built and verified against a sample area; the full-island build is
waiting on the state delivering the source files (email sent to `gis@hawaii.gov`). Design and
status: [docs/plans/2026-09-16-vivid-imagery-design.md](../plans/2026-09-16-vivid-imagery-design.md).

Note the year: the prototype and the pipeline use **Vivid_2020**, not Vivid_2022. The 2022 mosaic is lower resolution (0.6 m vs 0.5 m) and has nodata gaps over the AOI, including a ~800 m band clear across the island near 19.554, -155.713.
```

**Step 3: Record the ocean findings in the design doc**

In section "3. Ocean and no-data — provisional" of the design doc, add a `**Findings from Part 1:**` paragraph stating what you saw in Task 3 Step 4 and Task 5 Step 6: how the coastal tiles look at z15–17, whether the coverage edge is visible from the camera's allowed positions, and whether the current base-color globe is acceptable or a fill/composite is needed. Leave the section marked provisional if a decision still needs the full-island data.

**Step 4: Commit**

```bash
git add scripts/imagery/README.md docs/lavacoder/lavacoder-optimizations.md docs/plans/2026-09-16-vivid-imagery-design.md
git commit -m "Document the imagery tile pipeline and Part 1 status."
```

---

## Out of scope for Part 1 (do not do these here)

- Full-island build, no-data fill/compositing, footprint analysis — Part 2, blocked on source files.
- Gating Bing behind the authoring flag (option C), removing `street`, label overlays — separate tasks.
- Cypress coverage of the default map type — Cypress runs on localhost, where the default is intentionally `develop`.
- Pulling the prototype branch's multi-layer stack into `use-world-imagery.ts` — only needed for labels.
