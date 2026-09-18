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
