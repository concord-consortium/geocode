import { types } from "mobx-state-tree";
import { parseOfflineUNAVCOData } from "../utilities/unavco-data";
import strainCalc, { StationData, StrainOutput } from "../strain";
import { Filter, Range } from "./data-sets";
import Delaunator from "delaunator";

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

export const SeismicSimulationStore = types
  .model("seismicSimulation", {
    scenario: "Seismic CA",
    visibleGPSStationIds: types.array(types.string),      // by id
    selectedGPSStationId: types.maybe(types.string),
    showVelocityArrows: false,

    deformationModelStep: 0,            // year
    deformationModelSpeed: 100000,      // years / second
    deformationModelEndStep: 500000,

    deformSpeedPlate1: 0,     // mm/yr
    deformDirPlate1: 0,       // º from N
    deformSpeedPlate2: 0,
    deformDirPlate2: 0,
    deformMaxSpeed: 50,

    strainMapMinLat: -90,
    strainMapMinLng: -180,
    strainMapMaxLat: 90,
    strainMapMaxLng: 180,
    strainMapColorMethod: types.optional(types.string, "logarithmic"),
    renderStrainMap: false,
    renderStrainLabels: false,
  })
  .volatile(self => ({
    delaunayTriangles: [] as number[][][],
    delaunayTriangleStrains: [] as number[],
  }))
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
      if (step > self.deformationModelEndStep) {
        self.deformationModelStep = self.deformationModelEndStep;
      } else {
        self.deformationModelStep = step;
      }
    },
    resetDeformationModel() {
      self.deformationModelStep = 0;
    },
    setShowVelocityArrows(show: boolean) {
      self.showVelocityArrows = show;
    },
    setStrainMapBounds(bounds: Filter) {
      self.renderStrainMap = false;
      self.renderStrainLabels = false;

      self.delaunayTriangles = [];
      self.delaunayTriangleStrains = [];

      // reset values first
      self.strainMapMinLat = -90;
      self.strainMapMinLng = -180;
      self.strainMapMaxLat = 90;
      self.strainMapMaxLng = 180;

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

      // const { minLat, maxLat, minLng, maxLng } = this.props;

      const stationDataInBounds = stationData.filter(s =>
        s.latitude >= self.strainMapMinLat && s.latitude <= self.strainMapMaxLat &&
        s.longitude >= self.strainMapMinLng && s.longitude <= self.strainMapMaxLng);

      // Proximity based point removal
      // GPS points that are very close to each other will produce extremely high strain values
      // By removing these points, it becomes easier to plot the data using an infinite scale
      // Other methods of solving this problem would be by plotting the data in a bucketed gradient
      // e.g. 0 - 5: Blue, 5 - 50: Green, 50 - 250: Yellow, 250+: Red
      const removablePoints: Set<string> = new Set<string>();
      for (let i = 0; i < stationDataInBounds.length; i++) {
        for (let k = i + 1; k < stationDataInBounds.length; k++) {
          const dist = Math.sqrt(Math.pow(stationDataInBounds[i].latitude - stationDataInBounds[k].latitude, 2) +
                      Math.pow(stationDataInBounds[i].longitude - stationDataInBounds[k].longitude, 2));
          if (dist < 0.18) {
            removablePoints.add(stationDataInBounds[i].id);
            break;
          }
        }
      }

      const filteredData: StationData[] = stationDataInBounds.filter(s => !removablePoints.has(s.id));

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

      // const preDelaunayTriangleStrains = [];
      // const preDelaunayTriangles = [];

      for (let i = 0; i < mesh.triangles.length; i += 3) {
        if (removeTriangles.indexOf(i) > -1) continue;
        const strainOutput: StrainOutput = strainCalc({data: [ filteredData[mesh.triangles[i]],
          filteredData[mesh.triangles[i + 1]],
          filteredData[mesh.triangles[i + 2]],
        ]});

        const strain = strainOutput.secondInvariant;
        self.delaunayTriangleStrains.push(strain);
      }

      for (let i = 0; i < mesh.triangles.length; i += 3) {
        if (removeTriangles.indexOf(i) > -1) continue;
        const p1 = [points[mesh.triangles[i]][0], points[mesh.triangles[i]][1]];
        const p2 = [points[mesh.triangles[i + 1]][0], points[mesh.triangles[i + 1]][1]];
        const p3 = [points[mesh.triangles[i + 2]][0], points[mesh.triangles[i + 2]][1]];

        self.delaunayTriangles.push([p1, p2, p3]);
      }
    },
    setRenderStrainMap(method: ColorMethod) {
      self.strainMapColorMethod = method;
      self.renderStrainMap = true;
    },
    renderStrainRateLabels() {
      self.renderStrainLabels = true;
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
      self.renderStrainMap = false;
      self.renderStrainLabels = false;
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
      self.deformationModelStep = 0;
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
    }
  }));

export const seismicSimulation = SeismicSimulationStore.create({});

export type SeismicSimulationModelType = typeof SeismicSimulationStore.Type;
