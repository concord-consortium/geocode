import { runSimulation } from "./molasses";
import { AsciiRaster, parseAsciiRaster } from "./parse-ascii-raster";

let asciiRaster: AsciiRaster | undefined;

self.onmessage = (e) => {
  const reader = new FileReader();

  reader.onload = () => {
    const content = reader.result;
    if (typeof content === "string") {
      asciiRaster = parseAsciiRaster(content);
      postMessage({ status: "rasterParsed", raster: asciiRaster });
      console.log(`--- raster`, asciiRaster);
      
      postMessage({ status: "runningSimulation" });
      runSimulation(asciiRaster, postMessage);
    }
  };

  fetch("/data/data-half.asc")
    .then(response => response.blob())
    .then(blob => reader.readAsText(blob));
};

export default {} as typeof Worker & (new () => Worker);
