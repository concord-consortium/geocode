import * as L from "leaflet";

const iconVolcano = new L.Icon({
    iconUrl: require("../assets/volcano.png"),
    iconRetinaUrl: require("../assets/volcano.png"),
    iconSize: new L.Point(25, 25),
    className: "leaflet-div-icon"
});

export { iconVolcano };
