import { Cartographic, CesiumWidget, KmlDataSource, Math as CSMath, Cartesian3, Ellipsoid } from "@cesium/engine";
import { useCallback, useEffect, useState } from "react";
import hazardZonesKml from "../../assets/Volcano_Lava_Flow_Hazard_Zones.kml";

// Convert array of Cartesian3 to Cartographic
function cartesianArrayToCartographic(positions: Cartesian3[]): Cartographic[] {
  return positions.map(pos => Cartographic.fromCartesian(pos, Ellipsoid.WGS84));
}

function pointInPolygon(lat: number, lon: number, positions: Cartesian3[]): boolean {
  // Convert positions to [lon, lat] pairs
  const cartographicPositions = cartesianArrayToCartographic(positions);
  const polygon = cartographicPositions.map(pos => [pos.longitude, pos.latitude]);
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lon < (xj - xi) * (lat - yi) / (yj - yi + Number.EPSILON) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function useHazardZones(viewer: CesiumWidget | null, showHazardZones: boolean, verticalExaggeration: number) {
  const [hazardZones, setHazardZones] = useState<KmlDataSource | null>(null);

  const isPointInHazardZone = useCallback((latitude: number, longitude: number) => {
    if (!hazardZones) return false;

    const latitudeRadians = CSMath.toRadians(latitude);
    const longitudeRadians = CSMath.toRadians(longitude);
    const hazardZoneEntities = hazardZones.entities.values;
    for (const entity of hazardZoneEntities) {
      if (entity.polygon?.hierarchy) {
        const hierarchy = entity.polygon.hierarchy.getValue();
        // hierarchy.positions is an array of Cartographic positions
        if (pointInPolygon(latitudeRadians, longitudeRadians, hierarchy.positions)) {
          return true;
        }
      }
    }
    return false;
  }, [hazardZones]);

  useEffect(() => {
    // Load and overlay the KML file
    KmlDataSource.load(hazardZonesKml, { clampToGround: true }).then((dataSource) => {
      setHazardZones(dataSource);
      dataSource.show = false; // Initially hide the KML data
    }).catch((error) => {
      console.error("Failed to load KML file:", error);
    });
  }, []);

  useEffect(() => {
    if (hazardZones) {
      hazardZones.show = showHazardZones;
    }
  }, [hazardZones, showHazardZones]);

  useEffect(() => {
    if (viewer) {
      // update hazard zones overlay when vertical exaggeration is changed
      viewer.dataSources.removeAll();
      if (hazardZones) {
        viewer.dataSources.add(hazardZones);
      }
    }
  }, [hazardZones, verticalExaggeration, viewer]);

  return { hazardZones, isPointInHazardZone };
}
