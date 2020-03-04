import { types } from "mobx-state-tree";

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
})
.actions((self) => ({
  addSample(sample: number) {
    self.samples.push(sample);
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
}));

export type SamplesCollectionsModelType = typeof SamplesCollectionsStore.Type;
export const samplesCollectionsStore = SamplesCollectionsStore.create({});
