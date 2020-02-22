// @ts-ignore
import * as WindDataSet from "../assets/data/winds_Cerro_Negro.csv";

type Dataset = "Wind Data";
export const WIND_DATA = "Wind Data";

// dsv-loader loads in all data as strings. For now we know they are all numbers, so we can quick-convert
WindDataSet.forEach((item: any) => {
  for (const key of Object.keys(item)) {
    item[key] = parseFloat(item[key]);
  }
});

const datasets: {[key in Dataset]: any} = {
  [WIND_DATA]: WindDataSet
};

export const DataSampler = {

  getAllData(name: Dataset) {
    return datasets[name];
  },

  getRandomSampleWithReplacement(name: Dataset, sampleSize: number) {
    debugger;
    const dataset = datasets[name];
    const samples = [];
    for (let i = 0; i < sampleSize; i++) {
      samples.push(dataset[Math.floor(Math.random() * dataset.length)]);
    }
    return samples;
  },

  getRandomSampleWithoutReplacement(name: Dataset, sampleSize: number) {
    const dataset = datasets[name];
    const indices: number[] = [];
    const samples = new Array(sampleSize);
    for (let i = 0; i < sampleSize; i++ ) {
        const j = Math.floor(Math.random() * (dataset.length - i) + i);
        samples[i] = dataset[indices[j] === undefined ? j : indices[j]];
        indices[j] = indices[i] === undefined ? i : indices[i];
    }
    return samples;
  }
};
