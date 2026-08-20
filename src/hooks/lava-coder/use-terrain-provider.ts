import { Cartographic, createWorldTerrainAsync, sampleTerrainMostDetailed, TerrainProvider } from "@cesium/engine";
import { useCallback, useEffect, useState } from "react";

export type GetElevation = (longitude: number, latitude: number) => Promise<number>;

export function useTerrainProvider() {
  const [terrainProvider, setTerrainProvider] = useState<TerrainProvider | null>(null);

  useEffect(() => {
    // Add Cesium World Terrain
    createWorldTerrainAsync().then((provider) => {
      setTerrainProvider(provider);
    });
  }, []);

  const getElevation = useCallback<GetElevation>(async (longitude, latitude) => {
    if (!terrainProvider) {
      return 0;
    }

    const cartographic = Cartographic.fromDegrees(longitude, latitude);
    const [elevation] = await sampleTerrainMostDetailed(terrainProvider, [cartographic]);

    return elevation.height;
  }, [terrainProvider]);

  return { getElevation, terrainProvider };
}
