import { CesiumWidget, KmlDataSource } from "@cesium/engine";
import { useEffect, useState } from "react";
import hazardZonesKml from "../../assets/Volcano_Lava_Flow_Hazard_Zones.kml";

export function useHazardZones(viewer: CesiumWidget | null, showHazardZones: boolean, verticalExaggeration: number) {
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

  return hazardZones;
}
