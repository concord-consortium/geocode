
import { createWorldImageryAsync, ImageryLayer, IonWorldImageryStyle } from "@cesium/engine";
import { useEffect, useState } from "react";
import IconButton from "../buttons/icon-button";
import { useCesiumClickEvent } from "./use-cesium-click-event";
import { useCesiumViewer } from "./use-cesium-viewer";
import { useElevationData } from "./use-elevation-data";
import { useHazardZones } from "./use-hazard-zones";

import "./lava-coder-view.scss";

interface IProps {
  width: number;
  height: number;
  margin: string;
}

const kNormalElevation = 1;
// The vertical exaggeration factor for the terrain. This is used to make the terrain more visually distinct.
const kVerticalExaggeration = 3;

const round6 = (value: number) => Math.round(value * 1000000) / 1000000;

export function LavaCoderView({ width, height, margin }: IProps) {
  const [lavaCoderElt, setLavaCoderElt] = useState<HTMLDivElement | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const hazardZones = useHazardZones();
  const [showHazardZones, setShowHazardZones] = useState(false);
  const [verticalExaggeration, setVerticalExaggeration] = useState(kNormalElevation);

  const viewer = useCesiumViewer(lavaCoderElt);

  useCesiumClickEvent(viewer, (latitude, longitude, elevation) => {
    const elevationFeet = Math.round(elevation * 3.28084);
    // eslint-disable-next-line no-console
    console.log("Clicked at latitude:", round6(latitude), "longitude:", round6(longitude),
                "elevation:", `${Math.round(elevation)}m = ${elevationFeet}ft`);
  });

  function toggleShowLabels() {
    setShowLabels(prev => !prev);
  }

  useEffect(() => {
    if (viewer) {
      const style: IonWorldImageryStyle = showLabels
        ? IonWorldImageryStyle.AERIAL_WITH_LABELS
        : IonWorldImageryStyle.AERIAL;
      createWorldImageryAsync({ style }).then((imageryProvider) => {
        // Remove the old base layer
        const oldBaseLayer = widget.imageryLayers.get(0);
        if (oldBaseLayer) {
          widget.imageryLayers.remove(oldBaseLayer);
        }
        const newBaseLayer = new ImageryLayer(imageryProvider);
        // Add the new base layer at the bottom of the layer stack
        widget.imageryLayers.add(newBaseLayer, 0);
      });
    }
  }, [showLabels, viewer]);

  useElevationData();

  function toggleHazardZones() {
    setShowHazardZones(prev => !prev);
  }

  useEffect(() => {
    if (hazardZones) {
      hazardZones.show = showHazardZones;
    }
  }, [hazardZones, showHazardZones]);

  function toggleVerticalExaggeration() {
    setVerticalExaggeration(prev => prev === kNormalElevation ? kVerticalExaggeration : kNormalElevation);
  }

  useEffect(() => {
    if (viewer) {
      viewer.scene.verticalExaggeration = verticalExaggeration;

      // update hazard zones overlay when vertical exaggeration is changed
      viewer.dataSources.removeAll();
      if (hazardZones) {
        viewer.dataSources.add(hazardZones);
      }
    }
  }, [hazardZones, verticalExaggeration, viewer]);

  const containerStyle: React.CSSProperties = { width, height, margin };

  const showLabelsLabel = showLabels ? "Hide Labels" : "Show Labels";
  const hazardZonesLabel = showHazardZones ? "Hide Hazard Zones" : "Show Hazard Zones";
  const exaggerateLabel = verticalExaggeration === kNormalElevation
                            ? `Exaggerate Elevation (${kVerticalExaggeration}x)`
                            : `Normal Elevation (${kNormalElevation}x)`;

  return (
    <div className="lava-coder-view" style={containerStyle}>
      <div ref={elt => setLavaCoderElt(elt)} className="lava-coder-simulation" />
      <div className="lava-overlay-controls">
        <IconButton className="show-labels-button" label={showLabelsLabel} onClick={() => toggleShowLabels()} />
        <IconButton className="show-hazard-zones-button" label={hazardZonesLabel} onClick={() => toggleHazardZones()} />
        <IconButton className="exaggerate-elevation-button" label={exaggerateLabel} onClick={() => toggleVerticalExaggeration()} />
      </div>
    </div>
  );
}
