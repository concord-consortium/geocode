import { Cartesian2 } from "@cesium/engine";
import { FlagColor } from "../../simulations/lava-coder/lava-constants";

export interface ILatLong {
  latitude: number;
  longitude: number;
}

export interface ILatLongElevation extends ILatLong {
  elevation?: number;
}

interface ICartographicEventProps {
  latitude: number;
  longitude: number;
  elevation: number;
  position: Cartesian2;
}

export type CartographicEventCallback = (props: ICartographicEventProps) => void;

export type WindPattern = "trade" | "kona";

export interface FlagLocation {
  color: FlagColor;
  name: string;
  label?: string;
  latitude: number;
  longitude: number;
  vogConcentration?: number;
}
