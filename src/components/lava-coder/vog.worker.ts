import { disperseVog } from "./vog-dispersion";

self.onmessage = (e) => {
  if (!e.data.parameters) return;

  disperseVog({ ...e.data.parameters, postMessage });
};

export default {} as typeof Worker & (new () => Worker);
