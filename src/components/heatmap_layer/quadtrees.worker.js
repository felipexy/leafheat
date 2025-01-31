import Geohash from "ngeohash";

/**
 * Creates Level of Detail (LOD) points by clustering nearby points based on geohash precision
 * @param {Array} pointsArray - Array of points with lat, lng and intensity
 * @param {number} precision - Geohash precision level (higher = more precise)
 * @param {number} fraction - Fraction of points to consider (0-1)
 * @param {number} minIntensity - Minimum intensity threshold
 * @param {number} intensityMultiplier - Multiplier for intensity values
 */
function createLODPoints(
  pointsArray,
  precision,
  fraction,
  minIntensity,
  intensityMultiplier = 1.0
) {
  const sortedPoints = pointsArray.sort((a, b) => b.intensity - a.intensity);
  const numSelectedPoints = Math.floor(sortedPoints.length * fraction);
  const selectedPoints = sortedPoints.slice(0, numSelectedPoints);
  const filteredPoints = minIntensity
    ? selectedPoints.filter((p) => p.intensity >= minIntensity)
    : selectedPoints;

  const geohashToSummaryMap = new Map();

  filteredPoints.forEach((point) => {
    const geohash = Geohash.encode(point.lat, point.lng, precision);
    const existingSummary = geohashToSummaryMap.get(geohash) || {
      totalLat: 0,
      totalLng: 0,
      totalIntensity: 0,
      count: 0,
    };
    existingSummary.totalLat += point.lat;
    existingSummary.totalLng += point.lng;
    existingSummary.totalIntensity += point.intensity;
    existingSummary.count++;
    geohashToSummaryMap.set(geohash, existingSummary);
  });

  const result = Array.from(geohashToSummaryMap.values()).map(
    ({ totalLat, totalLng, totalIntensity, count }) => {
      return {
        lat: totalLat / count,
        lng: totalLng / count,
        intensity: Math.min(1, (totalIntensity / count) * intensityMultiplier), // max of 1
      };
    }
  );

  return result;
}

/**
 * Processes points into different LOD levels for efficient rendering
 * - ultraLow: Highest clustering, lowest detail (zoom levels 1-5)
 * - midLow: Medium clustering (zoom levels 6-10)
 * - mid: Lower clustering (zoom levels 11-14)
 * - high: No clustering, full detail (zoom levels 15+)
 */
function handleQuadTrees(points) {
  const lodLevels = {
    ultraLow: {
      precision: 7,
      fraction: 0.006,
      minIntensity: 0.08,
      intensityMultiplier: 100,
    },
    midLow: {
      precision: 7,
      fraction: 0.07,
      minIntensity: 0.08,
      intensityMultiplier: 100,
    },
    mid: {
      precision: 9,
      fraction: 0.07,
      minIntensity: 0.075,
      intensityMultiplier: 100,
    },
    high: {
      precision: 10,
      fraction: 1.0,
      minIntensity: 0,
      intensityMultiplier: 1.0,
    },
  };

  const latlngs = points.map((point) => {
    return { lat: point[0], lng: point[1], intensity: point[2] };
  });

  const processedPoints = {};

  for (const [
    level,
    { precision, fraction, minIntensity, intensityMultiplier },
  ] of Object.entries(lodLevels)) {
    if (level === "high") {
      processedPoints[level] = latlngs;
    } else
      processedPoints[level] = createLODPoints(
        latlngs,
        precision,
        fraction,
        minIntensity,
        intensityMultiplier
      );
  }

  return processedPoints;
}

function messageHandler(event) {
  const { points, type } = event.data;

  if (type === "terminate") {
    terminateWorker();
  } else {
    const result = handleQuadTrees(points);
    self.postMessage({ result });
  }
}

function terminateWorker() {
  self.removeEventListener("message", messageHandler);
  self.close();
}

self.addEventListener("message", messageHandler);
export default self;
