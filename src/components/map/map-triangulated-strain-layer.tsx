import * as React from "react";
import * as Leaflet from "leaflet";

import "leaflet-kmz";

import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";
import Delaunator from "delaunator";
import axios from "axios";
import strainCalc from "../../strain";
import { StationData, StrainOutput } from "../../strain";
import "../../css/custom-leaflet-icons.css";
import * as tinygradient from "tinygradient";
import { parseOfflineUNAVCOData } from "../../utilities/unavco-data";
import { LayerGroup, Polygon } from "react-leaflet";

interface IProps {
  map: Leaflet.Map | null;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  paintTriangles: boolean;
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
    const { map, paintTriangles } = this.props;

    if (!map || !paintTriangles) return null;

    const { minLat, maxLat, minLng, maxLng } = this.props;

    const data = parseOfflineUNAVCOData(minLat, maxLat, minLng, maxLng);    // FIXME stationDate

    // const { data } = this.state;

    // Proximity based point removal
    // GPS points that are very close to each other will produce extremely high strain values
    // By removing these points, it becomes easier to plot the data using an infinite scale
    // Other methods of solving this problem would be by plotting the data in a bucketed gradient
    // e.g. 0 - 5: Blue, 5 - 50: Green, 50 - 250: Yellow, 250+: Red
    const removablePoints: Set<string> = new Set<string>();
    for (let i = 0; i < data.length; i++) {
      for (let k = i + 1; k < data.length; k++) {
        const dist = Math.sqrt(Math.pow(data[i].latitude - data[k].latitude, 2) +
                    Math.pow(data[i].longitude - data[k].longitude, 2));
        if (dist < 0.1) {
          removablePoints.add(data[i].id);
          break;
        }
      }
    }

    const filteredData: StationData[] = data.filter((obj: StationData) => !removablePoints.has(obj.id));

    const points: number[][] = [];
    const coords: number[] = [];
    for (const station of filteredData) {
      const lat = station.latitude;
      const lng = station.longitude;

      coords.push(lat);
      coords.push(lng);
      points.push([lat, lng]);

    }

    // Delaunator takes in a 1D array of coordinates organized [x1, y1, x2, y2, ...]
    // It outputs a 2D array containing sets of vertices
    // Each vertex is returned as an index to an array of coordinates
    const mesh = new Delaunator(coords);
    const strainOutputs: StrainOutput[] = [];
    const adjustedStrainValues: number[] = [];
    let strainMin: number = 0;
    let strainMax: number = 0;

    for (let i = 0; i < mesh.triangles.length; i += 3) {
      const strainOutput: StrainOutput = strainCalc({data: [ filteredData[mesh.triangles[i]],
        filteredData[mesh.triangles[i + 1]],
        filteredData[mesh.triangles[i + 2]],
      ]});

      const strain = strainOutput.secondInvariant;
      // const strain = Math.log10(strainOutput.maxShearStrain);
      // strain = Math.sign(strain) * Math.log10(Math.abs(strain));
      strainOutputs.push(strainOutput);
      adjustedStrainValues.push(strain);
      if (i === 0) {
        strainMin = strain;
        strainMax = strain;
      } else {
        strainMax = strain > strainMax ? strain : strainMax;
        strainMin = strain < strainMin ? strain : strainMin;
      }
    }

    for (let i = 0; i < strainOutputs.length; i++) {
      const percent = (adjustedStrainValues[i] - strainMin) / (strainMax - strainMin);
      adjustedStrainValues[i] = percent * (1) + 0;
      adjustedStrainValues[i] = Number.isNaN(adjustedStrainValues[i]) ? strainMin : adjustedStrainValues[i];

    }

    const triangles = [];
    for (let i = 0; i < mesh.triangles.length; i += 3) {
      const p1 = Leaflet.latLng(
        points[mesh.triangles[i]][0],
        points[mesh.triangles[i]][1]
      );
      const p2 = Leaflet.latLng(
        points[mesh.triangles[i + 1]][0],
        points[mesh.triangles[i + 1]][1]
      );
      const p3 = Leaflet.latLng(
        points[mesh.triangles[i + 2]][0],
        points[mesh.triangles[i + 2]][1]
      );

      triangles.push(<Polygon
        positions={[p1, p2, p3]} key={`triangle-${i}`}
        stroke={true}
        color="#FFF"
        weight={1}
        fillOpacity={0.8}
        fillColor={this.gradient.rgbAt(adjustedStrainValues[(i - i % 3) / 3]).toRgbString()}
      />);
    }
    return (
      <LayerGroup>
        {triangles}
      </LayerGroup>
    );
  }

}
