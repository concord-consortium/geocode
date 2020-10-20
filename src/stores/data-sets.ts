// @ts-ignore
import * as RawWindDataSet from "../assets/data/winds_Cerro_Negro.csv";
import RawPositionTimeData, { filterStationByPositionData } from "../assets/data/seismic/position-time-data";

interface DatasetCase {[key: string]: number | Date; }
export type Dataset = DatasetCase[];
interface DatasetLibrary {[name: string]: Dataset; }

type DatasetName = "Wind Data";         // currently only one option
export const WIND_DATA = "Wind Data";

export interface Range {min: number | Date; max: number | Date; }
export interface Filter {[key: string]: number | Range; }
export interface TimeRange {from?: Date; to?: Date; duration?: number; }
export interface ProtoTimeRange {from?: string; to?: string; duration?: number; }

// dsv-loader loads in all data as strings. For now we know they are all numbers, so we can quick-convert
const WindDataSet: Dataset = RawWindDataSet.map((item: any) => {
  for (const key of Object.keys(item)) {
    item[key] = parseFloat(item[key]);
  }
  return item;
});

const datasets: {[key in DatasetName]: any} = {
  [WIND_DATA]: WindDataSet
};

// We're treating the position data sets separately, instead of trying to shoe-horn into the
// `datasets` object, since we always know if we're trying to get one or the other
const PositionTimeDataSets: DatasetLibrary = {};
for (const name of Object.keys(RawPositionTimeData)) {
  PositionTimeDataSets[name] = (RawPositionTimeData as any)[name].map((item: any) => {
    for (const key of Object.keys(item)) {
      if (key === "Date") {
        item[key] = new Date(item[key]);
      } else {
        item[key] = parseFloat(item[key]);
      }
    }
    return item;
  });
}

export const Datasets = {

  getAllData(name: DatasetName) {
    return datasets[name];
  },

  getRandomSampleWithReplacement(dataset: Dataset, sampleSize: number): Dataset {
    if (!dataset) return [];
    const samples = [];
    for (let i = 0; i < sampleSize; i++) {
      samples.push(dataset[Math.floor(Math.random() * dataset.length)]);
    }
    return samples;
  },

  getRandomSampleWithoutReplacement(dataset: Dataset, sampleSize: number): Dataset {
    if (!dataset) return [];
    const indices: number[] = [];
    const samples = new Array(sampleSize);
    for (let i = 0; i < sampleSize; i++ ) {
        const j = Math.floor(Math.random() * (dataset.length - i) + i);
        samples[i] = dataset[indices[j] === undefined ? j : indices[j]];
        indices[j] = indices[i] === undefined ? i : indices[i];
    }
    return samples;
  },

  filter(dataset: Dataset, filter: Filter): Dataset {
    if (!dataset) return [];

    return dataset.filter(item => {

      return Object.keys(filter).every(key => {
        const itemValue = item[key];
        const filterValue = filter[key];

        if (key === "only_stations_with_position_history" && filterValue) {
          // special-case
          return filterStationByPositionData(item);
        }

        if (typeof filterValue === "number") {
          return itemValue === filterValue;
        } else {
          return itemValue >= filterValue.min && itemValue <= filterValue.max;
        }
      });
    });
  },

  getGPSPositionTimeData(name: string, timeRange?: TimeRange) {
    let dataSet = (PositionTimeDataSets as any)[name] as Dataset;
    if (timeRange) {
      if (timeRange.from) {
        dataSet = dataSet.filter(d => (d.Date as Date) >= timeRange.from!);
      }
      if (timeRange.to) {
        dataSet = dataSet.filter(d => (d.Date as Date) <= timeRange.to!);
      }
      if (timeRange.duration) {
        if (timeRange.to) {
          dataSet = dataSet.splice(dataSet.length - timeRange.duration, timeRange.duration);
        } else {
          dataSet = dataSet.splice(0, timeRange.duration);
        }
      }
    }
    return dataSet;
  },

};

// ** Custom info about wind data **
interface TimeParser {fields: string[]; parser: string; label: string; }
interface DataSetInfo {
  extents: {[key: string]: [number, number]};
  timeParsers: {[key: string]: TimeParser};
  axisLabel: {[key: string]: string};
}
export const WindData: DataSetInfo = {
  extents: {
    "elevation": [1450, 1600],
    "speed": [0, 23],
    "East (mm)": [-800, 300],
    "North (mm)": [0, 650],
  },
  timeParsers: {
    date: {
      fields: ["year", "month", "day"],
      parser: "%Y-%m-%d",
      label: "%b %Y"
    },
    timeOfYear: {
      fields: ["month", "day"],
      parser: "%m-%d",
      label: "%b"
    },
    month: {
      fields: ["month"],
      parser: "%m",
      label: "%b"
    },
    year: {
      fields: ["year"],
      parser: "%Y",
      label: "%Y"
    },
    hour: {
      fields: ["hour"],
      parser: "%H",
      label: "%I%p"
    }
  },
  axisLabel: {
    "speed": "Wind Speed (m/s)",
    "timeOfYear": "Time of year",
    "direction": "Direction (degrees)",
    "East (mm)": "East displacement (mm)",
    "North (mm)": "North displacement (mm)",
  }
};
