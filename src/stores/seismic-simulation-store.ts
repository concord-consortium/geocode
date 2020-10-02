import { types } from "mobx-state-tree";
import { parseOfflineUNAVCOData } from "../utilities/unavco-data";
import { StationData } from "../strain";

const minLat = 32;
const maxLat = 42;
const minLng = -127;
const maxLng = -115;
const stationData = parseOfflineUNAVCOData(minLat, maxLat, minLng, maxLng);

// Percentage within the drawn square from left-to-right for x and from top-to-bottom for y
// so [0.1,0.9] is close to the left edge, close to the top.
const deformationSite1 = [0.75, 0.1];
const deformationSite2 = [0.6, 0.85];
const deformationSite3 = [0.2, 0.5];

export const SeismicSimulationStore = types
  .model("seismicSimulation", {
    scenario: "Seismic CA",
    visibleGPSStationIds: types.array(types.string),      // by id
    selectedGPSStationId: types.maybe(types.string),

    deformationModelStep: 0,
    deformationModelSpeed: 100,      // steps / second
    deformationModelEndStep: 500,
    showVelocityArrows: false,

    deformationBlock1Speed: 0,
    deformationBlock1Direction: 0,
    deformationBlock2Speed: 0,
    deformationBlock2Direction: 0

  })
  .actions((self) => ({
    showGPSStations(stations: StationData[]) {
      self.visibleGPSStationIds.clear();
      stations.forEach( stat => self.visibleGPSStationIds.push(stat.id) );
    },
    selectGPSStation(id: string) {
      self.selectedGPSStationId = id;
    },
    setDeformationStep(step: number) {
      self.deformationModelStep = step;
    },
    resetDeformationModel() {
      self.deformationModelStep = 0;
    },
    setShowVelocityArrows(show: boolean) {
      self.showVelocityArrows = show;
    }
  }))
  .actions((self) => ({
    startDeformationModel() {
      self.deformationModelStep = 0;

      const startTime = window.performance.now();

      const updateStep = () => {
        const dt = (window.performance.now() - startTime) / 1000;   // seconds since start
        const step = Math.floor(dt * self.deformationModelSpeed);
        // console.log(startTime, dt, step);
        self.setDeformationStep(step);
        if (step < self.deformationModelEndStep) {
          window.requestAnimationFrame(updateStep);
        }
      };

      window.requestAnimationFrame(updateStep);
    },
    setBlockVelocity(block: number, speed: number, direction: number) {
      if (block === 1) {
        self.deformationBlock1Speed = speed;
        self.deformationBlock1Direction = direction;
      } else {
        self.deformationBlock2Speed = speed;
        self.deformationBlock2Direction = direction;
      }
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
    },
    get deformationSites() {
      return [deformationSite1, deformationSite2, deformationSite3];
    }
  }));

export const seismicSimulation = SeismicSimulationStore.create({});

export type SeismicSimulationModelType = typeof SeismicSimulationStore.Type;
