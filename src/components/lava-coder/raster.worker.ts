// This worker reads an ASCII raster file and returns its parsed content in a message.
import elevationMap from "../../assets/lava-coder/elevation-maps/big_island.asc";
import { AsciiRaster, parseAsciiRaster } from "./parse-ascii-raster";

let asciiRaster: AsciiRaster | undefined;

self.onmessage = (e) => {
  const reader = new FileReader();

  reader.onload = () => {
    const content = reader.result;
    if (typeof content === "string") {
      asciiRaster = parseAsciiRaster(content);
      postMessage({ status: "rasterParsed", raster: asciiRaster });
    }
  };

  fetch(elevationMap)
    .then(response => response.blob())
    .then(blob => reader.readAsText(blob));
};

export default {} as typeof Worker & (new () => Worker);
