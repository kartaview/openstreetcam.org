import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { overlayConfigFactory } from 'ngx-modialog';
import { Modal, BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { LocalStorage, LocalStorageService } from 'ngx-webstorage';

import { MapComponent } from '../shared/elements/map.component';

import {
  ISequence, IPhoto
} from '../shared/api-services/osc/models';

import { AuthProviderService } from '../shared/auth/authProvider.service';

import { OSCApiService } from '../shared/osc-api/osc-api.service';

import { UserVxService } from '../shared/api-services/osc/userVx.service';
import { SequenceVxService } from '../shared/api-services/osc/sequenceVx.service';
import { PhotoVxService } from '../shared/api-services/osc/photoVx.service';

import { DeleteAccountModalComponent } from './modals/delete-account.component';

import { environment } from '../../environments/environment';
import { EPhotoJoin } from 'app/shared/api-services/osc/requests/v2';

/**
 * This class represents the lazy loaded HomeComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild('mapComponent') mapComponent: MapComponent;
  @LocalStorage('mapCoordinates', null) public mapCoordinates;

  currentZoom = null;
  currentLat = null;
  currentLng = null;
  initialZoom = null;
  initialLat = null;
  initialLng = null;

  mapMarkers = [];
  nearByPhotosData: IPhoto[] = [];

  nearBySequencesVisible = false;
  nearBySequencesData: ISequence[] = [];
  nearBySequencesLoading = false;
  nearBySequencesError = false;


  footerLeftDropdown = false;
  footerRightDropdown = false;

  nearbyPhotosV2 = false;
  mapFiltersEnabled = false;
  mapFilters = {
    userIds: undefined,
    startDate: undefined,
    endDate: undefined,
    sequenceType: undefined,
    platform: undefined,
    fieldOfView: undefined
  };

  mapLayers = {
    baseTilesEnabled: true,
    baseTilesUrl: environment.mapLayers.baseMapTilesUrl,
    baseTilesType: environment.mapLayers.baseMapTilesType,
    baseTilesToken: environment.mapLayers.baseMapTilesToken,
    coverageTilesEnabled: environment.mapLayers.coverageMapTilesEnabled,
    coverageTilesType: environment.mapLayers.coverageMapTilesType,
    coverageTilesUrl: environment.mapLayers.coverageMapTilesUrl
  };

  constructor(private localStorage: LocalStorageService, public auth: AuthProviderService,
    public sequenceService: SequenceVxService, public photoService: PhotoVxService, public userService: UserVxService,
    public modal: Modal, public location: Location, private activatedRoute: ActivatedRoute, public oscApiService: OSCApiService) {
    this.nearbyPhotosV2 = environment.features.nearbyPhotosV2;
    this.mapFiltersEnabled = environment.features.showHomeMapFilters;
    setTimeout(() => { // safari Hack
      $(window).trigger('resize');
      this.mapComponent.invalidateSize();
    }, 50);
  }

  ngOnInit() {
    const urlParts = this.activatedRoute.snapshot.url;
    if (urlParts.length === 1) {
      let path = urlParts[0].path;
      path = path.substr(0, path.length - 1);
      path = path.substr(1);
      const parts = path.split(',');
      if (parts.length === 3) {
        this.currentLat = parts[0];
        this.currentLng = parts[1];
        this.currentZoom = parts[2];
      }
    }
    if (!this.currentLat || !this.currentLng || !this.currentZoom) {
      if (this.mapCoordinates && this.mapCoordinates.lat && this.mapCoordinates.lng && this.mapCoordinates.zoom) {
        this.currentLat = this.mapCoordinates.lat;
        this.currentLng = this.mapCoordinates.lng;
        this.currentZoom = this.mapCoordinates.zoom;
      } else {
        this.currentLat = environment.defaults.homeLat;
        this.currentLng = environment.defaults.homeLng;
        this.currentZoom = environment.defaults.homeZoom;
      }
    }
    this.initialLat = this.currentLat;
    this.initialLng = this.currentLng;
    this.initialZoom = this.currentZoom;
  }

  updateBrowserAddress(data) {
    this.currentLat = data.lat;
    this.currentLng = data.lng;
    this.currentZoom = data.zoom;
    this.location.replaceState('/map/@' + this.currentLat + ',' + this.currentLng + ',' + this.currentZoom + 'z');
    this.localStorage.store('mapCoordinates', {
      lat: this.currentLat,
      lng: this.currentLng,
      zoom: this.currentZoom,
    });
  }

  showDeleteAccountModal() {
    const dialog = this.modal.open(DeleteAccountModalComponent, overlayConfigFactory({ size: 'sm' }, BSModalContext));
    dialog.result
      .then((r: any) => {
        if (r && r.submit && typeof r.value === 'boolean') {
          this.userService.delete(r.value).subscribe(
            result => {
              this.auth.logout();
              this.modal.alert().showClose(false).title('Success').body('Account deleted!').open();
            },
            error => {
              this.modal.alert().showClose(false).title('Error').body('Cannot delete account! Might be already deleted!').open();
            }
          );
        }
      }, (error) => {
        // failure
        console.log('Dialog ended with failure: ', error);
      });
  }

  loadNearBySequences(lat: number, lng: number, distance: number) {
    this.nearBySequencesError = false;
    this.nearBySequencesLoading = true;
    this.mapMarkers = [];
    const options = { lat: lat, lng: lng, distance: distance };
    /*if (this.showOwnTracks && this.auth.isLoggedIn()) {
      options['filterUserNames'] = this.auth.getUsername();
      options['mytracks'] = true;
    } */
    this.sequenceService.getSequencesNearBy(options).subscribe(
      result => {
        if (result && result.sequences && result.sequences.length > 0) {
          this.nearBySequencesVisible = true;
          const tempMarkers = [];
          tempMarkers.push({
            lat: result.lat,
            lng: result.lng,
            rotation: 0,
            image: '/assets/images/map/marker-icon.png'
          });
          /*result.sequences.forEach((sequence) => {
            tempMarkers.push({
              lat: sequence.currentLat,
              lng: sequence.currentLng,
              rotation: 0,
              image: '/assets/images/map/marker-icon.png'
            });
          });*/
          setTimeout(() => {
            this.mapMarkers = tempMarkers;
          }, 1);
          this.nearBySequencesLoading = false;
          this.nearBySequencesData = result.sequences;
        }
      },
      error => {
        this.nearBySequencesLoading = false;
        this.nearBySequencesError = true;
        console.log(error);
      }
    );
  }

  loadNearByPhotos(lat: number, lng: number, zoomLevel: number) {
    this.nearBySequencesError = false;
    this.nearBySequencesLoading = true;
    this.mapMarkers = [];
    const options = {
      lat: lat, lng: lng, zoomLevel, join: [EPhotoJoin.SEQUENCE],
      userIds: this.mapFilters.userIds,
      startDate: this.mapFilters.startDate,
      endDate: this.mapFilters.endDate,
      searchSequenceType: this.mapFilters.sequenceType,
      searchPlatform: this.mapFilters.platform,
      searchFieldOfView: this.mapFilters.fieldOfView
    };
    this.photoService.getPhotos(options).subscribe(
      result => {
        if (result && result.length > 0) {
          this.nearBySequencesVisible = true;
          const tempMarkers = [];
          /* tempMarkers.push({
            lat: result.lat,
            lng: result.lng,
            rotation: 0,
            image: '/assets/images/map/marker-icon.png'
          });*/
          result.forEach((photo) => {
            tempMarkers.push({
              lat: photo.lat,
              lng: photo.lng,
              rotation: 0,
              image: '/assets/images/map/marker-icon.png'
            });
          });
          setTimeout(() => {
            this.mapMarkers = tempMarkers;
          }, 1);
          this.nearBySequencesLoading = false;
          this.nearByPhotosData = result;
        } else {
          this.nearBySequencesLoading = false;
        }
      },
      error => {
        this.nearBySequencesLoading = false;
        this.nearBySequencesError = true;
        console.log(error);
      }
    );
  }

  deleteModalCheckbox(value) {
    this.deleteModalCheckbox = value;
  }

  onMapClick(event) {
    this.nearBySequencesVisible = false;
    if (this.nearbyPhotosV2) {
      this.loadNearByPhotos(event.lat, event.lng, this.currentZoom);
    } else {
      this.loadNearBySequences(event.lat, event.lng, (50 / this.currentZoom));
    }
  }
  onMapEvent(event) {
    if (event.type === 'search') {
      this.oscApiService.requestMapSearch(event.searchString).subscribe(
        places => {
          this.mapComponent.onMapEventResponse({
            type: 'search',
            result: 'success',
            searchData: places
          });
        },
        error => {
          this.mapComponent.onMapEventResponse({
            type: 'search',
            result: 'failed'
          });
        }
      );

    } else if (event.type === 'location') {
      this.oscApiService.requestLocation().subscribe(
        locationData => {
          this.mapComponent.onMapEventResponse({
            type: 'search',
            result: 'success',
            locationData
          });
        },
        error => {
          this.mapComponent.onMapEventResponse({
            type: 'location',
            result: 'failed'
          });
        }
      );

    }
  }

  closeNearbySequences() {
    this.nearBySequencesVisible = false;
    this.nearBySequencesLoading = false;
    this.nearBySequencesError = false;
    this.nearBySequencesData = [];
    this.mapMarkers = [];
  }

  hideDropdown() {
    this.hideLeftDropdown();
    this.hideRightDropdown();
  }

  switchLeftDropdown() {
    if (!this.footerLeftDropdown) {
      this.showLeftDropdown();
      this.hideRightDropdown();
    } else {
      this.hideLeftDropdown();
    }
  }

  showLeftDropdown() {
    this.footerLeftDropdown = true;
  }

  hideLeftDropdown() {
    this.footerLeftDropdown = false;
  }

  switchRightDropdown() {
    if (!this.footerRightDropdown) {
      this.showRightDropdown();
      this.hideLeftDropdown();
    } else {
      this.hideRightDropdown();
    }
  }

  showRightDropdown() {
    this.footerRightDropdown = true;
  }

  hideRightDropdown() {
    this.footerRightDropdown = false;
  }

  onFiltersUpdate(event) {
    this.mapLayers.coverageTilesUrl = environment.mapLayers.coverageMapTilesUrl +
      (event.computedFilters.length > 0 ? `?${event.computedFilters}` : '');
    this.mapFilters.userIds = event.userIds;
    this.mapFilters.startDate = event.startDate;
    this.mapFilters.endDate = event.endDate;
    this.mapFilters.sequenceType = event.sequenceType;
    this.mapFilters.platform = event.platform;
    this.mapFilters.fieldOfView = event.fieldOfView;
  }

}
