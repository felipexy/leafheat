"use strict";

L.HeatLayer = (L.Layer ? L.Layer : L.Class).extend({
  initialize: function (options, quadtrees) {
    // Store quadtrees for different resolution levels
    this._ultraLowResQuadtree = quadtrees.ultraLowResQuadtree; // For zoom <= 5
    this._lowResQuadtree = quadtrees.lowResQuadtree; // For zoom <= 8
    this._midResQuadtree = quadtrees.midResQuadtree; // For zoom <= 12
    this._midHighResQuadtree = quadtrees.midHighResQuadtree; // For zoom <= 14
    this._highResQuadtree = quadtrees.highResQuadtree; // For zoom > 14
    L.setOptions(this, options);
  },

  setLatLngs: function (latlngs) {
    this._latlngs = latlngs;
    return this.redraw();
  },

  addLatLng: function (latlng) {
    this._latlngs.push(latlng);
    return this.redraw();
  },

  setOptions: function (options) {
    L.setOptions(this, options);
    if (this._heat) {
      this._updateOptions();
    }
    return this.redraw();
  },

  redraw: function () {
    if (this._heat && !this._frame && this._map && !this._map._animating) {
      this._frame = L.Util.requestAnimFrame(this._redraw, this);
    }
    return this;
  },

  onAdd: function (map) {
    this._map = map;

    if (!this._canvas) {
      this._initCanvas();
    }

    if (this.options.pane) {
      this.getPane().appendChild(this._canvas);
    } else {
      map._panes.overlayPane.appendChild(this._canvas);
    }

    map.on("move zoom", this._reset, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on("zoomanim", this._animateZoom, this);
    }

    this._reset();
  },

  onRemove: function (map) {
    if (this.options.pane) {
      this.getPane().removeChild(this._canvas);
    } else {
      map.getPanes().overlayPane.removeChild(this._canvas);
    }

    this._map = null;
    this._heat = null;
    this._canvas = null;
    this._latlngs = null;
    this._ultraLowResQuadtree = null;
    this._lowResQuadtree = null;
    this._midResQuadtree = null;
    this._midHighResQuadtree = null;
    this._highResQuadtree = null;

    map.off("move zoom", this._reset, this);
    if (map.options.zoomAnimation) {
      map.off("zoomanim", this._animateZoom, this);
    }
  },

  addTo: function (map) {
    map.addLayer(this);
    return this;
  },

  _initCanvas: function () {
    var canvas = (this._canvas = L.DomUtil.create(
      "canvas",
      "leaflet-heatmap-layer leaflet-layer"
    ));

    canvas.getContext("2d", { willReadFrequently: true });

    var originProp = L.DomUtil.testProp([
      "transformOrigin",
      "WebkitTransformOrigin",
      "msTransformOrigin",
    ]);
    canvas.style[originProp] = "50% 50%";

    var size = this._map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;

    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(
      canvas,
      "leaflet-zoom-" + (animated ? "animated" : "hide")
    );

    this._heat = simpleheat(canvas);
    this._updateOptions();
  },

  _updateOptions: function () {
    this._heat.radius(
      this.options.radius || this._heat.defaultRadius,
      this.options.blur
    );

    if (this.options.gradient) {
      this._heat.gradient(this.options.gradient);
    }
    if (this.options.max) {
      this._heat.max(this.options.max);
    }
  },

  _reset: function () {
    if (!this._map) {
      return;
    }
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);

    var size = this._map.getSize();

    if (this._heat._width !== size.x) {
      this._canvas.width = this._heat._width = size.x;
    }
    if (this._heat._height !== size.y) {
      this._canvas.height = this._heat._height = size.y;
    }

    this._redraw();
  },

  _redraw: function () {
    if (!this._map) {
      return;
    }

    var bounds = this._map.getBounds();
    var zoom = this._map.getZoom();

    // Select appropriate quadtree based on current zoom level
    var quadtree;
    if (zoom <= 5) {
      quadtree = this._ultraLowResQuadtree;
    } else if (zoom <= 8) {
      quadtree = this._lowResQuadtree;
    } else if (zoom <= 12) {
      quadtree = this._midResQuadtree;
    } else if (zoom <= 14) {
      quadtree = this._midHighResQuadtree;
    } else {
      quadtree = this._highResQuadtree;
    }

    // Filter points using quadtree for better performance
    // This also includes points slightly outside the viewport for smooth panning
    var filteredPoints = [];
    quadtree.visit(function (node, x1, y1, x2, y2) {
      if (!node.length) {
        do {
          var d = node.data;
          if (
            d.x >= bounds.getWest() &&
            d.x < bounds.getEast() &&
            d.y >= bounds.getSouth() &&
            d.y < bounds.getNorth()
          ) {
            filteredPoints.push([d.y, d.x, d.intensity]);
          }
        } while ((node = node.next));
      }
      return (
        x1 >= bounds.getEast() ||
        y1 >= bounds.getNorth() ||
        x2 < bounds.getWest() ||
        y2 < bounds.getSouth()
      );
    });

    var data = [],
      r = this._heat._r,
      max = this.options.max === undefined ? 1 : this.options.max,
      maxZoom =
        this.options.maxZoom === undefined
          ? this._map.getMaxZoom()
          : this.options.maxZoom,
      v =
        1 /
        Math.pow(2, Math.max(0, Math.min(maxZoom - this._map.getZoom(), 12))),
      cellSize = r / 2,
      grid = [],
      panePos = this._map._getMapPanePos(),
      offsetX = panePos.x % cellSize,
      offsetY = panePos.y % cellSize,
      i,
      len,
      p,
      cell,
      x,
      y,
      k,
      j,
      len2;

    for (i = 0, len = filteredPoints.length; i < len; i++) {
      p = this._map.latLngToContainerPoint(filteredPoints[i]);

      x = Math.floor((p.x - offsetX) / cellSize) + 2;
      y = Math.floor((p.y - offsetY) / cellSize) + 2;

      var alt =
        filteredPoints[i].alt !== undefined
          ? filteredPoints[i].alt
          : filteredPoints[i][2] !== undefined
          ? +filteredPoints[i][2]
          : 1;
      k = alt * v;

      grid[y] = grid[y] || [];
      cell = grid[y][x];

      if (!cell) {
        grid[y][x] = [p.x, p.y, k];
      } else {
        cell[0] = (cell[0] * cell[2] + p.x * k) / (cell[2] + k); // x
        cell[1] = (cell[1] * cell[2] + p.y * k) / (cell[2] + k); // y
        cell[2] += k; // cumulated intensity value
      }
    }

    for (i = 0, len = grid.length; i < len; i++) {
      if (grid[i]) {
        for (j = 0, len2 = grid[i].length; j < len2; j++) {
          cell = grid[i][j];
          if (cell) {
            data.push([
              Math.round(cell[0]),
              Math.round(cell[1]),
              Math.min(cell[2], max),
            ]);
          }
        }
      }
    }
    this._heat.data(data).draw(this.options.minOpacity);

    this._frame = null;
  },

  _animateZoom: function (e) {
    var scale = this._map.getZoomScale(e.zoom),
      offset = this._map
        ._getCenterOffset(e.center)
        ._multiplyBy(-scale)
        .subtract(this._map._getMapPanePos());

    if (L.DomUtil.setTransform) {
      L.DomUtil.setTransform(this._canvas, offset, scale);
    } else {
      this._canvas.style[L.DomUtil.TRANSFORM] =
        L.DomUtil.getTranslateString(offset) + " scale(" + scale + ")";
    }
  },
});

L.heatLayer = function (latlngs, options) {
  return new L.HeatLayer(latlngs, options);
};
