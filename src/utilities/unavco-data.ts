// @ts-ignore
import * as RawVelocityDataSet from "../assets/data/seismic/cwu.final_nam14.vel";
import { StationData } from "../deformation";

/**
 * This method parses the offline UNAVCO velocity data found within "../../assets/data/cwu.snaps_nam14.vel"
 * It converts the file into a parsable format and extracts
 * the necessary data to be passed onto the buildMesh() method
 */
export function parseOfflineUNAVCOData(minLat: number, maxLat: number, minLng: number, maxLng: number) {
  const parsedData: string[][] = [];
  // Convert UNAVCO's ASCII file into a computer readable data set
  (RawVelocityDataSet as string).split("\n").forEach((value) => {parsedData.push(value.split(/\ +/g)); });
  const stationData: StationData[] = [];
  const filteredSet: Set<any> = new Set<any>();

  for (let i = 36; i < parsedData.length - 1; i++) {
      if (!filteredSet.has(parsedData[i][1])) {
          filteredSet.add(parsedData[i][1]);
          const eastVelocity = parseFloat(parsedData[i][21]);               // m/yr
          const northVelocity = parseFloat(parsedData[i][20]);              // m/yr
          const speed = Math.sqrt((eastVelocity as number) ** 2 + (northVelocity as number) ** 2) * 1000;   // mm/yr
          const direction = (360 + Math.atan2(eastVelocity, northVelocity) * (180 / Math.PI)) % 360;        // º from N
          const station: StationData = {
              id: parsedData[i][1],
              name: parsedData[i][2],
              longitude: parseFloat(parsedData[i][9]) - 360,
              latitude: parseFloat(parsedData[i][8]),
              eastVelocity,
              eastVelocityUncertainty: 0.01,
              northVelocity,
              northVelocityUncertainty: 0.01,
              speed,
              direction,
          };

          if ((station.longitude < maxLng && station.longitude > minLng) &&
              (station.latitude < maxLat && station.latitude > minLat)) {
                  stationData.push(station);
          }
      }
  }

  return stationData;
}
