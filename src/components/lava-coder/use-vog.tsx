import { Cartesian2, Cartesian3, CesiumWidget, CloudCollection, Color } from "@cesium/engine";
import { autorun } from "mobx";
import { useEffect, useRef } from "react";
import { gridBounds, lavaElevations, lavaSimulation } from "../../stores/lava-simulation-store";
import { elevationAtPoint } from "../../utilities/molasses-utils";

export function useVog(viewer: CesiumWidget | null, verticalExaggeration = 1) {
  const cloudsRef = useRef<null | CloudCollection>(null);

  useEffect(() => {
    if (viewer && !cloudsRef.current) {
      cloudsRef.current = viewer.scene.primitives.add(new CloudCollection({ noiseDetail: 32 }));
    }
  }, [viewer]);

  useEffect(() => {
    return autorun(() => {
      const { coveredCells, raster } = lavaSimulation;

      if (!coveredCells || !lavaElevations || !gridBounds || !raster || !viewer || !cloudsRef.current) return;

      cloudsRef.current.removeAll();

      Math.random();
      for (let i = 0; i < lavaElevations.length; i += 8) {
        for (let j = 0; j < lavaElevations[i].length; j += 8 + Math.floor(Math.random() * 8)) {
          const _i = i + Math.floor(Math.random() * 8);
          const lavaHeight = lavaElevations[_i] ? lavaElevations[_i][j] : undefined;
          if (lavaHeight && lavaHeight > 0) {
            const long = gridBounds.west + (gridBounds.east - gridBounds.west) * (j / lavaElevations[_i].length);
            const lat = gridBounds.north - (gridBounds.north - gridBounds.south) * (_i / lavaElevations.length);
            const elevation = elevationAtPoint(lat, long, raster) + (150 + Math.random() * 100) * verticalExaggeration;
            console.log(` --`, lat, long, elevation);
            cloudsRef.current.add({
              brightness: .75 + Math.random() * .15,
              color: Color.YELLOW.withAlpha(.75),
              position: Cartesian3.fromDegrees(long, lat, elevation),
              scale: new Cartesian2(5000.0, 3000.0),
              slice: .4 + Math.random() * .2,
              maximumSize: new Cartesian3(20.0, 8.0, 20.0)
            });
          }
        }
      }
    });
  }, [verticalExaggeration, viewer]);
}
