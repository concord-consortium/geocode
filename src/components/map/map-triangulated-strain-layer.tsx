import * as React from "react";
import * as Leaflet from "leaflet";
import { inject, observer } from "mobx-react";
import { BaseComponent } from "../base";
import { LayerGroup, Polygon, Marker} from "react-leaflet";
import axios from "axios";

interface IProps {
    map: Leaflet.Map | null;
}

interface IState {
    data: string[][];
    markers: React.ReactElement[];
}

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
          markers: [],
        };

        this.state = initialState;
      }

    public render() {
        const { map } = this.props;
        const { markers } = this.state;

        return(
            <LayerGroup map={map}>
                {markers}
            </LayerGroup>
        );
    }

    private getUNAVCOData() {
        const outputData: string[][] = [];

        const stationURL: string = "https://web-services.unavco.org/gps/metadata/sites/v1?";
        axios.get(stationURL, {
            params: {
                minlatitude: 35,
                maxlatitude: 37,
                minlongitude: -121,
                maxlongitude: -119
            }
        }).then(res => {
                const data: any[] = res.data;
                const filteredSet: Set<any> = new Set<any>();
                const filteredData: any[] = [];
                const requests: Array<Promise<any>> = [];
                data.forEach(element => {
                    if (!filteredSet.has(element.station_name)) {
                        filteredSet.add(element.station_name);
                        requests.push(axios.get("https://web-services.unavco.org/gps/data/velocity/" + element.id + "/beta", {
                            params: {
                                analysisCenter: "pbo",
                                referenceFrame: "igs08",
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
                                outputData.push(responseData[8].split(","));
                                filteredData.push(outputData);
                            }
                        }
                    });
                    this.setState({data: outputData});
                    this.buildMarkers();
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

    private buildMarkers() {
        const { map } = this.props;
        const { data } = this.state;
        data.forEach(element => {
            const lat = parseFloat(element[2]);
            const lng = parseFloat(element[3]) - 360;
            const velN = parseFloat(element[5]);
            const velE = parseFloat(element[6]);
            if (map) {
                const polygon: Leaflet.Polygon = Leaflet.polygon(
                    [Leaflet.latLng(lat, lng), Leaflet.latLng(lat + velN, lng + velE)]
                    ).addTo(map);
            }
        });
    }

}
