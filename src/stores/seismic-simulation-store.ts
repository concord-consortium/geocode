import { IModelType, IMSTArray, Instance, ISimpleType, types, _NotCustomized } from "mobx-state-tree";
import { parseOfflineUNAVCOData } from "../utilities/unavco-data";
import deformationCalc, { StationData, DeformationOutput } from "../deformation";
import { Filter, Range } from "./data-sets";
import Delaunator from "delaunator";
import { SeismicSimulationAuthorSettings, SeismicSimulationAuthorSettingsProps } from "./stores";
import { deg2rad } from "../utilities/coordinateSpaceConversion";

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

export type ColorMethod = "logarithmic" | "equalInterval";

export const Friction = types.enumeration("type", ["low", "medium", "high"]);
export const EarthquakeControl = types.enumeration("type", ["none", "auto", "user"]);

export const deformationCase = types.model({year: types.number, deformation: types.number});
export const deformationCases = types.array(deformationCase);
export const deformationGroup = types.model({group: types.number, values: deformationCases});
export const deformationRuns = types.array(deformationGroup);

export interface IDeformationGroup extends Instance<typeof deformationGroup> {}
export interface IDeformationRuns extends Instance<typeof deformationRuns> {}
export interface IDeformationCase extends Instance<typeof deformationCase> {}
export interface IDeformationCases extends Instance<typeof deformationCases> {}

export const SeismicSimulationStore = types
  .model("seismicSimulation", {
    scenario: "Seismic CA",
    visibleGPSStationIds: types.array(types.string),      // by id
    selectedGPSStationId: types.maybe(types.string),
    showVelocityArrows: false,

    deformationCurrentRunGroup: 0,
    deformationHistory: deformationRuns,
    deformationModelStep: 0,
    deformationModelEndStep: 500000,    // years
    deformationModelTotalClockTime: 5,  // seconds

    deformationModelWidthKm: 50,    // km
    deformationModelApparentWidthKm: 50,    // model width as indicated by the scale marker (km)
    deformationModelFaultAngle: 0,

    deformationModelEarthquakeControl: types.optional(EarthquakeControl, "none"),
    deformationModelFrictionCategory: types.optional(Friction, "low"),
    deformationModelFrictionLow: 5,     // total plate motion before earthquake (km)
    deformationModelFrictionMedium: 10,
    deformationModelFrictionHigh: 20,

    deformationModelUserEarthquakeCount: 0,
    deformationModelUserEarthquakeLatestStep: 0,

    deformationModelRainbowLines: false,
    deformationModelShowYear: true,

    // changes the visible value for years passed, and when students step through years manually with blocks
    deformationModelApparentYearScaling: 1,

    deformSpeedPlate1: 0,     // mm/yr
    deformDirPlate1: 0,       // º from N
    deformSpeedPlate2: 0,
    deformDirPlate2: 0,
    deformMaxSpeed: 50,

    deformationMapMinLat: -90,
    deformationMapMinLng: -180,
    deformationMapMaxLat: 90,
    deformationMapMaxLng: 180,
    deformationMapColorMethod: types.optional(types.string, "logarithmic"),
    renderDeformationMap: false,
    renderDeformationLabels: false,
  })
  .volatile(self => ({
    delaunayTriangles: [] as number[][][],
    delaunayTriangleDeformations: [] as number[],
  }))
  .views((self) => ({
    get relativeDeformDirPlate1() {
      // deformDirPlate1 and deformDirPlate2 are rotate 180 from user request, which is why we add instead of subtract
      return self.deformDirPlate1 +  self.deformationModelFaultAngle;
    },
    get relativeDeformDirPlate2() {
      return self.deformDirPlate2 +  self.deformationModelFaultAngle;
    }
  }))
  .views((self) => ({
    get deformationModelSpeed() {
      return self.deformationModelEndStep / self.deformationModelTotalClockTime;
    },
    get deformationModelMaxDisplacementBeforeEarthquake() {
      switch (self.deformationModelFrictionCategory) {
        case "low":
          return self.deformationModelFrictionLow;
        case "medium":
          return self.deformationModelFrictionMedium;
        case "high":
          return self.deformationModelFrictionHigh;
      }
    },
    get deformationModelEarthquakesEnabled() {
      return self.deformationModelEarthquakeControl === "auto" || self.deformationModelEarthquakeControl === "user";
    },
    get relativeVerticalSpeed() {   // mm/yr
      const { deformSpeedPlate1, relativeDeformDirPlate1, deformSpeedPlate2, relativeDeformDirPlate2 } = this;

      const plate1VerticalSpeed = Math.cos(deg2rad(relativeDeformDirPlate1)) * deformSpeedPlate1;
      const plate2VerticalSpeed = Math.cos(deg2rad(relativeDeformDirPlate2)) * deformSpeedPlate2;

      const relativeSpeed = plate1VerticalSpeed - plate2VerticalSpeed;
      return relativeSpeed;
    },
    get relativeHorizontalSpeed() {   // mm/yr
      const { deformSpeedPlate1, relativeDeformDirPlate1, deformSpeedPlate2, relativeDeformDirPlate2 } = this;

      const plate1HorizontalSpeed = Math.sin(deg2rad(relativeDeformDirPlate1)) * deformSpeedPlate1;
      const plate2HorizontalSpeed = Math.sin(deg2rad(relativeDeformDirPlate2)) * deformSpeedPlate2;

      const relativeSpeed = plate1HorizontalSpeed - plate2HorizontalSpeed;
      return relativeSpeed;
    },
  }))
  .actions((self) => {
    return {
      loadAuthorSettingsData: (data: SeismicSimulationAuthorSettings) => {
        Object.keys(data).forEach((key: SeismicSimulationAuthorSettingsProps) => {
          // annoying `as any ... as any` is needed because we're mixing bool and non-bool props, which combine to never
          // see https://github.com/microsoft/TypeScript/issues/31663
          (self[key] as any) = data[key] as any;
        });
      },
    };
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
      self.deformationModelUserEarthquakeCount = 0;
      self.deformationModelUserEarthquakeLatestStep = 0;
    },
    setShowVelocityArrows(show: boolean) {
      self.showVelocityArrows = show;
    },
    setDeformationMapBounds(stations: StationData[]) {
      self.renderDeformationMap = false;
      self.renderDeformationLabels = false;

      self.delaunayTriangles = [];
      self.delaunayTriangleDeformations = [];

      // reset values first
      self.deformationMapMinLat = -90;
      self.deformationMapMinLng = -180;
      self.deformationMapMaxLat = 90;
      self.deformationMapMaxLng = 180;

      // Proximity based point removal
      // GPS points that are very close to each other will produce extremely high deformation values
      // By removing these points, it becomes easier to plot the data using an infinite scale
      // Other methods of solving this problem would be by plotting the data in a bucketed gradient
      // e.g. 0 - 5: Blue, 5 - 50: Green, 50 - 250: Yellow, 250+: Red
      const removablePoints: Set<string> = new Set<string>();
      for (let i = 0; i < stations.length; i++) {
        for (let k = i + 1; k < stations.length; k++) {
          const dist = Math.sqrt(Math.pow(stations[i].latitude - stations[k].latitude, 2) +
                      Math.pow(stations[i].longitude - stations[k].longitude, 2));
          if (dist < 0.18) {
            removablePoints.add(stations[i].id);
            break;
          }
        }
      }

      const filteredData: StationData[] = stations.filter(s => !removablePoints.has(s.id));

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

      // filter trianges by removing those that have a vertex with an angle that is too small
      const removeTriangles: number[] = [];
      const minAngleDeg = 5;
      const minAngleRad = minAngleDeg / 180 * Math.PI;
      for (let i = 0; i < mesh.triangles.length; i += 3) {
        const triangle = [
          points[mesh.triangles[i]],
          points[mesh.triangles[i + 1]],
          points[mesh.triangles[i + 2]],
        ];

        const len01 = Math.sqrt((triangle[0][0] - triangle[1][0]) ** 2 + (triangle[0][1] - triangle[1][1]) ** 2);
        const len12 = Math.sqrt((triangle[1][0] - triangle[2][0]) ** 2 + (triangle[1][1] - triangle[2][1]) ** 2);
        const len20 = Math.sqrt((triangle[2][0] - triangle[0][0]) ** 2 + (triangle[2][1] - triangle[0][1]) ** 2);

        const a0 = Math.acos((len01 ** 2 + len20 ** 2 -  len12 ** 2) / (2 * len01 * len20));
        const a1 = Math.acos((len01 ** 2 + len12 ** 2 -  len20 ** 2) / (2 * len01 * len12));
        const a2 = Math.acos((len12 ** 2 + len20 ** 2 -  len01 ** 2) / (2 * len12 * len20));

        if (a0 < minAngleRad || a1 < minAngleRad || a2 < minAngleRad) {
          removeTriangles.push(i);
        }
      }

      // const preDelaunayTriangleDeformations = [];
      // const preDelaunayTriangles = [];

      for (let i = 0; i < mesh.triangles.length; i += 3) {
        if (removeTriangles.indexOf(i) > -1) continue;
        const deformationOutput: DeformationOutput = deformationCalc({data: [ filteredData[mesh.triangles[i]],
          filteredData[mesh.triangles[i + 1]],
          filteredData[mesh.triangles[i + 2]],
        ]});

        const deformation = deformationOutput.secondInvariant;
        self.delaunayTriangleDeformations.push(deformation);
      }

      for (let i = 0; i < mesh.triangles.length; i += 3) {
        if (removeTriangles.indexOf(i) > -1) continue;
        const p1 = [points[mesh.triangles[i]][0], points[mesh.triangles[i]][1]];
        const p2 = [points[mesh.triangles[i + 1]][0], points[mesh.triangles[i + 1]][1]];
        const p3 = [points[mesh.triangles[i + 2]][0], points[mesh.triangles[i + 2]][1]];

        self.delaunayTriangles.push([p1, p2, p3]);
      }
    },
    setRenderDeformationMap(method: ColorMethod = "logarithmic") {
      self.deformationMapColorMethod = method;
      self.renderDeformationMap = true;
    },
    renderDeformationBuildupLabels() {
      self.renderDeformationLabels = true;
    },
    reset() {
      self.visibleGPSStationIds.clear();
      self.selectedGPSStationId = undefined;
      self.showVelocityArrows = false;
      self.deformationHistory.clear();
      self.deformationCurrentRunGroup = 0;
      self.deformationModelStep = 0;
      self.deformationModelUserEarthquakeCount = 0;
      self.deformationModelUserEarthquakeLatestStep = 0;
      self.deformationMapMinLat = -90;
      self.deformationMapMinLng = -180;
      self.deformationMapMaxLat = 90;
      self.deformationMapMaxLng = 180;
      self.renderDeformationMap = false;
      self.renderDeformationLabels = false;
    }
  }))
  .actions((self) => ({
    startDeformationModel() {
      self.deformationModelStep = 0;

      const startTime = window.performance.now();

      const updateStep = () => {
        const dt = (window.performance.now() - startTime) / 1000;   // seconds since start
        let step = Math.floor(dt * self.deformationModelSpeed);
        if (step > self.deformationModelEndStep) {
          step = self.deformationModelEndStep;
        }
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
    },
    setApparentYear(year: number) {
      self.setDeformationStep(year / self.deformationModelApparentYearScaling);
    },
    triggerEarthquake() {
      if (self.deformationModelEarthquakeControl !== "user") {
        return;
      }
      self.deformationModelUserEarthquakeCount++;
      self.deformationModelUserEarthquakeLatestStep = self.deformationModelStep;
    },
    getDeformationModelMaxDisplacementBeforeEarthquakeGivenFriction(friction: "low" | "medium" | "high") {
      switch (friction) {
        case "low":
          return self.deformationModelFrictionLow;
        case "medium":
          return self.deformationModelFrictionMedium;
        case "high":
          return self.deformationModelFrictionHigh;
      }
    },
    setDeformationModelFaultAngle(angle: number) {
      self.deformationModelFaultAngle = angle;
    },
    setCurrentRunNumber(runNumber: number){
      self.deformationModelStep = 0;
      self.deformationModelUserEarthquakeCount = 0;
      self.deformationModelUserEarthquakeLatestStep = 0;

      if (runNumber === 1){
        self.deformationHistory.clear();
        self.deformationCurrentRunGroup = 0;
      }

      self.deformationCurrentRunGroup = runNumber;
    },
    saveDeformationData(year: number){
      const buildUpYears = self.deformationModelStep - self.deformationModelUserEarthquakeLatestStep;
      const deformation = Math.abs(buildUpYears * self.relativeVerticalSpeed) / 1e6;

      const currentRunNumber = self.deformationCurrentRunGroup;
      const lastGroup = self.deformationHistory[self.deformationHistory.length - 1];

      if (!self.deformationHistory.length || currentRunNumber > lastGroup.group){
        self.deformationHistory.push(deformationGroup.create({
          group: currentRunNumber,
          values: deformationCases.create([{year, deformation}])
        }));
      } else {
          lastGroup.values.push({year, deformation});
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
