"""Pull Vivid 2020 GeoTIFF chunks from the Hawaii Statewide GIS ImageServer.

The service offers no bulk download, so this drives its exportImage endpoint one chunk at a time.
Two modes:

  Sample:  --bbox WEST SOUTH EAST NORTH   a small area at native 0.5 m/px, for exercising the pipeline
  Island:  --island                       the whole LavaCoder AOI at 1 m/px (zoom 17 is 1.2 m/px, so
                                          nothing is lost), skipping chunks with no imagery

Both are polite by construction: one request at a time, a pause between requests, exponential
backoff on server errors, and an identifying User-Agent. Re-running skips chunks already on disk.

Check licensing before an island run: the service metadata says the original data is not for bulk
public download. See docs/plans/2026-09-16-vivid-imagery-design.md.
"""
import argparse
import json
import math
import os
import sys
import time
import urllib.error
import urllib.request

SERVICE = "https://geodata.hawaii.gov/arcgis/rest/services/SoH_Imagery/Vivid_2020/ImageServer"
USER_AGENT = "concord-geocode-imagery/1.0 (Concord Consortium LavaCoder; tfristoe@concord.org)"
EARTH_RADIUS = 6378137.0
PIXEL_METERS = 0.5           # native resolution of Vivid 2020
CHUNK_PIXELS = 4000          # server maxImageHeight is 4100

# LavaCoder's camera bounds. Keep in sync with src/simulations/lava-coder/lava-constants.ts.
AOI = dict(west=-156.0, south=18.90863649, east=-154.80533185226327, north=20.26825881713135)


def lonlat_to_mercator(lon, lat):
    """WGS84 degrees -> EPSG:3857 meters (spherical Mercator)."""
    x = math.radians(lon) * EARTH_RADIUS
    y = math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * EARTH_RADIUS
    return x, y


def _snap_down(value, step):
    return math.floor(value / step) * step


def chunk_grid(west, south, east, north, pixel_meters=PIXEL_METERS):
    """Return (x0, y0, x1, y1) mercator boxes, CHUNK_PIXELS * pixel_meters square, covering the box.

    Origins are multiples of the chunk size, hence of the pixel size, so adjacent exports share exact
    pixel edges and mosaic cleanly.
    """
    size = CHUNK_PIXELS * pixel_meters
    wx, sy = lonlat_to_mercator(west, south)
    ex, ny = lonlat_to_mercator(east, north)
    chunks = []
    x = _snap_down(wx, size)
    while x < ex:
        y = _snap_down(sy, size)
        while y < ny:
            chunks.append((x, y, x + size, y + size))
            y += size
        x += size
    return chunks


def chunk_filename(chunk, pixel_meters=PIXEL_METERS):
    # Pixel size is in the name so sample (0.5 m, 2 km) and island (1 m, 4 km) chunks that share an
    # origin never collide; a mosaic must not mix a partial 2 km chunk in for a missing 4 km one.
    x0, y0, _, _ = chunk
    return f"vivid-2020_{pixel_meters:g}m_{int(x0)}_{int(y0)}.tif"


def export_url(chunk):
    """exportImage request in its two-step form: the JSON response carries an href to the rendered file.

    Streaming a 50 MB TIFF directly (f=image) fails with HTTP 500 on this server; rendering it and
    fetching the href is reliable. LZW is lossless and saves ~15%.
    """
    x0, y0, x1, y1 = (int(v) for v in chunk)
    return (f"{SERVICE}/exportImage?bbox={x0},{y0},{x1},{y1}&bboxSR=3857&imageSR=3857"
            f"&size={CHUNK_PIXELS},{CHUNK_PIXELS}&format=tiff&compression=LZW&f=json")


# --- footprint filtering -------------------------------------------------------------------------
# Rasters are EPSG:3857 polygons from the service catalog, as lists of rings of (x, y) tuples. A
# chunk is worth fetching if its rectangle touches any footprint's outer ring.

def footprint_bbox(rings):
    xs = [x for ring in rings for x, _ in ring]
    ys = [y for ring in rings for _, y in ring]
    return min(xs), min(ys), max(xs), max(ys)


def _point_in_ring(px, py, ring):
    inside = False
    for (ax, ay), (bx, by) in zip(ring, ring[1:] + ring[:1]):
        if (ay > py) != (by > py) and px < (bx - ax) * (py - ay) / (by - ay) + ax:
            inside = not inside
    return inside


def _segments_intersect(p1, p2, q1, q2):
    def orient(a, b, c):
        return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    return (orient(p1, p2, q1) * orient(p1, p2, q2) < 0 and
            orient(q1, q2, p1) * orient(q1, q2, p2) < 0)


def rect_intersects_polygon(rect, rings):
    x0, y0, x1, y1 = rect
    bx0, by0, bx1, by1 = footprint_bbox(rings)
    if x1 < bx0 or x0 > bx1 or y1 < by0 or y0 > by1:
        return False
    outer = rings[0]
    corners = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
    if any(_point_in_ring(cx, cy, outer) for cx, cy in corners):
        return True
    if any(x0 <= vx <= x1 and y0 <= vy <= y1 for vx, vy in outer):
        return True
    rect_edges = list(zip(corners, corners[1:] + corners[:1]))
    for a, b in zip(outer, outer[1:] + outer[:1]):
        if any(_segments_intersect(a, b, c, d) for c, d in rect_edges):
            return True
    return False


def fetch_footprints(west, south, east, north, cache_path):
    """Primary-raster footprints intersecting the lon/lat box, from the service catalog (cached)."""
    if os.path.exists(cache_path):
        with open(cache_path) as f:
            return json.load(f)
    wx, sy = lonlat_to_mercator(west, south)
    ex, ny = lonlat_to_mercator(east, north)
    features, offset = [], 0
    while True:
        url = (f"{SERVICE}/query?where=Category%3D1&geometry={wx:.0f},{sy:.0f},{ex:.0f},{ny:.0f}"
               f"&geometryType=esriGeometryEnvelope&inSR=3857&spatialRel=esriSpatialRelIntersects"
               f"&outFields=OBJECTID&returnGeometry=true&outSR=3857&resultOffset={offset}&f=json")
        result = json.loads(_read(url))
        if "error" in result:
            raise RuntimeError(f"catalog query failed: {result['error']}")
        features += result.get("features", [])
        if not result.get("exceededTransferLimit"):
            break
        offset = len(features)
    footprints = [[[tuple(pt) for pt in ring] for ring in f["geometry"]["rings"]] for f in features]
    os.makedirs(os.path.dirname(cache_path) or ".", exist_ok=True)
    with open(cache_path, "w") as f:
        json.dump(footprints, f)
    return footprints


def filter_chunks(chunks, footprints):
    return [c for c in chunks if any(rect_intersects_polygon(c, fp) for fp in footprints)]


# --- downloading ---------------------------------------------------------------------------------

def _read(url, timeout=180):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def download(url, path, attempts=5):
    """Render via f=json, then download the href. Backs off 10, 20, 40, 80 s on failure."""
    for attempt in range(1, attempts + 1):
        try:
            result = json.loads(_read(url))
            if "href" not in result:
                raise RuntimeError(f"server returned no href: {result}")
            data = _read(result["href"])
            if len(data) < 1_000_000 or data[:4] not in (b"II*\x00", b"MM\x00*"):
                raise RuntimeError(f"href did not return a TIFF ({len(data)} bytes)")
            with open(path + ".part", "wb") as out:
                out.write(data)
            os.replace(path + ".part", path)
            return
        except Exception as error:  # noqa: BLE001 - retry anything transient, then give up
            print(f"  attempt {attempt} failed: {error}", file=sys.stderr)
            if "CERTIFICATE_VERIFY_FAILED" in str(error):
                # The python.org build of Python ships without CA certificates; Homebrew's does not.
                sys.exit("This Python cannot verify TLS certificates. Use Homebrew's python3 (the one GDAL uses), "
                         "or for a python.org install run \"Install Certificates.command\" from its Applications folder.")
            if attempt < attempts:
                time.sleep(10 * 2 ** (attempt - 1))
    raise RuntimeError(f"gave up on {url}")


def fetch(west, south, east, north, out_dir, pixel_meters, use_footprints, delay, dry_run):
    chunks = chunk_grid(west, south, east, north, pixel_meters)
    total_grid = len(chunks)
    if use_footprints:
        # Cache per box: a sample-area cache must never stand in for the island's footprints
        cache = os.path.join("build", f"footprints_{west:g}_{south:g}_{east:g}_{north:g}.json")
        footprints = fetch_footprints(west, south, east, north, cache)
        chunks = filter_chunks(chunks, footprints)
        print(f"{len(footprints)} raster footprints; {len(chunks)} of {total_grid} chunks touch imagery")
    size_m = CHUNK_PIXELS * pixel_meters
    est_gb = len(chunks) * CHUNK_PIXELS * CHUNK_PIXELS * 3 * 0.85 / 1e9
    todo = [c for c in chunks if not os.path.exists(os.path.join(out_dir, chunk_filename(c, pixel_meters)))]
    print(f"{len(chunks)} chunks of {size_m:.0f} m at {pixel_meters} m/px -> {out_dir} "
          f"(~{est_gb:.1f} GB total, {len(todo)} still to fetch, ~{len(todo) * (delay + 8) / 3600:.1f} h)")
    if dry_run:
        return
    os.makedirs(out_dir, exist_ok=True)
    for index, chunk in enumerate(chunks, 1):
        path = os.path.join(out_dir, chunk_filename(chunk, pixel_meters))
        if os.path.exists(path):
            continue
        print(f"[{index}/{len(chunks)}] fetching {os.path.basename(path)}", flush=True)
        download(export_url(chunk), path)
        time.sleep(delay)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    area = parser.add_mutually_exclusive_group(required=True)
    area.add_argument("--bbox", nargs=4, type=float, metavar=("WEST", "SOUTH", "EAST", "NORTH"),
                      help="lon/lat box in degrees, fetched at native resolution")
    area.add_argument("--island", action="store_true",
                      help="the whole LavaCoder AOI at 1 m/px, skipping chunks with no imagery")
    parser.add_argument("--pixel-size", type=float, help="override meters per pixel")
    parser.add_argument("--no-footprints", action="store_true",
                        help="fetch every chunk in the grid instead of only those touching imagery")
    parser.add_argument("--delay", type=float, default=2.0, help="seconds to wait between requests (default 2)")
    parser.add_argument("--dry-run", action="store_true", help="report the chunk count and size; fetch nothing")
    parser.add_argument("--out", default="source", help="output directory (default: source)")
    args = parser.parse_args()

    if args.island:
        box, pixel, footprints = AOI, args.pixel_size or 1.0, not args.no_footprints
    else:
        west, south, east, north = args.bbox
        box, pixel, footprints = dict(west=west, south=south, east=east, north=north), \
            args.pixel_size or PIXEL_METERS, not args.no_footprints
    fetch(**box, out_dir=args.out, pixel_meters=pixel, use_footprints=footprints, delay=args.delay,
          dry_run=args.dry_run)


if __name__ == "__main__":
    main()
