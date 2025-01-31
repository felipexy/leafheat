const fs = require("fs");
const path = require("path");

// Settings for realistic data generation
const NUM_POINTS = 20000;
const US_BOUNDS = {
  latMin: 40.477399, // Southern boundary of NYC
  latMax: 40.917577, // Northern boundary of NYC
  lngMin: -74.25909, // Western boundary of NYC
  lngMax: -73.700181, // Eastern boundary of NYC
};

function generateCrimeData() {
  const data = [];

  for (let i = 0; i < NUM_POINTS; i++) {
    // Generate random coordinates within NYC bounds
    const lat = parseFloat(
      (
        Math.random() * (US_BOUNDS.latMax - US_BOUNDS.latMin) +
        US_BOUNDS.latMin
      ).toFixed(6)
    );
    const lng = parseFloat(
      (
        Math.random() * (US_BOUNDS.lngMax - US_BOUNDS.lngMin) +
        US_BOUNDS.lngMin
      ).toFixed(6)
    );

    // Add intensity variation based on location
    const nycCenterLat = 40.7128;
    const nycCenterLng = -74.006;
    const distanceFromCenter = Math.sqrt(
      Math.pow(lat - nycCenterLat, 2) + Math.pow(lng - nycCenterLng, 2)
    );
    const locationFactor = Math.max(0, 1 - distanceFromCenter * 50);

    // Generate intensity with normal distribution (more concentrated in higher values)
    const intensity = Math.min(
      1.0,
      (Math.random() * 0.3 + 0.7) * // Base intensity
        locationFactor + // Central areas get higher intensity
        Math.random() * 0.2 // Random variation
    );

    data.push([lat, lng, parseFloat(intensity.toFixed(4))]);
  }

  return data;
}

// Save JSON file
const outputPath = path.join(__dirname, "../data/crime-data.json");
// Create directory if it doesn't exist
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(generateCrimeData(), null, 2));
console.log(`Crime data generated: ${outputPath}`);
