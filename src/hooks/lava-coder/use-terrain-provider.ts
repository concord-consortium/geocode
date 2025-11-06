import { Cartographic, createWorldTerrainAsync, sampleTerrainMostDetailed, TerrainProvider } from "@cesium/engine";
import { useCallback, useEffect, useState } from "react";

export function useTerrainProvider() {
  const [terrainProvider, setTerrainProvider] = useState<TerrainProvider | null>(null);

  useEffect(() => {
    // Add Cesium World Terrain
    createWorldTerrainAsync().then((provider) => {
      setTerrainProvider(provider);
    });
  }, []);

  const getElevation = useCallback(async (longitude: number, latitude: number): Promise<number> => {
    if (!terrainProvider) {
      return 0;
    }

    const cartographic = Cartographic.fromDegrees(longitude, latitude);
    const [elevation] = await sampleTerrainMostDetailed(terrainProvider, [cartographic]);

    return elevation.height;
  }, [terrainProvider]);

  return { getElevation, terrainProvider };
}
