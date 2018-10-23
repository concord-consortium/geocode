import { parse } from "query-string";
import { AppMode } from "../models/stores";

export interface QueryParams {
  // appMode is "authed", "test" or "dev" with the default of dev
  appMode?: AppMode;
}

const params = parse(location.search);
// allows use of ?demo for url
params.demo = typeof params.demo !== "undefined";

export const DefaultUrlParams: QueryParams = {
  appMode: "dev",
};

export const urlParams: QueryParams = params;
