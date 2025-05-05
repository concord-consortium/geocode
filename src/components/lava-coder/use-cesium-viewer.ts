import type { KmlDataSource, Viewer } from "cesium";
import { useEffect, useRef } from "react";
import hazardZonesKml from "../../assets/Volcano_Lava_Flow_Hazard_Zones.kml";

const Cesium = (window as any).Cesium;

import "cesium/Source/Widgets/widgets.css";

Cesium.Ion.defaultAccessToken = process.env.CESIUM_ION_ACCESS_TOKEN;

const kDefaultXLng = -155.470;
// const kOffsetXLng = 0.2;
const kDefaultYLat = 19.150;
// const kOffsetYLat = 0.2;
const kDefaultZHeight = 132000;
// const kMaxZHeight = kDefaultZHeight;

// const now = new Date();
// const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
// const csClock = new Clock({ currentTime: JulianDate.fromDate(today) });

export function useCesiumViewer(container: Element | null) {
  const viewer = useRef<Viewer | null>(null);
  const hazardZones = useRef<KmlDataSource | null>(null);

  useEffect(() => {
    if (container && !viewer.current) {
      viewer.current = new Cesium.Viewer(container, {
        animation: false,
        baseLayerPicker: true,
        // terrain: Cesium.Terrain.fromWorldTerrain(),
        // imageryProvider: Cesium.createWorldImageryAsync({
        //   style: Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS, // Use Bing Maps Aerial with Labels
        // }),
        fullscreenButton: false,
        vrButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
      }) as Viewer;

      // Tutorial from https://sandcastle.cesium.com/index.html?src=Cesium%2520Widget.html
      // const position = Cartesian3.fromDegrees(-123.0744619, 44.0503706, 500);
      // const heading = CSMath.toRadians(135);
      // const pitch = 0;
      // const roll = 0;
      // const hpr = new HeadingPitchRoll(heading, pitch, roll);
      // const orientation = Transforms.headingPitchRollQuaternion(position, hpr);

      // const entity = widget.current.entities.add({
      //   position,
      //   orientation,
      //   // model: {
      //   //   uri: "../SampleData/models/CesiumAir/Cesium_Air.glb",
      //   //   minimumPixelSize: 128,
      //   //   maximumScale: 20000,
      //   // },
      // });
      // widget.current.trackedEntity = entity;


      // Fly the camera to Hawaii at the given longitude, latitude, and height.
      viewer.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(kDefaultXLng, kDefaultYLat, kDefaultZHeight),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-75.0),
        },
        // move instantaneously to the destination
        easingFunction: () => 1
      });

      // Load and overlay the KML file
      Cesium.KmlDataSource.load(hazardZonesKml).then((dataSource: any) => {
        hazardZones.current = dataSource;
        dataSource.show = false; // Initially hide the KML data
        viewer.current?.dataSources.add(dataSource);
      }).catch((error: any) => {
        console.error("Failed to load KML file:", error);
      });
    }
  }, [container]);

  return { viewer: viewer.current, hazardZones: hazardZones.current };
}
