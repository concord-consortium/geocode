import unittest

from vivid_fetch import (
    AOI, CHUNK_PIXELS, IMAGERY_EXTENT, OTHER_ISLANDS_EXTENT, PIXEL_METERS, chunk_filename, chunk_grid, export_url, footprint_bbox,
    lonlat_to_mercator, looks_like_tiff, rect_intersects_polygon
)


class ImageryExtent(unittest.TestCase):
    def test_contains_the_aoi(self):
        self.assertLess(IMAGERY_EXTENT["west"], AOI["west"])
        self.assertLess(IMAGERY_EXTENT["south"], AOI["south"])
        self.assertGreater(IMAGERY_EXTENT["east"], AOI["east"])
        self.assertGreater(IMAGERY_EXTENT["north"], AOI["north"])

    def test_reaches_past_keahole_point(self):
        # The island's westernmost land, which sticks out past the AOI's -156.0
        self.assertLess(IMAGERY_EXTENT["west"], -156.0613 - 0.02)


class OtherIslandsExtent(unittest.TestCase):
    def test_does_not_overlap_the_big_island(self):
        # The two are fetched at different resolutions; an overlap would mosaic 8 m over 1 m data
        self.assertGreater(OTHER_ISLANDS_EXTENT["south"], IMAGERY_EXTENT["north"])

    def test_covers_niihau_to_hana(self):
        self.assertLess(OTHER_ISLANDS_EXTENT["west"], -160.25)   # Niʻihau's west coast
        self.assertGreater(OTHER_ISLANDS_EXTENT["east"], -155.98)  # Hāna, Maui's east tip
        self.assertGreater(OTHER_ISLANDS_EXTENT["north"], 22.23)  # Kauaʻi's north shore
        self.assertLess(OTHER_ISLANDS_EXTENT["south"], 20.50)    # Kahoʻolawe's south tip


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
        size = CHUNK_PIXELS * PIXEL_METERS
        for x0, y0, x1, y1 in self.chunks:
            self.assertEqual(x1 - x0, size)
            self.assertEqual(y1 - y0, size)
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

    def test_coarser_pixels_mean_bigger_and_fewer_chunks(self):
        coarse = chunk_grid(west=-155.31, south=19.38, east=-155.25, north=19.44, pixel_meters=1.0)
        x0, y0, x1, y1 = coarse[0]
        self.assertEqual(x1 - x0, CHUNK_PIXELS * 1.0)
        self.assertLess(len(coarse), len(self.chunks))
        self.assertGreaterEqual(len(coarse), 4)


class ChunkNaming(unittest.TestCase):
    def test_filename_encodes_pixel_size_and_origin(self):
        self.assertEqual(chunk_filename((-17286000.0, 2202000.0, -17284000.0, 2204000.0)),
                         "vivid-2020_0.5m_-17286000_2202000.tif")
        self.assertEqual(chunk_filename((-17288000.0, 2200000.0, -17284000.0, 2204000.0), pixel_meters=1.0),
                         "vivid-2020_1m_-17288000_2200000.tif")

    def test_export_url(self):
        url = export_url((-17286000.0, 2202000.0, -17284000.0, 2204000.0))
        self.assertTrue(url.startswith(
            "https://geodata.hawaii.gov/arcgis/rest/services/SoH_Imagery/Vivid_2020/ImageServer/exportImage?"))
        self.assertIn("bbox=-17286000,2202000,-17284000,2204000", url)
        self.assertIn("size=4000,4000", url)
        self.assertIn("format=tiff", url)
        self.assertIn("compression=LZW", url)
        self.assertIn("bboxSR=3857", url)
        self.assertIn("imageSR=3857", url)
        # Two-step export: the server streams 50 MB TIFFs unreliably (HTTP 500) with f=image, but
        # renders them fine and hands back an href with f=json
        self.assertIn("f=json", url)
        self.assertNotIn("f=image", url)


class FootprintFilter(unittest.TestCase):
    # A triangle: (0,0), (10,0), (0,10)
    tri = [[(0, 0), (10, 0), (0, 10), (0, 0)]]

    def test_bbox_of_polygon(self):
        self.assertEqual(footprint_bbox(self.tri), (0, 0, 10, 10))

    def test_rect_with_a_corner_inside_polygon_intersects(self):
        self.assertTrue(rect_intersects_polygon((1, 1, 3, 3), self.tri))

    def test_rect_containing_a_polygon_vertex_intersects(self):
        self.assertTrue(rect_intersects_polygon((-1, -1, 1, 1), self.tri))

    def test_rect_crossed_by_an_edge_but_no_vertex_inside_either_way_intersects(self):
        # Thin rectangle across the hypotenuse: corners (4,7)-(7,4) straddle x+y=10
        self.assertTrue(rect_intersects_polygon((4, 4, 7, 7), self.tri))

    def test_rect_in_the_empty_corner_of_the_bbox_does_not_intersect(self):
        # Inside the triangle's bounding box but beyond the hypotenuse
        self.assertFalse(rect_intersects_polygon((7, 7, 9, 9), self.tri))

    def test_rect_far_away_does_not_intersect(self):
        self.assertFalse(rect_intersects_polygon((20, 20, 30, 30), self.tri))


class TiffCheck(unittest.TestCase):
    def test_small_coastal_chunk_is_accepted(self):
        # A chunk that is mostly beyond the footprint LZW-compresses to a few hundred KB (443 KB seen)
        self.assertTrue(looks_like_tiff(b"II*\x00" + bytes(443_045)))

    def test_big_endian_tiff_is_accepted(self):
        self.assertTrue(looks_like_tiff(b"MM\x00*" + bytes(500_000)))

    def test_error_page_is_rejected(self):
        self.assertFalse(looks_like_tiff(b"<html>" + bytes(500_000)))

    def test_stub_with_tiff_magic_is_rejected(self):
        self.assertFalse(looks_like_tiff(b"II*\x00" + bytes(100)))


if __name__ == "__main__":
    unittest.main()
