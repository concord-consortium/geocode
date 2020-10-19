import * as React from "react";
import * as Leaflet from "leaflet";

import "leaflet-kmz";

import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";
import { StationData } from "../../strain";
import "../../css/custom-leaflet-icons.css";
import { LayerGroup, Polygon } from "react-leaflet";
import { equalIntervalStrainRanges, logarithmicStrainRanges } from "./map-strain-legend";
import { ColorMethod } from "../../stores/seismic-simulation-store";

interface IProps {
  map: Leaflet.Map | null;
}

interface IState {
  data: StationData[];
}

@inject("stores")
@observer
export class MapTriangulatedStrainLayer extends BaseComponent<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    const initialState: IState = {
      data: [],
    };

    this.state = initialState;
  }

  public render() {
    const { map } = this.props;
    const { delaunayTriangles, delaunayTriangleStrains, renderStrainMap,
      strainMapColorMethod } = this.stores.seismicSimulation;

    const isLog = (strainMapColorMethod as ColorMethod) === "logarithmic";

    if (!map || !renderStrainMap) return null;
    const triangles = [];
    for (let i = 0; i < delaunayTriangles.length; i++) {
      const triangle = delaunayTriangles[i];
      const [p1, p2, p3] = triangle.map(p => Leaflet.latLng(p[0], p[1]));

      const strain = isLog ? Math.log10(delaunayTriangleStrains[i]) : delaunayTriangleStrains[i];
      const ranges = isLog ? logarithmicStrainRanges : equalIntervalStrainRanges;

      const range = ranges.slice().reverse().find(r => strain > r.min);
      let fillColor;
      if (range) {
        fillColor = range.color;
      } else {
        fillColor = "#000";
      }

      triangles.push(<Polygon
        positions={[p1, p2, p3]} key={`triangle-${i}`}
        stroke={true}
        color="#FFF"
        weight={1}
        fillOpacity={0.8}
        fillColor={fillColor}
      />);

      // triangles.push(Leaflet.polygon(
      //   [p1, p2, p3],
        // {
        //   stroke: true,
        //   color: "#FFF",
        //   weight: 1,
        //   fillOpacity: 0.8,
        //   fillColor: this.gradient.rgbAt(adjustedStrainValues[(i - i % 3) / 3]).toRgbString()
        // }
      //   ));

      // // calculate the "incenter" of the triangle
      // const perim1 = Math.sqrt(((p1.lat - p2.lat) ** 2) + ((p1.lng - p2.lng) ** 2));
      // const perim2 = Math.sqrt(((p2.lat - p3.lat) ** 2) + ((p2.lng - p3.lng) ** 2));
      // const perim3 = Math.sqrt(((p3.lat - p1.lat) ** 2) + ((p3.lng - p1.lng) ** 2));
      // const perimiter = perim1 + perim2 + perim3;
      // const centLat = ((p1.lat * perim2) + (p2.lat * perim3) + p3.lat * perim1) / perimiter;
      // const centLng = ((p1.lng * perim2) + (p2.lng * perim3) + p3.lng * perim1) / perimiter;
      // const incenter = Leaflet.latLng(centLat, centLng);

      // // Leaflet.divIcon({iconAnchor: incenter})
      // Leaflet.circle(incenter, {radius: 1})
      //   .bindTooltip("" + (Math.round(adjustedStrainValues[(i - i % 3) / 3] * 10000) / 10000), {
      //     permanent: true,
      //     className: "plain-label"
      //   })
      //   .addTo(map);
    }
    return (
      <LayerGroup>
        {triangles}
      </LayerGroup>
    );
  }

}
