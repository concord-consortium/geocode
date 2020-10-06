import { types } from "mobx-state-tree";
import { parseOfflineUNAVCOData } from "../utilities/unavco-data";
import { StationData } from "../strain";
import { Filter, Range } from "./data-sets";

const minLat = 32;
const maxLat = 42;
const minLng = -127;
const maxLng = -115;

const stationData = parseOfflineUNAVCOData(minLat, maxLat, minLng, maxLng);

// Percentage within the drawn square from left-to-right for x and from top-to-bottom for y
// so [0.1,0.9] is close to the left edge, close to the top.
const deformationSite1 = [0.75, 0.2];
const deformationSite2 = [0.6, 0.85];
const deformationSite3 = [0.2, 0.6];

export const SeismicSimulationStore = types
  .model("seismicSimulation", {
    scenario: "Seismic CA",
    visibleGPSStationIds: types.array(types.string),      // by id
    selectedGPSStationId: types.maybe(types.string),

    deformationModelStep: 0,
    deformationModelSpeed: 100,      // steps / second
    deformationModelEndStep: 500,
    showVelocityArrows: false,

    deformSpeedPlate1: 0,
    deformDirPlate1: 0,
    deformSpeedPlate2: 0,
    deformDirPlate2: 0,
    deformMaxSpeed: 30,

    strainMapMinLat: -90,
    strainMapMinLng: -180,
    strainMapMaxLat: 90,
    strainMapMaxLng: 180,
    paintStrainMap: false,
  })
  .actions((self) => ({
    showGPSStations(stations: StationData[] | string) {
      self.visibleGPSStationIds.clear();
      if (typeof stations === "string") {
        self.visibleGPSStationIds.push(stations);
      } else {
        stations.forEach( stat => self.visibleGPSStationIds.push(stat.id) );
      }
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
    },
    setStrainMapBounds(bounds: Filter) {
      if (bounds.latitude && (bounds.latitude as Range).min) {
        self.strainMapMinLat = (bounds.latitude as Range).min as number;
      }
      if (bounds.longitude && (bounds.longitude as Range).min) {
        self.strainMapMinLng = (bounds.longitude as Range).min as number;
      }
      if (bounds.latitude && (bounds.latitude as Range).max) {
        self.strainMapMaxLat = (bounds.latitude as Range).max as number;
      }
      if (bounds.longitude && (bounds.longitude as Range).max) {
        self.strainMapMaxLng = (bounds.longitude as Range).max as number;
      }
      // FIXME
      self.paintStrainMap = true;
    },
    reset() {
      self.visibleGPSStationIds.clear();
      self.selectedGPSStationId = undefined;
      self.showVelocityArrows = false;
      self.deformationModelStep = 0;
      self.strainMapMinLat = -90;
      self.strainMapMinLng = -180;
      self.strainMapMaxLat = 90;
      self.strainMapMaxLng = 180;
      self.paintStrainMap = false;
    }
  }))
  .actions((self) => ({
    startDeformationModel() {
      self.deformationModelStep = 0;

      const startTime = window.performance.now();

      const updateStep = () => {
        const dt = (window.performance.now() - startTime) / 1000;   // seconds since start
        const step = Math.floor(dt * self.deformationModelSpeed);
        self.setDeformationStep(step);
        if (step < self.deformationModelEndStep) {
          window.requestAnimationFrame(updateStep);
        }
      };

      window.requestAnimationFrame(updateStep);
    },
    setPlateVelocity(block: number, speed: number, direction: number) {
      if (block === 1) {
        self.deformSpeedPlate1 = speed;
        self.deformDirPlate1 = 180 - direction;
      } else {
        self.deformSpeedPlate2 = speed;
        self.deformDirPlate2 = 180 - direction;
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
    },
    get deformationSimulationProgress() {
      return self.deformationModelStep / self.deformationModelEndStep;
    }
  }));

export const seismicSimulation = SeismicSimulationStore.create({});

export type SeismicSimulationModelType = typeof SeismicSimulationStore.Type;
