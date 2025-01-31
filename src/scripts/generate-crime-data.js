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

  // Define hotspots (areas with higher crime concentration)
  const hotspots = [
    { lat: 40.7128, lng: -74.006, weight: 2.0 }, // Manhattan
    { lat: 40.6782, lng: -73.9442, weight: 1.8 }, // Brooklyn
    { lat: 40.7282, lng: -73.7949, weight: 1.6 }, // Queens
    { lat: 40.8448, lng: -73.8648, weight: 1.7 }, // Bronx
  ];

  for (let i = 0; i < NUM_POINTS; i++) {
    // Randomly choose a hotspot with higher probability for important areas
    const useHotspot = Math.random() < 0.7; // 70% chance of using a hotspot
    let lat, lng;

    if (useHotspot) {
      const hotspot = hotspots[Math.floor(Math.random() * hotspots.length)];
      // Generate points in gaussian distribution around the hotspot
      const radius = Math.random() * 0.05; // Maximum radius of 0.05 degrees
      const angle = Math.random() * 2 * Math.PI;
      lat = hotspot.lat + radius * Math.cos(angle);
      lng = hotspot.lng + radius * Math.sin(angle);
    } else {
      // Generate random points for the rest of the city
      lat =
        Math.random() * (US_BOUNDS.latMax - US_BOUNDS.latMin) +
        US_BOUNDS.latMin;
      lng =
        Math.random() * (US_BOUNDS.lngMax - US_BOUNDS.lngMin) +
        US_BOUNDS.lngMin;
    }

    // Calculate intensity based on proximity to hotspots
    let maxIntensity = 0;
    hotspots.forEach((hotspot) => {
      const distance = Math.sqrt(
        Math.pow(lat - hotspot.lat, 2) + Math.pow(lng - hotspot.lng, 2)
      );
      const intensity = Math.max(0, hotspot.weight * (1 - distance * 5)); // Reduced from 10 to 5 to increase influence area
      maxIntensity = Math.max(maxIntensity, intensity);
    });

    // Increase overall intensity and add random variation
    const finalIntensity = Math.min(
      1.0,
      maxIntensity * 2.5 + // Increased from 1.5 to 2.5
        Math.random() * 0.4 + // Increased from 0.3 to 0.4
        0.35 // Increased from 0.2 to 0.35 (minimum intensity)
    );

    data.push([
      parseFloat(lat.toFixed(6)),
      parseFloat(lng.toFixed(6)),
      parseFloat(finalIntensity.toFixed(4)),
    ]);
  }

  return data;
}

// Save JSON file
const outputPath = path.join(__dirname, "../data/crime-data.json");
// Create directory if it doesn't exist
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(generateCrimeData(), null, 2));
console.log(`Crime data generated: ${outputPath}`);
