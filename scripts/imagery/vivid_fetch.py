"""Pull native-resolution Vivid 2020 GeoTIFF chunks from the Hawaii Statewide GIS ImageServer.

SAMPLE-ONLY STAGE. The service does not offer bulk download; this exists so the tile pipeline can be
built and verified on a small area before the state delivers the full dataset. When real files
arrive, drop them in source/ and skip this script. See docs/plans/2026-09-16-vivid-imagery-design.md.
"""
import argparse
import json
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


def chunk_filename(chunk):
    x0, y0, _, _ = chunk
    return f"vivid-2020_{int(x0)}_{int(y0)}.tif"


def export_url(chunk):
    """exportImage request in its two-step form: the JSON response carries an href to the rendered file.

    Streaming a 50 MB TIFF directly (f=image) fails with HTTP 500 on this server; rendering it and
    fetching the href is reliable.
    """
    x0, y0, x1, y1 = (int(v) for v in chunk)
    return (f"{SERVICE}/exportImage?bbox={x0},{y0},{x1},{y1}&bboxSR=3857&imageSR=3857"
            f"&size={CHUNK_PIXELS},{CHUNK_PIXELS}&format=tiff&f=json")


def _read(url, timeout=120):
    with urllib.request.urlopen(url, timeout=timeout) as response:
        return response.read()


def download(url, path, attempts=3):
    for attempt in range(1, attempts + 1):
        try:
            result = json.loads(_read(url))
            if "href" not in result:
                raise RuntimeError(f"server returned no href: {result}")
            with open(path + ".part", "wb") as out:
                out.write(_read(result["href"]))
            os.replace(path + ".part", path)
            return
        except Exception as error:  # noqa: BLE001 - retry anything transient, then give up
            print(f"  attempt {attempt} failed: {error}", file=sys.stderr)
            if "CERTIFICATE_VERIFY_FAILED" in str(error):
                # The python.org build of Python ships without CA certificates; Homebrew's does not.
                sys.exit("This Python cannot verify TLS certificates. Use Homebrew's python3 (the one GDAL uses), "
                         "or for a python.org install run \"Install Certificates.command\" from its Applications folder.")
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
