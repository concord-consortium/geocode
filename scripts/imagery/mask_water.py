"""Make the water in the source chunks transparent, using the OSM land polygons from osm_coastline.py.

The Vivid mosaic's water has seams, glint, and a hard rectangular edge a few km offshore, all of which
stand out against LavaCoder's flat ocean layer. This rasterizes the land polygons onto each chunk's
grid and sets every pixel outside them to (0,0,0), the pipeline's no-data, so build-tiles.sh writes
water as transparent and skips water-only tiles. Chunks entirely on land are symlinked; chunks with
no land are dropped.

Known limits: breakwaters disappear (OSM maps them apart from the coastline); coastal ponds inside
the coastline keep their water texture; and at zoom 16-17 the coastline can be a few meters off, so
slivers of water or shore occasionally land on the wrong side.

usage: /opt/homebrew/bin/python3 mask_water.py SOURCE_DIR OUT_DIR [--land build/osm-land.geojson] [--jobs N]
"""
import argparse
import glob
import multiprocessing
import os

import numpy as np
from osgeo import gdal, ogr

gdal.UseExceptions()
ogr.UseExceptions()
LAND = os.path.join("build", "osm-land.geojson")


def without_water(rgb, land):
    """Water (non-land) pixels become no-data (0,0,0); land pixels are unchanged."""
    return np.where(land, rgb, 0).astype(np.uint8)


def land_mask(src, land_path):
    """Boolean land mask on the chunk's own grid (the polygons are reprojected as needed)."""
    mem = gdal.GetDriverByName("MEM").Create("", src.RasterXSize, src.RasterYSize, 1, gdal.GDT_Byte)
    mem.SetGeoTransform(src.GetGeoTransform())
    mem.SetProjection(src.GetProjection())
    land = ogr.Open(land_path)
    gdal.RasterizeLayer(mem, [1], land.GetLayer(0), burn_values=[1])
    return mem.ReadAsArray().astype(bool)


def mask_chunk(args):
    path, land_path, out_dir = args
    out = os.path.join(out_dir, os.path.basename(path))
    if os.path.lexists(out):
        return "skipped"
    src = gdal.Open(path)
    land = land_mask(src, land_path)
    if not land.any():
        return "dropped"
    if land.all():
        os.symlink(os.path.abspath(path), out)
        return "linked"
    result = without_water(src.ReadAsArray(), land)
    # Match the originals' band metadata (ColorInterp Undefined on every band) or gdalbuildvrt skips
    # mismatched files. GTiff's Create forces band 1 to Gray; CreateCopy from MEM keeps Undefined.
    mem = gdal.GetDriverByName("MEM").Create("", src.RasterXSize, src.RasterYSize, 3, gdal.GDT_Byte)
    mem.SetGeoTransform(src.GetGeoTransform())
    mem.SetProjection(src.GetProjection())
    for b in range(3):
        band = mem.GetRasterBand(b + 1)
        band.SetColorInterpretation(gdal.GCI_Undefined)
        band.WriteArray(result[b])
    tmp = out + ".part"
    gdal.GetDriverByName("GTiff").CreateCopy(tmp, mem, options=["COMPRESS=LZW", "TILED=YES"])
    os.replace(tmp, out)
    return "masked"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source_dir")
    parser.add_argument("out_dir")
    parser.add_argument("--land", default=LAND, help=f"land polygons (default {LAND})")
    parser.add_argument("--jobs", type=int, default=os.cpu_count(), help="parallel workers")
    args = parser.parse_args()
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    chunks = sorted(glob.glob(os.path.join(args.source_dir, "*.tif")))
    os.makedirs(args.out_dir, exist_ok=True)
    print(f"Masking {len(chunks)} chunks in {args.source_dir} with {args.land}", flush=True)
    counts = {}
    with multiprocessing.Pool(args.jobs) as pool:
        work = [(c, args.land, args.out_dir) for c in chunks]
        for i, result in enumerate(pool.imap_unordered(mask_chunk, work), 1):
            counts[result] = counts.get(result, 0) + 1
            if i % 100 == 0 or i == len(chunks):
                print(f"  {i}/{len(chunks)} {counts}", flush=True)


if __name__ == "__main__":
    main()
