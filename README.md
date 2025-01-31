# Leaflet Heat + Smooth Drag + Level of Detail

This is a demonstration application showcasing a modified version of the Leaflet Heat library. The original library has been enhanced with additional features including smooth drag operations and level of detail (LOD) rendering. These modifications were specifically implemented to handle large datasets more efficiently through various performance optimizations such as a quadtree-based LOD system and canvas optimizations.

This project serves as a proof of concept for the enhanced Leaflet Heat library capabilities, demonstrating how the modified version can handle performance-critical scenarios better than the original implementation.

> **Note**: This demo uses synthetic data generated for demonstration purposes only. The data points do not represent real-world information and are created solely to showcase the library's capabilities and performance optimizations.

## Demo

<table style="border: none;">
<tr style="border: none;">
<td style="border: none;">
<h4>Before</h4>
<img src="before.gif" width="250" alt="Before implementation showing laggy drag">
</td>
<td style="border: none;">
<h4>After</h4>
<img src="after.gif" width="250" alt="After implementation showing smooth drag">
</td>
</tr>
</table>

The GIFs above demonstrate the improvement in drag performance. The "Before" GIF shows the original implementation with noticeable lag and visual artifacts during map dragging, while the "After" GIF showcases the enhanced version with smooth, responsive dragging and consistent visual quality during map navigation.

## Getting Started

### Installation

First, install the dependencies:

```bash

yarn  install

```

### Development Server

Then, run the development server:

```bash

yarn  dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Performance Optimizations

### Level of Detail (LOD) Implementation

This project includes a modified version of the Leaflet heat layer that implements Level of Detail (LOD) for improved performance with large datasets. The main optimizations include:

#### Quadtree-based LOD System

- Uses different resolution quadtrees based on zoom levels:

- Ultra Low Resolution: zoom ≤ 5

- Low Resolution: 5 < zoom ≤ 8

- Mid Resolution: 8 < zoom ≤ 12

- Mid-High Resolution: 12 < zoom ≤ 14

- High Resolution: zoom > 14

#### Extended Rendering Area

- Renders heatmap data beyond the visible viewport

- Provides smoother user experience when panning the map

- Reduces visual artifacts during map navigation

#### Canvas Optimizations

- Uses `willReadFrequently: true` flag for better canvas performance

- Implements efficient pixel manipulation strategies

- Optimizes memory usage during rendering

#### Spatial Query Improvements

- Utilizes quadtree spatial indexing for faster point queries

- Only processes points within the current map bounds

- Implements early return for out-of-view regions

### Development Notes

#### Modifying the Heatmap Source

If you need to modify the heatmap functionality, follow these steps:

1. Make your changes in `src/lib/heatmap-source/heatmap-source.js`

2. Run the minification command:

```bash

yarn  minify-heatmap

```

3. This will create/update `leaflet-heat.js` which is the actual library used by the application

The minification step is crucial as it:

- Optimizes the code for production

- Reduces file size

- Ensures compatibility across browsers

- Creates the final version used by the application

These optimizations significantly improve performance when dealing with large datasets while maintaining visual quality appropriate for each zoom level.

### Customization Options

The library supports extensive customization of the LOD (Level of Detail) system and heatmap appearance. Users can modify:

- LOD zoom level breakpoints

- Intensity levels for each LOD

- Quadtree cell sizes

- Visual parameters (radius, blur, gradient, opacity)

Please refer to the library documentation for detailed configuration options.

### Worker-based Geohash Clustering

The application implements a dedicated Web Worker for efficient point clustering using geohash-based spatial indexing. Key features include:

- **Asynchronous Processing**: Handles point clustering in a separate thread to maintain UI responsiveness

- **Geohash-based Clustering**: Groups nearby points using geohash precision levels

- **Multi-level LOD Processing**: Creates different detail levels simultaneously:

- Ultra-low: Highest clustering for zoom levels 1-5

- Mid-low: Medium clustering for zoom levels 6-10

- Mid: Lower clustering for zoom levels 11-14

- High: No clustering for zoom levels 15+

- **Intensity Weighting**: Maintains intensity information through weighted averages during clustering

- **Memory Efficient**: Processes points in batches and releases memory after clustering

This worker-based approach ensures smooth map interaction even with large datasets by offloading the computational overhead of point clustering.
