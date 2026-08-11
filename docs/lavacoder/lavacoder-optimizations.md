# Lavacoder Optimizations

## Map Imagery Alternatives (LavaCoder / Cesium)

Status: exploratory. No decision made. Effort figures are estimates, not commitments.

### The problem

LavaCoder's default basemap is Bing Aerial, reached through Cesium Ion
(`createWorldImageryAsync` in `src/hooks/lava-coder/use-world-imagery.ts:19-26`). It looks good, but
it is metered, and at classroom scale we cannot afford it. We need something close to free that still
looks good.

Two facts about our situation should drive the choice, because both cut against the intuitive answer.

#### 1. Bing is billed per session, not per tile

Cesium Ion meters Global Imagery in **sessions** — roughly one per page load that initializes the
provider. Quotas: Community 1,000/mo, Commercial ($149/mo) 5,000/mo, Premium ($499/mo) 10,000/mo.
Sessions across all Global Imagery sources are combined against one quota.

The consequence: **reducing tile requests saves nothing.** Capping imagery zoom levels, raising
`maximumScreenSpaceError`, or tightening the camera clamp — all of which would be the obvious first
moves under per-tile billing — have zero effect on cost here. The only levers are *not initializing
the provider* or *replacing it*.

It also means cost scales with number of students, and hits a hard wall rather than degrading. Ten
thousand sessions is the top published tier.

#### 2. The expensive surface is tiny and fixed

Bing is used by LavaCoder only. Tephra and Seismic run on Leaflet with ArcGIS topo tiles and never
touch Ion.

LavaCoder's camera cannot leave the Big Island of Hawaiʻi:

| Constraint | Value | Source |
|---|---|---|
| Longitude bounds | -156.0 → -154.805 | `src/simulations/lava-coder/lava-constants.ts:16-21` |
| Latitude bounds | 18.909 → 20.268 | same |
| Eye height | clamped 1 km – 140 km | `src/hooks/lava-coder/use-camera-controls.ts:20-22` |
| Pan / rotate / tilt | default controls disabled | `use-camera-controls.ts:212-227` |

That is a fixed box of roughly 126 × 151 km. We are paying for a global imagery subscription to
display one island. This is what makes self-hosting unusually attractive here — it would be a bad
idea for an app that could navigate anywhere.

At the 1 km minimum eye height the app needs roughly 1–2 m/px to look sharp, which corresponds to
about zoom level 17. This is the quality bar any candidate has to clear.

---

### Options under consideration

#### A. Switch to a different third-party service

Replace Bing with another hosted tile service, keyless or on a free tier.

Worth knowing before treating this as the safe default: **two of our existing "free" layers are
already liabilities at scale.**

- The `street` map type uses `OpenStreetMapImageryProvider`
  (`use-world-imagery.ts:16-18`), which hits `tile.openstreetmap.org`. OSM's Tile Usage Policy
  explicitly prohibits systematic or heavy use by applications. At the volume we are worried about,
  we would be blocked.
- Tephra/Seismic hit `services.arcgisonline.com` with no key
  (`src/components/map/map-component.tsx:272-274`), which is ToS-gray for the same reason.

So "just use a free service" is what we are already doing, and it does not survive success.

**Candidates:**

| Source | Max zoom over Kīlauea | Key needed | Notes |
|---|---|---|---|
| USGS `USGSImageryOnly` (The National Map) | **z16** (z17+ 404s) | No | Public domain. **Prototyped and rejected — see below.** |
| Esri World Imagery | **z19+** | Yes, for the legitimate endpoint | Good Hawaii coverage, cloud-free, proper water. Prototyped and looks good. |
| Hawaii Statewide GIS / NOAA Digital Coast | unknown | No | Not investigated. Possibly the best Hawaii-specific imagery. |

##### USGS: prototyped and rejected

A throwaway prototype wired `USGSImageryOnly` in as a Cesium `UrlTemplateImageryProvider`. The
imagery is not usable for this app:

- **Mosaic seams.** Hawaii is not NAIP (CONUS only), so coverage is stitched from partnership
  imagery of varying vintage. Seams between captures are obvious.
- **Cloud cover.** Source scenes were not selected for clarity.
- **No-data offshore.** Coastal tiles contain hard diagonal boundaries with large black regions;
  water is flat and dark where it renders at all.
- **z16 ceiling.** Direct probing confirmed z17+ returns 404 over Kīlauea, so Cesium magnifies
  level 16 as the camera approaches the 1 km floor, compounding the other problems.

This rules out USGS as an imagery source — including as the source for self-hosting (option B),
which had assumed USGS was the clean public-domain path. **Option B now needs a different source.**

##### Esri: two different products, only one of which is licensed

This distinction matters and is easy to miss:

| | Endpoint | Key | Status |
|---|---|---|---|
| ArcGIS Online hosted service | `services.arcgisonline.com/.../World_Imagery` | none | Works, but terms require an ArcGIS Online/Enterprise license. **Not licensed for our use.** This is what Tephra/Seismic already do with `World_Topo_Map`. |
| ArcGIS Location Platform | basemap styles service (`arcgis/imagery`) | API key | The legitimate, metered path. What the pricing below applies to. |

Both serve the same underlying World Imagery mosaic, so a prototype against the keyless endpoint is
a fair test of *appearance* — but it is not a test of the thing we would actually ship.

**Pricing** ([location.arcgis.com/pricing](https://location.arcgis.com/pricing/)). Account creation
is free. Basemaps offer two billing models and we choose one:

| Model | Free tier | Overage |
|---|---|---|
| Tiles | 2,000,000 tiles/month | $0.15 per 1,000 |
| Sessions | 1,000 sessions/month | $4.00 per 1,000 |

Estimated cost for LavaCoder alone, at ~250 tiles/session (derived from the AOI and zoom range, not
measured):

| Sessions/month | Tile model | Session model | Cesium Ion today |
|---|---|---|---|
| 5,000 | free (1.25M tiles) | ~$16 | $149 |
| 20,000 | ~$450 | ~$76 | not available |
| 100,000 | ~$3,450 | ~$396 | not available |

**The model choice depends on total usage across all three units, not just LavaCoder** — it is one
account and one shared free tier. Roughly: below ~2M tiles/month the tile model is free and wins;
above that the session model scales far better. See the Leaflet section below.

**Tradeoffs.** Cheapest to implement by a wide margin, and Esri-with-a-key is legitimate rather than
borrowed time. But it keeps us metered by a vendor who can reprice, and it introduces a *runtime* API
key to manage — unlike the Ion token, which is build-time inlined today.

**Effort:** ~half a day to swap the provider, plus key provisioning and verification.

#### A2. Make the Leaflet units legitimate

Tephra and Seismic hit `services.arcgisonline.com/.../World_Topo_Map` with no key
(`src/components/map/map-component.tsx:272-274`). That is the same unlicensed path described above.

The like-for-like keyed replacement is the Location Platform `arcgis/topographic` basemap style.

**Pricing impact.** Everything shares one account and one free tier, so the units cannot be costed
independently:

- **Under the session model**, cost tracks total app loads regardless of unit. Adding Tephra/Seismic
  could double or triple the session count, and therefore the bill.
- **Under the tile model**, the Leaflet units are much cheaper per session than LavaCoder — a 2D map
  at zoom 6–12 pulls on the order of 100 tiles per session versus ~250 for the Cesium globe — so
  they consume the shared 2M pool more slowly.

Worked example: at 10k LavaCoder + 30k Tephra/Seismic sessions per month, the session model costs
~$156/mo while the tile model costs ~$525/mo. At 2k + 8k, the tile model is free and the session
model costs ~$36/mo. The crossover sits around 8–15k combined sessions.

**This should be decided for the portfolio at once**, not per unit. There is also a non-cost reason
to do it: the current keyless dependency can be cut off without notice, and it would take both 2D
units down.

#### B. Host our own tiles

Build a tile pyramid for the fixed AOI once and serve it from our own S3 + CloudFront, alongside the
existing static deploy to `models-resources`.

**Legality is the deciding constraint on the source, and it is not ambiguous.** Bulk-downloading
Bing or Ion tiles violates both Microsoft's and Cesium's terms — this is a non-starter, not a gray
area. Esri and Google prohibit it as well.

**This option currently has no confirmed source.** It originally assumed USGS/The National Map as the
clean public-domain path, but the prototype above showed that imagery is unusable over Hawaii for
quality reasons that self-hosting does not fix — seams, clouds, and no-data offshore are properties
of the source, not of how it is served. Remaining leads, none yet investigated:

- **Hawaii Statewide GIS Program / NOAA Digital Coast** — state and federal imagery specific to
  Hawaii, likely better than the national mosaic. The most promising direction.
- **USGS EarthExplorer** — raw scenes rather than the pre-rendered basemap, which would let us
  select cloud-free captures ourselves at the cost of real orthorectification work.
- **Sentinel-2 cloudless (EOX)** — free and seamless, but 10 m, so it fails the quality bar for the
  same reason Ion's Sentinel-2 layer does.

Until one of these is verified, option B is blocked on source selection rather than on engineering.

**Cost, for our specific box** (estimates; ocean is ~45% of the bounding box and collapses to almost
nothing):

| Max zoom | Tiles | Storage | Quality at 1 km eye height |
|---|---|---|---|
| z≤15 | ~19,000 | ~0.3 GB | visibly soft when zoomed in |
| z≤16 | ~76,000 | ~1.0 GB | good |
| z≤17 | ~303,000 | ~4.2 GB | matches Bing |

Storage at these sizes is a few cents per month. Egress is the real cost, at roughly 4–10 MB per
student session:

| Sessions/month | Est. CloudFront egress | Est. cost | Ion equivalent |
|---|---|---|---|
| 5,000 | ~35 GB | ~$3 | $149 (Commercial cap) |
| 100,000 | ~700 GB | ~$60 | not available at any published tier |

**Tradeoffs.** Highest up-front effort, lowest and most predictable ongoing cost, and no vendor who
can cut us off or reprice. Scales linearly instead of hitting a wall. Costs are ours to control. The
downsides are a build pipeline someone has to maintain and re-run when imagery is refreshed, and a
deploy artifact measured in gigabytes rather than megabytes. Consider PMTiles (a single file served
via HTTP range requests) to avoid managing ~300k individual S3 objects.

**Effort:** ~3–5 days — source selection, GDAL pipeline, deploy wiring, provider swap, verification,
and documenting how to rebuild.

#### C. Gate Bing behind the existing authoring flag

Keep Bing, but make it opt-in for demos and screenshots rather than the student default. The plumbing
already exists: `showMapTypeTerrain` / `showMapTypeLabeledTerrain` and `defaultMapType()` in
`src/stores/ui-store.ts:13-17,62-72`, and the cycling logic in
`src/components/lava-coder/lava-coder-view.tsx:147-158`.

Because billing is per-session, savings are directly proportional to how rarely the layer is enabled.

**Tradeoffs.** Not a solution — it is a tourniquet. It does not answer the question of what students
see, and it depends on authors leaving the flag off. But it is by far the fastest way to stop the
bleeding, and it is compatible with every other option here, so it can ship while a real fix is
designed.

Note there is an unmerged local `low-res` branch that already makes Sentinel-2 the default; it is
adjacent to this work and worth reviewing before duplicating effort.

**Effort:** hours.

#### D. Bake a single image or shallow pyramid into the app

For a fixed AOI, ship one large orthophoto of the Big Island as a `SingleTileImageryProvider` — a
pattern already used for the lava overlay (`src/hooks/lava-coder/use-lava-overlay.ts:25-28`) — or a
very shallow local tile pyramid.

**Tradeoffs.** Zero ongoing cost, zero runtime dependencies, no vendor risk, and it works offline.
This is the floor: whatever else we do, this is the fallback that cannot fail. It degrades at maximum
zoom-in, and refreshing the imagery means rebuilding the app. Whether it is acceptable depends
entirely on the quality bar, which is not yet settled.

**Effort:** ~1 day.

---

### Comparison

| | Ongoing cost | Vendor risk | Quality ceiling | Effort |
|---|---|---|---|---|
| **A.** Esri with a key | free–moderate, usage-scaled | moderate | high (z19+) | half day + key |
| **A2.** Legitimize Leaflet units | shares A's meter | moderate | unchanged | half day |
| **B.** Self-host | very low, linear | none | unknown — **no source yet** | 3–5 days + source hunt |
| **C.** Gate the flag | proportional | unchanged | unchanged | hours |
| **D.** Baked image | zero | none | limited by same source problem as B | ~1 day |

The prototype narrowed this considerably. **A is now the leading option**: it is the only path with a
confirmed source that clears the quality bar. B remains the best long-term economics but is blocked
until someone finds Hawaii imagery that is both freely licensed and good. D inherits the same blocker,
since it needs a source image from somewhere. C is still worth doing regardless as a stopgap.

### Open questions

**What is our actual session and tile volume?** Every cost estimate here rests on a
~250-tiles-per-session figure that is derived, not measured, and on session counts nobody has
supplied. The tile-vs-session billing choice swings by an order of magnitude on these numbers, and
measuring is cheap — the dev server's network panel gives a real tile count in minutes.

**Does the keyed Location Platform imagery look identical to the keyless endpoint we prototyped?**
Both draw from the same World Imagery mosaic, so it should, but this has not been verified with an
actual key — and max zoom over Hawaii in particular should be re-checked, since that is what USGS
failed on.

This should happen before any of these options is worth planning in detail.

### References

- [Cesium ion pricing](https://cesium.com/platform/cesium-ion/pricing/)
- [ArcGIS Location Platform pricing](https://location.arcgis.com/pricing/) — includes a cost calculator
- [ArcGIS Location Platform billing guide](https://location.arcgis.com/help/billing/)
- [Esri session usage pricing announcement](https://www.esri.com/about/newsroom/announcements/esri-arcgis-location-platform-adds-session-usage-pricing-for-basemaps) (Oct 2025)
- [Esri World Imagery terms of use](https://goto.arcgisonline.com/maps/World_Imagery)
- [USGSImageryOnly service](https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer)
- [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)

---

## Terrain Mesh Alternatives (LavaCoder / Cesium)

Status: exploratory. No decision made. Effort figures are estimates, not commitments.

### Before doing anything

**What is Ion terrain actually costing today?** The streaming estimate below is derived, not measured.
If real usage is well inside quota, this work may be lower priority than the imagery question.

### The problem

Imagery is only half of our Ion dependency. `createWorldTerrainAsync()` in
`src/hooks/lava-coder/use-terrain-provider.ts:11` pulls Cesium World Terrain — the 3D *shape* of the
ground, as opposed to the photo draped over it. **Replacing Bing does not remove the Ion token or the
metering.**

It is a different meter, which cuts both ways. Terrain is a Cesium-owned asset, so it bills against
**data streaming GB/month** (15 GB on Community, 150 GB on Commercial) rather than Global Imagery
sessions. That means it is not subject to the hard per-session wall described above — but it is also
large enough to matter on its own:

| Sessions/month | Est. terrain streaming (at 1–4 MB/session) | Against quota |
|---|---|---|
| 5,000 | ~10 GB | nearly exhausts Community's 15 GB |
| 100,000 | ~200 GB | exceeds Commercial's 150 GB |

So "drop Bing and fall back to the free Community tier" does not eliminate Ion on its own.

### What the terrain provider is actually used for

| Job | Where | Needs a global service? |
|---|---|---|
| Visual 3D relief | `src/hooks/lava-coder/use-cesium-viewer.ts:31` | yes, or a replacement mesh |
| Camera zoom clamp (stay 1 km above ground) | `src/hooks/lava-coder/use-camera-controls.ts:201` | **no** |
| Flag placement on the surface | `src/hooks/lava-coder/use-flag-locations.ts:37` | **no** |

The last two go through `getElevation()`, which calls `sampleTerrainMostDetailed` — fetching terrain
tiles at maximum available detail on *every* zoom step and *every* flag drop. That is a meaningful
share of the streaming bill spent on what are only point lookups.

### Choosing a source DEM

- **`big_island.asc`** — the raster the simulation already runs on — is the obvious candidate, but it is 60 m posts
  (2151 × 2448 over the AOI). Cesium World Terrain over Hawaiʻi is roughly 10–30 m effective, so building relief from
  it would be a 2–4× downgrade, and the 3× default vertical exaggeration would amplify that into visible terracing
  on the shield slopes.
- **SRTM 1-arc-second (~30 m)** — the four GeoTIFFs already committed under
  `src/assets/lava-coder/elevation-maps/` (`n18_w156`, `n19_w155`, `n19_w156`, `n20_w156`). Zero new
  downloads.
- **USGS 3DEP 1/3-arc-second (~10 m)** — public domain, covers Hawaiʻi, and would be *better* than
  what Ion gives us today.

### Options under consideration

Cesium will not consume a `.asc` directly; it wants tiles or a heightmap callback. That constraint
shapes all three options.

#### Move the point lookups to a local DEM

Rewrite `getElevation()` as a bilinear sample into the raster the worker already loads
(`src/simulations/lava-coder/raster.worker.ts`). Removes two of the three Ion terrain uses, and with
them all per-zoom and per-flag network traffic. The lookups become synchronous and free.

**Tradeoffs.** Partial — the visual mesh still comes from Ion, so the token stays. But it is the
cheapest meaningful cut, it is independent of the other two options, and it is a prerequisite for the
heightmap option below.

**Effort:** ~1 day.

#### Self-hosted quantized-mesh pyramid

Merge a DEM with GDAL, build tiles with `ctb-quantized-mesh` (Docker), serve from the same
S3/CloudFront as the imagery, and swap to `CesiumTerrainProvider.fromUrl()`.

**Tradeoffs.** This is how Cesium expects to be fed: proper LOD, small tiles, detail fetched only
where the camera looks. It decouples resolution from bundle size entirely, so 10 m 3DEP is viable.
Removes the Ion token completely when paired with self-hosted imagery. Terrain tiles are far smaller
than imagery — the whole pyramid is likely a few hundred MB, not gigabytes. Costs a build pipeline
someone has to maintain and re-run.

**Effort:** ~2–4 days.

#### CustomHeightmapTerrainProvider with an in-memory DEM

`CustomHeightmapTerrainProvider` is available in our installed `@cesium/engine` 17. It takes a
callback returning a `Float32Array` of heights per tile; we sample an in-memory DEM shipped as a
bundled asset, exactly as `big_island.asc` is today. No tile pyramid, no build step, no hosting.

This is viable *only* because the camera is locked to a small fixed box — "the whole DEM fits in
memory" is actually true here. But it forces a resolution/bundle-size tradeoff:

| DEM resolution | Posts over the AOI | Raw Int16 | Viable? |
|---|---|---|---|
| 60 m (current `.asc`) | 5.3M | ~11 MB | yes, but that is the downgrade described above |
| 30 m (SRTM, already in repo) | 21M | ~42 MB | borderline — needs compression |
| 10 m (3DEP) | 189M | ~378 MB | no |

**Tradeoffs.** By far the simplest to build and operate, with no infrastructure and no vendor. But it
caps quality at roughly 30 m and adds tens of MB to the deployed bundle. Note that
`sampleTerrainMostDetailed` needs tile-availability metadata this provider does not expose, so it
requires the local-DEM lookup option above as a prerequisite — which is a benefit, not a cost.

**Effort:** ~1–2 days on top of the local-DEM work.

### Comparison

| | Removes Ion? | Quality ceiling | Infrastructure | Effort |
|---|---|---|---|---|
| Local DEM point lookups | partially | unchanged | none | ~1 day |
| Quantized-mesh pyramid | fully | high (10 m) | S3/CloudFront + build pipeline | 2–4 days |
| CustomHeightmapTerrainProvider | fully | medium (~30 m) | none | 1–2 days |

The local-DEM lookup is worth doing regardless — it is cheap, independent, and a prerequisite for the
third option. The real choice is between the pyramid (better quality, needs a pipeline) and the
heightmap (simpler, capped at ~30 m).

### Open questions

**How does 30 m look at 3× vertical exaggeration?** This decides whether the heightmap option is
acceptable, and it is cheap to test — the SRTM GeoTIFFs are already in the repo.

### Note on a related bug

`getElevation()` takes degrees (it calls `Cartographic.fromDegrees`), and
`src/hooks/lava-coder/use-flag-locations.ts:37` passes degrees correctly. But
`src/hooks/lava-coder/use-camera-controls.ts:201` passes `positionCartographic` values, which Cesium
returns in **radians**. The zoom-in clamp therefore samples elevation near (-2.7°, 0.34°) — the
Atlantic — gets ~0, and measures the 1 km floor from sea level instead of from terrain. Pre-existing
and unrelated to the options above, but whoever rewrites `getElevation()` should fix it in the same
pass.

### References

- [Cesium ion pricing](https://cesium.com/platform/cesium-ion/pricing/)
- [CustomHeightmapTerrainProvider](https://cesium.com/learn/cesiumjs/ref-doc/CustomHeightmapTerrainProvider.html)
- [USGS 3DEP](https://www.usgs.gov/3d-elevation-program)
- [ctb-quantized-mesh](https://github.com/ahuarte47/cesium-terrain-builder)
