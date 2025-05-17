// This worker reads an ASCII raster file and returns its parsed content in a message.
import { AsciiRaster, parseAsciiRaster } from "./parse-ascii-raster";

const dataFile = "/data/MaunaLoa_60m_UTM5N.asc";

let asciiRaster: AsciiRaster | undefined;

self.onmessage = (e) => {
  const reader = new FileReader();

  reader.onload = () => {
    const content = reader.result;
    console.log(`>>> content`, content);
    if (typeof content === "string") {
      asciiRaster = parseAsciiRaster(content);
      console.log(` >> raster`, asciiRaster);
      postMessage({ status: "rasterParsed", raster: asciiRaster });
    }
  };

  fetch(dataFile)
    .then(response => {
      console.log(`>>> response`, response);
      console.log(` >> blob`, response.blob());
      return response.blob();
    })
    .then(blob => reader.readAsText(blob));
};

export default {} as typeof Worker & (new () => Worker);
