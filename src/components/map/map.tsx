"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import L, { LatLngExpression, Point } from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet.edgebuffer";
import HeatmapLayer from "../heatmap_layer/heatmap_layer";
import { useGlobalContext } from "@/app/Context/store";
import { useState } from "react";
import Button from "../button/button";
import { Power } from "lucide-react";
import crimeData from "@/data/crime-data.json";

declare module "react-leaflet" {
  interface TileLayerProps {
    edgeBufferTiles?: number;
  }
}

const Map = () => {
  // State to control heatmap visibility and button appearance
  const [showingHeatMap, setShowingHeatMap] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const { loadingHeatmap, setLoadingHeatmap } = useGlobalContext();

  // Center coordinates for New York City
  const center: LatLngExpression | undefined = [40.7128, -74.0060];

  // Toggle heatmap visibility and update related states
  const handleClick = () => {
    setShowingHeatMap(!showingHeatMap);
    setButtonActive(!showingHeatMap);
    setLoadingHeatmap(!showingHeatMap);
  };

  return (
    <MapContainer
      className="relative z-0"
      center={center}
      zoom={13}
      minZoom={3}
      renderer={L.svg({ padding: 80 })} // SVG renderer with padding for better performance
    >
      {/* Base map layer using OpenStreetMap tiles */}
      <TileLayer
        url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        edgeBufferTiles={3} // Pre-load adjacent tiles for smooth navigation
        keepBuffer={2}
      />

      {/* Toggle button for heatmap with loading state */}
      <Button
        loading={loadingHeatmap}
        onClick={handleClick}
        color={"bg-gray-500"}
        size={50}
        className="absolute top-20 right-8"
      >
        <Power width={25} color={buttonActive ? "yellow" : "black"} />
      </Button>

      {/* Conditional rendering of heatmap layer */}
      {showingHeatMap && (
        <HeatmapLayer points={crimeData as unknown as Point[]} />
      )}
    </MapContainer>
  );
};

export default Map;
