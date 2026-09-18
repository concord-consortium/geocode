import unittest

from vivid_fetch import CHUNK_METERS, PIXEL_METERS, chunk_filename, chunk_grid, export_url, lonlat_to_mercator


class LonLatToMercator(unittest.TestCase):
    def test_origin(self):
        x, y = lonlat_to_mercator(0, 0)
        self.assertAlmostEqual(x, 0, places=6)
        self.assertAlmostEqual(y, 0, places=6)

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

    def test_a_6km_box_needs_a_handful_of_chunks(self):
        # 0.06 degrees is ~6.7 x 7.1 km in Mercator meters at this latitude, so 4-5 chunks per axis
        self.assertLessEqual(len(self.chunks), 25)
        self.assertGreaterEqual(len(self.chunks), 9)


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
        # Two-step export: the server streams 50 MB TIFFs unreliably (HTTP 500) with f=image, but
        # renders them fine and hands back an href with f=json
        self.assertIn("f=json", url)
        self.assertNotIn("f=image", url)


if __name__ == "__main__":
    unittest.main()
