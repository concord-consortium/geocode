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
    selectedGPSStationId: types.maybe(types.string),
  })
  .actions((self) => ({
    showAllGPSStations() {
      const allIds = stationData.map(stat => stat.id);
      self.visibleGPSStationIds.clear();
      allIds.forEach( id => self.visibleGPSStationIds.push(id) );
    },
    selectGPSStation(id: string) {
      self.selectedGPSStationId = id;
    }
  }))
  .views((self) => ({
    get visibleGPSStations() {
      return stationData.filter(stat => self.visibleGPSStationIds.includes(stat.id));
    },
    get selectedGPSStation() {
      if (!self.selectedGPSStationId) return;
      return stationData.find(stat => stat.id === self.selectedGPSStationId!);
    }
  }));

export const seismicSimulation = SeismicSimulationStore.create({});

export type SeismicSimulationModelType = typeof SeismicSimulationStore.Type;
