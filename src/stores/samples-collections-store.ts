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
 * A collection of samples, associated with a name and a location.
 * For now each sample is a single number.
 * It is likely that we will want this to eventually be an entire data set row
 * (e.g. all the inputs (wind data, vei etc.) plus tephra thickness).
 */
const SamplesCollection = types.model("SamplesCollection", {
  name: types.string,
  location: types.reference(SamplesLocation),
  samples: types.array(types.number),
  risk: types.maybe(RiskLevel)
})
.views((self) => ({
  get x() {
    return self.location.x;
  },

  get y() {
    return self.location.y;
  },
}))
.actions((self) => ({
  addSample(sample: number) {
    self.samples.push(sample);
  },
  setRiskLevel(threshold: number) {
    const thresholdData: ThresholdData = calculateThresholdData(self.samples, threshold);
    self.risk = calculateRisk(thresholdData.greaterThanPercent);
  }
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

  createSamplesCollection(collection: {name: string, location: SamplesLocationModelType }) {
    const { name, location } = collection;
    self.samplesCollections.push(SamplesCollection.create({name, location: location.id}));
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

  setSamplesCollectionRiskLevel(name: string, threshold: number) {
    const collection = self.samplesCollection(name);
    if (collection) {
      collection.setRiskLevel(threshold);
    }
  }
}));

export type SamplesLocationModelType = typeof SamplesLocation.Type;
export type SamplesCollectionModelType = typeof SamplesCollection.Type;
export type SamplesCollectionsModelType = typeof SamplesCollectionsStore.Type;
export const samplesCollectionsStore = SamplesCollectionsStore.create({});
