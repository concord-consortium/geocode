import { parse } from "query-string";
import { AppMode } from "../models/stores";

export interface QueryParams {
  appMode?: AppMode;
}

const params = parse(location.search);

export const DefaultUrlParams: QueryParams = {
  appMode: "dev",
};

export const urlParams: QueryParams = params;
