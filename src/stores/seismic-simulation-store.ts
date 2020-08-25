import { types } from "mobx-state-tree";
import { parseOfflineUNAVCOData } from "../utilities/unavco-data";

const minLat = 31;
const maxLat = 40;
const minLng = -127;
const maxLng = -115;
const stationData = parseOfflineUNAVCOData(minLat, maxLat, minLng, maxLng);

export const SeismicSimulationStore = types
  .model("seismicSimulation", {
    scenario: "Seismic CA",
    visibleGPSStationIds: types.array(types.string),      // by id
  })
  .actions((self) => ({
    showAllGPSStations() {
      const allIds = stationData.map(stat => stat.id);
      self.visibleGPSStationIds.clear();
      allIds.forEach( id => self.visibleGPSStationIds.push(id) );
    }
  }))
  .views((self) => ({
    visibleGPSStations() {
      return stationData.filter(stat => self.visibleGPSStationIds.includes(stat.id));
    }
  }));

export const seismicSimulation = SeismicSimulationStore.create({});

export type SeismicSimulationModelType = typeof SeismicSimulationStore.Type;
