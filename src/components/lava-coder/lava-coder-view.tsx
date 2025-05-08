
import { createWorldImageryAsync, ImageryLayer, IonWorldImageryStyle } from "@cesium/engine";
import { useEffect, useState } from "react";
import { lavaSimulation } from "../../stores/lava-simulation-store";
import IconButton from "../buttons/icon-button";
import RasterWorker from "./raster.worker";
import { useCesiumViewer } from "./use-cesium-viewer";

import "./lava-coder-view.css";

interface IProps {
  width: number;
  height: number;
  margin: string;
}

const kNormalElevation = 1;
// The vertical exaggeration factor for the terrain. This is used to make the terrain more visually distinct.
const kVerticalExaggeration = 3;

export function LavaCoderView({ width, height, margin }: IProps) {
  const [lavaCoderElt, setLavaCoderElt] = useState<HTMLDivElement | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const [showHazardZones, setShowHazardZones] = useState(false);
  const [verticalExaggeration, setVerticalExaggeration] = useState(kNormalElevation);

  const { hazardZones, widget } = useCesiumViewer(lavaCoderElt);

  function toggleShowLabels() {
    setShowLabels(prev => !prev);
  }

  useEffect(() => {
    if (widget) {
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
  }, [showLabels, widget]);

  // Load the elevation data
  useEffect(() => {
    if (lavaSimulation.raster) return;

    const rasterWorker = new RasterWorker();
    rasterWorker.onmessage = (e) => {
      try {
        const { status } = e.data;
        if (status === "rasterParsed") {
          lavaSimulation.setRaster(e.data.raster);
          rasterWorker.terminate();
        }
      } catch (error) {
        console.error("Error handling worker message:", error, e);
      }
    };

    rasterWorker.postMessage({ type: "start" });

    return () => {
      rasterWorker.terminate();
    };
  }, []);

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
    if (widget) {
      widget.scene.verticalExaggeration = verticalExaggeration;

      // update hazard zones overlay when vertical exaggeration is changed
      widget.dataSources.removeAll();
      if (hazardZones) {
        widget.dataSources.add(hazardZones);
      }
    }
  }, [hazardZones, verticalExaggeration, widget]);

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
