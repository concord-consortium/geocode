export interface ILatLong {
  latitude: number;
  longitude: number;
}

export interface ILatLongElevation extends ILatLong {
  elevation?: number;
}

export type CartographicEventCallback = (latitude: number, longitude: number, elevation: number) => void;
