import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
// import { ControlPosition } from 'leaflet';

import { OSCMapLeafletTiles } from './mapLeafletTiles';

// Assign the imported image assets before you do anything with Leaflet.

declare let L: any;

/**
 * This class represents the navigation bar component.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-map',
  templateUrl: 'map.component.html',
  styleUrls: ['map.component.css'],
})
export class MapComponent implements OnInit {

  private _mapTiles;


  leafletMap: any;
  leafletMapTrackLayer: any;
  leafletMarker: any = null;
  leafletMarkerRotation = new BehaviorSubject(0);
  leafletMarkerRotationValue = 0;
  leafletMarkers = [];
  leafletCanvas: any;
  leafletTrackDataPolyline: any = null;

  private _baseTilesTimeout;

  private _baseTilesEnabled = true;
  @Input()
  set baseTilesEnabled(value: boolean) {
    this._baseTilesEnabled = value;
    this.updateBaseTiles();
  }
  get baseTilesEnabled(): boolean {
    return this._baseTilesEnabled;
  };

  private _baseTilesUrl = '';
  @Input()
  set baseTilesUrl(value: string) {
    this._baseTilesUrl = value;
    this.updateBaseTiles();
  }
  get baseTilesUrl(): string {
    return this._baseTilesUrl;
  };

  private _baseTilesType = '';
  @Input()
  set baseTilesType(value: string) {
    this._baseTilesType = value;
    this.updateBaseTiles();
  }
  get baseTilesType(): string {
    return this._baseTilesType;
  };

  private _baseTilesToken = '';
  @Input()
  set baseTilesToken(value: string) {
    this._baseTilesToken = value;
    this.updateBaseTiles();
  }
  get baseTilesToken(): string {
    return this._baseTilesToken;
  };

  private _coverageTilesTimeout;

  private _coverageTilesEnabled = false;
  @Input()
  set coverageTilesEnabled(value: boolean) {
    this._coverageTilesEnabled = value;
    this.updateCoverageTiles();
  }
  get coverageTilesEnabled(): boolean {
    return this._coverageTilesEnabled;
  }

  private _coverageTilesType = '';
  @Input()
  set coverageTilesType(value: string) {
    this._coverageTilesType = value;
    this.updateCoverageTiles();
  }
  get coverageTilesType(): string {
    return this._coverageTilesType;
  }

  private _coverageTilesUrl = '';
  @Input()
  set coverageTilesUrl(value: string) {
    this._coverageTilesUrl = value;
    this.updateCoverageTiles();
  }
  get coverageTilesUrl(): string {
    return this._coverageTilesUrl;
  };


  @Input() lat = 0;
  @Input() lng = 0;
  @Input() zoom = 5;
  @Input() disableKeyboard = false;

  public _trackData = [];
  @Input()
  set trackData(trackData: any) {
    this._trackData = trackData;
    this.reloadTrackData();
  }
  get trackData() {
    return this._trackData;
  }

  private _marker = { enabled: false, lat: 0, lng: 0, zoom: null, rotation: 0, image: '', autoCenter: false };
  @Input()
  set marker(marker: any) {
    if (marker && marker.enabled) {
      this._marker = $.extend({}, this._marker, marker);
    }
    if (this._marker && this._marker.lat && this._marker.lng) {
      this.updateMarker();
    }
  }
  get marker() {
    return this._marker;
  };
  private _markerRotationDelta = 0;
  @Input()
  set markerRotationDelta(rotationDelta: number) {
    this._markerRotationDelta = rotationDelta;
    this.leafletMarkerRotation.next(this.leafletMarkerRotationValue + rotationDelta);
  }

  private _markers = [];
  @Input()
  set markers(markers: any) {
    this._markers = markers;
    this.updateMarkers();
  }
  get markers() {
    return this._marker;
  };

  @Input() set hiddenCheck(value: boolean) {
    if (value) {
      setTimeout(() => {
        this.leafletMap.invalidateSize();
      }, 500);
    }
  }

  @Input() elementId = 'map';
  @Input() locationControl = false;
  @Input() searchBoxControl = false;
  @Input() zoomControlPosition = 'bottomright';

  @Output() onPan = new EventEmitter();
  @Output() onClick = new EventEmitter();
  @Output() onMapEvent = new EventEmitter();

  @ViewChild('mapContainer') mapContainerElement: ElementRef;

  public hasOnPan = false;
  public hasOnClick = false;
  public locationLat = 0;
  public locationLng = 0;

  public locationLoading = false;
  public locationLoaded = false;

  public searchLoading = false;
  public searchString = '';
  public searchResults = [];
  public searchResultsErrorType = 0;

  private afterPositionChangeTimeout = null;

  constructor() { }

  ngOnInit() {
    this.mapContainerElement.nativeElement.setAttribute('id', this.elementId);
    this.hasOnPan = this.onPan.observers.length > 0;
    this.hasOnClick = this.onClick.observers.length > 0;

    this.leafletMap = L.map(this.elementId, {
      center: (this.lat !== null && this.lng !== null ? new L.LatLng(this.lat, this.lng) : null),
      zoom: (this.zoom ? this.zoom : null),
      zoomControl: false,
      attributionControl: false
    });

    this._mapTiles = new OSCMapLeafletTiles(this.leafletMap);

    if (this.hasOnClick) {
      this.leafletMap.on('click', (event) => {
        this.onClick.emit({
          lat: event.latlng.lat,
          lng: event.latlng.lng,
          x: event.containerPoint.x,
          y: event.containerPoint.y
        });
      });
    }

    this.leafletMapTrackLayer = L.layerGroup().addTo(this.leafletMap);
    if (this.disableKeyboard) {
      this.leafletMap.keyboard.disable();
    }

    this.leafletMap.on('moveend', (e) => {
      this.onChangeCallback();
    });

    this.leafletMap.on('zoomend', (e) => {
      this.onChangeCallback();
      this._mapTiles.zoomEndAction();
    });
    L.control.zoom({ position: this.zoomControlPosition }).addTo(this.leafletMap);

    this.leafletMarkerRotation.subscribe(value => {
      if (this.leafletMarker) {
        this.leafletMarker.setRotationAngle(value);
      }
    })
    this.reloadTrackData();
    this.updateMarker();
    this.onChangeCallback();
  }

  reloadTrackData() {
    if (!this.leafletMap) {
      return;
    }
    if (this.leafletTrackDataPolyline) {
      this.leafletMapTrackLayer.removeLayer(this.leafletTrackDataPolyline);
      this.leafletTrackDataPolyline = null;
    }
    if (this._trackData && this._trackData.length > 0) {
      this.leafletTrackDataPolyline = L.polyline(this._trackData, { color: 'blue', weight: 4 }).addTo(this.leafletMapTrackLayer);
    }
  }

  onChangeCallback() {
    clearTimeout(this.afterPositionChangeTimeout);
    this.afterPositionChangeTimeout = setTimeout(() => {
      const center = this.leafletMap.getCenter();
      this.onPan.emit({ lat: center.lat, lng: center.lng, zoom: this.leafletMap.getZoom(), bounds: this.leafletMap.getBounds() });
    }, 10);
  }

  onMapEventResponse(event) {
    if (event.type === 'search') {
      if (event.result === 'success') {
        this.searchLoading = false;
        if (!event.searchData || event.searchData.length === 0) {
          this.searchResultsErrorType = 1;
        } else {
          event.searchData.forEach((placeItem) => {
            const item = {
              data: placeItem,
              html: `${placeItem.name}`
            };
            this.searchResults.push(item);
          });
        }

      } else if (event.result === 'failed') {
        this.searchLoading = false;
        this.searchResultsErrorType = 2;
      }
    } else if (event.type === 'location') {
      if (event.result === 'success') {
        this.locationLat = event.locationData.lat;
        this.locationLng = event.locationData.lng;
        this.locationLoading = false;
        this.locationLoaded = true;
        this.refreshMapData();
      } else if (event.result === 'failed') {
        this.locationLoading = false;
      }
    }
  }

  onSearch(event) {
    this.searchLoading = true;
    this.searchResults = [];
    this.searchResultsErrorType = 0;
    if (!event.searchString || event.searchString.length < 1) {
      this.searchLoading = false;
      this.searchResultsErrorType = 3;
    } else {
      this.onMapEvent.emit({
        type: 'search',
        searchString: event.searchString
      });
    }
  }

  onResultSelected(event) {
    this.searchResults = [];
    this.leafletMap.setView([event.point.latitude, event.point.longitude], 13);
    this.searchString = '';
  }

  useMyLocation() {
    if (this.locationLoaded) {
      this.refreshMapData();
    } else {
      this.locationLoading = true;
      this.onMapEvent.emit({
        type: 'location'
      });

    }
  }

  refreshMapData() {
    const point = [this.locationLat, this.locationLng];
    this.leafletMap.setView(point, 10, { animate: false });
    this.onChangeCallback();
  }

  initMarker() {
    if (!this.leafletMarker) {
      const directionIcon = L.icon({
        iconUrl: this._marker.image,
        iconSize: [30, 30], // size of the icon
        iconAnchor: [15, 15]
      });
      this.leafletMarker = L.marker(new L.LatLng(this._marker.lat, this._marker.lng), { icon: directionIcon }).addTo(this.leafletMap);
      this.leafletMarkerRotation.next(this._marker.rotation + this._markerRotationDelta);
      this.leafletMarkerRotationValue = this._marker.rotation;
      this.leafletMarker.setZIndexOffset(1000);
    }
  }

  updateMarker() {
    if (this.leafletMap && this._marker.enabled) {
      (!this.leafletMarker ? this.initMarker() : this.changeMarkerPosition());
      if (this._marker.autoCenter) {
        if (this._marker.zoom) {
          this.leafletMap.setView([this._marker.lat, this._marker.lng], this._marker.zoom);
        } else {
          this.leafletMap.setView([this._marker.lat, this._marker.lng]);
        }
      }
    }
  }

  changeMarkerPosition() {
    if (!this.leafletMarker) {
      return;
    }
    this.leafletMarkerRotation.next(this._marker.rotation + this._markerRotationDelta);
    this.leafletMarkerRotationValue = this._marker.rotation;
    this.leafletMarker.setLatLng(new L.LatLng(this._marker.lat, this._marker.lng));
  }

  updateMarkers() {
    if (this.leafletMap) {
      this.leafletMarkers.forEach(item => {
        this.leafletMap.removeLayer(item);
      });
      this.leafletMarkers = [];
      this._markers.forEach(marker => {
        const directionIcon = L.icon({
          iconUrl: marker.image,
          iconSize: [30, 30], // size of the icon
          // iconAnchor: [15, 15]
        });
        const newMarker = L.marker(new L.LatLng(marker.lat, marker.lng), { icon: directionIcon }).addTo(this.leafletMap);
        if (marker.rotation) {
          (newMarker as any).setRotationAngle(marker.rotation);
        }
        this.leafletMarkers.push(newMarker);
      });
    }
  }

  invalidateSize() {
    this.leafletMap.invalidateSize();
  }

  onMapReady(map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }

  getBounds() {
    return this._mapTiles.getBounds();
  }

  initBaseMap(mapTiles: string) {
    this._baseTilesEnabled = true;
    this._baseTilesUrl = mapTiles;
    this._mapTiles.initBaseMapLayer(mapTiles);
  }

  initGeoJSONLayer(options = {}) {
    this._mapTiles.initGeoJSONLayer(options);
  }

  addGeoJSON(jsonString) {
    this._mapTiles.addGeoJSON(jsonString);
  }

  getJSONLayer() {
    return this._mapTiles.getJSONLayer();
  }

  updateBaseTiles() {
    clearTimeout(this._baseTilesTimeout)
    this._baseTilesTimeout = setTimeout(() => {
      if (this._baseTilesEnabled) {
        this._mapTiles.initBaseMapLayer(this._baseTilesUrl, this._baseTilesType, this._baseTilesToken);
      } else {
        this._mapTiles.removeBaseMapLayer();
      }
    }, 500);
  }

  updateCoverageTiles() {
    clearTimeout(this._coverageTilesTimeout)
    this._coverageTilesTimeout = setTimeout(() => {
      if (this._coverageTilesEnabled) {
        this._mapTiles.initCoverageMapLayer(this._coverageTilesUrl, this._coverageTilesType);
      } else {
        this._mapTiles.removeCoverageMapLayer();
      }
    }, 500);
  }

}
