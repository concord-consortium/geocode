import * as L from "leaflet";

import { DivIcon } from "leaflet";

import "../css/custom-leaflet-icons.css";

const iconVolcano = new L.Icon({
    iconUrl: "./assets/volcano.png",
    iconRetinaUrl: "./assets/volcano.png",
    iconSize: new L.Point(25, 25),
});

// Cache icons. First, it's just faster. Second, it prevents us from unnecessary re-rendering and buttons blinking.
const iconsCache: Map<string, DivIcon> = new Map<string, DivIcon>();

export function circleIcon(label: string): DivIcon {
    return new DivIcon({ className: "circle-icon", html: label });
}

export function getCachedCircleIcon(label: string) {
    const iconKey = "circle-icon" + label;
    if (!iconsCache.get(iconKey)) iconsCache.set(iconKey, circleIcon(label)); // = circleIcon();
    return iconsCache.get(iconKey);
}

export { iconVolcano };
