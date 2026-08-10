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

| Source | Resolution | Key needed | Notes |
|---|---|---|---|
| USGS `USGSImageryOnly` (The National Map) | 1 m where NAIP exists | No | Public domain. Hawaii is **not** NAIP (CONUS only) — coverage comes from partnership imagery of unverified vintage. Effective max detail appears to be ~z16 despite advertising 24 LODs. |
| Esri World Imagery | high, deep zoom | Yes (free tier) | Good Hawaii coverage. Esri's location platform free tier is generous. Legal and keyed — would also legitimize the dependency Tephra/Seismic already have. |
| Hawaii Statewide GIS / NOAA Digital Coast | varies | No | Not yet investigated. Possibly the best Hawaii-specific imagery. |

**Tradeoffs.** Cheapest to implement by a wide margin. But it keeps us exposed to exactly the failure
mode we are escaping: a vendor changing terms, adding metering, or rate-limiting us. Esri with a key
is the honest version of this option; keyless scraping of Esri or OSM is borrowed time.

**Effort:** ~half a day to swap the provider, plus verification.

#### B. Host our own tiles

Build a tile pyramid for the fixed AOI once and serve it from our own S3 + CloudFront, alongside the
existing static deploy to `models-resources`.

**Legality is the deciding constraint on the source, and it is not ambiguous.** Bulk-downloading
Bing or Ion tiles violates both Microsoft's and Cesium's terms — this is a non-starter, not a gray
area. Esri and Google prohibit it as well. Public-domain federal imagery (USGS / The National Map)
carries no such restriction and is the clean path.

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
| **A.** Third-party service | free–low | high | high (Esri) / medium (USGS) | half day |
| **B.** Self-host | very low, linear | none | high (z≤17) | 3–5 days |
| **C.** Gate the flag | proportional | unchanged | unchanged | hours |
| **D.** Baked image | zero | none | medium | ~1 day |

A and B are the real alternatives. C is a stopgap worth doing regardless. D is the safety net.

### Open question blocking a decision

**How good is free Hawaii imagery, actually?** USGS `USGSImageryOnly` is the natural self-hosting
source — free, keyless, public domain — but NAIP does not cover Hawaii, so the imagery there comes
from partnerships of unknown vintage and resolution, and the service's effective detail looks like
~z16 rather than the 24 levels its metadata advertises.

Someone should load USGS, Esri, and any Hawaii state imagery over Kīlauea at maximum zoom and compare
them against Bing side by side. If USGS looks good, self-hosting is clearly the answer. If it is soft
or cloudy, the decision shifts toward Esri with a key, or toward accepting a lower quality bar.

This should happen before any of these options is worth planning in detail.

### References

- [Cesium ion pricing](https://cesium.com/platform/cesium-ion/pricing/)
- [USGSImageryOnly service](https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer)
- [USGS Imagery Only catalog entry](https://www.sciencebase.gov/catalog/item/544172dae4b0b0a643c73c6e)
- [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)
