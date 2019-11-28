import { Component, NgZone, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { overlayConfigFactory } from 'ngx-modialog';
import { Modal, BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SequenceVxService, PhotoVxService } from '../shared/api-services/osc';
import { ApolloDetectionVxService } from '../shared/api-services/apollo'
import { ConfirmModalComponent } from '../shared/modals';

import { RoadSignUrlPipe } from '../shared/pipes';

import { environment } from 'environments/environment';
import { NavbarService } from '../shared/navbar/navbar.service';

import { AuthProviderService } from '../shared/auth/authProvider.service';
import { PhotosIterator } from '../shared/photos-iterator';

import { SequenceBaseComponent } from './sequence-base.component';

@Component({
  moduleId: module.id,
  selector: 'osc-sequence',
  templateUrl: 'sequence.component.html',
  styleUrls: ['sequence-base.component.css', 'sequence.component.css']
})
export class SequenceComponent extends SequenceBaseComponent {
  private availableTabs = ['track-info', 'edit-osm', 'detections'];
  public sequenceCountryCode = null;

  public detectionsMarkers = [];

  mapLayers = {
    baseTilesEnabled: true,
    baseTilesUrl: environment.mapLayers.baseMapTilesUrl,
    baseTilesType: environment.mapLayers.baseMapTilesType,
    baseTilesToken: environment.mapLayers.baseMapTilesToken,
    coverageTilesEnabled: environment.mapLayers.coverageMapTilesEnabled,
    coverageTilesType: environment.mapLayers.coverageMapTilesType,
    coverageTilesUrl: environment.mapLayers.coverageMapTilesUrl
  };

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
    if (this.modal.overlay.stackLength > 0 || (this.modalService as any)._modalStack._applicationRef.viewCount > 1
      || $('input:focus').length === 1) {
      // VERY DIRTY HACK FOR NGBMODAL SERVICE
      return;
    }
    if (event.ctrlKey || event.metaKey) {
      if (!this.panoramaViewerEnabled) {
        if (event.keyCode === 37) { // left
          if (!this.detectionsEnabled) {
            return;
          }
          event.preventDefault();
          this.photosIterator.switchToPrevDetection();
        } else if (event.keyCode === 39) { // right
          if (!this.detectionsEnabled) {
            return;
          }
          event.preventDefault();
          this.photosIterator.switchToNextDetection();
        } else if (event.keyCode === 38) { // up
          if (!this.detectionsEnabled) {
            return;
          }
          event.preventDefault();
          this.confirmDetection();
        } else if (event.keyCode === 40) { // down
          if (!this.detectionsEnabled) {
            return;
          }
          event.preventDefault();
          this.invalidDetection();
        } else if (event.keyCode === 89 && this.sidebarTab === 'detections') { // Y - confirm
          if (!this.detectionsEnabled) {
            return;
          }
          event.preventDefault();
          this.confirmDetection();
        } else if (event.keyCode === 78 && this.sidebarTab === 'detections') { // N - invalid
          if (!this.detectionsEnabled) {
            return;
          }
          event.preventDefault();
          this.invalidDetection();
        } else if (event.keyCode === 191 && this.sidebarTab === 'detections') { // ? - not sure
          if (!this.detectionsEnabled) {
            return;
          }
          event.preventDefault();
          this.reviewLaterDetection();
        } else if (event.keyCode === 48) { // 0 - Reset pan/zoom
          event.preventDefault();
          this.imageGallery.resetOrientationAndZoom(true);
        } else if (event.keyCode === 189) { // '-' - Zoom Out
          event.preventDefault();
          this.imageGallery.zoomOut();
        } else if (event.keyCode === 187) { // '=' - Zoom in
          event.preventDefault();
          const detection = this.photosIterator.getCurrentDetection();
          if (detection) {
            this.imageGallery.panAndZoomToDetection(detection, true);
          } else {
            this.imageGallery.zoomIn();
          }
        }
      }
    } else {
      if (event.keyCode === 65 && this.sidebarTab === 'detections' && !this.panoramaViewerEnabled) { // A - Add
        if (!this.detectionsEnabled) {
          return;
        }
        event.preventDefault();
        this.toggleAddSelection();
      } else if (event.keyCode === 69 && this.sidebarTab === 'detections' && !this.panoramaViewerEnabled) { // E - edit
        if (!this.detectionsEnabled) {
          return;
        }
        event.preventDefault();
        this.toggleEditSelection();
      } else if (event.keyCode === 89 && this.sidebarTab === 'detections' && !this.panoramaViewerEnabled) { // Y - confirm
        if (!this.detectionsEnabled) {
          return;
        }
        event.preventDefault();
        this.confirmDetection();
      } else if (event.keyCode === 78 && this.sidebarTab === 'detections' && !this.panoramaViewerEnabled) { // N - invalid
        if (!this.detectionsEnabled) {
          return;
        }
        event.preventDefault();
        this.invalidDetection();
      } else if (event.keyCode === 38 || event.keyCode === 39) {
        event.preventDefault();
        this.photosIterator.switchToNextPhoto();
      } else if (event.keyCode === 40 || event.keyCode === 37) {
        event.preventDefault();
        this.photosIterator.switchToPrevPhoto();
      } else if (event.keyCode === 27 && !this.panoramaViewerEnabled) { // ESC - Cancel add
        if (!this.detectionsEnabled) {
          return;
        }
        if (!this.imageGallery.editSignDialogVisible()) {
          event.preventDefault();
          if (this.addSelectionInProgress) {
            this.disableAddSelection();
          }
        }
      }
    }
  }


  constructor(public sequenceService: SequenceVxService, public photoService: PhotoVxService,
    public apolloDetectionsService: ApolloDetectionVxService, ngZone: NgZone,
    public route: ActivatedRoute, public modal: Modal, public navbarService: NavbarService, public location: Location,
    public modalService: NgbModal, public auth: AuthProviderService
  ) {
    super(sequenceService, photoService, apolloDetectionsService, modal, modalService, auth);
    this.photosIterator = new PhotosIterator();
    this.photosIterator.optimisationsEnabled = true;
    this.photosIterator.autoSelectDetection = false;
    this.photosIterator.registerSwitchingCallback(() => {
      return new Promise((resolve, reject) => {
        if (this.rotationStarted) {
          const dialog = this.modal.open(ConfirmModalComponent, overlayConfigFactory({
            modalTitle: 'Cancel rotation',
            modalBody: 'Are you sure to cancel the changes?',
            cancelButtonText: 'Close',
            submitButtonText: 'Ok',
            submitButtonClass: 'btn-danger',
            size: 'sm'
          }, BSModalContext));
          dialog.result
            .then((r: any) => {
              if (r && r.submit) {
                this.resetRotation();
                resolve();
              } else {
                reject();
              }
            }, (error) => {
              reject();
              console.log('Dialog ended with failure: ', error);
            });
        } else {
          resolve();
        }
      });
    });

    $(window).resize((e) => {
      ngZone.run(() => {
        this.checkMobileSwitch();
      });
    });
    this.checkMobileSwitch();
    this.detectionsEnabled = environment.apollo.signDetectionsEnabled;
    this.detectionsNewDetection = environment.apollo.signDetectionsNewDetection
    if (this.detectionsEnabled) {
      this._showLoading();
      apolloDetectionsService.getSignsList().subscribe(
        (signsList) => {
          this.signsList = signsList;
          this.initComponent()
        },
        () => {
          this.initComponent()
        });
    } else {
      this.initComponent()
    }

  }

  initComponent() {
    this.initComponentBaseComponent();
    console.log('init');
    this.route
      .params
      .subscribe(params => {
        this.currentSequenceId = parseInt(params['id'], 10);
        console.log('start sequence load');
        this._loadSequence(params['id'], (typeof params['imageId'] !== 'undefined' ? parseInt(params['imageId'], 10) : null));
        console.log('end sequence load');
        if (params['tabId'] && this.availableTabs.indexOf(params['tabId']) > -1) {
          // this.sidebarTab = params['tabId'];
          this.switchSidebarTab(params['tabId']);
        } else {
          this.switchSidebarTab(this.sidebarTab);
        }
        console.log('end tab switch');
      });
    this.photosIterator.filteredDetections.subscribe(detections => {
      const markers = [];
      if (detections.length > 0) {
        const signIconNamePipe = new RoadSignUrlPipe();
        detections.forEach(detection => {
          markers.push({
            lat: detection.point.lat,
            lng: detection.point.lon,
            image: signIconNamePipe.transform(detection.sign),
            rotation: 0
          });
        });
      }
      this.detectionsMarkers = markers;

    });
    this.photosIterator.currentPhoto.subscribe(photoData => {
      if (this.addSelectionInProgress) {
        this.disableAddSelection();
      }
      if (this.onEditSelection) {
        this.disableEditSelection();
      }
      this.currentPhotoCache = photoData;
      if (photoData) {
        this.updatePageUrl();
        this.currentMarker = {
          lat: photoData.lat,
          lng: photoData.lng,
          enabled: true,
          rotation: photoData.heading,
          image: '/assets/images/map/direction.png',
          autoCenter: true
        };
      }
    });
  }

  protected _loadSequence(sequenceId: number, imageId: number) {
    this.errorFound = false;
    this._showLoading();
    this.sequenceService.get(sequenceId).subscribe(
      sequence => {
        this.sequenceData = sequence;
        this.sequenceCountryCode = sequence.countryCode ? sequence.countryCode : environment.apollo.apiDefaultRegion;
        console.log(sequence);
        this._loadPhotos(this.currentSequenceId, imageId);
        this._loadUploadHistory(this.currentSequenceId);
        this._loadApolloDetections(this.currentSequenceId);
        this._hideLoading();
      },
      error => {
        this._hideLoading();
        this.errorFound = true;
      }
    );
  }

  protected _loadUploadHistory(sequenceId: number) {
    this.errorFound = false;
    this._showLoading();
    this.sequenceService.getUploadHistory(sequenceId).subscribe(
      uploadHistory => {
        this.uploadHistory = uploadHistory;
        this._hideLoading();
      },
      error => {
        this._hideLoading();
        this.errorFound = true;
      }
    );
  }

  protected _loadPhotos(sequenceId: number, imageId: number) {
    this.errorFound = false;
    this._showLoading();
    this.sequenceService.getPhotos(sequenceId).subscribe(photos => {
      this.photosIterator.updatePhotos(photos);
      let imageFound = false;
      photos.forEach(photo => {
        if (!imageFound && imageId !== null && photo.sequenceIndex === imageId) {
          imageFound = true;
          setTimeout(() => {
            this.photosIterator.switchToPhotoSequenceIndex(sequenceId, photo.sequenceIndex);
          }, 1);
        }
      });
      if (!imageFound) {
        setTimeout(() => {
          this.photosIterator.switchToFirstPhoto();
        });
      }
      this._hideLoading();
    },
      error => {
        this._hideLoading();
        this.errorFound = true;
      });
  }

  protected _loadApolloDetections(sequenceId: number) {
    if (!this.detectionsEnabled) {
      return false;
    }
    this._showLoading();
    this.apolloDetectionsService.getAllBySequence(sequenceId).subscribe(
      detections => {
        this.photosIterator.updateDetections(detections);
        $(window).trigger('resize');
        this._hideLoading();
      },
      error => {
        $(window).trigger('resize');
        this._hideLoading();
      }
    );
  }

  getSequenceData() {
    this._loadSequence(this.currentSequenceId, null);
  }

  switchSidebarTab(tab) {
    this.sidebarTab = tab;
    this.disableAddSelection();
    this.disableEditSelection();
    this.updatePageUrl();
    if (tab === 'detections') {
      this.photosIterator.filters.validationFiltersEnabled = true;
      this.photosIterator.filters.OSMComparisonFiltersEnabled = false
      this.photosIterator.refreshFilters();
    } else if (tab === 'edit-osm') {
      this.photosIterator.filters.validationFiltersEnabled = false;
      this.photosIterator.filters.OSMComparisonFiltersEnabled = true
      this.photosIterator.refreshFilters();
    } else if (tab === 'track-info') {
      this.photosIterator.filters.validationFiltersEnabled = false;
      this.photosIterator.filters.OSMComparisonFiltersEnabled = false
      this.photosIterator.refreshFilters();
    }
    console.log('end switch tab');
    setTimeout(() => {
      $(window).trigger('resize');
    }, 10);
  }

  updatePageUrl() {
    if (this.currentPhotoCache) {
      setTimeout(() => {
        this.location.replaceState('/details/' + this.currentPhotoCache.sequenceId + '/' +
          this.currentPhotoCache.sequenceIndex + '/' + this.sidebarTab);
      }, 1);
    }
  }


}
