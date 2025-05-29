// This worker reads an ASCII raster file and returns its parsed content in a message.
import smallElevationMap from "../../assets/lava-coder/elevation-maps/MaunaLoa_60m_UTM5N.asc";
import largeElevationMap from "../../assets/lava-coder/elevation-maps/big_island.asc";
import { useLargeMap } from "./lava-options";
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

  fetch(useLargeMap ? largeElevationMap : smallElevationMap)
    .then(response => response.blob())
    .then(blob => reader.readAsText(blob));
};

export default {} as typeof Worker & (new () => Worker);
