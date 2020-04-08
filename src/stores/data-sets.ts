// @ts-ignore
import * as RawWindDataSet from "../assets/data/winds_Cerro_Negro.csv";
import { filters } from "pixi.js";

interface DatasetCase {[key: string]: number; }
export type Dataset = DatasetCase[];

type DatasetName = "Wind Data";         // currently only one option
export const WIND_DATA = "Wind Data";

export interface Range {min: number; max: number; }
export interface Filter{[key: string]: number | Range; }

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
        if (typeof filterValue === "number") {
          return itemValue === filterValue;
        } else {
          return itemValue >= filterValue.min && itemValue <= filterValue.max;
        }
      });
    });
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
    elevation: [1450, 1600],
    speed: [0, 23]
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
    speed: "Wind Speed (m/s)",
    timeOfYear: "Time of year",
    direction: "Direction (degrees)"
  }
};
