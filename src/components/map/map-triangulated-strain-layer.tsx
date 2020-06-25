import * as React from "react";
import * as Color from "color";
import * as Leaflet from "leaflet";

import "leaflet-kmz";
import * as KMZFile from "../../assets/data/qfaults.kmz";

// @ts-ignore
import * as RawVelocityDataSet from "../../assets/data/cwu.snaps_nam14.vel";

import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";
import Delaunator from "delaunator";
import axios from "axios";
import strainCalc from "../../strain";
import { StationData, StrainOutput } from "../../strain";
import "../../css/custom-leaflet-icons.css";
import { parse } from "path";
import { stat } from "fs";

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

        // this.getUNAVCOData();

        const initialState: IState = {
          data: [],
        };

        this.state = initialState;
    }

    public componentDidMount() {
        this.parseOfflineUNAVCOData();
    }

    // Polygon data is added to the map directly, so there is no react render
    // This might want to be changed in the future
    public render() {
        return null;
    }

    // This is a multi-step method that pulls UNAVCO GPS data from within the bounds defined in the props
    // Most of it runs asynchronously and updates the state when complete
    // It uses the axios library to handle GET requests
    // [Deprecated: Now using offline parseOfflineUNAVCOData() method for same results]
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
                                analysisCenter: "cwu",
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
                                    id: splitResponseData[0],
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
                    this.buildMesh(outputData);
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

    // This method parses the offline UNAVCO velocity data found within "../../assets/data/cwu.snaps_nam14.vel"
    // It converts the file into a parsable format and extracts
    // the necessary data to be passed onto the buildMesh() method
    private parseOfflineUNAVCOData() {
        const { minLat, maxLat, minLng, maxLng } = this.props;

        const parsedData: string[][] = [];
        // Convert UNAVCO's ASCII file into a computer readable data set
        (RawVelocityDataSet as string).split("\n").forEach((value) => {parsedData.push(value.split(/\ +/g)); });
        const outputData: StationData[] = [];
        const filteredSet: Set<any> = new Set<any>();

        for (let i = 36; i < parsedData.length - 1; i++) {
            if (!filteredSet.has(parsedData[i][1])) {
                filteredSet.add(parsedData[i][1]);
                const station: StationData = {
                    id: parsedData[i][1],
                    longitude: parseFloat(parsedData[i][9]) - 360,
                    latitude: parseFloat(parsedData[i][8]),
                    eastVelocity: parseFloat(parsedData[i][21]),
                    eastVelocityUncertainty: 0.01,
                    northVelocity: parseFloat(parsedData[i][20]),
                    northVelocityUncertainty: 0.01
                };

                if ((station.longitude < maxLng && station.longitude > minLng) &&
                    (station.latitude < maxLat && station.latitude > minLat)) {
                        outputData.push(station);
                }
            }
        }

        this.setState({data: outputData});
        this.buildMesh(outputData);
    }

    // This method creates and displays a mesh based on the GPS stations acquired from getUNAVCOData()
    // It uses Delaunator to calculate the mesh and colors each triangle based on calculated strain
    // The strain calculation can be found in "../../strain.ts"
    private buildMesh(data: StationData[]) {
        const { map } = this.props;

        // Proximity based point removal
        // GPS points that are very close to each other will produce extremely high strain values
        // By removing these points, it becomes easier to plot the data using an infinite scale
        // Other methods of solving this problem would be by plotting the data in a bucketed gradient
        // e.g. 0 - 5: Blue, 5 - 50: Green, 50 - 250: Yellow, 250+: Red
        const removablePoints: Set<string> = new Set<string>();
        for (let i = 0; i < data.length; i++) {
            for (let k = 0; k < data.length; k++) {
                if (i !== k && !removablePoints.has(data[i].id) && !removablePoints.has(data[k].id)) {
                    const dist = Math.sqrt(Math.pow(data[i].latitude - data[k].latitude, 2) +
                                           Math.pow(data[i].longitude - data[k].longitude, 2));
                    if (dist < 0.1) {
                        removablePoints.add(data[i].id);
                    }
                }
            }
        }

        // Output station id for all points removed from the mesh
        // let removedPoints: string = "";
        // removablePoints.forEach(element => {
        //     removedPoints += element + ", ";
        // });
        // console.log(removedPoints);

        const filteredData: StationData[] = data.filter((obj: StationData) => !removablePoints.has(obj.id));

        const points: number[][] = [];
        const coords: number[] = [];
        for (let i = 0; i < filteredData.length; i++) {
            const lat = filteredData[i].latitude;
            const lng = filteredData[i].longitude;

            coords.push(lat);
            coords.push(lng);
            points.push([lat, lng, i]);

        }

        // Delaunator takes in a 1D array of coordinates organized [x1, y1, x2, y2, ...]
        // It outputs a 2D array containing sets of vertecies
        // Each vertex is returned as an index to an array of coordinates
        const mesh = new Delaunator(coords);
        const strainOutputs: StrainOutput[] = [];
        const adjustedStrainValues: number[] = [];
        let strainMin: number = 0;
        let strainMax: number = 0;

        for (let i = 0; i < mesh.triangles.length; i += 3) {
            const strainOutput: StrainOutput = strainCalc({data: [ filteredData[points[mesh.triangles[i]][2]],
                filteredData[points[mesh.triangles[i + 1]][2]],
                filteredData[points[mesh.triangles[i + 2]][2]],
            ]});

            const strain = Math.log10(strainOutput.maxShearStrain);
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
                        fillOpacity: adjustedStrainValues[(i - i % 3) / 3],
                        fillColor: Color.rgb(255, 0, 0).toString()
                    }
                    ).addTo(map);

                const label = Leaflet.divIcon({className: "div-icon",
                                               html: strainOutputs[(i - i % 3) / 3].maxShearStrain.toFixed(2)});
                const marker = Leaflet.marker(Leaflet.latLng(strainOutputs[(i - i % 3) / 3].triangleCenter.latitude,
                                                             strainOutputs[(i - i % 3) / 3].triangleCenter.longitude),
                                              {icon: label}).addTo(map);
            }
        }

        // Additional code for simple display of GPS site velocities as lines
        for (const d of filteredData) {
            if (map) {
                const velocityArrow: Leaflet.Polygon = Leaflet.polygon(
                    [Leaflet.latLng(d.latitude, d.longitude),
                    Leaflet.latLng(d.latitude + d.northVelocity, d.longitude + d.eastVelocity)],
                    {
                        stroke: true,
                        color: "#0000ffff",
                        weight: 3,
                        fillOpacity: 0
                    }).addTo(map);
            }
        }

        if (map) {
            // Instantiate KMZ parser (async)
            const kmzParser = new Leaflet.KMZParser({
                onKMZLoaded: function(layer, name) {
                    layer.addTo(map);
                }
            });
            // Add remote KMZ files as layers (NB if they are 3rd-party servers, they MUST have CORS enabled)
            kmzParser.load(KMZFile);
        }
    }

}
