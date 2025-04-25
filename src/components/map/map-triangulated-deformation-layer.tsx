import Leaflet from "leaflet";

import "leaflet-kmz";

import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";
import "../../css/custom-leaflet-icons.css";
import { LayerGroup, Polygon, Marker } from "react-leaflet";
import { equalIntervalDeformationRanges, logarithmicDeformationRanges } from "./map-deformation-legend";
import { ColorMethod } from "../../stores/seismic-simulation-store";
import { deformationLabelIcon } from "../icons";

interface IProps {
  map: Leaflet.Map | null;
}

interface IState {
  zoomLevel: number;
}

@inject("stores")
@observer
export class MapTriangulatedDeformationLayer extends BaseComponent<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    const initialState: IState = {
      zoomLevel: props.map ? props.map.getZoom() : 0
    };

    this.state = initialState;
  }

  public componentDidMount() {
    const { map } = this.props;
    if (map) {
      map.on("zoomend", () => {
        this.setState({zoomLevel: map.getZoom()});
      });
    }
  }

  public render() {
    const { map } = this.props;
    const { delaunayTriangles, delaunayTriangleDeformations, renderDeformationMap, renderDeformationLabels,
      deformationMapColorMethod } = this.stores.seismicSimulation;
    const { zoomLevel } = this.state;

    const isLog = (deformationMapColorMethod as ColorMethod) === "logarithmic";

    if (!map || (!renderDeformationMap && !renderDeformationLabels)) return null;
    const triangles = [];
    const labels = [];
    for (let i = 0; i < delaunayTriangles.length; i++) {
      const triangle = delaunayTriangles[i];
      const [p1, p2, p3] = triangle.map(p => Leaflet.latLng(p[0], p[1]));

      const deformation = delaunayTriangleDeformations[i];
      const ranges = isLog ? logarithmicDeformationRanges : equalIntervalDeformationRanges;

      const range = ranges.slice().reverse().find(r => deformation > r.min);
      let strokeColor = "#333";
      let fillColor = "none";
      if (renderDeformationMap) {
        strokeColor = "#FFF";
        if (range) {
          fillColor = range.color;
        } else {
          fillColor = "#000";
        }
      }

      triangles.push(<Polygon
        positions={[p1, p2, p3]} key={`triangle-${i}`}
        stroke={true}
        color={strokeColor}
        weight={1}
        fillOpacity={0.5}
        fillColor={fillColor}
      />);

      if (renderDeformationLabels) {
        // calculate the incenter of the triangle
        const perim1 = Math.sqrt(((p1.lat - p2.lat) ** 2) + ((p1.lng - p2.lng) ** 2));
        const perim2 = Math.sqrt(((p2.lat - p3.lat) ** 2) + ((p2.lng - p3.lng) ** 2));
        const perim3 = Math.sqrt(((p3.lat - p1.lat) ** 2) + ((p3.lng - p1.lng) ** 2));
        const perimeter = perim1 + perim2 + perim3;
        const centLat = ((p1.lat * perim2) + (p2.lat * perim3) + p3.lat * perim1) / perimeter;
        const centLng = ((p1.lng * perim2) + (p2.lng * perim3) + p3.lng * perim1) / perimeter;
        const incenter = Leaflet.latLng(centLat, centLng);
        const minPerimSize = 1.5 - ((zoomLevel - 6) * 0.4);
        const largeSide = zoomLevel > 7 ? perimeter * 0.48 : perimeter * 0.45;
        const smallSide = zoomLevel > 7 ? perimeter * 0.1 : perimeter * 0.25;

        if (perimeter > minPerimSize
            && perim1 < largeSide && perim1 > smallSide && perim2 < largeSide
            && perim2 > smallSide  && perim3 < largeSide && perim3 > smallSide ) {
          const text = deformationLabelIcon(parseFloat(delaunayTriangleDeformations[i].toFixed(1)));
          labels.push(<Marker  key={`deformation-label-${i}`}position={incenter} icon={text} />);
        }
      }
    }
    return (
      <LayerGroup>
        {triangles}
        {labels}
      </LayerGroup>
    );
  }

}
