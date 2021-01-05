import { types } from "mobx-state-tree";
import uuid = require("uuid");
import { calculateThresholdData, calculateRisk, ThresholdData } from "../components/montecarlo/monte-carlo";

export const RiskLevel = types.enumeration("type", ["Undefined", "Low", "Medium", "High"]);
export type RiskLevelType = typeof RiskLevel.Type;

/**
 * Locations used for sample collections
 */
const SamplesLocation = types.model("SamplesLocation", {
  id: types.optional(types.identifier, () => uuid()),
  name: types.string,
  x: types.number,
  y: types.number
});

/**
 * A collection of samples, with a name and a threshold used when displaying risk.
 * For now each sample is a single number.
 * It is likely that we will want this to eventually be an entire data set row
 * (e.g. all the inputs (wind data, vei etc.) plus tephra thickness).
 */
const SamplesCollection = types.model("SamplesCollection", {
  name: types.string,
  threshold: types.number,
  samples: types.array(types.number),
})
.views((self) => ({
  get risk(): RiskLevelType {
    const thresholdData: ThresholdData = calculateThresholdData(self.samples, self.threshold);
    return calculateRisk(thresholdData.greaterThanPercent);
  },
}))
.actions((self) => ({
  addSample(sample: number) {
    self.samples.push(sample);
  },
}));

const SamplesCollectionsStore = types.model("SamplesCollections", {
  samplesLocations: types.array(SamplesLocation),
  samplesCollections: types.array(SamplesCollection)
})
.views((self) => ({
  samplesLocation(name: string) {
    return self.samplesLocations.find(c => c.name === name);
  },

  samplesCollection(name: string) {
    return self.samplesCollections.find(c => c.name === name);
  }
}))
.actions((self) => ({
  createSamplesLocation(location: {name: string, x: number, y: number }) {
    self.samplesLocations.push(SamplesLocation.create(location));
  },

  createSamplesCollection(collection: {name: string, threshold: number }) {
    const {name, threshold} = collection;
    const newCollection = SamplesCollection.create({name, threshold});
    self.samplesCollections.push(newCollection);
    return newCollection;
  },

  reset() {
    self.samplesLocations.length = 0;
    self.samplesCollections.length = 0;
  },

  addToSamplesCollection(name: string, sample: number) {
    const collection = self.samplesCollection(name);
    if (collection) {
      collection.addSample(sample);
    }
  },
}));

export type SamplesLocationModelType = typeof SamplesLocation.Type;
export type SamplesCollectionModelType = typeof SamplesCollection.Type;
export type SamplesCollectionsModelType = typeof SamplesCollectionsStore.Type;
export const samplesCollectionsStore = SamplesCollectionsStore.create({});
