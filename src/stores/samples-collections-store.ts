import { types } from "mobx-state-tree";
import { calculateThresholdData, calculateRisk, ThresholdData } from "../components/montecarlo/monte-carlo";

export const RiskLevel = types.enumeration("type", ["Undefined", "Low", "Medium", "High"]);
export type RiskLevelType = typeof RiskLevel.Type;

/**
 * For now each sample is a single number.
 * It is likely that we will want this to eventually be an entire data set row
 * (e.g. all the inputs (wind data, vei etc.) plus tephra thickness).
 */
const SamplesCollection = types.model("SamplesCollection", {
  name: types.string,
  x: types.number,
  y: types.number,
  samples: types.array(types.number),
  risk: types.maybe(RiskLevel)
})
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
  samplesCollections: types.array(SamplesCollection)
})
.views((self) => ({
  samplesCollection(name: string) {
    return self.samplesCollections.find(c => c.name === name);
  }
}))
.actions((self) => ({
  createSamplesCollection(collection: {name: string, x: number, y: number }) {
    self.samplesCollections.push(SamplesCollection.create(collection));
  },

  reset() {
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

export type SamplesCollectionModelType = typeof SamplesCollection.Type;
export type SamplesCollectionsModelType = typeof SamplesCollectionsStore.Type;
export const samplesCollectionsStore = SamplesCollectionsStore.create({});
