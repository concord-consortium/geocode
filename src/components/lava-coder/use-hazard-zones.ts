import { KmlDataSource } from "@cesium/engine";
import { useEffect, useState } from "react";
import hazardZonesKml from "../../assets/Volcano_Lava_Flow_Hazard_Zones.kml";

export function useHazardZones() {
  const [hazardZones, setHazardZones] = useState<KmlDataSource | null>(null);

  useEffect(() => {
    // Load and overlay the KML file
    KmlDataSource.load(hazardZonesKml, { clampToGround: true }).then((dataSource) => {
      setHazardZones(dataSource);
      dataSource.show = false; // Initially hide the KML data
    }).catch((error) => {
      console.error("Failed to load KML file:", error);
    });
  }, []);

  return hazardZones;
}
