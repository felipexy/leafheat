type Coordinate = number;
type Position = [Coordinate, Coordinate]; // Longitude, Latitude
type PositionList = Position[];

interface GeoJsonGeometry {
  type: "Point" | "LineString" | "Polygon";
  coordinates: Position | PositionList | PositionList[];
}

interface GeoJsonFeature<Properties = {}> {
  type: "Feature";
  geometry: GeoJsonGeometry;
  properties: Properties;
}

interface GeoJsonFeatureCollection<Properties = {}> {
  type: "FeatureCollection";
  features: GeoJsonFeature<Properties>[];
}

export type GeoJsonObject = GeoJsonGeometry | GeoJsonFeature | GeoJsonFeatureCollection;