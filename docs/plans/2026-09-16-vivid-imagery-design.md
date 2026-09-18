# Self-Hosted Vivid 2020 Imagery for LavaCoder — Design

Status: approved design, 2026-09-16. Implements option B from
[lavacoder-optimizations.md](../lavacoder/lavacoder-optimizations.md).

## Goal

Replace LavaCoder's Bing Aerial basemap (metered per session through Cesium Ion) with a self-hosted
XYZ tile pyramid built from the Hawaii Statewide GIS Program's `SoH_Imagery/Vivid_2020` imagery
(Maxar Vivid, 0.5 m/px) and served from `models-resources` via CloudFront.

Scope is the imagery swap only. Place-name labels, gating Bing behind the authoring flag (option C),
and cleanup of the other map types are separate tasks.

## Constraints that shape the design

- **Source files are not in hand.** The Vivid service exposes `Image,Metadata,Catalog` capabilities
  only (no `Download`), and its metadata says the original data "cannot be downloaded via public
  access." The team has emailed `gis@hawaii.gov` for the files. Until they arrive, the pipeline is
  built and verified against a small sample area pulled through `exportImage` — the same call the
  prototype already makes at runtime — so the full build is one command later.
- **Vivid_2020, not 2022.** 2022 is 0.6 m and has nodata gaps across the island; 2020 is 0.5 m with
  no interior holes over the AOI.
- **Fixed AOI.** Camera is clamped to lon −156.0→−154.805, lat 18.909→20.268, eye height 1–140 km
  (`src/simulations/lava-coder/lava-constants.ts`, `src/hooks/lava-coder/use-camera-controls.ts`).
  At the 1 km floor the app needs ~1–2 m/px, i.e. zoom 17.
- **Delivered files will likely not be Web Mercator** (UTM 5N or Hawaii State Plane), so the
  pipeline must reproject, not just slice.

## Decisions

| Decision | Choice | Alternatives considered |
|---|---|---|
| Tile tooling | GDAL CLI + `gdal2tiles.py --xyz --tiledriver=WEBP` (GDAL 3.13 via Homebrew; needs numpy) | rasterio/mercantile venv (reimplements the pyramid); Docker `osgeo/gdal` (reproducible but heavy for multi‑GB I/O) |
| Packaging | Plain XYZ **WebP** tiles, `{z}/{x}/{y}.webp` — changed from JPEG during Part 1, see below | PMTiles (single file, but needs a custom Cesium provider) |
| Hosting | `s3://models-resources/geocode-imagery/vivid-2020/`, served at `https://models-resources.concord.org/geocode-imagery/vivid-2020/` | Separate bucket (needs new provisioning) |
| Zoom range | 7–17 | z≤16 (softer at 1 km); z≤18 (4× storage, no visible gain) |
| Cesium provider | `UrlTemplateImageryProvider` with `rectangle` = AOI, `maximumLevel: 17` | Layer-stack refactor from the prototype (not needed for a single layer) |
| Imagery refresh | New prefix (e.g. `vivid-2024/`), tiles uploaded immutable with long `Cache-Control` | In-place overwrite (cache invalidation headaches) |

## Components

### 1. Pipeline — `scripts/imagery/`

Lives beside the existing DEM scripts with its own README.

- **`vivid_fetch.py`** *(sample-only stage)* — given a WGS84 bbox, computes 4000×4000 native-res
  chunks on a 2 km Web Mercator grid (origins on the 0.5 m pixel grid, so chunks mosaic without
  seams) and requests each from `Vivid_2020/ImageServer/exportImage?...&format=tiff` into
  `source/`, using the two-step form (`f=json`, then download the returned `href`) because the server
  returns HTTP 500 when streaming a 50 MB TIFF directly. Skips chunks already present. Unit-tested
  with `unittest`. Verified: a 4000×4000 request returns a georeferenced EPSG:3857 GeoTIFF at 0.5 m
  in ~5 s (~50 MB).
  When the state delivers files they go straight into `source/` and this step is skipped.
- **`build-tiles.sh`** — `gdalbuildvrt` over `source/*.tif`, then
  `gdal2tiles.py --xyz --tiledriver=WEBP -z 7-17 --processes=N --exclude` over a VRT built with
  `-srcnodata 0 -vrtnodata 0`, writing `tiles/{z}/{x}/{y}.webp` and skipping fully empty tiles. Handles reprojection when inputs are not EPSG:3857.
- **`upload.sh`** — `aws s3 sync tiles/ s3://models-resources/geocode-imagery/vivid-2020/`
  with `--content-type image/webp` and `--cache-control "public, max-age=31536000, immutable"`.
  Requires `aws login` first.

### 2. App — `src/hooks/lava-coder/use-world-imagery.ts`, `src/stores/ui-store.ts`

- Add `"vivid"` to `LavaMapTypes`; label "Vivid" in `lava-coder-view.tsx`; icon reuses the
  terrain icon.
- Provider: `new UrlTemplateImageryProvider({ url: <base>/{z}/{x}/{y}.webp, rectangle:
  Rectangle.fromDegrees(minLong, minLat, maxLong, maxLat), maximumLevel: 17, credit })`, where the credit is
  the wording the Maxar license requires on derivative works: *"Includes copyrighted material of
  Maxar, Inc., All Rights Reserved. Imagery via USDA-FPAC and the Hawaii Statewide GIS Program."*
  The base URL is a single constant.
- `defaultMapType()` will return `"vivid"` for students **once the full island is hosted (Part 2)**;
  until then it stays `"terrain"` with a TODO, so deploys of the branch don't show a mostly-empty
  globe. `"develop"` (Ion Sentinel‑2) remains the localhost/testing default.
- Existing `terrain`, `terrainWithLabels`, and `street` types are left in place (out of scope).

### 3. Ocean and no-data — **provisional**

Vivid coverage ends offshore and JPEG (the original packaging choice) carries no alpha, so no-data
would have to become *some* color.
Current plan: fill no-data with a flat ocean color in the pipeline and set `globe.baseColor` to the
same color, so areas beyond coverage and beyond the provider `rectangle` are indistinguishable.

This is explicitly to be revisited after Part 1: the sample area includes the Puna coastline so we
can see what Vivid actually contains offshore (real water, black, or transparent) before committing.
Alternatives if the flat fill looks wrong: composite Vivid over a low-res ocean layer (e.g.
Sentinel‑2 cloudless) in the VRT; or use PNG/WebP with alpha for coastal tiles only.

**Findings from Part 1 (2026-09-18):**

- *Offshore content.* Vivid_2020 has real imagery — very dark blue water (RGB ≈ 1,6,9) — for at
  least ~2 km off the Kalapana coast. Beyond the mosaic footprint every band is 0. So near shore the
  question is moot; only the footprint edge needs handling.
- *Tiles are WebP, not JPEG, and that settles the edge.* GDAL 3.13's `gdal2tiles.py` wraps the C++
  `gdal raster tile`, which detects blank tiles by alpha/nodata. JPEG has neither, so with JPEG output
  every uncovered tile in the AOI was written as a 668-byte black square (6,756 of 9,039 on the
  sample) and edge tiles had hard black regions. WebP carries alpha: blank tiles are skipped, and
  tiles that straddle the footprint edge are transparent beyond it, so the globe's base color shows
  through. Sizes are equal (median ~7 KB at q80 on the same tiles). No pipeline fill or compositing
  is needed; the only remaining lever is `globe.baseColor`, which can be set to an ocean tone in
  Part 2 if the default blue looks wrong next to Vivid's water.
- *The bigger visual issues are in the source, not at the edge.* The coast sample shows a visible
  mosaic seam (different land tone and a distinctly greener water block on one side) and clouds over
  the lava field. These are properties of the state's mosaic and were equally present in the runtime
  prototype; self-hosting cannot fix them. Worth surveying across the island once the full files
  arrive, in case a different vintage patches the worst spots.

Status: no longer provisional for the coverage edge. `globe.baseColor` choice remains open for Part 2.

## Sample area (Part 1)

Two ~6 km boxes: **A**, Kīlauea caldera (lon −155.31→−155.25, lat 19.38→19.44) for sharpness, and
**B**, the Kalapana coast (lon −155.08→−155.02, lat 19.30→19.36) for the shoreline. 36 chunks,
1.7 GB of source, 2,283 WebP tiles (24 MB) at z12–17, hosted at
`https://models-resources.concord.org/geocode-imagery/vivid-2020/`. Tiles outside the sample 404;
Cesium leaves those areas at base color.

## Testing

- Fetcher: `unittest` coverage of the Mercator math, chunk grid, filenames, and export URL form.
- App: `tsc` + `eslint`; the exhaustive `Record<LavaMapType, string>` label map fails to compile
  when a map type is added without a label. No Jest test — Jest cannot import `@cesium/engine`
  (ESM) in this project's config, and no existing test does.
- Manual verification in the app against the hosted sample tiles at both the 1 km floor and the
  140 km ceiling, including the coastline.
- Pipeline: `build-tiles.sh` run on the sample; tile count, byte sizes (5–9 KB median, ≤22 KB at
  z16–17, in line with Esri's ~12 KB JPEGs), and visual checks of caldera, shoreline, and
  coverage-edge tiles.
- Cypress was considered and dropped: it runs on localhost, where the default is intentionally
  `develop`.

## Delivery in parts

| Part | Deliverable | Depends on |
|---|---|---|
| **1** (~2 days) | Pipeline scripts + README; sample tiles built and hosted; `vivid` provider wired and default; verified in a branch deploy; ocean approach evaluated | nothing |
| **2** | Full-island build from delivered files: ingest/reproject, no-data handling as decided, z≤17 run (~300k tiles, ~4 GB), upload, QA sweep for seams and coast, size/timing numbers recorded in the optimizations doc | state's files or written permission |
| **3** | Cutover: measure real tiles/session, egress check after first classroom use, retire the runtime `exportImage` prototype branch, CHANGELOG; hand off Bing gating (option C) and labels as separate tasks | Part 2 |

## Open questions

- What does Vivid_2020 contain offshore — water imagery, black, or no-data? (Answered by Part 1.)
- Delivered file format, projection, and total size — determines how long the Part 2 build runs.
- Attribution wording the state / USDA want on the credit line.
