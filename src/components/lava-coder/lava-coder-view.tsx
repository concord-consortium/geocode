import { createWorldImageryAsync, ImageryLayer, IonWorldImageryStyle } from "@cesium/engine";
import { useEffect, useState } from "react";
import IconButton from "../buttons/icon-button";
import { useCesiumViewer } from "./use-cesium-viewer";

import "./lava-coder-view.css";

interface IProps {
  width: number;
  height: number;
  margin: string;
}

const kVerticalExaggeration = 3;

export function LavaCoderView({ width, height, margin }: IProps) {
  const [lavaCoderElt, setLavaCoderElt] = useState<HTMLDivElement | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const [showHazardZones, setShowHazardZones] = useState(false);
  const [verticalExaggeration, setVerticalExaggeration] = useState(1.0);

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
        const imageryLayer = new ImageryLayer(imageryProvider);
        widget.imageryLayers.removeAll();
        widget.imageryLayers.add(imageryLayer);
      });
    }
  }, [showLabels, widget]);

  function toggleHazardZones() {
    setShowHazardZones(prev => !prev);
  }

  useEffect(() => {
    if (hazardZones) {
      hazardZones.show = showHazardZones;
    }
  }, [hazardZones, showHazardZones]);

  function toggleVerticalExaggeration() {
    setVerticalExaggeration(prev => prev === 1 ? kVerticalExaggeration : 1);
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
  const exaggerateLabel = verticalExaggeration === 1 ? "Exaggerate Elevation (3x)" : "Normal Elevation (1x)";

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
