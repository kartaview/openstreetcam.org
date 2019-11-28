// import { Marker, icon } from 'leaflet';

// const mapboxgl = require('mapbox-gl-leaflet');

declare let L: any;
// declare let Marker: any;
// declare let icon: any;

let leafletGlobalMap = null;

/*(Marker as any).prototype.options.icon = icon({
  iconRetinaUrl: '/assets/images/map/marker-icon-2x.png',
  iconUrl: '/assets/images/map/marker-icon.png',
  shadowUrl: '/assets/images/map/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});*/

export enum EBaseTilesLayerType {
  XYZURL = 'xyzurl',
  MAPBOX = 'mapbox'
}

export class OSCMapLeafletTiles {
  private _leafletMapEngine: any;
  private _baseMapLayer: any;
  private _coverageMapLayer: any;

  private _geoJSONLayer: any = null;


  private _coverageTilesEnabled = false;
  private _coverageTilesType = '';
  private _coverageTilesUrl = '';

  constructor(leafletMapEngine: any) {
    this._leafletMapEngine = leafletMapEngine;
    leafletGlobalMap = leafletMapEngine;
  }

  public removeBaseMapLayer() {
    if (this._leafletMapEngine) {
      this._leafletMapEngine.removeLayer(this._baseMapLayer)
    }
  }

  public initBaseMapLayer(baseTilesLayerUrl: string, baseTilesLayerType: EBaseTilesLayerType, baseTilesLayerToken: string) {
    switch (baseTilesLayerType) {
      case EBaseTilesLayerType.XYZURL:
        this._baseMapLayer = L.tileLayer(baseTilesLayerUrl,
          { attribution: '', maxZoom: 20, maxNativeZoom: 18 }
        );
        this._leafletMapEngine.addLayer(this._baseMapLayer);
        break;
      case EBaseTilesLayerType.MAPBOX:
        /*console.log(baseTilesLayerToken);
        mapboxgl.accessToken = baseTilesLayerToken;
        this._baseMapLayer = L.mapboxGL({
          accessToken: baseTilesLayerToken,
          style: 'mapbox://styles/mapbox/bright-v8'
        }).addTo(this._leafletMapEngine);*/
        break;
      default:
        throw new Error(`Invalid base map tiles type ${baseTilesLayerType}`);
    }
  }

  public removeCoverageMapLayer() {
    if (this._coverageMapLayer) {
      this._leafletMapEngine.removeLayer(this._coverageMapLayer)
      this._coverageMapLayer = null;
    }
  }

  public initCoverageMapLayer(coverageTileLayerUrl, coverageTileLayerType) {
    if (this._coverageMapLayer) {
      this.removeCoverageMapLayer();
    }
    this._coverageTilesEnabled = true;
    this._coverageTilesType = coverageTileLayerType;
    this._coverageTilesUrl = coverageTileLayerUrl;

    if (this._coverageTilesEnabled) {
      if (this._coverageTilesType === 'geojson') {
        this._coverageMapLayer = (L as any).geoJson(null, {
          style: this.geoJSONStyles
        }).addTo(this._leafletMapEngine);

        this._baseMapLayer.on('tileload', (event) => {
          const title = (event as any).tile.currentSrc.split('/');
          const z = title[title.length - 3];
          const x = title[title.length - 2];
          const y = title[title.length - 1].split('.')[0];

          const jsonString = this._coverageTilesUrl.replace('{x}', x).replace('{y}', y).replace('{z}', z);

          $.getJSON(jsonString, (json) => {
            try {
              if (parseInt(z, 10) === this._leafletMapEngine.getZoom()) {
                this._coverageMapLayer.addData(json);
              }
            } catch (e) {
              throw e;
            }
          });
        });
      } else if (this._coverageTilesType === 'png') {
        this._coverageMapLayer = L.tileLayer(this._coverageTilesUrl, { attribution: '', maxZoom: 20 });
        this._coverageMapLayer.addTo(this._leafletMapEngine)
      } else if (this._coverageTilesType === 'json') {
        this._coverageMapLayer = (new L.GridLayer());
        const mapObject = this;
        this._coverageMapLayer.createTile = function (coords) {
          const tile = L.DomUtil.create('canvas', 'leaflet-tile');
          const size = this.getTileSize();
          (tile as any).width = (size as any).x;
          (tile as any).height = (size as any).y;

          /*const ctx = (tile as any).getContext('2d');
          const nwPoint = coords.scaleBy(size)
          const nw = mapObject.leafletMap.unproject(nwPoint, coords.z)

          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, size.x, 50);
          ctx.fillStyle = 'black';
          ctx.fillText('x: ' + coords.x + ', y: ' + coords.y + ', zoom: ' + coords.z, 20, 20);
          ctx.fillText('lat: ' + nw.lat + ', lon: ' + nw.lng, 20, 40);
          ctx.strokeStyle = 'red';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(size.x - 1, 0);
          ctx.lineTo(size.x - 1, size.y - 1);
          ctx.lineTo(0, size.y - 1);
          ctx.closePath();
          ctx.stroke();*/

          const jsonString = this._coverageTilesUrl.replace('{x}', coords.x).replace('{y}', coords.y).replace('{z}', coords.z);
          $.getJSON(jsonString, (json) => {
            try {
              setTimeout(() => {
                if (parseInt(coords.z, 10) === mapObject._leafletMapEngine.getZoom()) {
                  mapObject.drawPolylineV2(null, (tile as any).getContext('2d'), json.lines, true);
                }
              }, 100);
            } catch (e) {
              throw e;
            }
          });
          return tile;
        }
        this._coverageMapLayer.addTo(this._leafletMapEngine)
      } else if (this._coverageTilesType === 'jsoncanvas') {
        this._coverageMapLayer = (L as any).canvasLayer().delegate(this).addTo(this._leafletMapEngine);

        this._baseMapLayer.on('tileload', (event) => {
          const title = (event as any).tile.currentSrc.split('/');
          const z = title[title.length - 3];
          const x = title[title.length - 2];
          const y = title[title.length - 1].split('.')[0];

          const jsonString = this._coverageTilesUrl.replace('{x}', x).replace('{y}', y).replace('{z}', z);

          $.getJSON(jsonString, (json) => {
            try {
              if (parseInt(z, 10) === this._leafletMapEngine.getZoom()) {
                const ctx = this._coverageMapLayer.canvas().getContext('2d');
                this.drawPolylineV2(this._coverageMapLayer, ctx, json.lines, false);
              }
            } catch (e) {
              throw e;
            }
          });
        });
      }
    }

  }

  public zoomEndAction() {
    if (this._coverageTilesEnabled) {
      if (this._coverageTilesType === 'geojson') {
        this._coverageMapLayer.clearLayers();
      } else if (this._coverageTilesType === 'json') {
        this._leafletMapEngine.invalidateSize();
      } else if (this._coverageTilesType === 'jsoncanvas') {
        const ctx = this._coverageMapLayer.canvas().getContext('2d');
        ctx.clearRect(0, 0, this._coverageMapLayer.canvas().width, this._coverageMapLayer.canvas().height);
      }
    }

  }

  drawPolylineV2(canvasOverlay, ctx, tracks, canvasTileLayer) {
    tracks.forEach((track) => {
      if (parseInt(track.matched, 10) === 1) {
        if (track.track.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(189,16,224,' + (0.4 + (Math.max(parseInt(track.coverage, 10), 10) / 6)) + ')'; // (parseInt(10, 10) / 6) +
          ctx.fillStyle = 'rgba(189,16,224,' + (0.4 + (Math.max(parseInt(track.coverage, 10), 10) / 6)) + ')'; // (parseInt(10, 10) / 6) +
          ctx.lineWidth = 2;
          let pointIndex = 0;
          for (let i = 0; i < track.track.length; i++) {

            const dotXY = canvasTileLayer ?
              { x: track.track[i]['x'], y: track.track[i]['y'] } :
              canvasOverlay._map.latLngToContainerPoint(new L.LatLng(track.track[i]['lat'], track.track[i]['lng']));

            if (pointIndex === 0) {
              ctx.moveTo(dotXY.x, dotXY.y);
            } else {
              ctx.lineTo(dotXY.x, dotXY.y);
            }
            pointIndex++;
          }
          ctx.stroke();
          ctx.closePath();
        } else if (track.track.length === 1) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(189,16,224,' + (0.4 + (Math.max(parseInt(track.coverage, 10), 10) / 6)) + ')';
          ctx.fillStyle = 'rgba(189,16,224,' + (0.4 + (Math.max(parseInt(track.coverage, 10), 10) / 6)) + ')';
          ctx.lineWidth = 2;

          const dotXY = canvasTileLayer ?
            { x: track.track[0]['x'], y: track.track[0]['y'] } :
            canvasOverlay._map.latLngToContainerPoint(new L.LatLng(track.track[0]['lat'], track.track[0]['lng']));

          ctx.arc(dotXY.x, dotXY.y, 1, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        }
      } else {
        if (track.track.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(16,189,16,1)'; // (parseInt(10, 10) / 6) +
          ctx.fillStyle = 'rgba(16,189,16,1)'; // (parseInt(10, 10) / 6) +
          ctx.lineWidth = 2;
          let pointIndex = 0;
          for (let i = 0; i < track.track.length; i++) {

            const dotXY = canvasTileLayer ?
              { x: track.track[i]['x'], y: track.track[i]['y'] } :
              canvasOverlay._map.latLngToContainerPoint(new L.LatLng(track.track[i]['lat'], track.track[i]['lng']));

            if (pointIndex === 0) {
              ctx.moveTo(dotXY.x, dotXY.y);
            } else {
              ctx.lineTo(dotXY.x, dotXY.y);
            }
            pointIndex++;
          }
          ctx.stroke();
          ctx.closePath();
        } else if (track.track.length === 1) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(16,189,16,1)';
          ctx.fillStyle = 'rgba(16,189,16,1)';
          ctx.lineWidth = 2;
          const dotXY = canvasTileLayer ?
            { x: track.track[0]['x'], y: track.track[0]['y'] } :
            canvasOverlay._map.latLngToContainerPoint(new L.LatLng(track.track[0]['lat'], track.track[0]['lng']));

          ctx.arc(dotXY.x, dotXY.y, 1, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        }
      }
    });
  }

  geoJSONStyles(feature) {
    return {
      weight: (feature.properties.name === 'unmatched' || feature.geometry.properties.name === 'unmatched' ?
        5 + ((18 - leafletGlobalMap.getZoom()) * 10)
        : 3 + ((18 - leafletGlobalMap.getZoom()) / 6)),
      opacity: 1,
      color: (feature.properties.name === 'matched' || feature.geometry.properties.name === 'matched'
        ? '#BD10E0' :
        (feature.properties.name === 'unmatched' || feature.geometry.properties.name === 'unmatched' ? '#10BD10' : 'black')),
    };
  }

  initGeoJSONLayer(options = {}) {
    this._geoJSONLayer = (L as any).geoJson(null, options).addTo(this._leafletMapEngine);
  }

  addGeoJSON(jsonString) {
    if (!this._geoJSONLayer) {
      throw new Error('Leaflet map was not initialized!!!');
    }
    this._geoJSONLayer.addData(jsonString);
  }

  getJSONLayer() {
    return this._geoJSONLayer;
  }

  getBounds() {
    return this._leafletMapEngine.getBounds();
  }
}
