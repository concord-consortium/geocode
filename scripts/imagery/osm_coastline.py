"""Build land polygons for the Hawaiian Islands from the OpenStreetMap coastline.

mask_water.py uses these to make the water in the imagery transparent, so only land is drawn over
LavaCoder's flat ocean layer. OSM's coastline is traced from modern imagery and maintained (it has
the land added by the 2018 Kapoho eruption, for example); the state's official coastline is from
1983 USGS maps and misses decades of new lava coast.

One Overpass query covers every island. OSM splits each island's coastline into many open ways,
which are joined into rings; closed ways (most islets) come through GDAL's OSM driver as
multipolygons and are added as they are. The coastline has no lakes, so every ring is its own
island rather than a hole.

The data is (c) OpenStreetMap contributors under the ODbL, so tiles masked with it must credit
OpenStreetMap (kVividCredit in src/hooks/lava-coder/use-world-imagery.ts).

usage: /opt/homebrew/bin/python3 osm_coastline.py   # writes build/osm-land.geojson
"""
import os
import urllib.parse
import urllib.request

from osgeo import ogr, osr

ogr.UseExceptions()
OVERPASS = "https://overpass-api.de/api/interpreter"
USER_AGENT = "concord-geocode-imagery/1.0 (Concord Consortium LavaCoder; tfristoe@concord.org)"
# South, west, north, east: every main island, Niʻihau to the Big Island, with margin
BBOX = (18.80, -160.40, 22.35, -154.70)
RAW = os.path.join("build", "osm-coastline.osm")
OUT = os.path.join("build", "osm-land.geojson")


def _add_rings(geom, out):
    if ogr.GT_Flatten(geom.GetGeometryType()) == ogr.wkbPolygon:
        for i in range(geom.GetGeometryCount()):
            polygon = ogr.Geometry(ogr.wkbPolygon)
            polygon.AddGeometry(geom.GetGeometryRef(i).Clone())
            out.AddGeometry(polygon)
    else:
        for i in range(geom.GetGeometryCount()):
            _add_rings(geom.GetGeometryRef(i), out)


def land_polygons(open_ways, closed_areas):
    """MultiPolygon of every island: open coastline ways joined into rings, plus closed islets."""
    edges = ogr.Geometry(ogr.wkbGeometryCollection)
    for way in open_ways:
        edges.AddGeometry(way)
    land = ogr.Geometry(ogr.wkbMultiPolygon)
    if edges.GetGeometryCount():
        _add_rings(ogr.BuildPolygonFromEdges(edges, bBestEffort=1, bAutoClose=0, dfTolerance=1e-9), land)
    for area in closed_areas:
        _add_rings(area, land)
    return land


def fetch():
    south, west, north, east = BBOX
    query = f'[out:xml][timeout:300];way["natural"="coastline"]({south},{west},{north},{east});(._;>;);out body;'
    request = urllib.request.Request(OVERPASS, data=urllib.parse.urlencode({"data": query}).encode(),
                                     headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=400) as response, open(RAW, "wb") as out:
        out.write(response.read())


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    os.makedirs("build", exist_ok=True)
    print(f"Fetching the OSM coastline for {BBOX} from Overpass", flush=True)
    fetch()
    src = ogr.Open(RAW)
    ways = [f.GetGeometryRef().Clone() for f in src.GetLayerByName("lines") if f.GetGeometryRef() is not None]
    islets = src.GetLayerByName("multipolygons")
    islets.SetAttributeFilter("natural = 'coastline'")
    areas = [f.GetGeometryRef().Clone() for f in islets]
    land = land_polygons(ways, areas)

    driver = ogr.GetDriverByName("GeoJSON")
    if os.path.exists(OUT):
        driver.DeleteDataSource(OUT)
    ds = driver.CreateDataSource(OUT)
    srs = osr.SpatialReference()
    srs.ImportFromEPSG(4326)
    layer = ds.CreateLayer("land", srs, ogr.wkbMultiPolygon)
    feature = ogr.Feature(layer.GetLayerDefn())
    feature.SetGeometry(land)
    layer.CreateFeature(feature)
    ds = None
    sizes = sorted((land.GetGeometryRef(i).GetArea() for i in range(land.GetGeometryCount())), reverse=True)
    print(f"{len(ways)} open ways + {len(areas)} closed islets -> {land.GetGeometryCount()} land polygons "
          f"({sum(s > 0.01 for s in sizes)} larger than ~100 km²) -> {OUT}")


if __name__ == "__main__":
    main()
