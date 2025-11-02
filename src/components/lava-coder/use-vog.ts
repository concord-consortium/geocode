import { Cartesian2, Cartesian3, CesiumWidget, CloudCollection, Color } from "@cesium/engine";
import { autorun } from "mobx";
import { useEffect, useRef } from "react";
import { lavaSimulation, vogBounds, vogConcentrations } from "../../stores/lava-simulation-store";
import { elevationAtPoint } from "../../utilities/molasses-utils";

export function useVog(viewer: CesiumWidget | null, verticalExaggeration = 1) {
  const cloudsRef = useRef<null | CloudCollection>(null);

  useEffect(() => {
    if (viewer && !cloudsRef.current) {
      cloudsRef.current = viewer.scene.primitives.add(new CloudCollection({ noiseDetail: 32 }));
      viewer.scene.globe.depthTestAgainstTerrain = true;
    }
  }, [viewer]);

  useEffect(() => {
    return autorun(() => {
      const { voggedCells, raster, ventLatitude, ventLongitude } = lavaSimulation;

      if (!voggedCells || !vogConcentrations || !vogBounds || !raster || !viewer || !cloudsRef.current) return;

      cloudsRef.current.removeAll();

      const ventElevation = elevationAtPoint(ventLatitude, ventLongitude, raster);
      for (let i = 0; i < vogConcentrations.length; i += 8) {
        for (let j = 0; j < vogConcentrations[i].length; j += 8 + Math.floor(Math.random() * 8)) {
          const _i = i + Math.floor(Math.random() * 8);
          const vogConcentration = vogConcentrations[_i] ? vogConcentrations[_i][j] : undefined;
          if (vogConcentration && vogConcentration > 0) {
            const concentrationFactor = Math.min(1, vogConcentration / 10);
            const lat = vogBounds.north - (vogBounds.north - vogBounds.south) * (_i / vogConcentrations.length);
            const long = vogBounds.west + (vogBounds.east - vogBounds.west) * (j / vogConcentrations[_i].length);
            const dLat = lat - ventLatitude;
            const dLong = long - ventLongitude;
            const dist = Math.sqrt(dLat * dLat + dLong * dLong);
            const _distFactor = Math.log(dist * 1000);
            const distFactor = _distFactor ** 2;
            const elevationFactor = Math.random() * 100 * verticalExaggeration;
            const elevation = Math.max(elevationAtPoint(lat, long, raster) + elevationFactor,
              ventElevation + (50 * distFactor * verticalExaggeration) + elevationFactor);
            console.log(` --`, lat, long, dist, distFactor, elevation);
            cloudsRef.current.add({
              brightness: .75 + Math.random() * .15,
              // color: Color.YELLOW.withAlpha(.8 - .01 * distFactor),
              color: Color.DARKGRAY.withAlpha(.2 + .6 * concentrationFactor),
              position: Cartesian3.fromDegrees(long, lat, elevation),
              scale: new Cartesian2(3000 + 500 * distFactor, 2000 + 250 * distFactor),
              slice: .4 + Math.random() * .2,
              maximumSize: new Cartesian3(20.0, 8.0, 20.0)
            });
          }
        }
      }
    });
  }, [verticalExaggeration, viewer]);
}
