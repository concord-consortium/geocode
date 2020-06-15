import * as React from "react";
import * as Color from "color";
import * as Leaflet from "leaflet";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";
import Delaunator from "delaunator";
import axios from "axios";
import strainCalc from "../../strain";
import { StationData } from "../../strain";

interface IProps {
    map: Leaflet.Map | null;
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
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

    constructor(props: IProps) {
        super(props);

        this.getUNAVCOData();

        const initialState: IState = {
          data: [],
        };

        this.state = initialState;
      }

    // Polygon data is added to the map directly, so there is no react render
    // This might want to be changed in the future
    public render() {
        return null;
    }

    // This is a multi-step method that pulls UNAVCO GPS data from within the bounds defined in the props
    // Most of it runs asynchronously and updates the state when complete
    // It uses the axios library to handle GET requests
    private getUNAVCOData() {
        const { minLat, maxLat, minLng, maxLng } = this.props;
        const outputData: StationData[] = [];

        const stationURL: string = "https://web-services.unavco.org/gps/metadata/sites/v1?";
        axios.get(stationURL, {
            params: {
                minlatitude: minLat,
                maxlatitude: maxLat,
                minlongitude: minLng,
                maxlongitude: maxLng
            }
        }).then(res => {
                const data: any[] = res.data;
                const filteredSet: Set<any> = new Set<any>();
                const requests: Array<Promise<any>> = [];
                data.forEach(element => {
                    if (!filteredSet.has(element.station_name)) {
                        filteredSet.add(element.station_name);
                        requests.push(axios.get("https://web-services.unavco.org/gps/data/velocity/" + element.id + "/beta", {
                            params: {
                                analysisCenter: "pbo",
                                referenceFrame: "nam08",
                                report: "short",
                                solutionType: "snaps"
                            }
                        }));
                    }

                });

                Promise.all(requests).then((responses) => {
                    responses.forEach(element => {
                        if (!element.response) {
                            if (element.status === 200) {
                                const responseText = element.data;
                                const responseData = responseText.split(/\r|\n|\r/);
                                const splitResponseData = responseData[8].split(",");
                                const station: StationData = {
                                    longitude: parseFloat(splitResponseData[3]) - 360,
                                    latitude: parseFloat(splitResponseData[2]),
                                    eastVelocity: parseFloat(splitResponseData[6]),
                                    eastVelocityUncertainty: 0.01,
                                    northVelocity: parseFloat(splitResponseData[5]),
                                    northVelocityUncertainty: 0.01
                                };
                                outputData.push(station);
                            }
                        }
                    });
                    this.setState({data: outputData});
                    this.buildMesh();
                }).catch(err => {
                    if (err.response) {
                        console.log(err.response);
                    } else {
                        console.log(err);
                    }
                });

            }
        ).catch(err => {
            console.log(err);
        });
    }

    // This method creates and displays a mesh based on the GPS stations acquired from getUNAVCOData()
    // It uses Delaunator to calculate the mesh and colors each triangle based on calculated strain
    // The strain calculation can be found in "../../strain.ts"
    private buildMesh() {
        const { map } = this.props;
        const { data } = this.state;

        const points: number[][] = [];
        const coords: number[] = [];
        for (let i = 0; i < data.length; i++) {
            const lat = data[i].latitude;
            const lng = data[i].longitude;

            coords.push(lat);
            coords.push(lng);
            points.push([lat, lng, i]);

        }

        // Delaunator takes in a 1D array of coordinates organized [x1, y1, x2, y2, ...]
        // It outputs a 2D array containing sets of vertecies
        // Each vertex is returned as an index to an array of coordinates
        const mesh = new Delaunator(coords);
        const strainValues: number[] = [];
        let strainMin: number = 0;
        let strainMax: number = 0;

        for (let i = 0; i < mesh.triangles.length; i += 3) {
            const strain = Math.log10(strainCalc({data: [ data[points[mesh.triangles[i]][2]],
                data[points[mesh.triangles[i + 1]][2]],
                data[points[mesh.triangles[i + 2]][2]],
            ]}));
            // strain = Math.sign(strain) * Math.log10(Math.abs(strain));
            strainValues.push(strain);
            if (i === 0) {
                strainMin = strain;
                strainMax = strain;
            } else {
                strainMax = strain > strainMax ? strain : strainMax;
                strainMin = strain < strainMin ? strain : strainMin;
            }
        }

        for (let i = 0; i < strainValues.length; i++) {
            const percent = (strainValues[i] - strainMin) / (strainMax - strainMin);
            strainValues[i] = percent * (1) + 0;
            strainValues[i] = Number.isNaN(strainValues[i]) ? strainMin : strainValues[i];

        }

        for (let i = 0; i < mesh.triangles.length; i += 3) {
            if (map) {
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

                const polygon: Leaflet.Polygon = Leaflet.polygon(
                    [p1, p2, p3],
                    {
                        stroke: true,
                        color: "#FFF",
                        weight: 1,
                        fillOpacity: strainValues[(i - i % 3) / 3],
                        fillColor: Color.rgb(255, 0, 0).toString()
                    }
                    ).addTo(map);
            }
        }

        // Additional code for simple display of GPS site velocities as lines
        // for (const d of data) {
        //     if (map) {
        //         const velocityArrow: Leaflet.Polygon = Leaflet.polygon(
        //             [Leaflet.latLng(d.latitude, d.longitude),
        //             Leaflet.latLng(d.latitude + d.northVelocity, d.longitude + d.eastVelocity)],
        //             {
        //                 stroke: true,
        //                 color: "#0000ffff",
        //                 weight: 3,
        //                 fillOpacity: 0
        //             }).addTo(map);
        //     }
        // }
    }

}
