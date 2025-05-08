import {
  Cartesian3, CesiumWidget, createWorldTerrainAsync, Math as CSMath, ImageryLayer, Ion, KmlDataSource, Rectangle,
  SingleTileImageryProvider, TerrainProvider
} from "@cesium/engine";
import { autorun } from "mobx";
import { useEffect, useRef, useState } from "react";
import hazardZonesKml from "../../assets/Volcano_Lava_Flow_Hazard_Zones.kml";
import { lavaElevations, lavaSimulation } from "../../stores/lava-simulation-store";
import { maxLat, maxLong, minLat, minLong } from "./lava-constants";
import { visualizeLava } from "./visualize-lava";

import "@cesium/engine/Source/Widget/CesiumWidget.css";

Ion.defaultAccessToken = process.env.CESIUM_ION_ACCESS_TOKEN;

const kDefaultXLng = -155.470;
const kDefaultYLat = 19.150;
const kDefaultZHeight = 132000;

export function useCesiumViewer(container: Element | null) {
  const widget = useRef<CesiumWidget | null>(null);
  const [terrainProvider, setTerrainProvider] = useState<TerrainProvider | null>(null);
  const hazardZones = useRef<KmlDataSource | null>(null);
  const lavaLayerRef = useRef<ImageryLayer | null>(null);
  // Two layers are displayed to avoid flickering. A layer is only removed when it is the third oldest.
  // This works as long as the lava always expands. If it ever contracts, this will display incorrectly.
  const oldLavaLayerRef = useRef<ImageryLayer | null>(null);

  useEffect(() => {
    // Add Cesium World Terrain
    createWorldTerrainAsync({ requestVertexNormals: true }).then((provider) => {
      setTerrainProvider(provider);
    });
  }, []);

  useEffect(() => {
    if (container && terrainProvider && !widget.current) {
      widget.current = new CesiumWidget(container, {
        shouldAnimate: true,
        terrainProvider
      });

      // Fly the camera to Hawaii at the given longitude, latitude, and height.
      widget.current.camera.flyTo({
        destination: Cartesian3.fromDegrees(kDefaultXLng, kDefaultYLat, kDefaultZHeight),
        orientation: {
          heading: CSMath.toRadians(0.0),
          pitch: CSMath.toRadians(-75.0),
        },
        // move instantaneously to the destination
        easingFunction: () => 1
      });

      // Load and overlay the KML file
      KmlDataSource.load(hazardZonesKml, { clampToGround: true }).then((dataSource) => {
        hazardZones.current = dataSource;
        dataSource.show = false; // Initially hide the KML data
        widget.current?.dataSources.add(dataSource);
      }).catch((error) => {
        console.error("Failed to load KML file:", error);
      });
    }
    return () => widget.current?.destroy();
  }, [container, terrainProvider]);
  
  // Update the lava display
  useEffect(() => {
    return autorun(() => {
      const { coveredCells, raster } = lavaSimulation;

      if (!coveredCells || !lavaElevations || !raster || !widget.current) return;

      const oldLayer = oldLavaLayerRef.current;
      oldLavaLayerRef.current = lavaLayerRef.current;

      const url = visualizeLava(raster, lavaElevations);
      lavaLayerRef.current = ImageryLayer.fromProviderAsync(
        SingleTileImageryProvider.fromUrl(url, {
          rectangle: Rectangle.fromDegrees(minLong, minLat, maxLong, maxLat)
        })
      );
      if (lavaLayerRef.current) widget.current.imageryLayers.add(lavaLayerRef.current);
      if (oldLayer) widget.current.imageryLayers.remove(oldLayer, true);
    });
  }, []);

  return { widget: widget.current, hazardZones: hazardZones.current };
}
