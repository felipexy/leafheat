"use strict";!function(){function t(i){if(!(this instanceof t))return new t(i);this._canvas=i="string"==typeof i?document.getElementById(i):i,this._ctx=i.getContext("2d"),this._width=i.width,this._height=i.height,this._max=1,this.clear()}t.prototype={defaultRadius:25,defaultGradient:{.4:"blue",.6:"cyan",.7:"lime",.8:"yellow",1:"red"},data:function(t,i){return this._data=t,this},max:function(t){return this._max=t,this},add:function(t){return this._data.push(t),this},clear:function(){return this._data=[],this},radius:function(t,i){i=i||15;var a=this._circle=document.createElement("canvas"),e=a.getContext("2d"),s=this._r=t+i;return a.width=a.height=2*s,e.shadowOffsetX=e.shadowOffsetY=200,e.shadowBlur=i,e.shadowColor="black",e.beginPath(),e.arc(s-200,s-200,t,0,2*Math.PI,!0),e.closePath(),e.fill(),this},gradient:function(t){var i=document.createElement("canvas"),a=i.getContext("2d"),e=a.createLinearGradient(0,0,0,256);i.width=1,i.height=256;for(var s in t)e.addColorStop(s,t[s]);return a.fillStyle=e,a.fillRect(0,0,1,256),this._grad=a.getImageData(0,0,1,256).data,this},draw:function(t){this._circle||this.radius(this.defaultRadius),this._grad||this.gradient(this.defaultGradient);var i=this._ctx;i.clearRect(0,0,this._width,this._height);for(var a,e=0,s=this._data.length;e<s;e++)a=this._data[e],i.globalAlpha=Math.max(a[2]/this._max,t||.05),i.drawImage(this._circle,a[0]-this._r,a[1]-this._r);var h=i.getImageData(0,0,this._width,this._height);return this._colorize(h.data,this._grad),i.putImageData(h,0,0),this},_colorize:function(t,i){for(var a,e=3,s=t.length;e<s;e+=4)(a=4*t[e])&&(t[e-3]=i[a],t[e-2]=i[a+1],t[e-1]=i[a+2])}},window.simpleheat=t}(),L.HeatLayer=(L.Layer?L.Layer:L.Class).extend({initialize:function(t,i){this._ultraLowResQuadtree=i.ultraLowResQuadtree,this._midLowResQuadtree=i.midLowResQuadtree,this._midResQuadtree=i.midResQuadtree,this._highResQuadtree=i.highResQuadtree,L.setOptions(this,t)},setLatLngs:function(t){return this._latlngs=t,this.redraw()},addLatLng:function(t){return this._latlngs.push(t),this.redraw()},setOptions:function(t){return L.setOptions(this,t),this._heat&&this._updateOptions(),this.redraw()},redraw:function(){return this._heat&&!this._frame&&this._map&&!this._map._animating&&(this._frame=L.Util.requestAnimFrame(this._redraw,this)),this},onAdd:function(t){this._map=t,this._canvas||this._initCanvas(),this.options.pane?this.getPane().appendChild(this._canvas):t._panes.overlayPane.appendChild(this._canvas),t.on("move zoom",this._reset,this),t.options.zoomAnimation&&L.Browser.any3d&&t.on("zoomanim",this._animateZoom,this),this._reset()},onRemove:function(t){this.options.pane?this.getPane().removeChild(this._canvas):t.getPanes().overlayPane.removeChild(this._canvas),this._map=null,this._heat=null,this._canvas=null,this._latlngs=null,this._ultraLowResQuadtree=null,this._midLowResQuadtree=null,this._midResQuadtree=null,this._highResQuadtree=null,t.off("move zoom",this._reset,this),t.options.zoomAnimation&&t.off("zoomanim",this._animateZoom,this)},addTo:function(t){return t.addLayer(this),this},_initCanvas:function(){var t=this._canvas=L.DomUtil.create("canvas","leaflet-heatmap-layer leaflet-layer");t.getContext("2d",{willReadFrequently:!0});var i=L.DomUtil.testProp(["transformOrigin","WebkitTransformOrigin","msTransformOrigin"]);t.style[i]="50% 50%";var a=this._map.getSize();t.width=a.x,t.height=a.y;var e=this._map.options.zoomAnimation&&L.Browser.any3d;L.DomUtil.addClass(t,"leaflet-zoom-"+(e?"animated":"hide")),this._heat=simpleheat(t),this._updateOptions()},_updateOptions:function(){this._heat.radius(this.options.radius||this._heat.defaultRadius,this.options.blur),this.options.gradient&&this._heat.gradient(this.options.gradient),this.options.max&&this._heat.max(this.options.max)},_reset:function(){if(this._map){var t=this._map.containerPointToLayerPoint([0,0]);L.DomUtil.setPosition(this._canvas,t);var i=this._map.getSize();this._heat._width!==i.x&&(this._canvas.width=this._heat._width=i.x),this._heat._height!==i.y&&(this._canvas.height=this._heat._height=i.y),this._redraw()}},_redraw:function(){if(this._map){var t,i=this._map.getBounds(),a=this._map.getZoom();t=a<=5?this._ultraLowResQuadtree:a<=10?this._midLowResQuadtree:a<=13?this._midResQuadtree:this._highResQuadtree;var e=[];t.visit(function(t,a,s,h,n){if(!t.length)do{var o=t.data;o.x>=i.getWest()&&o.x<i.getEast()&&o.y>=i.getSouth()&&o.y<i.getNorth()&&e.push([o.y,o.x,o.intensity])}while(t=t.next);return a>=i.getEast()||s>=i.getNorth()||h<i.getWest()||n<i.getSouth()});var s,h,n,o,r,d,_,l,m,u=[],c=this._heat._r,g=void 0===this.options.max?1:this.options.max,p=void 0===this.options.maxZoom?this._map.getMaxZoom():this.options.maxZoom,f=1/Math.pow(2,Math.max(0,Math.min(p-this._map.getZoom(),12))),v=c/2,w=[],L=this._map._getMapPanePos(),y=L.x%v,x=L.y%v;for(s=0,h=e.length;s<h;s++){n=this._map.latLngToContainerPoint(e[s]),r=Math.floor((n.x-y)/v)+2,d=Math.floor((n.y-x)/v)+2;_=(void 0!==e[s].alt?e[s].alt:void 0!==e[s][2]?+e[s][2]:1)*f,w[d]=w[d]||[],o=w[d][r],o?(o[0]=(o[0]*o[2]+n.x*_)/(o[2]+_),o[1]=(o[1]*o[2]+n.y*_)/(o[2]+_),o[2]+=_):w[d][r]=[n.x,n.y,_]}for(s=0,h=w.length;s<h;s++)if(w[s])for(l=0,m=w[s].length;l<m;l++)(o=w[s][l])&&u.push([Math.round(o[0]),Math.round(o[1]),Math.min(o[2],g)]);this._heat.data(u).draw(this.options.minOpacity),this._frame=null}},_animateZoom:function(t){var i=this._map.getZoomScale(t.zoom),a=this._map._getCenterOffset(t.center)._multiplyBy(-i).subtract(this._map._getMapPanePos());L.DomUtil.setTransform?L.DomUtil.setTransform(this._canvas,a,i):this._canvas.style[L.DomUtil.TRANSFORM]=L.DomUtil.getTranslateString(a)+" scale("+i+")"}}),L.heatLayer=function(t,i){return new L.HeatLayer(t,i)};