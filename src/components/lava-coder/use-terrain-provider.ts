import { createWorldTerrainAsync, TerrainProvider } from "@cesium/engine";
import { useEffect, useState } from "react";

export function useTerrainProvider() {
  const [terrainProvider, setTerrainProvider] = useState<TerrainProvider | null>(null);

  useEffect(() => {
    // Add Cesium World Terrain
    createWorldTerrainAsync().then((provider) => {
      setTerrainProvider(provider);
    });
  }, []);

  return terrainProvider;
}
