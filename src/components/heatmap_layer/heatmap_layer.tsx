import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { Point } from "leaflet";
import L from "leaflet";
import * as d3quadtree from "d3-quadtree";
import { useGlobalContext } from "@/app/Context/store";
import "@/lib/leaflet-heat";
import Worker from "./quadtrees.worker.js";

type LatLngIn = { lat: number; lng: number; intensity: number };

/**
 * Creates a new quadtree data structure for spatial indexing
 * Quadtree helps in efficiently storing and querying spatial data
 */
const initializeQuadtree = () => {
  return d3quadtree
    .quadtree<any>()
    .x((d) => d.x)
    .y((d) => d.y)
    .extent([
      [-180, -90],
      [180, 90],
    ]);
};

/**
 * Populates the quadtree with point data
 * Converts lat/lng points to x/y coordinates for quadtree storage
 */
function fillQuadtree(
  quadtree: d3quadtree.Quadtree<any>,
  points: LatLngIn[]
): void {
  points.forEach((point) => {
    if (point) {
      quadtree.add({
        x: point.lng,
        y: point.lat,
        intensity: point.intensity,
      });
    }
  });
}

interface HeatmapLayerProps {
  points: Point[];
}

/**
 * HeatmapLayer Component
 * Implements a multi-resolution heatmap using Level of Detail (LOD) technique
 * - Uses Web Workers for point processing
 * - Creates different resolution quadtrees for different zoom levels
 * - Dynamically switches between resolutions based on zoom level
 */
const HeatmapLayer = ({ points }: HeatmapLayerProps) => {
  // Quadtrees for different LOD levels
  const [ultraLowResQuadtree, setUltraLowResQuadtree] = useState<any | null>(
    null
  );
  const [midLowResQuadtree, setMidLowResQuadtree] = useState<any | null>(null);
  const [midResQuadtree, setMidResQuadtree] = useState<any | null>(null);
  const [highResQuadtree, setHighResQuadtree] = useState<any | null>(null);

  const [lodPoints, setLodPoints] = useState<any | null>(null);

  const [treesInit, setTreesInit] = useState(false);
  const [treesReady, setTreesReady] = useState(false);

  const [worker, setWorker] = useState<Worker | null>(null);

  const map = useMap();
  const { setLoadingHeatmap, loadingHeatmap } = useGlobalContext();

  // Main effect for initializing and managing quadtrees
  useEffect(() => {
    // Initialize web worker for point processing
    if (worker === null) {
      const newWorker = new (Worker as any)();
      setWorker(newWorker);
    }

    // Process points and initialize quadtrees
    if (map && loadingHeatmap && !treesReady && !treesInit && worker) {
      worker.postMessage({ points });
      worker.onmessage = (event: { data: { result: any } }) => {
        const { result } = event.data;
        setLodPoints(result);
        setTreesInit(true);
      };
      setUltraLowResQuadtree(initializeQuadtree());
      setMidLowResQuadtree(initializeQuadtree());
      setMidResQuadtree(initializeQuadtree());
      setHighResQuadtree(initializeQuadtree());
    }

    // Fill quadtrees with processed points
    if (treesInit && !treesReady) {
      fillQuadtree(ultraLowResQuadtree, lodPoints.ultraLow);
      fillQuadtree(midLowResQuadtree, lodPoints.midLow);
      fillQuadtree(midResQuadtree, lodPoints.mid);
      fillQuadtree(highResQuadtree, lodPoints.high);

      setTreesReady(true);
    }

    // Add heatmap layer to map when ready
    if (treesReady) {
      setLoadingHeatmap(false);
      const heat = L.heatLayer(
        { radius: 25 },
        {
          ultraLowResQuadtree,
          midLowResQuadtree,
          midResQuadtree,
          highResQuadtree,
        }
      ).addTo(map);

      return () => {
        if (worker) {
          worker.postMessage({ type: "terminate" });
          worker.onmessage = null;
          map.removeLayer(heat);
        }
      };
    }
  }, [treesInit, treesReady, worker]);
  return null;
};

export default HeatmapLayer;
