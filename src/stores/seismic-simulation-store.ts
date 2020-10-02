import { types } from "mobx-state-tree";
import { parseOfflineUNAVCOData } from "../utilities/unavco-data";
import { StationData } from "../strain";

const minLat = 32;
const maxLat = 42;
const minLng = -127;
const maxLng = -115;
const stationData = parseOfflineUNAVCOData(minLat, maxLat, minLng, maxLng);

export const SeismicSimulationStore = types
  .model("seismicSimulation", {
    scenario: "Seismic CA",
    visibleGPSStationIds: types.array(types.string),      // by id
    selectedGPSStationId: types.maybe(types.string),
    showVelocityArrows: false
  })
  .actions((self) => ({
    showGPSStations(stations: StationData[]) {
      self.visibleGPSStationIds.clear();
      stations.forEach( stat => self.visibleGPSStationIds.push(stat.id) );
    },
    selectGPSStation(id: string) {
      self.selectedGPSStationId = id;
    },
    setShowVelocityArrows(show: boolean) {
      self.showVelocityArrows = show;
    },
    reset() {
      self.visibleGPSStationIds.clear();
      self.selectedGPSStationId = undefined;
      self.showVelocityArrows = false;
    }
  }))
  .views((self) => ({
    get allGPSStations() {
      return stationData;
    },
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
