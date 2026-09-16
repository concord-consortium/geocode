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
| Tile tooling | GDAL CLI + `gdal2tiles.py --xyz --tiledriver=JPEG` (GDAL 3.11 via Homebrew; needs `brew install numpy`) | rasterio/mercantile venv (reimplements the pyramid); Docker `osgeo/gdal` (reproducible but heavy for multi‑GB I/O) |
| Packaging | Plain XYZ JPEG tiles, `{z}/{x}/{y}.jpg` | PMTiles (single file, but needs a custom Cesium provider) |
| Hosting | `s3://models-resources/geocode-imagery/vivid-2020/`, served at `https://models-resources.concord.org/geocode-imagery/vivid-2020/` | Separate bucket (needs new provisioning) |
| Zoom range | 7–17 | z≤16 (softer at 1 km); z≤18 (4× storage, no visible gain) |
| Cesium provider | `UrlTemplateImageryProvider` with `rectangle` = AOI, `maximumLevel: 17` | Layer-stack refactor from the prototype (not needed for a single layer) |
| Imagery refresh | New prefix (e.g. `vivid-2024/`), tiles uploaded immutable with long `Cache-Control` | In-place overwrite (cache invalidation headaches) |

## Components

### 1. Pipeline — `scripts/imagery/`

Lives beside the existing DEM scripts with its own README.

- **`fetch-sample.py`** *(sample-only stage)* — given a WGS84 bbox, computes 4000×4000 native-res
  chunks aligned to the z17 tile grid and requests each from
  `Vivid_2020/ImageServer/exportImage?bboxSR=3857&imageSR=3857&format=tiff` into `source/`.
  Skips chunks already present. Verified: a 4000×4000 request returns a georeferenced EPSG:3857
  GeoTIFF at 0.5 m in ~5 s (~50 MB).
  When the state delivers files they go straight into `source/` and this step is skipped.
- **`build-tiles.sh`** — `gdalbuildvrt` over `source/*.tif`, then
  `gdal2tiles.py --xyz --tiledriver=JPEG -z 7-17 --processes=N` clipped to the AOI, writing
  `tiles/{z}/{x}/{y}.jpg`. Handles reprojection when inputs are not EPSG:3857.
- **`upload.sh`** — `aws s3 sync tiles/ s3://models-resources/geocode-imagery/vivid-2020/`
  with `--content-type image/jpeg` and `--cache-control "public, max-age=31536000, immutable"`.
  Requires `aws login` first.

### 2. App — `src/hooks/lava-coder/use-world-imagery.ts`, `src/stores/ui-store.ts`

- Add `"vivid"` to `LavaMapTypes`; label "Vivid" in `lava-coder-view.tsx`; icon reuses the
  terrain icon.
- Provider: `new UrlTemplateImageryProvider({ url: <base>/{z}/{x}/{y}.jpg, rectangle:
  Rectangle.fromDegrees(minLong, minLat, maxLong, maxLat), maximumLevel: 17, credit: "Maxar Vivid
  2020 via State of Hawaii Statewide GIS Program" })`. The base URL is a single constant.
- `defaultMapType()` returns `"vivid"` for students; `"develop"` (Ion Sentinel‑2) remains the
  localhost/testing default so dev work does not depend on hosted tiles being complete.
- Existing `terrain`, `terrainWithLabels`, and `street` types are left in place (out of scope).

### 3. Ocean and no-data — **provisional**

Vivid coverage ends offshore and JPEG carries no alpha, so no-data must become *some* color.
Current plan: fill no-data with a flat ocean color in the pipeline and set `globe.baseColor` to the
same color, so areas beyond coverage and beyond the provider `rectangle` are indistinguishable.

This is explicitly to be revisited after Part 1: the sample area includes the Puna coastline so we
can see what Vivid actually contains offshore (real water, black, or transparent) before committing.
Alternatives if the flat fill looks wrong: composite Vivid over a low-res ocean layer (e.g.
Sentinel‑2 cloudless) in the VRT; or use PNG/WebP with alpha for coastal tiles only.

## Sample area (Part 1)

~10 × 10 km from Kīlauea caldera southeast to the Puna coast: caldera, recent lava fields, forest,
and a coastline in one box. Roughly 25 `exportImage` requests, ~1.3 GB of source, a few thousand
tiles. Tiles outside the sample simply 404 during Part 1; Cesium leaves those areas at base color.

## Testing

- Unit test for the `vivid` provider configuration (URL template, rectangle equals the AOI,
  maximum level).
- Manual verification in the app against the hosted sample tiles at both the 1 km floor and the
  140 km ceiling, including the coastline.
- Cypress smoke test: map type defaults to `vivid` when not on localhost / `testing`.
- Pipeline: `build-tiles.sh` run on the sample; spot-check tile count, byte sizes (target ~10–15 KB
  at z16, matching Esri's JPEGs), and visual seams between chunks.

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
