import * as L from "leaflet";

import { DivIcon } from "leaflet";

import "../css/custom-leaflet-icons.css";

const iconVolcano = new L.Icon({
    iconUrl: "./assets/volcano.png",
    iconRetinaUrl: "./assets/volcano.png",
    iconSize: new L.Point(25, 25),
});

const iconMarker = new L.Icon({
    iconUrl: "./assets/marker.png",
    iconRetinaUrl: "./assets/marker.png",
    iconSize: new L.Point(20, 30),
});

// Cache icons. First, it's just faster. Second, it prevents us from unnecessary re-rendering and buttons blinking.
const iconsCache: Map<string, DivIcon> = new Map<string, DivIcon>();

export function circleIcon(label: string): DivIcon {
    return new DivIcon({ className: "circle-icon", html: label });
}

export function riskIcon(color: string, label: string, selected: boolean): DivIcon {
    const iconClass = "diamond-icon " + (selected ? "selected" : "");
    const iconStyle = "background:" + color + ";";
    const html = "<div class='" + iconClass + "' style='" + iconStyle + "'><div class='diamond-text'>" + label + "</div></div>";
    return new DivIcon({ className: "diamond-container", html });
}

export function getCachedCircleIcon(label: string) {
    const iconKey = "circle-icon" + label;
    if (!iconsCache.get(iconKey)) iconsCache.set(iconKey, circleIcon(label)); // = circleIcon();
    return iconsCache.get(iconKey);
}

export function divIcon(label: string, anchorCorner: string = "top-left"): DivIcon {
    const html = "<div class='icon-content " + anchorCorner + "'>" + label + "</div>";
    return new DivIcon({ className: "div-icon", html });
}

export function getCachedDivIcon(label: string) {
    const iconKey = "div-icon" + label;
    if (!iconsCache.get(iconKey)) iconsCache.set(iconKey, divIcon(label));
    return iconsCache.get(iconKey);
}

export { iconVolcano, iconMarker };
