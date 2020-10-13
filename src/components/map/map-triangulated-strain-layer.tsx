import * as React from "react";
import * as Leaflet from "leaflet";

import "leaflet-kmz";

import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";
import axios from "axios";
import { StationData } from "../../strain";
import "../../css/custom-leaflet-icons.css";
import * as tinygradient from "tinygradient";
import { LayerGroup, Polygon } from "react-leaflet";

interface IProps {
  map: Leaflet.Map | null;
}

interface IState {
  data: StationData[];
}

// UNAVCO servers often throw 500 errors. This catches and resolves them, allowing the code to continue
axios.interceptors.response.use(
  response => response,
  error => {
    console.log(error.message);
    return Promise.resolve(error);
  }
);

@inject("stores")
@observer
export class MapTriangulatedStrainLayer extends BaseComponent<IProps, IState> {

  // Gradient used for strain triangle coloration
  // Usually data has outliers which skew the data up towards the top
  // Most of the gradient is also skewed towards the top (0.97 and above)
  // This is not an ideal solution because changing the plotted boundaries yields extremely varying results
  // depending on how extreme the outliers are
  // Using standard deviation or some normalization method could fix this
  private gradient: tinygradient.Instance = tinygradient([
    {color: "rgb(238, 226, 112)", pos: 0},
    {color: "rgb(255, 191, 78)", pos: 0.97},
    {color: "rgb(255, 117, 75)", pos: 0.976},
    {color: "rgb(233, 78, 131)", pos: 0.982},
    {color: "rgb(174, 78, 211)", pos: 0.988},
    {color: "rgb(123, 88, 174)", pos: 0.994},
    {color: "rgb(81, 90, 148)", pos: 1}
  ]);

  constructor(props: IProps) {
    super(props);

    const initialState: IState = {
      data: [],
    };

    this.state = initialState;
  }

  public render() {
    const { map } = this.props;
    const { delaunayTriangles, delaunayTriangleStrains, paintStrainMap } = this.stores.seismicSimulation;

    if (!map || !paintStrainMap) return null;

    const triangles = [];
    for (let i = 0; i < delaunayTriangles.length; i++) {
      const triangle = delaunayTriangles[i];
      const [p1, p2, p3] = triangle.map(p => Leaflet.latLng(p[0], p[1]));

      triangles.push(<Polygon
        positions={[p1, p2, p3]} key={`triangle-${i}`}
        stroke={true}
        color="#FFF"
        weight={1}
        fillOpacity={0.8}
        fillColor={this.gradient.rgbAt(delaunayTriangleStrains[i]).toRgbString()}
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
