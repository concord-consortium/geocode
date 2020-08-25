import * as React from "react";
import { inject, observer } from "mobx-react";
import { Map as LeafletMap, LayerGroup, Marker, Popup } from "react-leaflet";
import { BaseComponent } from "../base";
import { StationData } from "../../strain";
import { parseOfflineUNAVCOData } from "../../utilities/unavco-data";
import { iconStation } from "../icons";

interface IProps {
  map: LeafletMap | null;
}

interface IState {
  data: StationData[];
}

@inject("stores")
@observer
export class MapGPSStationsLayer extends BaseComponent<IProps, IState> {

  public render() {
    const { map, minLat, maxLat, minLng, maxLng } = this.props;
    if (!map) return;

    const stationData = this.stores.seismicSimulation.visibleGPSStations();

    const markers = stationData.map(stat => {
      return (
        <Marker key={stat.id}
          title={stat.id}
          position={[stat.latitude, stat.longitude]}
          icon={iconStation}
        >
          <Popup>
            {stat.name}
          </Popup>
        </Marker>
      );
    });

    return (
      <LayerGroup map={map}>
        { markers }
      </LayerGroup>
    );
  }
}
