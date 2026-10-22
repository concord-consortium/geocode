import os
import tempfile
import unittest

import numpy as np
from osgeo import gdal, ogr, osr

from mask_water import mask_chunk, without_water

gdal.UseExceptions()
ogr.UseExceptions()


def write_chunk(path, rgb, x0=0.0, y0=100.0, pixel=1.0):
    ds = gdal.GetDriverByName("GTiff").Create(path, rgb.shape[2], rgb.shape[1], 3, gdal.GDT_Byte)
    ds.SetGeoTransform([x0, pixel, 0, y0, 0, -pixel])
    srs = osr.SpatialReference()
    srs.ImportFromEPSG(3857)
    ds.SetProjection(srs.ExportToWkt())
    for b in range(3):
        ds.GetRasterBand(b + 1).WriteArray(rgb[b])
    ds = None


def write_land(path, wkt):
    ds = ogr.GetDriverByName("GeoJSON").CreateDataSource(path)
    srs = osr.SpatialReference()
    srs.ImportFromEPSG(3857)
    layer = ds.CreateLayer("land", srs, ogr.wkbPolygon)
    f = ogr.Feature(layer.GetLayerDefn())
    f.SetGeometry(ogr.CreateGeometryFromWkt(wkt))
    layer.CreateFeature(f)
    ds = None


class WithoutWater(unittest.TestCase):
    def test_water_pixels_become_no_data_and_land_is_unchanged(self):
        rgb = np.full((3, 2, 2), 50, dtype=np.uint8)
        land = np.array([[True, False], [False, True]])
        out = without_water(rgb, land)
        np.testing.assert_array_equal(out[:, 0, 0], [50, 50, 50])
        np.testing.assert_array_equal(out[:, 0, 1], [0, 0, 0])
        np.testing.assert_array_equal(out[:, 1, 1], [50, 50, 50])


class MaskChunk(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.chunk = os.path.join(self.dir, "chunk.tif")
        write_chunk(self.chunk, np.full((3, 100, 100), 80, dtype=np.uint8))   # covers x 0-100, y 0-100

    def run_with_land(self, wkt):
        land = os.path.join(self.dir, "land.geojson")
        write_land(land, wkt)
        out_dir = os.path.join(self.dir, "out")
        os.makedirs(out_dir, exist_ok=True)
        return mask_chunk((self.chunk, land, out_dir)), os.path.join(out_dir, "chunk.tif")

    def test_partly_land_chunk_is_rewritten_with_the_water_removed(self):
        result, out = self.run_with_land("POLYGON ((0 0, 50 0, 50 100, 0 100, 0 0))")   # west half is land
        self.assertEqual(result, "masked")
        rgb = gdal.Open(out).ReadAsArray()
        self.assertTrue(rgb[:, :, :50].all())
        self.assertFalse(rgb[:, :, 50:].any())

    def test_all_land_chunk_is_linked(self):
        result, out = self.run_with_land("POLYGON ((-10 -10, 110 -10, 110 110, -10 110, -10 -10))")
        self.assertEqual(result, "linked")
        self.assertTrue(os.path.islink(out))

    def test_all_water_chunk_is_dropped(self):
        result, out = self.run_with_land("POLYGON ((500 500, 600 500, 600 600, 500 600, 500 500))")
        self.assertEqual(result, "dropped")
        self.assertFalse(os.path.lexists(out))


if __name__ == "__main__":
    unittest.main()
