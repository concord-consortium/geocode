import CloseIcon1x from "../../assets/lava-coder/close-icon.png";
import CloseIcon2x from "../../assets/lava-coder/close-icon@2x.png";
import CloseIcon3x from "../../assets/lava-coder/close-icon@3x.png";
import HomeViewIcon1x from "../../assets/lava-coder/return-to-home-view-icon.png";
import HomeViewIcon2x from "../../assets/lava-coder/return-to-home-view-icon@2x.png";
import HomeViewIcon3x from "../../assets/lava-coder/return-to-home-view-icon@3x.png";
import MapStreetIcon1x from "../../assets/lava-coder/map-street-icon.png";
import MapStreetIcon2x from "../../assets/lava-coder/map-street-icon@2x.png";
import MapStreetIcon3x from "../../assets/lava-coder/map-street-icon@3x.png";
import MapTerrainIcon1x from "../../assets/lava-coder/map-terrain-icon.png";
import MapTerrainIcon2x from "../../assets/lava-coder/map-terrain-icon@2x.png";
import MapTerrainIcon3x from "../../assets/lava-coder/map-terrain-icon@3x.png";
import MoveIcon1x from "../../assets/lava-coder/move-icon.png";
import MoveIcon2x from "../../assets/lava-coder/move-icon@2x.png";
import MoveIcon3x from "../../assets/lava-coder/move-icon@3x.png";
import PlaceVentMarkerIcon1x from "../../assets/lava-coder/place-vent-marker-icon.png";
import PlaceVentMarkerIcon2x from "../../assets/lava-coder/place-vent-marker-icon@2x.png";
import PlaceVentMarkerIcon3x from "../../assets/lava-coder/place-vent-marker-icon@3x.png";
import RotateIcon1x from "../../assets/lava-coder/rotate-icon.png";
import RotateIcon2x from "../../assets/lava-coder/rotate-icon@2x.png";
import RotateIcon3x from "../../assets/lava-coder/rotate-icon@3x.png";
import VentKeyIcon1x from "../../assets/lava-coder/key-icon.png";
import VentKeyIcon2x from "../../assets/lava-coder/key-icon@2x.png";
import VentKeyIcon3x from "../../assets/lava-coder/key-icon@3x.png";
import ZoomInIcon1x from "../../assets/lava-coder/zoom-in-icon.png";
import ZoomInIcon2x from "../../assets/lava-coder/zoom-in-icon@2x.png";
import ZoomInIcon3x from "../../assets/lava-coder/zoom-in-icon@3x.png";
import ZoomOutIcon1x from "../../assets/lava-coder/zoom-out-icon.png";
import ZoomOutIcon2x from "../../assets/lava-coder/zoom-out-icon@2x.png";
import ZoomOutIcon3x from "../../assets/lava-coder/zoom-out-icon@3x.png";
import { LavaMapType } from "../../stores/ui-store";

function iconSrcSet( icon1x: string, icon2x: string, icon3x: string) {
  return `${icon1x} 1x, ${icon2x} 2x, ${icon3x} 3x`;
}

export function CloseIcon() {
  return (
    <img src={CloseIcon1x} className="close-icon" alt="Close Vent Key"
        srcSet={iconSrcSet(CloseIcon1x, CloseIcon2x, CloseIcon3x)} />
  );
}

export function HomeViewIcon() {
  return (
    <img src={HomeViewIcon1x} srcSet={iconSrcSet(HomeViewIcon1x, HomeViewIcon2x, HomeViewIcon3x)} alt="Home View" />
  );
}

interface IMapButtonIconProps {
  mapType: LavaMapType;
}
export function MapButtonIcon({ mapType }: IMapButtonIconProps) {
  return (
    mapType === "street"
      ? <img src={MapStreetIcon1x} alt="Map Type: Street"
            srcSet={iconSrcSet(MapStreetIcon1x, MapStreetIcon2x, MapStreetIcon3x)} />
      : <img src={MapTerrainIcon1x} alt="Map Type: Terrain"
            srcSet={iconSrcSet(MapTerrainIcon1x, MapTerrainIcon2x, MapTerrainIcon3x)} />
  );
}

export function MoveIcon() {
  return (
    <img src={MoveIcon1x} srcSet={iconSrcSet(MoveIcon1x, MoveIcon2x, MoveIcon3x)} alt="Enable Camera Panning" />
  );
}

export function PlaceVentMarkerIcon() {
  return (
    <img src={PlaceVentMarkerIcon1x} alt="Place Vent Marker"
        srcSet={iconSrcSet(PlaceVentMarkerIcon1x, PlaceVentMarkerIcon2x, PlaceVentMarkerIcon3x)} />
  );
}

interface IRotateIconProps {
  altText: string;
  style?: React.CSSProperties;
}
export function RotateIcon({ altText, style }: IRotateIconProps) {
  return (
    <img src={RotateIcon1x} style={style} alt={altText}
        srcSet={iconSrcSet(RotateIcon1x, RotateIcon2x, RotateIcon3x)} />
  );
}

export function RotateHeadingIcon() {
  return (
    <RotateIcon altText="Enable Camera Heading Rotation" />
  );
}

export function RotatePitchIcon() {
  return (
    <RotateIcon style={{ transform: "rotate(90deg)" }} altText="Enable Camera Pitch Rotation" />
  );
}

export function VentKeyIcon() {
  return (
    <img src={VentKeyIcon1x} className="vent-key-icon" alt="Show Vent Key"
        srcSet={iconSrcSet(VentKeyIcon1x, VentKeyIcon2x, VentKeyIcon3x)} />
  );
}

export function ZoomInIcon() {
  return (
    <img src={ZoomInIcon1x} srcSet={iconSrcSet(ZoomInIcon1x, ZoomInIcon2x, ZoomInIcon3x)} alt="Zoom In" />
  );
}

export function ZoomOutIcon() {
  return (
    <img src={ZoomOutIcon1x} srcSet={iconSrcSet(ZoomOutIcon1x, ZoomOutIcon2x, ZoomOutIcon3x)} alt="Zoom Out" />
  );
}
