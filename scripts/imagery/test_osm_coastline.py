import unittest

from osgeo import ogr

from osm_coastline import land_polygons

ogr.UseExceptions()


def line(*points):
    g = ogr.Geometry(ogr.wkbLineString)
    for x, y in points:
        g.AddPoint_2D(x, y)
    return g


def area(polygons):
    return sum(polygons.GetGeometryRef(i).GetArea() for i in range(polygons.GetGeometryCount()))


class LandPolygons(unittest.TestCase):
    def test_open_ways_join_into_an_island(self):
        # OSM splits a coastline into many open ways that only close as a ring
        ways = [line((0, 0), (4, 0), (4, 4)), line((4, 4), (0, 4), (0, 0))]
        land = land_polygons(ways, [])
        self.assertEqual(land.GetGeometryCount(), 1)
        self.assertAlmostEqual(area(land), 16)

    def test_separate_islands_stay_separate_instead_of_becoming_holes(self):
        ways = [line((0, 0), (4, 0), (4, 4), (0, 4), (0, 0)), line((10, 0), (12, 0), (12, 2), (10, 2), (10, 0))]
        land = land_polygons(ways, [])
        self.assertEqual(land.GetGeometryCount(), 2)
        self.assertAlmostEqual(area(land), 20)

    def test_closed_islets_are_included(self):
        islet = ogr.CreateGeometryFromWkt("MULTIPOLYGON (((20 20, 21 20, 21 21, 20 21, 20 20)))")
        land = land_polygons([line((0, 0), (4, 0), (4, 4), (0, 4), (0, 0))], [islet])
        self.assertEqual(land.GetGeometryCount(), 2)
        self.assertAlmostEqual(area(land), 17)


if __name__ == "__main__":
    unittest.main()
