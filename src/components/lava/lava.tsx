import { useEffect, useState } from "react";
import { AsciiRaster, parseAsciiRaster } from "./parse-ascii-raster";

import "./lava.scss";

export function Lava() {
  const [rasterData, setRasterData] = useState<AsciiRaster|null>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      if (typeof content === "string") {
        const raster = parseAsciiRaster(content);
        setRasterData(raster);
        console.log(`--- raster`, raster);
      }
    };
    fetch("/data/data.asc")
      .then(response => response.blob())
      .then(blob => reader.readAsText(blob));
  }, []);

  return (
    <div className="lava-output">
      {rasterData
        ? Object.keys(rasterData.header).map(key => `${key}: ${rasterData.header[key]}\n`) + `\n` + rasterData.values.map(row => `${row.join(",\t")}\n`)
        : "Loading Data..."
      }
    </div>
  );
}
