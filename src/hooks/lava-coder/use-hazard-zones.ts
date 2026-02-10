// import { CesiumWidget } from "@cesium/engine";
import { CesiumWidget, KmlDataSource } from "@cesium/engine";
import { useEffect } from "react";
import hazardZonesKml from "../../assets/Volcano_Lava_Flow_Hazard_Zones.kml";
import { lavaSimulation } from "../../stores/lava-simulation-store";

export function useHazardZones(viewer: CesiumWidget | null, showHazardZones: boolean, verticalExaggeration: number) {
  const { hazardZones } = lavaSimulation;

  useEffect(() => {
    // Load and overlay the KML file
    KmlDataSource.load(hazardZonesKml, { clampToGround: true }).then((dataSource) => {
      lavaSimulation.setHazardZones(dataSource);
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
}
