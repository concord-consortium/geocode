import { Cartesian2 } from "@cesium/engine";

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
